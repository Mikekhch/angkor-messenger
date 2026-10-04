const test = require('node:test');
const assert = require('node:assert');
const { app, server } = require('../src/index');

test('Backend Server REST API Tests', async (t) => {
  const address = server.address();
  const port = address.port;
  const baseUrl = `http://localhost:${port}`;

  await t.test('GET /api/features returns initial feature flags', async () => {
    const res = await fetch(`${baseUrl}/api/features`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(typeof json.video_calling, 'boolean');
    assert.strictEqual(typeof json.voice_calling, 'boolean');
    assert.strictEqual(typeof json.file_sharing, 'boolean');
  });

  await t.test('POST /api/auth/login authenticates user', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'sophea.chan@example.com', name: 'Sophea Chan' })
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.user.email, 'sophea.chan@example.com');
  });

  await t.test('POST /api/admin/features updates remote feature flags', async () => {
    const res = await fetch(`${baseUrl}/api/admin/features`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ video_calling: false })
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.featureFlags.video_calling, false);

    // Restore feature flag
    await fetch(`${baseUrl}/api/admin/features`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ video_calling: true })
    });
  });

  await t.test('POST /api/admin/broadcast creates system broadcast', async () => {
    const res = await fetch(`${baseUrl}/api/admin/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Maintenance Notice', body: 'Server update tonight.' })
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.broadcast.title, 'Maintenance Notice');
  });

  await t.test('GET /api/admin/metrics returns health and stats', async () => {
    const res = await fetch(`${baseUrl}/api/admin/metrics`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.ok(json.systemHealth);
    assert.ok(json.callVolume);
  });

  // Teardown
  server.close();
});
