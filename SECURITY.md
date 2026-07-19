# Security Policy

## Supported Versions
Only the latest branch (`main`) is actively supported with security updates.

## Threat Model & Security Features
- **Secret Management**: All sensitive keys (e.g. `GEMINI_API_KEY`, `GOOGLE_CLIENT_SECRET`, `JWT_SECRET`) must be provided via the `.env` file, which is strictly omitted from version control.
- **CSRF Protection**: A double-submit cookie strategy is enforced on all non-GET routes using custom middleware in the backend. 
- **Session Handling**: Authentication is managed via HTTP-Only, Secure JWT cookies. The backend will refuse to start in production if `JWT_SECRET` is unset, explicitly averting fallback vulnerabilities.
- **CSP & Helmet**: Standard browser security is enforced via `helmet`. The Content Security Policy explicitly limits script origins and frame embedding for maximum safety.
- **Rate Limiting**: AI endpoints use a strict secondary rate limit layer (10 req/min/IP) to prevent abuse and excessive API costs, independent of the general API limit (30 req/min/IP).

## Reporting a Vulnerability
If you discover a vulnerability, please do NOT file a public issue. Instead, email the repository maintainers securely. We will respond with an initial assessment within 48 hours.