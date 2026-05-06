'use client';

import { useState, useEffect } from 'react';
import { formatDate } from '@/lib/utils';
import type { User } from '@/types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  async function fetchUsers() {
    setLoading(true);
    const res = await fetch('/api/admin/users');
    const data = await res.json();
    if (data.success) setUsers(data.data);
    setLoading(false);
  }

  useEffect(() => { fetchUsers(); }, []);

  async function handleRoleChange(userId: number, role: string) {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    const data = await res.json();
    setMessage(data.success ? '角色已更新' : data.error || '更新失败');
    if (data.success) fetchUsers();
  }

  async function handleDelete(userId: number) {
    if (!confirm('确定删除此用户？其所有照片将被删除。')) return;
    const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
    const data = await res.json();
    setMessage(data.success ? '用户已删除' : data.error || '删除失败');
    if (data.success) fetchUsers();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">用户管理</h1>

      {message && (
        <div className="text-sm px-4 py-2 rounded-xl bg-green-500/10 text-green-500">{message}</div>
      )}

      <div className="glass overflow-hidden rounded-2xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-foreground/10">
              <th className="text-left px-4 py-3 font-medium text-foreground/50">ID</th>
              <th className="text-left px-4 py-3 font-medium text-foreground/50">用户名</th>
              <th className="text-left px-4 py-3 font-medium text-foreground/50">邮箱</th>
              <th className="text-left px-4 py-3 font-medium text-foreground/50">角色</th>
              <th className="text-left px-4 py-3 font-medium text-foreground/50">注册时间</th>
              <th className="text-right px-4 py-3 font-medium text-foreground/50">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-foreground/5 hover:bg-foreground/[0.02]">
                <td className="px-4 py-3 text-foreground/40">{user.id}</td>
                <td className="px-4 py-3 font-medium">{user.username}</td>
                <td className="px-4 py-3 text-foreground/60">{user.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="px-2 py-1 rounded-lg bg-black/5 dark:bg-white/10 border border-foreground/10 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  >
                    <option value="visitor">游客</option>
                    <option value="user">用户</option>
                    <option value="admin">管理员</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-foreground/40">{formatDate(user.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-xs text-red-400 hover:text-red-500 transition"
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
