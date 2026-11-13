package com.tripilot.auth.service;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.tripilot.auth.dto.AuthResponse;
import com.tripilot.auth.dto.LoginRequest;
import com.tripilot.auth.dto.RegisterRequest;
import com.tripilot.auth.dto.UserView;
import com.tripilot.auth.model.UserAccount;
import com.tripilot.auth.repository.UserRepository;
import com.tripilot.config.JwtService;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.getEmail());
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists");
        }

        UserAccount user = new UserAccount();
        user.setEmail(email);
        user.setFullName(request.getFullName().trim());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        UserAccount saved = userRepository.save(user);
        return createAuthResponse(saved);
    }

    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.getEmail());
        UserAccount user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (user.getPasswordHash() == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        return createAuthResponse(user);
    }

    public UserView getProfile(String email) {
        UserAccount user = userRepository.findByEmailIgnoreCase(normalizeEmail(email))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));
        return new UserView(user);
    }

    public AuthResponse loginWithGoogle(Map<String, Object> attributes) {
        String email = String.valueOf(attributes.getOrDefault("email", "")).trim().toLowerCase();
        String subject = String.valueOf(attributes.getOrDefault("sub", ""));
        String name = String.valueOf(attributes.getOrDefault("name", "Tripilot traveller"));
        String picture = attributes.get("picture") == null ? null : String.valueOf(attributes.get("picture"));
        Object verified = attributes.get("email_verified");

        if (email.isBlank() || subject.isBlank() || !Boolean.TRUE.equals(verified)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google did not provide a verified email address");
        }

        UserAccount user = userRepository.findByGoogleSubject(subject)
                .or(() -> userRepository.findByEmailIgnoreCase(email))
                .orElseGet(UserAccount::new);
        user.setEmail(email);
        user.setFullName(name);
        user.setGoogleSubject(subject);
        user.setPictureUrl(picture);
        return createAuthResponse(userRepository.save(user));
    }

    private AuthResponse createAuthResponse(UserAccount user) {
        return new AuthResponse(jwtService.createToken(user.getEmail()), new UserView(user));
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }
}
