package com.tripilot.chat.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import com.tripilot.chat.dto.ChatRequest;
import com.tripilot.chat.dto.ChatTurn;

@Service
public class GeminiChatService {
    private static final String TRAVEL_SYSTEM_PROMPT = """
        You are Tripilot, a thoughtful AI travel-planning assistant.
        Help users plan realistic trips. Ask concise follow-up questions when important details are missing,
        such as origin, destination, dates, number of travellers, interests, or budget.
        When useful, organize a plan by day, with morning, afternoon and evening suggestions.
        Clearly label budget figures as rough estimates unless the user provides verified prices.
        Do not claim that you checked live availability, current prices, weather, opening hours, or made a booking.
        Do not invent confirmed flight, hotel or restaurant availability. Explain when information needs verification.
        Prefer practical, safe, accessible travel advice and explain assumptions.
        """;

    private final RestClient restClient = RestClient.create();
    private final String apiKey;
    private final String model;

    public GeminiChatService(@Value("${app.gemini.api-key:}") String apiKey,
                             @Value("${app.gemini.model:gemini-3.8-flash}") String model) {
        this.apiKey = apiKey;
        this.model = model;
    }

    public String reply(ChatRequest request) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Gemini is not configured. Add GEMINI_API_KEY to backend/.env and restart the backend.");
        }

        List<Map<String, Object>> contents = new ArrayList<>();
        List<ChatTurn> history = request.getHistory() == null ? List.of() : request.getHistory();
        int start = Math.max(0, history.size() - 12);
        for (int i = start; i < history.size(); i++) {
            ChatTurn turn = history.get(i);
            if (turn == null || turn.getContent() == null || turn.getContent().isBlank()) {
                continue;
            }
            String role = "assistant".equalsIgnoreCase(turn.getRole()) || "model".equalsIgnoreCase(turn.getRole())
                    ? "model" : "user";
            contents.add(content(role, turn.getContent()));
        }
        contents.add(content("user", request.getMessage().trim()));

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("systemInstruction", Map.of("parts", List.of(Map.of("text", TRAVEL_SYSTEM_PROMPT))));
        payload.put("contents", contents);

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> result = restClient.post()
                    .uri(uriBuilder -> uriBuilder
        .scheme("https")
        .host("generativelanguage.googleapis.com")
        .path("/v1beta/models/{model}:generateContent")
        .build(model))
.header("x-goog-api-key", apiKey)
.contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .body(Map.class);

            return extractText(result);
        } catch (RestClientResponseException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Gemini API returned HTTP " + exception.getStatusCode().value());
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Could not get a response from Gemini. Check the API key and network connection.");
        }
    }

    private Map<String, Object> content(String role, String text) {
        return Map.of("role", role, "parts", List.of(Map.of("text", text)));
    }

    @SuppressWarnings("unchecked")
    private String extractText(Map<String, Object> response) {
        if (response == null) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Gemini returned an empty response");
        }
        List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
        if (candidates == null || candidates.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Gemini did not return a text answer");
        }
        Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
        List<Map<String, Object>> parts = content == null ? null : (List<Map<String, Object>>) content.get("parts");
        if (parts == null) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Gemini response did not contain text");
        }
        StringBuilder text = new StringBuilder();
        for (Map<String, Object> part : parts) {
            Object value = part.get("text");
            if (value instanceof String line) {
                if (!text.isEmpty()) text.append("\n");
                text.append(line);
            }
        }
        if (text.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Gemini returned an empty text answer");
        }
        return text.toString();
    }

    public String getModel() { return model; }
}
