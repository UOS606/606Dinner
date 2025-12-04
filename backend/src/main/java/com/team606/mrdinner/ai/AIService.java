package com.team606.mrdinner.ai;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import okhttp3.*;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;

@Service
public class AIService {

    // TODO: 나중에 application.properties로 빼도 좋음
    private static final String WHISPER_URL = "https://cerographic-subpermanently-kerri.ngrok-free.dev/transcribe";
    private static final String QWEN_URL = "https://cerographic-subpermanently-kerri.ngrok-free.dev/generate";
    private static final MediaType JSON_TYPE = MediaType.get("application/json; charset=utf-8");

    private final OkHttpClient client = new OkHttpClient();

    public OrderResult analyzeAudioFile(File audioFile) throws Exception {
        if (audioFile == null || !audioFile.exists()) {
            throw new IOException("파일이 존재하지 않습니다: " + audioFile);
        }

        // 1. Whisper 호출 (음성 -> 텍스트)
        String transcribedText = callWhisper(audioFile);
        System.out.println("LOG [Whisper]: " + transcribedText);

        // 2. Qwen 호출 (텍스트 -> JSON 분석)
        String jsonResult = callQwen(transcribedText);
        System.out.println("LOG [Qwen]: " + jsonResult);

        // 3. 결과 파싱 (JSON -> OrderResult)
        return parseResult(jsonResult);
    }

    private String callWhisper(File file) throws IOException {
        RequestBody body = new MultipartBody.Builder()
                .setType(MultipartBody.FORM)
                .addFormDataPart(
                        "file",
                        file.getName(),
                        // 프론트는 webm을 보내니 webm으로 맞추자 (백엔드 서버에서 알아서 처리할 가능성 큼)
                        RequestBody.create(file, MediaType.parse("audio/webm"))
                )
                .build();

        Request request = new Request.Builder()
                .url(WHISPER_URL)
                .post(body)
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Whisper 오류: " + response.code() + " / " + response.message());
            }
            String bodyStr = response.body().string();
            JsonObject json = JsonParser.parseString(bodyStr).getAsJsonObject();
            return json.get("text").getAsString();
        }
    }

    private String callQwen(String text) throws IOException {
        JsonObject payload = new JsonObject();
        payload.addProperty("prompt", text);

        Request request = new Request.Builder()
                .url(QWEN_URL)
                .post(RequestBody.create(payload.toString(), JSON_TYPE))
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Qwen 오류: " + response.code() + " / " + response.message());
            }

            String responseBody = response.body().string();
            JsonObject json = JsonParser.parseString(responseBody).getAsJsonObject();

            if (json.has("generated_text")) {
                // <think> 태그 제거
                return json.get("generated_text").getAsString()
                        .replaceAll("<think>[\\s\\S]*?</think>", "")
                        .trim();
            }
            throw new IOException("응답에 generated_text가 없습니다.");
        }
    }

    private OrderResult parseResult(String jsonString) {
        OrderResult result = new OrderResult();
        try {
            JsonObject root = JsonParser.parseString(jsonString).getAsJsonObject();

            if (root.has("intent")) {
                result.setIntent(root.get("intent").getAsString());
            }
            if (root.has("date")) {
                result.setDate(root.get("date").getAsString());
            }

            if (root.has("items")) {
                JsonArray arr = root.getAsJsonArray("items");
                for (JsonElement e : arr) {
                    if (e.isJsonObject()) {
                        JsonObject item = e.getAsJsonObject();
                        String name = item.has("name") ? item.get("name").getAsString() : null;
                        String qty = item.has("qty") ? item.get("qty").getAsString() : null;
                        String unit = item.has("unit") ? item.get("unit").getAsString() : null;
                        result.addItem(name, qty, unit);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("파싱 중 오류 발생: " + e.getMessage());
        }
        return result;
    }
}
