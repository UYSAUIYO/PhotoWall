'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import PageHeader from '@/components/ui/PageHeader';
import SearchInput from '@/components/photos/SearchInput';
import Avatar from '@/components/ui/Avatar';
import Icon from '@/components/ui/Icon';
import Notice from '@/components/ui/Notice';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils';
import type { User } from '@/types';

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const currentUserId = (session?.user as { id?: string } | undefined)?.id;

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users?limit=100');
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 3600);
    return () => clearTimeout(timer);
  }, [notice]);

  async function handleRoleChange(userId: number, role: string) {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    const data = await res.json();
    setNotice(
      data.success
        ? { tone: 'success', text: '角色已更新' }
        : { tone: 'error', text: data.error || '更新失败' }
    );
    if (data.success) {
      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role } as User : user)));
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/users/${pendingDelete.id}`, { method: 'DELETE' });
    const data = await res.json();
    setDeleting(false);
    setPendingDelete(null);
    setNotice(
      data.success
        ? { tone: 'success', text: '用户已删除' }
        : { tone: 'error', text: data.error || '删除失败' }
    );
    if (data.success) fetchUsers();
  }

  const keyword = search.trim().toLowerCase();
  const filtered = keyword
    ? users.filter(
        (user) =>
          user.username.toLowerCase().includes(keyword) ||
          user.email.toLowerCase().includes(keyword)
      )
    : users;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Members"
        title="用户管理"
        description={`共 ${users.length} 位成员，调整角色或移除账户。`}
        actions={
          <button type="button" onClick={fetchUsers} className="btn btn-glass btn-sm !h-9">
            <Icon name="refresh" size={13} />
            刷新
          </button>
        }
      />

      {notice && (
        <Notice tone={notice.tone} onClose={() => setNotice(null)}>
          {notice.text}
        </Notice>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="w-full max-w-[300px]">
          <SearchInput value={search} onChange={setSearch} placeholder="搜索用户名或邮箱…" />
        </div>
        <span className="hidden shrink-0 text-[11.5px] text-subtle sm:block">
          {keyword ? `${filtered.length} / ${users.length} 位成员` : `${users.length} 位成员`}
        </span>
      </div>

      <div className="surface-card overflow-hidden rounded-[26px]">
        {loading ? (
          <div className="space-y-px">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4 px-5 py-4">
                <span className="skeleton h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-2">
                  <span className="skeleton block h-3 w-32 rounded-full" />
                  <span className="skeleton block h-2.5 w-48 rounded-full" />
                </div>
                <span className="skeleton h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              compact
              icon="users"
              title={keyword ? '没有匹配的成员' : '还没有注册用户'}
              description={keyword ? '试试更短的关键词。' : undefined}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-[var(--hairline)] bg-[var(--field-bg)]">
                  {['成员', '邮箱', '角色', '注册时间', '操作'].map((label, index) => (
                    <th
                      key={label}
                      className={`px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-subtle ${
                        index === 4 ? 'text-right' : ''
                      }`}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--hairline)]">
                {filtered.map((user) => {
                  const isSelf = currentUserId === String(user.id);
                  return (
                    <tr key={user.id} className="group transition-colors hover:bg-[var(--hover)]">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.username} size={34} />
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-medium">
                              {user.username}
                              {isSelf && (
                                <span className="ml-1.5 rounded-full bg-[var(--accent-light)] px-1.5 py-[1px] text-[9px] font-medium text-[var(--accent)]">
                                  你
                                </span>
                              )}
                            </p>
                            <p className="mt-0.5 text-[10.5px] tabular text-subtle">#{user.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-[220px] truncate px-5 py-3.5 text-[12.5px] text-muted">
                        {user.email}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="relative inline-flex items-center">
                          <select
                            value={user.role}
                            onChange={(event) => handleRoleChange(user.id, event.target.value)}
                            className="appearance-none rounded-full border border-[var(--hairline)] bg-[var(--field-bg)] py-1 pl-3 pr-7 text-[11.5px] font-medium text-foreground outline-none transition hover:border-[var(--hairline-strong)] focus:ring-2 focus:ring-[var(--accent-light)]"
                            aria-label={`修改 ${user.username} 的角色`}
                          >
                            <option value="visitor">游客</option>
                            <option value="user">用户</option>
                            <option value="admin">管理员</option>
                          </select>
                          <Icon
                            name="chevronDown"
                            size={12}
                            className="pointer-events-none absolute right-2.5 text-subtle"
                          />
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[12px] tabular text-muted">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setPendingDelete(user)}
                          disabled={isSelf}
                          className="grid h-8 w-8 place-items-center rounded-full text-subtle transition hover:bg-[var(--danger-bg)] hover:text-[var(--danger)] disabled:cursor-not-allowed disabled:opacity-30"
                          title={isSelf ? '不能删除当前登录账户' : '删除用户'}
                          aria-label={isSelf ? '不能删除当前登录账户' : `删除 ${user.username}`}
                        >
                          <Icon name="trash" size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        title={`删除用户「${pendingDelete?.username ?? ''}」？`}
        description="该用户的照片记录会一并移除，此操作无法撤销。"
        confirmLabel="删除用户"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
