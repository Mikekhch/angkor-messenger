const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '../data.json');

const initialData = {
  featureFlags: {
    video_calling: true,
    voice_calling: true,
    file_sharing: true
  },
  users: [
    {
      id: "usr_1",
      name: "Sophea Chan",
      email: "sophea.chan@example.com",
      avatar: "https://i.pravatar.cc/150?u=sophea",
      authProvider: "google",
      status: "online",
      isBanned: false,
      pin: "1234",
      biometricEnabled: true,
      lastActive: new Date().toISOString()
    },
    {
      id: "usr_2",
      name: "Vireak Bot",
      email: "vireak.bot@example.com",
      avatar: "https://i.pravatar.cc/150?u=vireak",
      authProvider: "apple",
      status: "online",
      isBanned: false,
      pin: "0000",
      biometricEnabled: false,
      lastActive: new Date().toISOString()
    },
    {
      id: "usr_3",
      name: "Bopha Khem",
      email: "bopha.khem@example.com",
      avatar: "https://i.pravatar.cc/150?u=bopha",
      authProvider: "google",
      status: "offline",
      isBanned: false,
      pin: "5555",
      biometricEnabled: true,
      lastActive: new Date(Date.now() - 3600000).toISOString()
    }
  ],
  messages: [
    {
      id: "msg_1",
      senderId: "usr_2",
      receiverId: "usr_1",
      content: "Hello Sophea! Welcome to Angkor Messenger 🇰🇭",
      type: "text",
      timestamp: new Date(Date.now() - 1000000).toISOString()
    },
    {
      id: "msg_2",
      senderId: "usr_1",
      receiverId: "usr_2",
      content: "Thanks Vireak! Real-time communication feels super fast.",
      type: "text",
      timestamp: new Date(Date.now() - 500000).toISOString()
    }
  ],
  broadcasts: [],
  metrics: {
    callVolume: {
      voiceCallsTotal: 142,
      videoCallsTotal: 98,
      failedCalls: 3,
      avgDurationSeconds: 245
    }
  }
};

function loadData() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error loading DB, initializing defaults:", err.message);
  }
  saveData(initialData);
  return JSON.parse(JSON.stringify(initialData));
}

function saveData(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error("Error saving DB:", err.message);
  }
}

const db = loadData();

module.exports = {
  db,
  save: () => saveData(db)
};
