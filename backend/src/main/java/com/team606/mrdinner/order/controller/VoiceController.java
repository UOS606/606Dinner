package com.team606.mrdinner.order.controller;

import com.team606.mrdinner.order.dto.VoiceResponseDto;
import com.team606.mrdinner.order.service.VoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class VoiceController {

    private final VoiceService voiceService;

    /**
     * 프론트에서 전송한 음성 파일을 받는 엔드포인트.
     * 프론트 fetch:
     *   fetch("/api/voice-record", { method: "POST", body: formData })
     *   formData.append("file", audioBlob, "recording-...webm");
     */
    @PostMapping("/voice-record")
    public ResponseEntity<VoiceResponseDto> handleVoiceRecord(
            @RequestParam("file") MultipartFile file
    ) {
        VoiceResponseDto responseDto = voiceService.handleVoiceFile(file);
        return ResponseEntity.ok(responseDto);
    }
}
