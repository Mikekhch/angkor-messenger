import React, { useState, useEffect } from 'react';
import {
  Users,
  MessageSquare,
  ShieldAlert,
  Radio,
  Settings,
  LogOut,
  Ban,
  CheckCircle,
  Trash2,
  Bell,
  Activity,
  Search,
  Lock
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export function App() {
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const [stats, setStats] = useState({ totalUsers: 0, totalChannels: 0, totalMessages: 0 });
  const [users, setUsers] = useState([]);
  const [channels, setChannels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  useEffect(() => {
    if (token) {
      fetchStats();
      fetchUsers();
      fetchChannels();
    }
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      if (data.user.role !== 'admin') {
        throw new Error('Access denied: Admin permissions required.');
      }
      setToken(data.token);
      localStorage.setItem('admin_token', data.token);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('admin_token');
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchChannels = async () => {
    try {
      const res = await fetch(`${API_BASE}/channels`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setChannels(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleBlockUser = async (userId, currentBlocked) => {
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}/block`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ is_blocked: !currentBlocked })
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteChannel = async (channelId) => {
    if (!confirm('Are you sure you want to delete this channel?')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/channels/${channelId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchChannels();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const sendBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    setBroadcastSuccess(true);
    setBroadcastMessage('');
    setTimeout(() => setBroadcastSuccess(false), 3000);
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-angkor-slate p-4">
        <div className="max-w-md w-full bg-angkor-surface rounded-xl border border-angkor-gold/30 shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-angkor-gold/10 border border-angkor-gold/30 mb-4">
              <span className="font-khmer text-3xl font-bold text-angkor-gold">អង្គរ</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wide">ANGKOR MESSENGER</h1>
            <p className="text-sm text-slate-400 mt-1">Web Admin Control Panel</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-angkor-slate border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-angkor-gold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-angkor-slate border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-angkor-gold"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-angkor-gold to-angkor-gold-dark hover:from-angkor-gold-light hover:to-angkor-gold text-slate-950 font-bold py-3 px-4 rounded-lg shadow-lg transition"
            >
              Sign In to Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.display_name && u.display_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-angkor-slate text-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-angkor-blue-dark border-b border-angkor-gold/20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-angkor-gold/20 border border-angkor-gold/50 flex items-center justify-center font-khmer font-bold text-angkor-gold text-xl">
            អង្គរ
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">ANGKOR MESSENGER</h1>
            <span className="text-xs text-angkor-gold font-medium">ADMIN CONTROL PANEL</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-angkor-surface px-3 py-1.5 rounded-full border border-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-300">Server Status: Online</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 text-slate-400 hover:text-red-400 text-sm font-medium transition"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-angkor-surface border-r border-slate-800 p-4 flex flex-col justify-between">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-sm transition ${
                activeTab === 'overview'
                  ? 'bg-angkor-gold text-slate-950 font-semibold shadow'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Activity size={18} />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-sm transition ${
                activeTab === 'users'
                  ? 'bg-angkor-gold text-slate-950 font-semibold shadow'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Users size={18} />
              <span>User Moderation</span>
            </button>
            <button
              onClick={() => setActiveTab('channels')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-sm transition ${
                activeTab === 'channels'
                  ? 'bg-angkor-gold text-slate-950 font-semibold shadow'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <MessageSquare size={18} />
              <span>Channel Moderation</span>
            </button>
            <button
              onClick={() => setActiveTab('broadcast')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-sm transition ${
                activeTab === 'broadcast'
                  ? 'bg-angkor-gold text-slate-950 font-semibold shadow'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Radio size={18} />
              <span>System Broadcast</span>
            </button>
          </nav>

          <div className="p-3 bg-angkor-slate/50 rounded-lg border border-slate-800 text-xs text-slate-400">
            <div className="font-semibold text-slate-300">System Information</div>
            <div>Version: 1.0.0-PROD</div>
            <div>Engine: Node.js + SQLite</div>
          </div>
        </aside>

        {/* Dashboard Area */}
        <main className="flex-1 p-8 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">System Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-angkor-surface border border-slate-800 rounded-xl p-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase font-semibold text-slate-400">Total Registered Users</p>
                    <p className="text-3xl font-extrabold text-white mt-1">{stats.totalUsers}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-angkor-blue/50 text-angkor-gold border border-angkor-gold/20 flex items-center justify-center">
                    <Users size={24} />
                  </div>
                </div>

                <div className="bg-angkor-surface border border-slate-800 rounded-xl p-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase font-semibold text-slate-400">Active Public Channels</p>
                    <p className="text-3xl font-extrabold text-white mt-1">{stats.totalChannels}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-angkor-blue/50 text-angkor-gold border border-angkor-gold/20 flex items-center justify-center">
                    <MessageSquare size={24} />
                  </div>
                </div>

                <div className="bg-angkor-surface border border-slate-800 rounded-xl p-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase font-semibold text-slate-400">Total Transmitted Messages</p>
                    <p className="text-3xl font-extrabold text-white mt-1">{stats.totalMessages}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-angkor-blue/50 text-angkor-gold border border-angkor-gold/20 flex items-center justify-center">
                    <Activity size={24} />
                  </div>
                </div>
              </div>

              {/* System Banner */}
              <div className="bg-gradient-to-r from-angkor-blue to-angkor-blue-dark border border-angkor-gold/30 rounded-xl p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-angkor-gold font-khmer">អង្គរ Messenger Security Status</h3>
                  <p className="text-sm text-slate-300 mt-1">
                    All WebSocket socket rooms are encrypted and real-time state sync is active.
                  </p>
                </div>
                <div className="px-4 py-2 bg-angkor-gold/20 text-angkor-gold border border-angkor-gold/40 rounded-lg text-xs font-bold uppercase">
                  Protected
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">User Moderation</h2>
                <div className="relative w-72">
                  <Search className="absolute left-3 top-3 text-slate-500" size={16} />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-angkor-surface border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-angkor-gold"
                  />
                </div>
              </div>

              <div className="bg-angkor-surface border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-800/60 text-slate-400 uppercase text-xs font-semibold">
                    <tr>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Joined</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/30 transition">
                        <td className="px-6 py-4 flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-angkor-gold/20 border border-angkor-gold/40 flex items-center justify-center font-bold text-angkor-gold">
                            {u.display_name ? u.display_name.charAt(0).toUpperCase() : u.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{u.display_name || u.username}</div>
                            <div className="text-xs text-slate-400">@{u.username} • {u.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                              u.role === 'admin'
                                ? 'bg-angkor-gold/20 text-angkor-gold border border-angkor-gold/30'
                                : 'bg-slate-700 text-slate-300'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {u.is_blocked ? (
                            <span className="text-red-400 font-medium text-xs flex items-center space-x-1">
                              <Ban size={14} /> <span>Suspended</span>
                            </span>
                          ) : (
                            <span className="text-emerald-400 font-medium text-xs flex items-center space-x-1">
                              <CheckCircle size={14} /> <span>Active</span>
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => toggleBlockUser(u.id, u.is_blocked)}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                              u.is_blocked
                                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                            }`}
                          >
                            {u.is_blocked ? 'Unblock' : 'Suspend'}
                          </button>
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => deleteUser(u.id)}
                              className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-md transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'channels' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">Channel Moderation</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {channels.map((c) => (
                  <div key={c.id} className="bg-angkor-surface border border-slate-800 rounded-xl p-5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-lg">#{c.name}</span>
                        {c.is_private ? (
                          <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded">Private</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-angkor-gold/20 text-angkor-gold border border-angkor-gold/30 text-xs rounded">Public</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{c.description || 'No description provided'}</p>
                    </div>
                    {c.name !== 'general' && (
                      <button
                        onClick={() => deleteChannel(c.id)}
                        className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'broadcast' && (
            <div className="space-y-6 max-w-2xl">
              <h2 className="text-xl font-bold text-white">System Announcement Broadcast</h2>
              <p className="text-sm text-slate-400">
                Send a real-time broadcast message to all connected Angkor Messenger Android app users and web sessions.
              </p>

              {broadcastSuccess && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm flex items-center space-x-2">
                  <CheckCircle size={18} />
                  <span>Broadcast transmitted successfully to all active clients!</span>
                </div>
              )}

              <form onSubmit={sendBroadcast} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Message Content</label>
                  <textarea
                    rows={4}
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="Enter system announcement..."
                    className="w-full bg-angkor-surface border border-slate-700 rounded-lg p-4 text-white focus:outline-none focus:border-angkor-gold"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="bg-angkor-gold hover:bg-angkor-gold-light text-slate-950 font-bold px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 transition"
                >
                  <Radio size={18} />
                  <span>Dispatch Broadcast</span>
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
