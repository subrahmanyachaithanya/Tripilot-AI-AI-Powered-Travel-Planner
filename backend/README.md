# Backend notes

- `auth/controller/AuthController`: signup, signin, profile and Google-status endpoints.
- `auth/service/AuthService`: validation/business rules, BCrypt password hashing, JWT issuing and Google account upsert.
- `auth/repository/UserRepository`: Spring Data JPA database methods.
- `auth/model/UserAccount`: JPA entity mapped to `users`.
- `config/JwtAuthenticationFilter`: reads and validates the Bearer JWT on protected API requests.
- `config/SecurityConfig`: CORS, public/protected routes, password encoder and OAuth2 login.
- `chat/controller/ChatController`: authenticated chat endpoint.
- `chat/service/ChatService`: application-level chat orchestration.
- `chat/service/GeminiChatService`: creates the Tripilot system prompt and calls Gemini.

The database is H2 by default. Tables are created/updated from JPA entities because `spring.jpa.hibernate.ddl-auto=update` is set for local learning. Do not use automatic schema updates as a substitute for database migrations in a production deployment.
