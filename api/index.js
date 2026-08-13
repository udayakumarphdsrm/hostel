const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDb, isPostgresConnected } = require('../../server/config/db');
const authRoutes = require('../../server/routes/auth');
const reportRoutes = require('../../server/routes/reports');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    postgresConnected: isPostgresConnected()
  });
});

// Initialize database on first request
let dbInitialized = false;
app.use(async (req, res, next) => {
  if (!dbInitialized) {
    try {
      await initDb();
      dbInitialized = true;
    } catch (err) {
      console.error('Database initialization error:', err.message);
    }
  }
  next();
});

module.exports = app;
