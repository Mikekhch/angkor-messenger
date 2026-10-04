const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { db, save } = require('./db');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.use(cors());
app.use(express.json());

// File upload setup
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });
app.use('/uploads', express.static(uploadDir));

// Active Sockets Map: userId -> socketId
const activeUsers = new Map();

// --- REST API ENDPOINTS ---

// Auth Simulation
app.post('/api/auth/login', (req, res) => {
  const { email, name, provider, avatar } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  let user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    user = {
      id: "usr_" + Date.now(),
      name: name || email.split('@')[0],
      email: email,
      avatar: avatar || `https://i.pravatar.cc/150?u=${email}`,
      authProvider: provider || "google",
      status: "online",
      isBanned: false,
      pin: "1234",
      biometricEnabled: true,
      lastActive: new Date().toISOString()
    };
    db.users.push(user);
    save();
  } else if (user.isBanned) {
    return res.status(403).json({ error: "Account is banned. Contact system administrator." });
  } else {
    user.status = "online";
    user.lastActive = new Date().toISOString();
    save();
  }

  return res.json({ success: true, user });
});

// Verify PIN
app.post('/api/auth/verify-pin', (req, res) => {
  const { userId, pin } = req.body;
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  if (user.pin && user.pin !== pin) {
    return res.status(401).json({ success: false, error: "Incorrect PIN code" });
  }
  return res.json({ success: true, message: "PIN verified" });
});

// Update Security Settings (PIN / Biometric)
app.put('/api/auth/settings', (req, res) => {
  const { userId, pin, biometricEnabled, activeStatus } = req.body;
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  if (pin !== undefined) user.pin = pin;
  if (biometricEnabled !== undefined) user.biometricEnabled = biometricEnabled;
  if (activeStatus !== undefined) user.status = activeStatus ? "online" : "offline";
  save();

  // Broadcast user status update
  io.emit('user_status_changed', { userId: user.id, status: user.status });

  return res.json({ success: true, user });
});

// Get Feature Flags
app.get('/api/features', (req, res) => {
  res.json(db.featureFlags);
});

// File Upload Endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!db.featureFlags.file_sharing) {
    return res.status(403).json({ error: "File sharing feature is currently disabled by admin." });
  }
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    fileUrl,
    fileName: req.file.originalname,
    fileType: req.file.mimetype,
    fileSize: req.file.size
  });
});

// Admin: System Metrics
app.get('/api/admin/metrics', (req, res) => {
  const activeCount = activeUsers.size;
  const memoryUsage = process.memoryUsage();
  res.json({
    systemHealth: {
      status: "Healthy",
      uptimeSeconds: Math.floor(process.uptime()),
      memoryUsageMB: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2),
      cpuLoadPercentage: (Math.random() * 5 + 2).toFixed(1)
    },
    activeUsersCount: activeCount,
    totalUsersCount: db.users.length,
    callVolume: db.metrics.callVolume,
    featureFlags: db.featureFlags
  });
});

// Admin: Feature Management
app.get('/api/admin/features', (req, res) => {
  res.json(db.featureFlags);
});

app.post('/api/admin/features', (req, res) => {
  const { video_calling, voice_calling, file_sharing } = req.body;
  if (video_calling !== undefined) db.featureFlags.video_calling = !!video_calling;
  if (voice_calling !== undefined) db.featureFlags.voice_calling = !!voice_calling;
  if (file_sharing !== undefined) db.featureFlags.file_sharing = !!file_sharing;
  save();

  // Notify all connected mobile clients instantly of dynamic feature updates
  io.emit('feature_flags_updated', db.featureFlags);

  res.json({ success: true, featureFlags: db.featureFlags });
});

// Admin: User Management
app.get('/api/admin/users', (req, res) => {
  const usersWithOnlineState = db.users.map(u => ({
    ...u,
    isOnline: activeUsers.has(u.id)
  }));
  res.json(usersWithOnlineState);
});

app.post('/api/admin/users/:id/ban', (req, res) => {
  const { id } = req.params;
  const { isBanned } = req.body;
  const user = db.users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  user.isBanned = !!isBanned;
  save();

  if (user.isBanned) {
    const socketId = activeUsers.get(user.id);
    if (socketId) {
      io.to(socketId).emit('account_banned', { message: "Your account has been banned by an administrator." });
      activeUsers.delete(user.id);
    }
  }

  io.emit('user_updated', user);
  res.json({ success: true, user });
});

// Admin: System-wide Broadcast Push Notifications
app.get('/api/admin/broadcasts', (req, res) => {
  res.json(db.broadcasts);
});

