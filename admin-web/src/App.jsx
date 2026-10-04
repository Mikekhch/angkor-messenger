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
  HardDrive
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-rose-600 to-blue-600 p-2.5 rounded-xl shadow-md">
            <span className="text-xl font-black text-white tracking-wider">🇰🇭 AM</span>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Angkor Messenger
            </h1>
            <p className="text-xs text-rose-400 font-semibold tracking-wide uppercase">
              Web Admin Control Panel
            </p>
          </div>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3.5 py-2 rounded-lg text-sm font-medium transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Data</span>
        </button>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 bg-slate-900/50 border-r border-slate-800 p-4 flex flex-col space-y-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              activeTab === 'overview' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Activity className="w-5 h-5" />
            <span>Dashboard Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('features')}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              activeTab === 'features' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Video className="w-5 h-5" />
            <span>Remote Feature Toggles</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              activeTab === 'users' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>User Management</span>
          </button>

          <button
            onClick={() => setActiveTab('broadcast')}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              activeTab === 'broadcast' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
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
                <h2 className="text-2xl font-bold">System Dashboard</h2>
                <p className="text-slate-400 text-sm">Real-time health, user activity, and call volume metrics.</p>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-sm font-medium">System Health</span>
                    <Activity className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-emerald-400">
                    {metrics?.systemHealth?.status || "Healthy"}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Uptime: {metrics?.systemHealth?.uptimeSeconds || 0}s</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-sm font-medium">Active Connected Users</span>
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-3xl font-black text-white">
                    {metrics?.activeUsersCount ?? 0}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Total registered: {metrics?.totalUsersCount ?? 0}</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-sm font-medium">Voice Calls Volume</span>
                    <PhoneCall className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="text-3xl font-black text-indigo-400">
                    {metrics?.callVolume?.voiceCallsTotal ?? 0}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Avg duration: {metrics?.callVolume?.avgDurationSeconds ?? 0}s</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-sm font-medium">Video Calls Volume</span>
                    <Video className="w-5 h-5 text-rose-400" />
                  </div>
                  <div className="text-3xl font-black text-rose-400">
                    {metrics?.callVolume?.videoCallsTotal ?? 0}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Failed calls: {metrics?.callVolume?.failedCalls ?? 0}</p>
                </div>
              </div>

              {/* Server Resources Info */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
                  <Cpu className="w-5 h-5 text-blue-400" />
                  <span>Server Telemetry</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Memory Usage</p>
                      <p className="text-xl font-bold text-white mt-1">{metrics?.systemHealth?.memoryUsageMB || "0.00"} MB</p>
                    </div>
                    <HardDrive className="w-8 h-8 text-slate-600" />
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 font-medium">CPU Load Simulation</p>
                      <p className="text-xl font-bold text-white mt-1">{metrics?.systemHealth?.cpuLoadPercentage || "0.0"} %</p>
                    </div>
                    <Cpu className="w-8 h-8 text-slate-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* REMOTE FEATURE TOGGLES TAB */}
          {activeTab === 'features' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Remote Feature Management</h2>
                <p className="text-slate-400 text-sm">
                  Enable or disable core mobile client capabilities dynamically in real time without client app updates.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Video Calling Toggle */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500 mb-4">
                      <Video className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold">Video Calling</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Controls WebRTC real-time high-definition video calling capabilities across Android clients.
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800">
                    <span className="text-sm font-semibold text-slate-300">
                      Status: {features.video_calling ? <span className="text-emerald-400">ENABLED</span> : <span className="text-rose-400">DISABLED</span>}
                    </span>
                    <button
                      onClick={() => handleToggleFeature('video_calling')}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                        features.video_calling ? 'bg-emerald-500' : 'bg-slate-700'
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
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 mb-4">
                      <Mic className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold">Voice Calling</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Controls low-latency WebRTC voice communication functionality for mobile clients.
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800">
                    <span className="text-sm font-semibold text-slate-300">
                      Status: {features.voice_calling ? <span className="text-emerald-400">ENABLED</span> : <span className="text-rose-400">DISABLED</span>}
                    </span>
                    <button
                      onClick={() => handleToggleFeature('voice_calling')}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                        features.voice_calling ? 'bg-emerald-500' : 'bg-slate-700'
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
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 mb-4">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold">File Sharing</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Allows or restricts users from uploading and sharing media or documents in conversation rooms.
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800">
                    <span className="text-sm font-semibold text-slate-300">
                      Status: {features.file_sharing ? <span className="text-emerald-400">ENABLED</span> : <span className="text-rose-400">DISABLED</span>}
                    </span>
                    <button
                      onClick={() => handleToggleFeature('file_sharing')}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                        features.file_sharing ? 'bg-emerald-500' : 'bg-slate-700'
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
                <h2 className="text-2xl font-bold">User Security & Management</h2>
                <p className="text-slate-400 text-sm">View registered mobile users, active statuses, and ban or unban accounts.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Auth Provider</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Account Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-800/50 transition">
                        <td className="px-6 py-4 flex items-center space-x-3">
                          <img src={u.avatar} alt="" className="w-10 h-10 rounded-full border border-slate-700" />
                          <div>
                            <p className="font-semibold text-white">{u.name}</p>
                            <p className="text-xs text-slate-500">{u.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 capitalize font-medium text-slate-400">{u.authProvider}</td>
                        <td className="px-6 py-4">
                          {u.isOnline ? (
                            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                              <span>Online</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400">
                              <span>Offline</span>
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {u.isBanned ? (
                            <span className="inline-flex items-center space-x-1 text-xs font-bold text-rose-400">
                              <XCircle className="w-4 h-4" />
                              <span>Banned</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-400">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Active</span>
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleToggleBan(u.id, u.isBanned)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                              u.isBanned
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                : 'bg-rose-600 hover:bg-rose-500 text-white'
                            }`}
                          >
                            {u.isBanned ? 'Unban Account' : 'Ban User'}
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
                <h2 className="text-2xl font-bold">System Broadcast & Push Notifications</h2>
                <p className="text-slate-400 text-sm">Send system-wide broadcast alerts directly to all connected Angkor Messenger users.</p>
              </div>

              {broadcastStatus && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-semibold flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{broadcastStatus}</span>
                </div>
              )}

              <form onSubmit={handleSendBroadcast} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Notification Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Scheduled System Maintenance"
                    value={broadcastForm.title}
                    onChange={e => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 transition text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Message Body
                  </label>
                  <textarea
                    required
                    rows="4"
                    placeholder="e.g., Angkor Messenger will undergo routine upgrades tonight at 02:00 UTC."
                    value={broadcastForm.body}
                    onChange={e => setBroadcastForm({ ...broadcastForm, body: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 transition text-sm"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3.5 px-6 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-rose-600/20"
                >
                  <Send className="w-5 h-5" />
                  <span>{loading ? 'Sending Broadcast...' : 'Broadcast Push Notification'}</span>
                </button>
              </form>

              {/* Broadcast History */}
              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-bold">Recent Broadcasts History</h3>
                <div className="space-y-3">
                  {broadcasts.map(b => (
                    <div key={b.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{b.title}</span>
                        <span className="text-xs text-slate-500">{new Date(b.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-slate-400">{b.body}</p>
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
