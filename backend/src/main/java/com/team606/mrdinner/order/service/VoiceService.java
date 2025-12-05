package com.team606.mrdinner.order.service;

import com.team606.mrdinner.ai.AIService;
import com.team606.mrdinner.ai.OrderResult;
import com.team606.mrdinner.ai.OrderSession;
import com.team606.mrdinner.order.dto.OrderItemRequestDto;
import com.team606.mrdinner.order.dto.OrderRequestDto;
import com.team606.mrdinner.order.dto.VoiceResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class VoiceService {

    private final AIService aiService;

    // 🔹 실제 주문 생성용 서비스
    private final OrderService orderService;

    // 사용자별 음성 주문 세션 관리
    private final Map<String, OrderSession> sessions = new ConcurrentHashMap<>();

    public VoiceResponseDto handleVoiceFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            log.warn("빈 음성 파일이 전달되었습니다.");
            return new VoiceResponseDto(
                    "음성 파일이 비어 있습니다. 다시 말씀해 주세요.",
                    false
            );
        }

        String username = resolveUsernameFromSecurityContext();
        OrderSession session = sessions.computeIfAbsent(username, u -> new OrderSession());

        try {
            log.info("음성 파일 수신 완료: name={}, originalName={}, size={} bytes, contentType={}",
                    file.getName(),
                    file.getOriginalFilename(),
                    file.getSize(),
                    file.getContentType()
            );

            // 1. MultipartFile → File (임시 파일)
            File tempFile = File.createTempFile("voice-", ".webm");
            file.transferTo(tempFile);

            // 2. AI 분석 (Whisper + Qwen)
            OrderResult aiResult = aiService.analyzeAudioFile(tempFile);

            // 3. 세션 업데이트 (대화/메뉴 상태 반영)
            session.updateFromAI(aiResult);

            // 4. 프론트 응답 DTO 구성
            String outputText = session.getOutput();
            boolean shouldStop = session.getcheckEnd();

            // 5. 대화 종료 시 -> 실제 주문 생성 시도
            if (shouldStop) {
                try {
                    createOrderFromSession(session);
                } catch (Exception ex) {
                    log.error("음성 주문 세션으로부터 주문 생성 중 오류 발생", ex);
                } finally {
                    // 대화 종료되면 세션 정리
                    sessions.remove(username);
                }
            }

            return new VoiceResponseDto(outputText, shouldStop);

        } catch (Exception e) {
            log.error("음성 처리 중 오류 발생", e);
            return new VoiceResponseDto(
                    "서버에서 음성을 처리하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
                    false
            );
        }
    }

    /**
     * OrderSession에 쌓인 정보를 기반으로 실제 주문을 생성한다.
     * - menuName, serviceStyle, currentItems를 사용해서 OrderRequestDto 구성
     * - OrderService.createOrder(...) 호출
     */
    private void createOrderFromSession(OrderSession session) {
        String sessionMenuName = session.getMenuName();
        String sessionStyle = session.getServiceStyle();

        if (sessionMenuName == null || sessionStyle == null) {
            log.warn(
                    "음성 주문 세션에 메뉴 또는 스타일 정보가 부족하여 주문을 생성하지 않습니다. menuName={}, serviceStyle={}",
                    sessionMenuName,
                    sessionStyle
            );
            return;
        }

        // 🔹 디너 이름 매핑 (세션에서 쓰는 내부 코드 → 프론트/DB에서 보는 메뉴 이름)
        String menuName = mapMenuName(sessionMenuName);

        // 🔹 스타일 코드 매핑 (simple_style → simple 등)
        String style = mapStyleCode(sessionStyle);

        // 🔹 품목 변환 (OrderResult.OrderItem → OrderItemRequestDto)
        // 존재하지 않는 품목은 건너뛰고 유효한 품목만 추가
        List<OrderItemRequestDto> items = new ArrayList<>();
        List<String> validItemNames = List.of(
            "샐러드", "커피", "와인", "스테이크", "에그스크램블", "베이컨",
            "빵", "바게트", "샴페인"
        );

        for (OrderResult.OrderItem aiItem : session.getCurrentItems()) {
            int qty = 0;
            try {
                qty = Integer.parseInt(aiItem.getQty());
            } catch (NumberFormatException e) {
                log.warn("수량 파싱 실패: name={}, qty={}", aiItem.getName(), aiItem.getQty());
            }
            if (qty <= 0) {
                continue;
            }

            // 유효한 품목인지 확인 (존재하지 않는 품목은 건너뜀)
            if (!validItemNames.contains(aiItem.getName())) {
                log.warn("존재하지 않는 품목 건너뜀: {}", aiItem.getName());
                continue;
            }

            OrderItemRequestDto dto = new OrderItemRequestDto();
            dto.setName(aiItem.getName());
            dto.setQty(qty);
            dto.setUnit(aiItem.getUnit());
            items.add(dto);
        }

        if (items.isEmpty()) {
            log.warn("음성 주문 세션에 품목 정보가 없어 주문을 생성하지 않습니다. menuName={}", menuName);
            return;
        }

        // 🔹 실제 주문 DTO 구성
        OrderRequestDto req = new OrderRequestDto();
        req.setMenuName(menuName);
        req.setStyle(style);
        // 음성 주문은 장바구니를 거치지 않고 바로 주문된 것으로 처리
        req.setAction("ordered");
        req.setItems(items);

        // 🔹 배달 날짜 설정 (세션에서 eventDate를 deliveryDate로 전달)
        String eventDate = session.getEventDate();
        if (eventDate != null && !eventDate.isEmpty()) {
            try {
                LocalDate deliveryDate = LocalDate.parse(eventDate, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
                req.setDeliveryDate(deliveryDate);
                log.info("음성 주문 배달 날짜 설정: {}", deliveryDate);
            } catch (Exception e) {
                log.warn("배달 날짜 파싱 실패, 오늘 날짜로 설정: {}", eventDate);
                req.setDeliveryDate(LocalDate.now());
            }
        } else {
            // 날짜 정보가 없으면 오늘 날짜로 기본 설정
            req.setDeliveryDate(LocalDate.now());
            log.info("음성 주문 배달 날짜 미설정, 오늘 날짜로 기본 설정");
        }

        // 🔹 주문 생성 (로그인한 사용자 기준)
        orderService.createOrder(req);
        log.info(
                "음성 주문으로 Order 생성 완료. menuName={}, style={}, itemCount={}",
                menuName,
                style,
                items.size()
        );
    }

    /**
     * OrderSession의 serviceStyle 값을 프론트에서 쓰는 style 문자열로 변환
     * - simple_style → simple
     * - grand_style  → grand
     * - deluxe_style → deluxe
     */
    private String mapStyleCode(String serviceStyle) {
        if (serviceStyle == null) {
            return "simple";
        }
        return switch (serviceStyle) {
            case "deluxe_style" -> "deluxe";
            case "grand_style" -> "grand";
            case "simple_style" -> "simple";
            default -> "simple";
        };
    }

    /**
     * OrderSession의 menuName을 실제 메뉴 이름으로 매핑
     * - champagne_dinner → Champagne Feast
     * - french_dinner    → French
     * - english_dinner   → English
     * - valentine_dinner → Valentine
     */
    private String mapMenuName(String menuName) {
        if (menuName == null) {
            return null;
        }
        return switch (menuName) {
            case "champagne_dinner" -> "Champagne Feast";
            case "french_dinner" -> "French";
            case "english_dinner" -> "English";
            case "valentine_dinner" -> "Valentine";
            default -> menuName;
        };
    }

    private String resolveUsernameFromSecurityContext() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new IllegalStateException("인증 정보가 없습니다.");
        }
        return auth.getName();
    }
}
