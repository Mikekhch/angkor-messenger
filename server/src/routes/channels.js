const express = require('express');
const { db } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// List channels
router.get('/', authenticateToken, (req, res) => {
  db.all(`SELECT * FROM channels ORDER BY name ASC`, [], (err, channels) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(channels || []);
  });
});

// Create new channel
router.post('/', authenticateToken, (req, res) => {
  const { name, description, is_private } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Channel name is required' });
  }

  const isPrivateInt = is_private ? 1 : 0;
  db.run(
    `INSERT INTO channels (name, description, is_private, created_by) VALUES (?, ?, ?, ?)`,
    [name.toLowerCase().trim().replace(/\s+/g, '-'), description || '', isPrivateInt, req.user.id],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({ error: 'Channel name already exists' });
        }
        return res.status(500).json({ error: err.message });
      }

      const channelId = this.lastID;
      // Add creator as member
      db.run(`INSERT INTO channel_members (channel_id, user_id) VALUES (?, ?)`, [channelId, req.user.id]);

      res.status(201).json({
        id: channelId,
        name: name.toLowerCase().trim().replace(/\s+/g, '-'),
        description,
        is_private: isPrivateInt,
        created_by: req.user.id
      });
    }
  );
});

// Join channel
router.post('/:id/join', authenticateToken, (req, res) => {
  const channelId = req.params.id;
  db.run(
    `INSERT OR IGNORE INTO channel_members (channel_id, user_id) VALUES (?, ?)`,
    [channelId, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Joined channel successfully' });
    }
  );
});

module.exports = router;
