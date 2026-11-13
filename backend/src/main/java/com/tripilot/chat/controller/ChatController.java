package com.tripilot.chat.controller;

import jakarta.validation.Valid;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tripilot.chat.dto.ChatRequest;
import com.tripilot.chat.dto.ChatResponse;
import com.tripilot.chat.service.ChatService;

@RestController
@RequestMapping("/api/chat")
public class ChatController {
    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public ChatResponse sendMessage(@Valid @RequestBody ChatRequest request,
                                    Authentication authentication) {
        // The authenticated email is available for future per-user chat history.
        return chatService.sendMessage(request);
    }
}
