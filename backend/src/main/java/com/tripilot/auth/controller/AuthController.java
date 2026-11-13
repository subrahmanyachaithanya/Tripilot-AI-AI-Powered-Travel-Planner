package com.tripilot.auth.controller;

import java.util.Map;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tripilot.auth.dto.AuthResponse;
import com.tripilot.auth.dto.LoginRequest;
import com.tripilot.auth.dto.RegisterRequest;
import com.tripilot.auth.dto.UserView;
import com.tripilot.auth.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final boolean googleEnabled;

    public AuthController(AuthService authService,
                          @Value("${app.google.enabled:false}") boolean googleEnabled) {
        this.authService = authService;
        this.googleEnabled = googleEnabled;
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public UserView currentUser(Authentication authentication) {
        return authService.getProfile(authentication.getName());
    }

    @GetMapping("/google/status")
    public Map<String, Boolean> googleStatus() {
        return Map.of("enabled", googleEnabled);
    }
}
