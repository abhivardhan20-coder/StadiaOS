# Security Policy

## Secret Management
- Environment variables are used for secrets (JWT_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GEMINI_API_KEY).
- `.env` file is gitignored and must not be committed.
- In production, `JWT_SECRET` must be set; missing secret causes the app to exit.

## CSRF Protection
- Double-submit cookie pattern: a random CSRF token is stored in an encrypted cookie (`csrf_token`) and must be sent via the `x-csrf-token` header on state-changing requests.
- Middleware validates that the token matches.

## JWT Session Handling
- Sessions are JSON Web Tokens signed with `JWT_SECRET`.
- Tokens contain user ID and name, expire in 1 day.
- Tokens are stored in HTTP-only, Secure cookies named `token`.
- In development, a fallback secret is used only when `NODE_ENV` is not production.

## CSP and Helmet
- HTTP headers are set via Helmet.js:
  - Content Security Policy restricts sources for scripts, styles, etc.
  - Other headers (XSS protection, no-sniff, etc.) are enabled.
- Adjustments are made to allow inline styles/scripts required by the UI framework.

## Rate Limiting
- General API rate limit: 30 requests per minute per IP.
- AI-specific endpoints (`/ops-copilot`, `/polyglot`, `/wayfinder`, `/green-ops`) have a stricter limit of 10 requests per minute per IP.
- Limits prevent abuse and control costs associated with external AI calls.

## Reporting a Vulnerability
If you discover a security issue, please contact the repository maintainer via GitHub Issues or email (if provided). Do not disclose the issue publicly until a fix is available.