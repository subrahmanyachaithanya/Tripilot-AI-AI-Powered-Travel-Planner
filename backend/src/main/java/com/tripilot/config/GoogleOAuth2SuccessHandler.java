package com.tripilot.config;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.tripilot.auth.dto.AuthResponse;
import com.tripilot.auth.service.AuthService;

@Component
public class GoogleOAuth2SuccessHandler implements AuthenticationSuccessHandler {
    private final AuthService authService;
    private final String frontendUrl;

    public GoogleOAuth2SuccessHandler(AuthService authService,
                                      @Value("${app.frontend-url}") String frontendUrl) {
        this.authService = authService;
        this.frontendUrl = frontendUrl;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2AuthenticationToken googleAuth = (OAuth2AuthenticationToken) authentication;
        AuthResponse result = authService.loginWithGoogle(googleAuth.getPrincipal().getAttributes());
        String encodedToken = URLEncoder.encode(result.getToken(), StandardCharsets.UTF_8);
        response.sendRedirect(frontendUrl + "/oauth2/callback?token=" + encodedToken);
    }
}
