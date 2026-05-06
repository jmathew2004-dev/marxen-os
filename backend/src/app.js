const express = require('express');
require('express-async-errors');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config/env');

const authRoutes = require('./routes/auth');
const attendanceRoutes = require('./routes/attendance');
const workRoutes = require('./routes/work');
const adminRoutes = require('./routes/admin');
const aiRoutes = require('./routes/ai');

const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.frontend.url,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/work', workRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Error handling
app.use(errorHandler);

module.exports = app;
