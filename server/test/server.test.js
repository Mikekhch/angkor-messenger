const test = require('node:test');
const assert = require('node:assert');
const http = require('http');
process.env.NODE_ENV = 'test';
const { app, initDb } = require('../src/index');

let server;
let baseUrl;

test.before(async () => {
  await initDb();
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  baseUrl = `http://localhost:${port}`;
});

test.after(() => {
  server.close();
});

test('GET /health returns status ok', async () => {
  const res = await fetch(`${baseUrl}/health`);
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.status, 'ok');
});

test('Authentication Flow: register, login, me', async () => {
  // 1. Register new user
  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'testuser',
      email: 'testuser@angkor.kh',
      password: 'password123',
      display_name: 'Test User'
    })
  });
  const regData = await regRes.json();
  assert.strictEqual(regRes.status, 201);
  assert.ok(regData.token);
  assert.strictEqual(regData.user.username, 'testuser');

  // 2. Login
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'testuser',
      password: 'password123'
    })
  });
  const loginData = await loginRes.json();
  assert.strictEqual(loginRes.status, 200);
  assert.ok(loginData.token);
  const token = loginData.token;

  // 3. Get profile /me
  const meRes = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const meData = await meRes.json();
  assert.strictEqual(meRes.status, 200);
  assert.strictEqual(meData.username, 'testuser');
});

test('Channels & Messages Flow', async () => {
  // Login admin to create channel and send message
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'admin',
      password: 'admin123'
    })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;

  // List channels (general should exist by default)
  const channelsRes = await fetch(`${baseUrl}/api/channels`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const channels = await channelsRes.json();
  assert.strictEqual(channelsRes.status, 200);
  assert.ok(channels.length >= 1);
  const generalChannel = channels.find(c => c.name === 'general');
  assert.ok(generalChannel);

  // Send message to general channel
  const msgRes = await fetch(`${baseUrl}/api/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      channel_id: generalChannel.id,
      content: 'Hello Angkor Messenger!'
    })
  });
  const msgData = await msgRes.json();
  assert.strictEqual(msgRes.status, 201);
  assert.strictEqual(msgData.content, 'Hello Angkor Messenger!');

  // Fetch messages from general channel
  const fetchMsgRes = await fetch(`${baseUrl}/api/messages/channel/${generalChannel.id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const fetchedMsgs = await fetchMsgRes.json();
  assert.strictEqual(fetchMsgRes.status, 200);
  assert.ok(fetchedMsgs.length >= 1);
  assert.strictEqual(fetchedMsgs[0].content, 'Hello Angkor Messenger!');
});

test('Admin APIs Flow', async () => {
  // Login admin
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'admin',
      password: 'admin123'
    })
  });
  const { token } = await loginRes.json();

  // Get Admin Stats
  const statsRes = await fetch(`${baseUrl}/api/admin/stats`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const stats = await statsRes.json();
  assert.strictEqual(statsRes.status, 200);
  assert.ok(stats.totalUsers >= 1);
  assert.ok(stats.totalChannels >= 1);
});
