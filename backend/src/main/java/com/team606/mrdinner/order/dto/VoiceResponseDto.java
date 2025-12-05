package com.team606.mrdinner.order.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class VoiceResponseDto {

    /**
     * TTS로 읽어줄 응답 문장
     */
    private String response_text;

    /**
     * true이면 프론트에서 음성 인식 루프를 종료
     */
    private boolean stop_command;
}
