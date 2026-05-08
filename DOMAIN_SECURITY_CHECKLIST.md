# Marxen OS Domain and Firewall Protection Checklist

Use this when `osmarxen.com` is purchased and ready for production.

## 1. Registrar Protection

- Buy the domain from Cloudflare Registrar, Porkbun, Namecheap, or another reputable registrar.
- Turn on registrar lock or transfer lock.
- Turn on auto-renew.
- Turn on WHOIS/domain privacy when the registrar supports it.
- Protect the registrar account with a passkey or authenticator-app 2FA.
- Use a dedicated owner email for the domain, not a shared team inbox.

## 2. DNS and Edge Firewall

- Put DNS behind Cloudflare.
- Enable DNSSEC after the nameservers are stable.
- Use proxied DNS records where the host supports it:
  - `osmarxen.com` -> frontend hosting target
  - `www.osmarxen.com` -> frontend hosting target
  - `api.osmarxen.com` -> backend hosting target
- Set SSL/TLS mode to `Full (strict)`.
- Enable Always Use HTTPS.
- Enable HSTS only after HTTPS is verified on every subdomain.
- Enable Cloudflare WAF managed rules.
- Add a WAF custom rule to challenge obvious scanner paths:
  - `/.env`
  - `/.git/*`
  - `/wp-login.php`
  - `/xmlrpc.php`
  - `/phpmyadmin/*`
- Add Cloudflare rate limiting rules:
  - `/api/auth/*`: strict login protection
  - `/api/ai/*`: moderate AI Buddy protection
  - `/api/*`: general API abuse protection

## 3. Backend Production Environment

Set these on the backend host:

```bash
NODE_ENV=production
FRONTEND_URL=https://osmarxen.com
ALLOWED_ORIGINS=https://osmarxen.com,https://www.osmarxen.com
TRUST_PROXY=1
ALLOW_TUNNEL_ORIGINS=false
ENFORCE_SECURE_CONFIG=true
BODY_LIMIT=200kb
GLOBAL_RATE_LIMIT_WINDOW_MS=900000
GLOBAL_RATE_LIMIT_MAX=300
AUTH_RATE_LIMIT_MAX=10
AI_RATE_LIMIT_MAX=30
```

Also set:

```bash
JWT_SECRET=<unique 32+ character random secret>
DATABASE_URL=<managed postgres url>
CLAUDE_API_KEY=<anthropic key if AI Buddy should use live AI>
```

Generate a strong JWT secret:

```bash
openssl rand -base64 48
```

## 4. Database Protection

- Use managed PostgreSQL where possible.
- Keep the database private or restricted to the backend host.
- Require SSL for production database connections when the provider supports it.
- Use a database user with only the permissions Marxen OS needs.
- Turn on automated daily backups.
- Store backup access in the owner account only.

## 5. App Protection Already Added

- Security headers through Helmet.
- Production HSTS support.
- CORS allowlist for Marxen domains.
- Tunnel origins disabled in production unless explicitly enabled.
- Global API request rate limit.
- Stricter login rate limit.
- AI Buddy rate limit.
- Request firewall for scanner paths and unsafe methods.
- Request body size limit.
- Production startup checks for weak JWT/database/domain settings.

## Official References

- Cloudflare DNSSEC: https://developers.cloudflare.com/dns/dnssec/
- Cloudflare SSL/TLS Full strict: https://developers.cloudflare.com/ssl/get-started/
- Cloudflare WAF setup: https://developers.cloudflare.com/waf/get-started/
- Cloudflare rate limiting rules: https://developers.cloudflare.com/waf/rate-limiting-rules/
- Domain lock explanation: https://workers.cloudflare.com/learning/dns/how-to-transfer-a-domain-name
- Domain privacy explanation: https://www.cloudflare.com/learning/dns/what-is-domain-privacy/
