const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { username, email, password, display_name } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const displayName = display_name || username;

    db.run(
      `INSERT INTO users (username, email, password, display_name) VALUES (?, ?, ?, ?)`,
      [username, email, hashedPassword, displayName],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ error: 'Username or email already exists' });
          }
          return res.status(500).json({ error: err.message });
        }

        const user = { id: this.lastID, username, email, display_name: displayName, role: 'user' };
        const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, user });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  db.get(`SELECT * FROM users WHERE username = ? OR email = ?`, [username, username], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    if (user.is_blocked) {
      return res.status(403).json({ error: 'Account has been suspended' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

    const tokenPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      display_name: user.display_name,
      role: user.role
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        role: user.role,
        status: user.status
      }
    });
  });
});

// Get current user profile
router.get('/me', authenticateToken, (req, res) => {
  db.get(`SELECT id, username, email, display_name, avatar_url, role, status, created_at FROM users WHERE id = ?`, [req.user.id], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  });
});

// List all active users (for direct messaging)
router.get('/users', authenticateToken, (req, res) => {
  db.all(`SELECT id, username, display_name, avatar_url, status FROM users WHERE id != ? AND is_blocked = 0`, [req.user.id], (err, users) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(users || []);
  });
});

module.exports = router;
