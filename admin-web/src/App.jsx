import React, { useState, useEffect } from 'react';
import {
  Activity,
  Users,
  PhoneCall,
  Video,
  Mic,
  FileText,
  Send,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Cpu,
  HardDrive,
  Lock,
  KeyRound
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState(null);
  const [features, setFeatures] = useState({ video_calling: true, voice_calling: true, file_sharing: true });
  const [users, setUsers] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [broadcastForm, setBroadcastForm] = useState({ title: '', body: '' });
  const [broadcastStatus, setBroadcastStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE = '/api';

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [mRes, fRes, uRes, bRes] = await Promise.all([
        fetch(`${API_BASE}/admin/metrics`),
        fetch(`${API_BASE}/admin/features`),
        fetch(`${API_BASE}/admin/users`),
        fetch(`${API_BASE}/admin/broadcasts`)
      ]);

      if (mRes.ok) setMetrics(await mRes.ok ? await mRes.json() : null);
      if (fRes.ok) setFeatures(await fRes.json());
      if (uRes.ok) setUsers(await uRes.json());
      if (bRes.ok) setBroadcasts(await bRes.json());
    } catch (e) {
      console.error("Error fetching admin data:", e);
    }
  };

  const handleToggleFeature = async (key) => {
    const updated = { ...features, [key]: !features[key] };
    setFeatures(updated);
    try {
      await fetch(`${API_BASE}/admin/features`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBan = async (userId, currentBanState) => {
    try {
      await fetch(`${API_BASE}/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBanned: !currentBanState })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.body) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(broadcastForm)
      });
      if (res.ok) {
        setBroadcastForm({ title: '', body: '' });
        setBroadcastStatus('Broadcast push notification sent successfully!');
        setTimeout(() => setBroadcastStatus(''), 4000);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#071423] text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-[#14202f] border-b border-[#253045] px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-xl backdrop-blur-md bg-opacity-90">
        <div className="flex items-center space-x-3">
          <div className="bg-[#1e2b3a] border border-[#253045] p-2.5 rounded-xl shadow-md flex items-center justify-center">
            <span className="text-xl">🛡️</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Cipher Slate
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00C2FF]/20 text-[#00C2FF] font-bold uppercase tracking-wider">
                v2.4 E2EE
              </span>
            </div>
            <p className="text-xs text-[#8E9BAE] font-mono">
              Admin & Security Management Console
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
            <span>Signal Ratchet Active</span>
          </div>

          <button
            onClick={fetchData}
            className="flex items-center space-x-2 bg-[#1e2b3a] hover:bg-[#253045] text-slate-300 px-3.5 py-2 rounded-xl text-sm font-medium transition border border-[#253045]"
          >
            <RefreshCw className="w-4 h-4 text-[#00C2FF]" />
            <span>Refresh Data</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 bg-[#0B0F17]/80 border-r border-[#253045] p-4 flex flex-col space-y-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              activeTab === 'overview' ? 'bg-[#007AFF] text-white shadow-lg shadow-[#007AFF]/25' : 'text-[#8E9BAE] hover:bg-[#14202f] hover:text-white'
            }`}
          >
            <Activity className="w-5 h-5" />
            <span>Dashboard Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('features')}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              activeTab === 'features' ? 'bg-[#007AFF] text-white shadow-lg shadow-[#007AFF]/25' : 'text-[#8E9BAE] hover:bg-[#14202f] hover:text-white'
            }`}
          >
            <Video className="w-5 h-5" />
            <span>Remote Feature Toggles</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              activeTab === 'users' ? 'bg-[#007AFF] text-white shadow-lg shadow-[#007AFF]/25' : 'text-[#8E9BAE] hover:bg-[#14202f] hover:text-white'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>User & Security Keys</span>
          </button>

          <button
            onClick={() => setActiveTab('broadcast')}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              activeTab === 'broadcast' ? 'bg-[#007AFF] text-white shadow-lg shadow-[#007AFF]/25' : 'text-[#8E9BAE] hover:bg-[#14202f] hover:text-white'
            }`}
          >
            <Send className="w-5 h-5" />
            <span>System Broadcast</span>
          </button>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white">System & Cryptographic Dashboard</h2>
                <p className="text-[#8E9BAE] text-sm">Real-time node telemetry, active key exchanges, and connection health.</p>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-[#14202f] border border-[#253045] rounded-2xl p-5 shadow-md">
                  <div className="flex items-center justify-between text-[#8E9BAE] mb-2">
                    <span className="text-sm font-medium">Node Security Health</span>
                    <Lock className="w-5 h-5 text-[#10B981]" />
                  </div>
                  <div className="text-2xl font-black text-[#10B981]">
                    {metrics?.systemHealth?.status || "Healthy"}
                  </div>
                  <p className="text-xs text-[#8E9BAE] mt-1 font-mono">Uptime: {metrics?.systemHealth?.uptimeSeconds || 0}s</p>
                </div>

                <div className="bg-[#14202f] border border-[#253045] rounded-2xl p-5 shadow-md">
                  <div className="flex items-center justify-between text-[#8E9BAE] mb-2">
                    <span className="text-sm font-medium">Active E2EE Sessions</span>
                    <Users className="w-5 h-5 text-[#00C2FF]" />
                  </div>
                  <div className="text-3xl font-black text-white">
                    {metrics?.activeUsersCount ?? 0}
                  </div>
                  <p className="text-xs text-[#8E9BAE] mt-1 font-mono">Total registered keys: {metrics?.totalUsersCount ?? 0}</p>
                </div>

                <div className="bg-[#14202f] border border-[#253045] rounded-2xl p-5 shadow-md">
                  <div className="flex items-center justify-between text-[#8E9BAE] mb-2">
                    <span className="text-sm font-medium">Voice Stream Volume</span>
                    <PhoneCall className="w-5 h-5 text-[#007AFF]" />
                  </div>
                  <div className="text-3xl font-black text-[#007AFF]">
                    {metrics?.callVolume?.voiceCallsTotal ?? 0}
                  </div>
                  <p className="text-xs text-[#8E9BAE] mt-1 font-mono">Avg latency: {metrics?.callVolume?.avgDurationSeconds ?? 0}s</p>
                </div>

                <div className="bg-[#14202f] border border-[#253045] rounded-2xl p-5 shadow-md">
                  <div className="flex items-center justify-between text-[#8E9BAE] mb-2">
                    <span className="text-sm font-medium">Video Stream Volume</span>
                    <Video className="w-5 h-5 text-[#00C2FF]" />
                  </div>
                  <div className="text-3xl font-black text-[#00C2FF]">
                    {metrics?.callVolume?.videoCallsTotal ?? 0}
                  </div>
                  <p className="text-xs text-[#8E9BAE] mt-1 font-mono">Failed handshakes: {metrics?.callVolume?.failedCalls ?? 0}</p>
                </div>
              </div>

              {/* Server Resources Info */}
              <div className="bg-[#14202f] border border-[#253045] rounded-2xl p-6 shadow-md">
                <h3 className="text-lg font-bold mb-4 flex items-center space-x-2 text-white">
                  <Cpu className="w-5 h-5 text-[#00C2FF]" />
                  <span>Server Telemetry & Infrastructure</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#0B0F17] p-4 rounded-xl border border-[#253045] flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[#8E9BAE] font-mono">Memory Allocation</p>
                      <p className="text-xl font-bold text-white mt-1">{metrics?.systemHealth?.memoryUsageMB || "0.00"} MB</p>
                    </div>
                    <HardDrive className="w-8 h-8 text-[#253045]" />
                  </div>
                  <div className="bg-[#0B0F17] p-4 rounded-xl border border-[#253045] flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[#8E9BAE] font-mono">CPU Core Load</p>
                      <p className="text-xl font-bold text-white mt-1">{metrics?.systemHealth?.cpuLoadPercentage || "0.0"} %</p>
                    </div>
                    <Cpu className="w-8 h-8 text-[#253045]" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* REMOTE FEATURE TOGGLES TAB */}
          {activeTab === 'features' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Remote Dynamic Feature Control</h2>
                <p className="text-[#8E9BAE] text-sm">
                  Enable or disable encrypted client capabilities in real time without client app recompilation.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Video Calling Toggle */}
                <div className="bg-[#14202f] border border-[#253045] rounded-2xl p-6 flex flex-col justify-between shadow-md">
                  <div>
                    <div className="w-12 h-12 bg-[#00C2FF]/10 rounded-xl flex items-center justify-center text-[#00C2FF] mb-4">
                      <Video className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Video Calling</h3>
                    <p className="text-xs text-[#8E9BAE] mt-1">
                      Controls WebRTC real-time high-definition video calling capabilities across mobile clients.
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-between pt-4 border-t border-[#253045]">
                    <span className="text-sm font-semibold text-[#8E9BAE] font-mono">
                      Status: {features.video_calling ? <span className="text-[#10B981]">ENABLED</span> : <span className="text-[#EF4444]">DISABLED</span>}
                    </span>
                    <button
                      onClick={() => handleToggleFeature('video_calling')}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                        features.video_calling ? 'bg-[#10B981]' : 'bg-[#253045]'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                          features.video_calling ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Voice Calling Toggle */}
                <div className="bg-[#14202f] border border-[#253045] rounded-2xl p-6 flex flex-col justify-between shadow-md">
                  <div>
                    <div className="w-12 h-12 bg-[#007AFF]/10 rounded-xl flex items-center justify-center text-[#007AFF] mb-4">
                      <Mic className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Voice Calling</h3>
                    <p className="text-xs text-[#8E9BAE] mt-1">
                      Controls low-latency WebRTC voice communication functionality for mobile clients.
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-between pt-4 border-t border-[#253045]">
                    <span className="text-sm font-semibold text-[#8E9BAE] font-mono">
                      Status: {features.voice_calling ? <span className="text-[#10B981]">ENABLED</span> : <span className="text-[#EF4444]">DISABLED</span>}
                    </span>
                    <button
                      onClick={() => handleToggleFeature('voice_calling')}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                        features.voice_calling ? 'bg-[#10B981]' : 'bg-[#253045]'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                          features.voice_calling ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* File Sharing Toggle */}
                <div className="bg-[#14202f] border border-[#253045] rounded-2xl p-6 flex flex-col justify-between shadow-md">
                  <div>
                    <div className="w-12 h-12 bg-[#00C2FF]/10 rounded-xl flex items-center justify-center text-[#00C2FF] mb-4">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white">File Sharing</h3>
                    <p className="text-xs text-[#8E9BAE] mt-1">
                      Allows or restricts users from uploading and sharing media or encrypted documents in rooms.
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-between pt-4 border-t border-[#253045]">
                    <span className="text-sm font-semibold text-[#8E9BAE] font-mono">
                      Status: {features.file_sharing ? <span className="text-[#10B981]">ENABLED</span> : <span className="text-[#EF4444]">DISABLED</span>}
                    </span>
                    <button
                      onClick={() => handleToggleFeature('file_sharing')}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                        features.file_sharing ? 'bg-[#10B981]' : 'bg-[#253045]'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                          features.file_sharing ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* USER MANAGEMENT TAB */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white">User Security & Identity Management</h2>
                <p className="text-[#8E9BAE] text-sm">View registered mobile accounts, cryptographic safety keys, and ban/unban statuses.</p>
              </div>

              <div className="bg-[#14202f] border border-[#253045] rounded-2xl overflow-hidden shadow-md">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-[#0B0F17] text-[#8E9BAE] text-xs font-mono uppercase tracking-wider border-b border-[#253045]">
                    <tr>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Auth Provider</th>
                      <th className="px-6 py-4">Presence</th>
                      <th className="px-6 py-4">Account Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#253045]">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-[#1e2b3a]/50 transition">
                        <td className="px-6 py-4 flex items-center space-x-3">
                          <img src={u.avatar} alt="" className="w-10 h-10 rounded-full border border-[#253045]" />
                          <div>
                            <p className="font-semibold text-white">{u.name}</p>
                            <p className="text-xs text-[#8E9BAE] font-mono">{u.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 capitalize font-mono text-[#8E9BAE]">{u.authProvider}</td>
                        <td className="px-6 py-4">
                          {u.isOnline ? (
                            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
                              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                              <span>Online</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-[#1e2b3a] text-[#8E9BAE]">
                              <span>Offline</span>
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {u.isBanned ? (
                            <span className="inline-flex items-center space-x-1 text-xs font-mono font-bold text-[#EF4444]">
                              <XCircle className="w-4 h-4" />
                              <span>Banned</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 text-xs font-mono font-bold text-[#10B981]">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Active Key</span>
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleToggleBan(u.id, u.isBanned)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                              u.isBanned
                                ? 'bg-[#10B981] hover:bg-[#10B981]/80 text-white'
                                : 'bg-[#EF4444] hover:bg-[#EF4444]/80 text-white'
                            }`}
                          >
                            {u.isBanned ? 'Unban Account' : 'Revoke Identity'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BROADCAST TAB */}
          {activeTab === 'broadcast' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h2 className="text-2xl font-bold text-white">System Broadcast & Encrypted Alerts</h2>
                <p className="text-[#8E9BAE] text-sm">Dispatch system-wide signed notification alerts to all connected Cipher clients.</p>
              </div>

              {broadcastStatus && (
                <div className="p-4 bg-[#10B981]/10 border border-[#10B981]/20 rounded-xl text-[#10B981] text-sm font-semibold flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{broadcastStatus}</span>
                </div>
              )}

              <form onSubmit={handleSendBroadcast} className="bg-[#14202f] border border-[#253045] rounded-2xl p-6 space-y-4 shadow-md">
                <div>
                  <label className="block text-xs font-mono font-semibold text-[#8E9BAE] uppercase tracking-wider mb-2">
                    Notification Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Key Ratchet Rotation Scheduled"
                    value={broadcastForm.title}
                    onChange={e => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                    className="w-full bg-[#0B0F17] border border-[#253045] rounded-xl px-4 py-3 text-white placeholder-[#4B586E] focus:outline-none focus:border-[#007AFF] transition text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold text-[#8E9BAE] uppercase tracking-wider mb-2">
                    Message Body
                  </label>
                  <textarea
                    required
                    rows="4"
                    placeholder="e.g., Cipher nodes will undergo key rotation tonight at 02:00 UTC."
                    value={broadcastForm.body}
                    onChange={e => setBroadcastForm({ ...broadcastForm, body: e.target.value })}
                    className="w-full bg-[#0B0F17] border border-[#253045] rounded-xl px-4 py-3 text-white placeholder-[#4B586E] focus:outline-none focus:border-[#007AFF] transition text-sm"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#007AFF] hover:bg-[#007AFF]/90 text-white font-bold py-3.5 px-6 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-[#007AFF]/20"
                >
                  <Send className="w-5 h-5" />
                  <span>{loading ? 'Transmitting Broadcast...' : 'Broadcast System Push Notification'}</span>
                </button>
              </form>

              {/* Broadcast History */}
              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-bold text-white">Recent Broadcast Transmissions</h3>
                <div className="space-y-3">
                  {broadcasts.map(b => (
                    <div key={b.id} className="bg-[#14202f] border border-[#253045] rounded-xl p-4 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{b.title}</span>
                        <span className="text-xs font-mono text-[#8E9BAE]">{new Date(b.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-[#8E9BAE]">{b.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
