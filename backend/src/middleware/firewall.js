const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('../config/env');

const isProduction = config.nodeEnv === 'production';

const securityHeaders = helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'same-site' },
  hsts: isProduction
    ? {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
    : false,
  referrerPolicy: { policy: 'no-referrer' }
});

const blockedPathPatterns = [
  /(?:^|\/)\.(?:env|git|svn|hg)(?:\/|$)/i,
  /^\/(?:wp-admin|wp-content|wp-includes|wp-login\.php|xmlrpc\.php)(?:\/|$)/i,
  /^\/(?:phpmyadmin|pma|adminer|server-status|actuator|cgi-bin)(?:\/|$)/i,
  /(?:^|\/)(?:composer\.(?:json|lock)|package-lock\.json|yarn\.lock|pnpm-lock\.yaml|docker-compose\.ya?ml)$/i,
  /\.php$/i
];

const allowedMethods = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']);

const requestFirewall = (req, res, next) => {
  if (!allowedMethods.has(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (blockedPathPatterns.some((pattern) => pattern.test(req.path))) {
    return res.status(403).json({ error: 'Request blocked' });
  }

  return next();
};

const createLimiter = ({ max, message }) => rateLimit({
  windowMs: config.security.globalRateLimitWindowMs,
  max,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: (req) => req.path === '/health',
  message: { error: message }
});

const globalLimiter = createLimiter({
  max: config.security.globalRateLimitMax,
  message: 'Too many requests. Please slow down and try again shortly.'
});

const authLimiter = createLimiter({
  max: config.security.authRateLimitMax,
  message: 'Too many login attempts. Please wait before trying again.'
});

const aiLimiter = createLimiter({
  max: config.security.aiRateLimitMax,
  message: 'AI Buddy is receiving too many requests. Please try again shortly.'
});

const weakJwtSecrets = new Set([
  'your-secret-key-change-in-production',
  'your-super-secret-jwt-key-change-this-in-production',
  'change-this-in-production'
]);

const validateProductionSecurity = () => {
  if (!config.security.enforceSecureConfig) {
    return;
  }

  const problems = [];
  const jwtSecret = String(config.jwt.secret || '');
  const origins = config.security.allowedOrigins;

  if (jwtSecret.length < 32 || weakJwtSecrets.has(jwtSecret)) {
    problems.push('JWT_SECRET must be a unique 32+ character secret.');
  }

  if (!origins.length || origins.some((origin) => /localhost|127\.0\.0\.1/i.test(origin))) {
    problems.push('ALLOWED_ORIGINS/FRONTEND_URL must point to production HTTPS domains.');
  }

  if (!config.database.url && ['postgres', 'password', ''].includes(String(config.database.password || '').toLowerCase())) {
    problems.push('Production database password must not use a default value.');
  }

  if (problems.length) {
    throw new Error(`Secure production config required: ${problems.join(' ')}`);
  }
};

module.exports = {
  aiLimiter,
  authLimiter,
  globalLimiter,
  requestFirewall,
  securityHeaders,
  validateProductionSecurity
};
