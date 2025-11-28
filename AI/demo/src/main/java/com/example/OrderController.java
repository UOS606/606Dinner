package com.example;

import com.google.gson.Gson;
import java.io.File;

public class OrderController {

    private final AIService aiService;
    private final OrderSession session; // 세션은 계속 유지되어야 함

    public OrderController() {
        this.aiService = new AIService();
        this.session = new OrderSession(); // 손님이 오면 주문서 하나 생성
    }

    /**
     * [핵심] JS가 오디오 파일을 보내면 호출되는 메소드
     * @param audioFile JS가 업로드한 파일
     * @return JS가 받을 JSON 문자열
     */
    public String processClientAudio(File audioFile) {
        
        // 1. 응답을 담을 객체 준비 (JS에게 줄 선물상자)
        ClientResponse response = new ClientResponse();

        try {
            // 2. AI 분석 실행
            OrderResult aiResult = aiService.analyzeAudioFile(audioFile);

            // 3. 세션 업데이트 (로직 수행)
            session.updateFromAI(aiResult);

            // 4. 결과 데이터 포장 (Session에서 필요한 것만 뽑음)
            response.setOutput(session.getOutput());       // 시스템 대답
            response.setEndCheck(session.checkEnd());    // 종료 여부
            
        } catch (Exception e) {
            // 에러 발생 시 처리
            response.setOutput("오류가 발생했습니다: " + e.getMessage());
            response.setEndCheck(false);
            e.printStackTrace();
        }

        // 5. 최종 JSON 변환 후 반환
        return new Gson().toJson(response);
    }

    // ========================================================
    // [내부 클래스] JS에게 보낼 데이터 형태 정의 (DTO)
    // ========================================================
    static class ClientResponse {
        private String output;         // 시스템의 말 (TTS용)
        private boolean endCheck;      // 대화 종료 여부

        // Setter
        public void setOutput(String output) { this.output = output; }
        public void setEndCheck(boolean endCheck) { this.endCheck = endCheck; }
    }
}