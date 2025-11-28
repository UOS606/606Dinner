package com.example;

import okhttp3.*;
import com.google.gson.*;
import java.io.File;
import java.io.IOException;

public class AIService {

    // ngrok 주소 설정
    private static final String WHISPER_URL = "https://cerographic-subpermanently-kerri.ngrok-free.dev/transcribe";
    private static final String QWEN_URL = "https://cerographic-subpermanently-kerri.ngrok-free.dev/generate";
    private static final MediaType JSON_TYPE = MediaType.get("application/json; charset=utf-8");

    private final OkHttpClient client;

    public AIService() {
        this.client = new OkHttpClient();
    }

    // ★ 이 메소드가 핵심입니다. (파일을 주면 -> 결과를 리턴)
    public OrderResult analyzeAudioFile(File audioFile) throws Exception {
        if (!audioFile.exists()) {
            throw new IOException("파일이 존재하지 않습니다: " + audioFile.getAbsolutePath());
        }

        // 1. Whisper 호출 (음성 -> 텍스트)
        String transcribedText = callWhisper(audioFile);
        System.out.println("LOG [Whisper]: " + transcribedText); 

        // 2. Qwen 호출 (텍스트 -> JSON 분석)
        String jsonResult = callQwen(transcribedText);
        System.out.println("LOG [Qwen]: " + jsonResult); 

        // 3. 결과 파싱 (JSON -> OrderResult 객체)
        return parseResult(jsonResult);
    }

    // 내부 메소드 1: Whisper 통신
    private String callWhisper(File file) throws IOException {
        RequestBody body = new MultipartBody.Builder().setType(MultipartBody.FORM)
                .addFormDataPart("file", file.getName(),
                        RequestBody.create(file, MediaType.parse("audio/mpeg")))
                .build();
        Request request = new Request.Builder().url(WHISPER_URL).post(body).build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) throw new IOException("Whisper 오류: " + response.code());
            return JsonParser.parseString(response.body().string()).getAsJsonObject().get("text").getAsString();
        }
    }

    // 내부 메소드 2: Qwen 통신
    private String callQwen(String text) throws IOException {
        JsonObject payload = new JsonObject();
        payload.addProperty("prompt", text);
        Request request = new Request.Builder().url(QWEN_URL)
                .post(RequestBody.create(payload.toString(), JSON_TYPE)).build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) throw new IOException("Qwen 오류: " + response.code());
            
            String responseBody = response.body().string();
            JsonObject json = JsonParser.parseString(responseBody).getAsJsonObject();
            
            if (json.has("generated_text")) {
                // <think> 태그 제거 후 리턴
                return json.get("generated_text").getAsString()
                        .replaceAll("<think>[\\s\\S]*?</think>", "").trim();
            }
            throw new IOException("응답에 generated_text가 없습니다.");
        }
    }

    // 내부 메소드 3: JSON 파싱 및 객체 변환
    private OrderResult parseResult(String jsonString) {
        OrderResult result = new OrderResult();
        try {
            JsonObject root = JsonParser.parseString(jsonString).getAsJsonObject();

            // 1. 공통 정보 (Intent, Date)
            if (root.has("intent")) result.setIntent(root.get("intent").getAsString());
            if (root.has("date")) result.setDate(root.get("date").getAsString());

            // 2. 아이템 리스트
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