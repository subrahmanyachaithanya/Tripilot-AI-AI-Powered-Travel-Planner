# Tripilot AI — Java 21 + Spring Boot + React

A beginner-friendly starter for an AI travel-planning chat application. The project is split into a React frontend and a Spring Boot backend with clear layers: Controller → Service → Repository → Entity.

## What works in this starter

- Sign up with name, email and password.
- Sign in with email and password.
- Passwords stored as BCrypt hashes (never plain text).
- JWT authentication for protected API calls.
- Google OAuth2 login flow (requires your own Google OAuth client credentials).
- ChatGPT-style travel-planning workspace with a sidebar, new-trip action, prompt suggestions and chat composer.
- Gemini API integration on the backend (requires your own Gemini API key).
- H2 file database by default so the project can start without installing a database server.
- Optional PostgreSQL profile/configuration.

**Honest setup note:** Google login cannot complete until you create a Google OAuth web client and put its client ID/secret in `backend/.env`. AI replies require a Gemini API key. The chat workspace and local email/password authentication work without either external key. This starter does not provide live hotel/flight availability or booking; those require separate travel-provider APIs and are a later integration.

## Technology

- Java 21
- Spring Boot 4.1.2
- Spring Security + JWT + Google OAuth2 Client
- Spring Data JPA / Hibernate
- H2 (default) or PostgreSQL (optional)
- React 18, Vite 4, React Router 6
- Gemini API model default: `gemini-3.8-flash`

## Project structure

```text
tripilot-ai-starter/
├── backend/
│   ├── mvnw                       # downloads/uses Maven 3.9.11 for this project
│   ├── pom.xml
│   └── src/main/java/com/tripilot/
│       ├── TripilotApplication.java
│       ├── auth/
│       │   ├── controller/         # REST endpoints for register/login/me
│       │   ├── dto/                # request/response objects
│       │   ├── model/              # UserAccount entity
│       │   ├── repository/         # UserRepository
│       │   └── service/            # authentication/business logic
│       ├── chat/
│       │   ├── controller/         # protected chat endpoint
│       │   ├── dto/                # chat request/response objects
│       │   └── service/            # Gemini integration and prompt logic
│       └── config/                 # security, JWT and Google OAuth config
└── frontend/
    ├── src/
    │   ├── auth/                   # AuthContext and protected routes
    │   ├── components/             # reusable chat components
    │   ├── pages/                  # login, signup, OAuth callback, chat
    │   ├── services/               # backend HTTP client
    │   └── styles/                 # application styling
    └── package.json
```

## Requirements

- JDK 21 installed and selected in the terminal (`java -version` should show 21).
- `curl`, `tar`, and `bash` for the included Maven bootstrap script.
- Node.js 16.20.2 or newer for the Vite 4 frontend. Your Ubuntu laptop's Node 16.20.2 is suitable.
- Internet access for the first Maven and npm dependency downloads.

## 1. Start the backend

Open Terminal 1:

```bash
cd ~/Downloads/tripilot-ai-starter/backend
java -version
```

Create your local environment file:

```bash
cp .env.example .env
nano .env
```

For the first run, you can leave the example values as they are. Google and Gemini will remain disabled until you add real credentials. Do not commit `.env` to GitHub.

Load environment values in the current terminal:

```bash
set -a
source .env
set +a
```

Run Spring Boot using the included Maven bootstrap:

```bash
./mvnw spring-boot:run
```

The first run downloads Maven 3.9.11 and Java dependencies. Wait for:

```text
Tomcat started on port 8080
Started TripilotApplication
```

Backend health check: <http://localhost:8080/actuator/health>

H2 database console: <http://localhost:8080/h2-console>

H2 connection values:

```text
JDBC URL: jdbc:h2:file:./data/tripilot;AUTO_SERVER=TRUE
User Name: sa
Password: (empty)
```

## 2. Start the frontend

Open Terminal 2:

```bash
cd ~/Downloads/tripilot-ai-starter/frontend
npm install
npm run dev
```

Open <http://localhost:5173>.

Keep both terminals running while developing.

## 3. Configure Google sign-in

1. Open Google Cloud Console: <https://console.cloud.google.com/apis/credentials>.
2. Create or select a Google Cloud project.
3. Configure the OAuth consent screen / Google Auth Platform as requested.
4. Create an OAuth Client ID with application type **Web application**.
5. Add this Authorized JavaScript origin:

   `http://localhost:5173`

6. Add this Authorized redirect URI exactly:

   `http://localhost:8080/login/oauth2/code/google`

7. Copy the Client ID and Client Secret into `backend/.env`:

```dotenv
GOOGLE_OAUTH_ENABLED=true
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

8. Restart the backend after changing `.env`.

The Google button is visible in the sign-in screen. If OAuth is not configured, clicking it shows a setup message rather than pretending Google login succeeded.

## 4. Configure Gemini AI chat

Create an API key in Google AI Studio: <https://aistudio.google.com/app/apikey>.

Put it in `backend/.env`:

```dotenv
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-3.8-flash
```

Restart the backend. The API key stays on the server; it is never placed in React code.

The assistant prompt is tailored for trip planning. It should distinguish estimates from confirmed prices and must not claim that a booking or live availability check was performed.

## 5. Optional PostgreSQL

H2 is enabled by default. To use PostgreSQL instead, create a database named `tripilot`, then edit `backend/.env`:

```dotenv
DB_URL=jdbc:postgresql://localhost:5432/tripilot
DB_DRIVER=org.postgresql.Driver
DB_USERNAME=postgres
DB_PASSWORD=your-postgres-password
```

The PostgreSQL driver is included. Restart the backend after changing database settings. Keep secrets in `.env` only.

## API endpoints

Public:

- `POST /api/auth/register` — create an account.
- `POST /api/auth/login` — sign in and receive a JWT.
- `GET /api/auth/google/status` — check whether Google OAuth has been configured.
- `GET /actuator/health` — backend health check.

Authenticated (send `Authorization: Bearer <token>`):

- `GET /api/auth/me` — current user profile.
- `POST /api/chat` — send a travel question and recent conversation history to Gemini.

Google OAuth start URL:

- `GET /oauth2/authorization/google`

## Architecture in one example

When a signed-in user sends a travel question:

1. React calls `POST /api/chat` with a JWT in the Authorization header.
2. `JwtAuthenticationFilter` validates the token and identifies the user.
3. `ChatController` validates the request and calls `ChatService`.
4. `ChatService` prepares the travel-planning system prompt and conversation history.
5. `GeminiChatService` calls the Gemini API using the key stored on the backend.
6. The response travels back as JSON and React displays it.

For authentication, the structure is similar: `AuthController → AuthService → UserRepository → UserAccount entity/database`.

## Important learning / production notes

- This is a learning starter, not a production security audit. Before deployment, use HTTPS, a strong unique JWT secret, restricted CORS origins, secure token storage/cookies, rate limiting, email verification, password reset, and proper monitoring.
- The default H2 file database is for local development. PostgreSQL is recommended for a deployed multi-user application.
- The starter keeps the current chat in React state. Server-side conversation history, travel API integrations (maps/places/flights/hotels), saved itineraries and booking workflows are natural next phases.
- Never put Google client secrets, Gemini keys, database passwords or JWT secrets in frontend files or commit them to Git.
