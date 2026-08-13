const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initDb, isPostgresConnected } = require('./config/db');
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 5000;

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

// Serve frontend in production build if present
const clientDistPath = path.join(__dirname, '../client/dist');
if (require('fs').existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

async function startServer() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
    console.log(`Database engine status: PostgreSQL connected = ${isPostgresConnected()}`);
  });
}

startServer();
