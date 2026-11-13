package com.tripilot.auth.dto;

public class AuthResponse {
    private final String token;
    private final String tokenType;
    private final UserView user;

    public AuthResponse(String token, UserView user) {
        this.token = token;
        this.tokenType = "Bearer";
        this.user = user;
    }

    public String getToken() { return token; }
    public String getTokenType() { return tokenType; }
    public UserView getUser() { return user; }
}
