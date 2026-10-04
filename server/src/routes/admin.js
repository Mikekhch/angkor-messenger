const express = require('express');
const { db } = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard overview stats
router.get('/stats', (req, res) => {
  db.get(`SELECT COUNT(*) as total_users FROM users`, [], (err, uRow) => {
    if (err) return res.status(500).json({ error: err.message });
    db.get(`SELECT COUNT(*) as total_channels FROM channels`, [], (err, cRow) => {
      if (err) return res.status(500).json({ error: err.message });
      db.get(`SELECT COUNT(*) as total_messages FROM messages`, [], (err, mRow) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({
          totalUsers: uRow ? uRow.total_users : 0,
          totalChannels: cRow ? cRow.total_channels : 0,
          totalMessages: mRow ? mRow.total_messages : 0,
          serverTime: new Date().toISOString()
        });
      });
    });
  });
});

// User management - List all users
router.get('/users', (req, res) => {
  db.all(`SELECT id, username, email, display_name, role, status, is_blocked, created_at FROM users ORDER BY created_at DESC`, [], (err, users) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(users || []);
  });
});

// Block or Unblock User
router.put('/users/:id/block', (req, res) => {
  const userId = req.params.id;
  const { is_blocked } = req.body;
  const blockedInt = is_blocked ? 1 : 0;

  db.run(`UPDATE users SET is_blocked = ? WHERE id = ?`, [blockedInt, userId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: `User status updated successfully`, is_blocked: blockedInt });
  });
});

// Delete user
router.delete('/users/:id', (req, res) => {
  const userId = req.params.id;
  db.run(`DELETE FROM users WHERE id = ?`, [userId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'User deleted successfully' });
  });
});

// Delete channel
router.delete('/channels/:id', (req, res) => {
  const channelId = req.params.id;
  db.run(`DELETE FROM channels WHERE id = ?`, [channelId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Channel deleted successfully' });
  });
});

module.exports = router;
