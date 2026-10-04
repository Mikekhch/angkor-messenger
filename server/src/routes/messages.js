const express = require('express');
const { db } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get channel messages
router.get('/channel/:channelId', authenticateToken, (req, res) => {
  const channelId = req.params.channelId;
  db.all(
    `SELECT m.*, u.username as sender_username, u.display_name as sender_display_name, u.avatar_url as sender_avatar
     FROM messages m
     JOIN users u ON m.sender_id = u.id
     WHERE m.channel_id = ?
     ORDER BY m.created_at ASC`,
    [channelId],
    (err, messages) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(messages || []);
    }
  );
});

// Get direct messages with specific user
router.get('/direct/:userId', authenticateToken, (req, res) => {
  const otherUserId = req.params.userId;
  const currentUserId = req.user.id;

  db.all(
    `SELECT m.*, u.username as sender_username, u.display_name as sender_display_name, u.avatar_url as sender_avatar
     FROM messages m
     JOIN users u ON m.sender_id = u.id
     WHERE (m.sender_id = ? AND m.recipient_id = ?)
        OR (m.sender_id = ? AND m.recipient_id = ?)
     ORDER BY m.created_at ASC`,
    [currentUserId, otherUserId, otherUserId, currentUserId],
    (err, messages) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(messages || []);
    }
  );
});

// Post direct or channel message
router.post('/', authenticateToken, (req, res) => {
  const { channel_id, recipient_id, content, media_url } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  if (!channel_id && !recipient_id) {
    return res.status(400).json({ error: 'Either channel_id or recipient_id is required' });
  }

  db.run(
    `INSERT INTO messages (sender_id, channel_id, recipient_id, content, media_url) VALUES (?, ?, ?, ?, ?)`,
    [req.user.id, channel_id || null, recipient_id || null, content, media_url || null],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      const msgId = this.lastID;
      db.get(
        `SELECT m.*, u.username as sender_username, u.display_name as sender_display_name, u.avatar_url as sender_avatar
         FROM messages m
         JOIN users u ON m.sender_id = u.id
         WHERE m.id = ?`,
        [msgId],
        (err, msg) => {
          if (err) return res.status(500).json({ error: err.message });
          res.status(201).json(msg);
        }
      );
    }
  );
});

module.exports = router;
