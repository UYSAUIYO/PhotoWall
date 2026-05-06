'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function ProfilePage() {
  const { data: session } = useSession();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passMsg, setPassMsg] = useState('');

  useEffect(() => {
    if (session?.user) {
      setUsername(session.user.name || '');
      setEmail(session.user.email || '');
    }
  }, [session]);

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, bio }),
    });
    const data = await res.json();
    setMessage(data.success ? '资料已更新' : data.error || '更新失败');
    setLoading(false);
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPassMsg('');

    if (newPassword !== confirmPassword) {
      setPassMsg('两次输入的密码不一致');
      return;
    }

    const res = await fetch('/api/user/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    setPassMsg(data.success ? '密码已更新' : data.error || '修改失败');
    if (data.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }

  return (
    <div className="space-y-8 max-w-lg">
      <h1 className="text-2xl font-bold">个人资料</h1>

      <form onSubmit={handleProfileUpdate} className="glass p-6 space-y-4">
        <h2 className="font-semibold">基本信息</h2>

        {message && (
          <div className={`text-sm px-4 py-2 rounded-xl ${message.includes('失败') ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
            {message}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1.5">用户名</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">邮箱</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 opacity-50 cursor-not-allowed"
          />
          <p className="text-xs text-foreground/40 mt-1">邮箱不可修改</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">个人简介</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition resize-none"
            placeholder="介绍一下自己..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? '保存中...' : '保存'}
        </button>
      </form>

      <form onSubmit={handlePasswordChange} className="glass p-6 space-y-4">
        <h2 className="font-semibold">修改密码</h2>

        {passMsg && (
          <div className={`text-sm px-4 py-2 rounded-xl ${passMsg.includes('失败') || passMsg.includes('不一致') ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
            {passMsg}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1.5">当前密码</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">新密码</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">确认新密码</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
            required
          />
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition"
        >
          修改密码
        </button>
      </form>
    </div>
  );
}
