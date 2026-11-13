package com.tripilot.chat.dto;

import java.time.Instant;

public class ChatResponse {
    private final String reply;
    private final String model;
    private final Instant createdAt;

    public ChatResponse(String reply, String model) {
        this.reply = reply;
        this.model = model;
        this.createdAt = Instant.now();
    }

    public String getReply() { return reply; }
    public String getModel() { return model; }
    public Instant getCreatedAt() { return createdAt; }
}
