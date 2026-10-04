const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./middleware/auth');
const { db } = require('./db');

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  const connectedUsers = new Map(); // socket.id -> userId

  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) {
      return next(new Error('Authentication token missing'));
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return next(new Error('Invalid token'));
      socket.user = user;
      next();
    });
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    connectedUsers.set(socket.id, user.id);

    // Update status to online in db
    db.run(`UPDATE users SET status = 'online' WHERE id = ?`, [user.id]);
    socket.broadcast.emit('user_status_changed', { userId: user.id, status: 'online' });

    // Join channel room
    socket.on('join_channel', (channelId) => {
      socket.join(`channel_${channelId}`);
    });

    // Leave channel room
    socket.on('leave_channel', (channelId) => {
      socket.leave(`channel_${channelId}`);
    });

    // Join direct message room
    socket.on('join_direct', (otherUserId) => {
      const room = [user.id, otherUserId].sort().join('_');
      socket.join(`dm_${room}`);
    });

    // Send Message via Socket
    socket.on('send_message', (data) => {
      const { channel_id, recipient_id, content, media_url } = data;
      if (!content) return;

      db.run(
        `INSERT INTO messages (sender_id, channel_id, recipient_id, content, media_url) VALUES (?, ?, ?, ?, ?)`,
        [user.id, channel_id || null, recipient_id || null, content, media_url || null],
        function (err) {
          if (err) return;

          const msgId = this.lastID;
          db.get(
            `SELECT m.*, u.username as sender_username, u.display_name as sender_display_name, u.avatar_url as sender_avatar
             FROM messages m
             JOIN users u ON m.sender_id = u.id
             WHERE m.id = ?`,
            [msgId],
            (err, message) => {
              if (err || !message) return;

              if (channel_id) {
                io.to(`channel_${channel_id}`).emit('new_message', message);
              } else if (recipient_id) {
                const room = [user.id, recipient_id].sort().join('_');
                io.to(`dm_${room}`).emit('new_message', message);
                // Also emit directly to recipient if online
                io.emit(`dm_notification_${recipient_id}`, message);
              }
            }
          );
        }
      );
    });

    // Typing status
    socket.on('typing', (data) => {
      const { channel_id, recipient_id, isTyping } = data;
      if (channel_id) {
        socket.to(`channel_${channel_id}`).emit('user_typing', { userId: user.id, username: user.username, isTyping, channel_id });
      } else if (recipient_id) {
        const room = [user.id, recipient_id].sort().join('_');
        socket.to(`dm_${room}`).emit('user_typing', { userId: user.id, username: user.username, isTyping });
      }
    });

    // Admin Broadcast
    socket.on('admin_broadcast', (broadcastData) => {
      if (user.role === 'admin') {
        io.emit('system_broadcast', broadcastData);
      }
    });

    socket.on('disconnect', () => {
      connectedUsers.delete(socket.id);
      db.run(`UPDATE users SET status = 'offline' WHERE id = ?`, [user.id]);
      socket.broadcast.emit('user_status_changed', { userId: user.id, status: 'offline' });
    });
  });

  return io;
}

module.exports = { setupSocket };
