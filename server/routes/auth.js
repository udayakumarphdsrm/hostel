const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool, isPostgresConnected, fallbackData } = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are mandatory.' });
    }

    let user = null;

    if (isPostgresConnected()) {
      const result = await pool.query('SELECT * FROM users WHERE username = $1', [username.trim()]);
      if (result.rows.length > 0) {
        user = result.rows[0];
      }
    } else {
      user = fallbackData.users.find(u => u.username === username.trim());
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      fullName: user.full_name
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'super_secret_hostel_jwt_key_2026', {
      expiresIn: '24h'
    });

    return res.json({
      message: 'Login successful',
      token,
      user: payload
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during authentication.' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
