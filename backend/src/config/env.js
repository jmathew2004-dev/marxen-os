require('dotenv').config();

const splitCsv = (value) => String(value || '')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

const numberFromEnv = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const rangedNumberFromEnv = (value, fallback, min, max) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
};

const booleanFromEnv = (value, fallback = false) => {
  if (value === undefined) return fallback;
  return value === 'true';
};

const parseTrustProxy = (value) => {
  if (value === undefined) {
    return process.env.NODE_ENV === 'production' ? 1 : false;
  }

  if (value === 'true') return 1;
  if (value === 'false') return false;

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : value;
};

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const allowedOrigins = [
  ...splitCsv(frontendUrl),
  ...splitCsv(process.env.ALLOWED_ORIGINS)
];

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,

  database: {
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'marxen',
    url: process.env.DATABASE_URL,
    ssl: booleanFromEnv(process.env.DB_SSL),
    sslRejectUnauthorized: booleanFromEnv(process.env.DB_SSL_REJECT_UNAUTHORIZED, true)
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },

  claude: {
    apiKey: process.env.CLAUDE_API_KEY,
    model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-5',
    maxTokens: numberFromEnv(process.env.CLAUDE_MAX_TOKENS, 900),
    temperature: rangedNumberFromEnv(process.env.CLAUDE_TEMPERATURE, 0.7, 0, 1)
  },

  frontend: {
    url: frontendUrl
  },

  security: {
    allowedOrigins,
    allowTunnelOrigins: process.env.ALLOW_TUNNEL_ORIGINS === 'true' || process.env.NODE_ENV !== 'production',
    bodyLimit: process.env.BODY_LIMIT || '200kb',
    trustProxy: parseTrustProxy(process.env.TRUST_PROXY),
    globalRateLimitWindowMs: numberFromEnv(process.env.GLOBAL_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    globalRateLimitMax: numberFromEnv(process.env.GLOBAL_RATE_LIMIT_MAX, 300),
    authRateLimitMax: numberFromEnv(process.env.AUTH_RATE_LIMIT_MAX, 10),
    aiRateLimitMax: numberFromEnv(process.env.AI_RATE_LIMIT_MAX, 30),
    enforceSecureConfig: process.env.ENFORCE_SECURE_CONFIG
      ? process.env.ENFORCE_SECURE_CONFIG === 'true'
      : process.env.NODE_ENV === 'production'
  }
};

module.exports = config;
