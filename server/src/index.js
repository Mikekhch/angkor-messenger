const express = require('express');
const http = require('http');
const cors = require('cors');
const { initDb } = require('./db');
const { setupSocket } = require('./socket');

const authRoutes = require('./routes/auth');
const channelRoutes = require('./routes/channels');
const messageRoutes = require('./routes/messages');
const adminRoutes = require('./routes/admin');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'angkor-messenger-server' });
});

const io = setupSocket(server);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  initDb().then(() => {
    server.listen(PORT, () => {
      console.log(`Angkor Messenger Server running on port ${PORT}`);
    });
  }).catch((err) => {
    console.error('Failed to initialize database:', err);
  });
}

module.exports = { app, server, io, initDb };
