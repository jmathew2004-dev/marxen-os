const express = require('express');
require('express-async-errors');
const cors = require('cors');
const config = require('./config/env');
const {
  aiLimiter,
  authLimiter,
  globalLimiter,
  requestFirewall,
  securityHeaders,
  validateProductionSecurity
} = require('./middleware/firewall');

const authRoutes = require('./routes/auth');
const attendanceRoutes = require('./routes/attendance');
const workRoutes = require('./routes/work');
const adminRoutes = require('./routes/admin');
const aiRoutes = require('./routes/ai');
const notificationRoutes = require('./routes/notifications');

const errorHandler = require('./middleware/errorHandler');

validateProductionSecurity();

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', config.security.trustProxy);

const productionOrigins = [
  'https://osmarxen.com',
  'https://www.osmarxen.com',
  'https://api.osmarxen.com'
];

const developmentOrigins = [
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

const allowedOrigins = new Set([
  ...config.security.allowedOrigins,
  ...productionOrigins,
  ...(config.nodeEnv === 'production' ? [] : developmentOrigins)
]);

const isAllowedTunnelOrigin = (origin) => {
  if (!config.security.allowTunnelOrigins) {
    return false;
  }

  try {
    const { hostname, protocol } = new URL(origin);
    return protocol === 'https:' && (
      hostname.endsWith('.loca.lt') ||
      hostname.endsWith('.trycloudflare.com')
    );
  } catch {
    return false;
  }
};

// Middleware
app.use(securityHeaders);
app.use(requestFirewall);
app.use(globalLimiter);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin) || isAllowedTunnelOrigin(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  optionsSuccessStatus: 204
}));
app.use(express.json({ limit: config.security.bodyLimit }));
app.use(express.urlencoded({ extended: true, limit: config.security.bodyLimit }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/work', workRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Error handling
app.use(errorHandler);

module.exports = app;
