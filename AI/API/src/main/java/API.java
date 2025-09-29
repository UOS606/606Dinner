
import java.util.Map;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

public class API {
    // Python 서버와 주고받을 데이터의 모양(DTO)을 정의합니다.
    // 1. Python 서버로 보낼 데이터 형식
    public record PythonRequest(String user_text) {}

    // 2. Python 서버로부터 받을 데이터 형식
    public record PythonResponse(String label, float score) {}

    public static void main(String[] args) {
        // WebClient: 다른 서버와 통신
        WebClient webClient = WebClient.create("http://127.0.0.1:8000");

        // 테스트를 위해 Python 서버로 보낼 문장
        String testSentence = "오늘 서울 날씨 알려줘";

        // 보낼 데이터를 PythonRequest 객체로 만듭니다.
        PythonRequest requestData = new PythonRequest(testSentence);

        System.out.println("▶️ Python 서버로 요청을 보냅니다...");
        System.out.println("  - 보낼 문장: \"" + testSentence + "\"");

        try {
            // Python 서버의 '/MrDaebak' 주소로 POST 요청을 보냅니다.
            PythonResponse response = webClient.post()
                    .uri("/MrDaebak") // 상세 주소
                    .bodyValue(requestData)    // 보낼 데이터
                    .retrieve()                // 응답을 받아서
                    .bodyToMono(PythonResponse.class) // PythonResponse 객체로 변환
                    .block(); // 비동기 응답을 동기적으로 기다립니다 (테스트용)

            // 성공적으로 응답을 받았을 경우
            System.out.println("✅ 통신 성공! 서버로부터 받은 응답:");
            System.out.println("  - Action: " + response.label());
            System.out.println("  - Entities: " + response.score());

        } catch (Exception e) {
            // 통신 중 오류가 발생했을 경우
            System.err.println("❌ 통신 실패! 오류가 발생했습니다.");
            System.err.println("  - 오류 메시지: " + e.getMessage());
            System.err.println("  - 확인 사항: Python 서버가 http://127.0.0.1:8000 에서 실행 중인지 확인하세요.");
        }
    }
}
