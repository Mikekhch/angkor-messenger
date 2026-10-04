const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = process.env.NODE_ENV === 'test' ? ':memory:' : path.join(__dirname, '../angkor.db');
const db = new sqlite3.Database(dbPath);

function initDb() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          display_name TEXT,
          avatar_url TEXT,
          role TEXT DEFAULT 'user',
          status TEXT DEFAULT 'offline',
          is_blocked INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Channels table
      db.run(`
        CREATE TABLE IF NOT EXISTS channels (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          description TEXT,
          is_private INTEGER DEFAULT 0,
          created_by INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(created_by) REFERENCES users(id)
        )
      `);

      // Channel Members
      db.run(`
        CREATE TABLE IF NOT EXISTS channel_members (
          channel_id INTEGER,
          user_id INTEGER,
          joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (channel_id, user_id),
          FOREIGN KEY(channel_id) REFERENCES channels(id),
          FOREIGN KEY(user_id) REFERENCES users(id)
        )
      `);

      // Messages table (handles both channel & direct messages)
      db.run(`
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sender_id INTEGER NOT NULL,
          channel_id INTEGER,
          recipient_id INTEGER,
          content TEXT NOT NULL,
          media_url TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(sender_id) REFERENCES users(id),
          FOREIGN KEY(channel_id) REFERENCES channels(id),
          FOREIGN KEY(recipient_id) REFERENCES users(id)
        )
      `);

      // System Settings table
      db.run(`
        CREATE TABLE IF NOT EXISTS system_settings (
          key TEXT PRIMARY KEY,
          value TEXT
        )
      `, async (err) => {
        if (err) return reject(err);

        // Create default Admin User if not exists
        db.get(`SELECT * FROM users WHERE username = 'admin'`, async (err, row) => {
          if (err) return reject(err);
          if (!row) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            db.run(
              `INSERT INTO users (username, email, password, display_name, role) VALUES (?, ?, ?, ?, ?)`,
              ['admin', 'admin@angkor.kh', hashedPassword, 'Angkor Admin', 'admin']
            );
          }
        });

        // Create default general channel
        db.get(`SELECT * FROM channels WHERE name = 'general'`, (err, row) => {
          if (err) return reject(err);
          if (!row) {
            db.run(
              `INSERT INTO channels (name, description, is_private) VALUES (?, ?, 0)`,
              ['general', 'General discussion channel for Angkor Messenger']
            );
          }
          resolve();
        });
      });
    });
  });
}

module.exports = { db, initDb };