app.post('/api/admin/broadcast', (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) {
    return res.status(400).json({ error: "Title and body are required." });
  }

  const broadcast = {
    id: "bcast_" + Date.now(),
    title,
    body,
    timestamp: new Date().toISOString()
  };

  db.broadcasts.unshift(broadcast);
  save();

  // Broadcast notification to all connected socket clients
  io.emit('system_broadcast', broadcast);

  res.json({ success: true, broadcast });
});

// Get Messages
app.get('/api/messages', (req, res) => {
  const { userId, targetId } = req.query;
  if (!userId || !targetId) {
    return res.status(400).json({ error: "userId and targetId are required" });
  }

  const list = db.messages.filter(m =>
    (m.senderId === userId && m.receiverId === targetId) ||
    (m.senderId === targetId && m.receiverId === userId)
  );

  res.json(list);
});


// --- REAL-TIME SOCKET.IO HANDLERS ---
io.on('connection', (socket) => {
  let connectedUserId = null;

  socket.on('register_user', ({ userId }) => {
    if (!userId) return;
    const user = db.users.find(u => u.id === userId);
    if (user && user.isBanned) {
      socket.emit('account_banned', { message: "Account is banned" });
      return;
    }
    connectedUserId = userId;
    activeUsers.set(userId, socket.id);

    if (user) {
      user.status = "online";
      user.lastActive = new Date().toISOString();
      save();
    }

    io.emit('user_status_changed', { userId, status: "online" });
    socket.emit('feature_flags_updated', db.featureFlags);
  });

  // Direct Messaging
  socket.on('send_message', (data) => {
    const { senderId, receiverId, content, type, fileUrl, fileName } = data;

    const sender = db.users.find(u => u.id === senderId);
    if (sender && sender.isBanned) {
      socket.emit('error_message', { message: "Cannot send messages. Account is banned." });
      return;
    }

    if (type === 'file' && !db.featureFlags.file_sharing) {
      socket.emit('error_message', { message: "File sharing feature is currently disabled." });
      return;
    }

    const newMessage = {
      id: "msg_" + Date.now(),
      senderId,
      receiverId,
      content: content || "",
      type: type || "text",
      fileUrl: fileUrl || null,
      fileName: fileName || null,
      timestamp: new Date().toISOString()
    };

    db.messages.push(newMessage);
    save();

    // Send back to sender
    socket.emit('receive_message', newMessage);

    // Send to receiver if online
    const receiverSocketId = activeUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receive_message', newMessage);
    }
  });

  // WebRTC Voice/Video Call Signaling
  socket.on('call_offer', (data) => {
    const { callerId, calleeId, offer, callType } = data; // callType: 'voice' | 'video'

    if (callType === 'video' && !db.featureFlags.video_calling) {
      socket.emit('call_error', { message: "Video calling is currently disabled by system administrator." });
      return;
    }
    if (callType === 'voice' && !db.featureFlags.voice_calling) {
      socket.emit('call_error', { message: "Voice calling is currently disabled by system administrator." });
      return;
    }

    // Increment metrics
    if (callType === 'video') db.metrics.callVolume.videoCallsTotal++;
    if (callType === 'voice') db.metrics.callVolume.voiceCallsTotal++;
    save();

    const calleeSocketId = activeUsers.get(calleeId);
    if (calleeSocketId) {
      io.to(calleeSocketId).emit('incoming_call', {
        callerId,
        offer,
        callType
      });
    } else {
      socket.emit('call_failed', { calleeId, reason: "User is offline" });
    }
  });

  socket.on('call_answer', (data) => {
    const { callerId, calleeId, answer } = data;
    const callerSocketId = activeUsers.get(callerId);
    if (callerSocketId) {
      io.to(callerSocketId).emit('call_answered', { calleeId, answer });
    }
  });

  socket.on('ice_candidate', (data) => {
    const { targetId, candidate } = data;
    const targetSocketId = activeUsers.get(targetId);
    if (targetSocketId) {
      io.to(targetSocketId).emit('ice_candidate', { senderId: connectedUserId, candidate });
    }
  });

  socket.on('end_call', (data) => {
    const { targetId, reason } = data;
    const targetSocketId = activeUsers.get(targetId);
    if (targetSocketId) {
      io.to(targetSocketId).emit('call_ended', { reason: reason || "Call ended" });
    }
  });

  socket.on('disconnect', () => {
    if (connectedUserId) {
      activeUsers.delete(connectedUserId);
      const user = db.users.find(u => u.id === connectedUserId);
      if (user) {
        user.status = "offline";
        user.lastActive = new Date().toISOString();
        save();
      }
      io.emit('user_status_changed', { userId: connectedUserId, status: "offline" });
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Angkor Messenger Server running on http://localhost:${PORT}`);
});

module.exports = { app, server };
