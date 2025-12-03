package com.team606.mrdinner.service;

import com.team606.mrdinner.dto.VoiceResponseDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
public class VoiceService {

    public VoiceResponseDto handleVoiceFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            log.warn("빈 음성 파일이 전달되었습니다.");
            // 프론트에서 에러 메시지를 TTS로 읽게 할 수도 있음
            return new VoiceResponseDto(
                    "음성 파일이 비어 있습니다. 다시 말씀해 주세요.",
                    false
            );
        }

        log.info("음성 파일 수신 완료: name={}, originalName={}, size={} bytes, contentType={}",
                file.getName(),
                file.getOriginalFilename(),
                file.getSize(),
                file.getContentType()
        );

        // TODO: 여기서 나중에 외부 음성 인식 API로 file 전달하는 로직 추가 예정
        // 예: sttResult = externalSttClient.request(file);

        // 지금은 더미 응답을 돌려줌
        // stop_command = false 이면 프론트에서 계속 다음 질문/녹음 루프 진행
        return new VoiceResponseDto(
                "음성 파일을 정상적으로 받았습니다. 인식 기능은 준비 중입니다.",
                false
        );
    }
}
