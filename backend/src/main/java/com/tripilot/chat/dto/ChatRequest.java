package com.tripilot.chat.dto;

import java.util.ArrayList;
import java.util.List;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ChatRequest {
    @NotBlank(message = "Please enter a travel question")
    @Size(max = 6000, message = "Message must be 6000 characters or fewer")
    private String message;
    private List<ChatTurn> history = new ArrayList<>();

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public List<ChatTurn> getHistory() { return history; }
    public void setHistory(List<ChatTurn> history) { this.history = history; }
}
