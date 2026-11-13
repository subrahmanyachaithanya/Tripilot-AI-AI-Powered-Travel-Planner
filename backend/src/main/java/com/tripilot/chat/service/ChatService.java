package com.tripilot.chat.service;

import org.springframework.stereotype.Service;
import com.tripilot.chat.dto.ChatRequest;
import com.tripilot.chat.dto.ChatResponse;

@Service
public class ChatService {
    private final GeminiChatService geminiChatService;

    public ChatService(GeminiChatService geminiChatService) {
        this.geminiChatService = geminiChatService;
    }

    public ChatResponse sendMessage(ChatRequest request) {
        String answer = geminiChatService.reply(request);
        return new ChatResponse(answer, geminiChatService.getModel());
    }
}
