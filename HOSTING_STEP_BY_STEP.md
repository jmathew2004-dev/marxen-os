# Marxen OS Hosting Step by Step

This path assumes:

- Domain: `osmarxen.com`
- Frontend: Vercel
- Backend API: Railway or Render
- Database: managed PostgreSQL from the backend host, Neon, Supabase, or Render/Railway Postgres
- DNS screen: GoDaddy DNS Records

## 1. Deploy the Backend API

Create a new backend service from this repo.

Backend settings:

```text
Root Directory: backend
Build Command: npm install
Start Command: npm start
Health Check Path: /health
```

Set backend environment variables:

```bash
NODE_ENV=production
DATABASE_URL=<your managed postgres connection string>
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=true
JWT_SECRET=<generate with: openssl rand -base64 48>
JWT_EXPIRES_IN=7d
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
CLAUDE_API_KEY=<optional live AI key>
CLAUDE_MODEL=claude-sonnet-4-5
CLAUDE_MAX_TOKENS=900
CLAUDE_TEMPERATURE=0.7
```

After deploy, run the database migration on the backend host:

```bash
npm run migrate
```

Then open:

```text
https://<backend-host-url>/health
```

It should return:

```json
{"status":"ok"}
```

## 2. Add the API Custom Domain

In the backend host, add this custom domain:

```text
api.osmarxen.com
```

The host will show a DNS target. Copy that value.

In GoDaddy DNS Records, add:

```text
Type: CNAME
Name: api
Value: <backend host DNS target>
TTL: 1/2 Hour
```

Do not type `https://` in the DNS value.

## 3. Deploy the Frontend

Create a Vercel project from this repo.

Frontend settings:

```text
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Set frontend environment variable:

```bash
VITE_API_BASE_URL=https://api.osmarxen.com/api
```

Deploy it.

This repo includes `frontend/vercel.json` so direct refreshes on routes such as `/admin` still load the React app.

## 4. Add the Frontend Custom Domains

In Vercel, add both domains:

```text
osmarxen.com
www.osmarxen.com
```

In GoDaddy DNS Records, add or update:

```text
Type: A
Name: @
Value: 76.76.21.21
TTL: 1/2 Hour
```

```text
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 1/2 Hour
```

Delete conflicting GoDaddy parking records for `@` or `www` only if Vercel says they conflict. Do not delete `NS` or `SOA` records.

## 5. Verify

Check these URLs:

```text
https://api.osmarxen.com/health
https://osmarxen.com
https://www.osmarxen.com
```

DNS can be instant or take a few hours.

## 6. Security After It Is Live

In GoDaddy:

- Keep domain lock on.
- Turn on auto-renew.
- Turn on privacy/protection.
- Use 2FA/passkey on the account.

For stronger firewall protection, move nameservers to Cloudflare after the site is working, then enable:

- DNSSEC
- SSL/TLS Full strict
- Always Use HTTPS
- WAF managed rules
- Rate limiting for `/api/auth/*`, `/api/ai/*`, and `/api/*`
