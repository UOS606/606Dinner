package com.example;

import java.io.File;

public class Main {
    public static void main(String[] args) {
        
        // 1. 컨트롤러 시작 (서버 켜짐)
        OrderController controller = new OrderController();

        // [시뮬레이션] JS에서 파일이 들어왔다고 가정
        File fileFromJS = new File("./demo/my_recording_038.wav");

        System.out.println("📡 JS 요청 처리 중...");

        // 2. 컨트롤러에게 파일 넘기고 JSON 받기 (이 한 줄이면 끝!)
        String jsonResponse = controller.processClientAudio(fileFromJS);

        // 3. 결과 확인 (JS가 받게 될 데이터)
        System.out.println("\n✅ JS에게 보낼 JSON:");
        System.out.println(jsonResponse);
    }
}