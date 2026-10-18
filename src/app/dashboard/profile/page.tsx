'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import PageHeader from '@/components/ui/PageHeader';
import Avatar from '@/components/ui/Avatar';
import Icon from '@/components/ui/Icon';
import Notice from '@/components/ui/Notice';
import { formatDate } from '@/lib/utils';

interface ProfileData {
  id: number;
  username: string;
  email: string;
  role: string;
  avatar: string | null;
  bio: string | null;
  created_at: string;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passMsg, setPassMsg] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/user/profile')
      .then((res) => res.json())
      .then((data) => {
        if (!active || !data.success) return;
        const user = data.data as ProfileData;
        setProfile(user);
        setUsername(user.username || '');
        setEmail(user.email || '');
        setBio(user.bio || '');
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  async function handleProfileUpdate(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, bio }),
    });
    const data = await res.json();

    if (data.success) {
      setMessage({ tone: 'success', text: '资料已保存' });
      setProfile((prev) => (prev ? { ...prev, username, bio } : prev));
    } else {
      setMessage({ tone: 'error', text: data.error || '保存失败' });
    }
    setLoading(false);
  }

  async function handlePasswordChange(event: React.FormEvent) {
    event.preventDefault();
    setPassMsg(null);

    if (newPassword !== confirmPassword) {
      setPassMsg({ tone: 'error', text: '两次输入的新密码不一致' });
      return;
    }

    if (newPassword.length < 6) {
      setPassMsg({ tone: 'error', text: '新密码长度至少 6 位' });
      return;
    }

    setPassLoading(true);

    const res = await fetch('/api/user/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();

    if (data.success) {
      setPassMsg({ tone: 'success', text: '密码已更新' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPassMsg({ tone: 'error', text: data.error || '修改失败' });
    }
    setPassLoading(false);
  }

  const displayName = profile?.username || session?.user?.name || '';
  const displayEmail = profile?.email || session?.user?.email || '';
  const role = profile?.role || (session?.user as { role?: string } | undefined)?.role;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Account"
        title="个人资料"
        description="管理你的公开身份与登录安全。这些信息只会在必要时展示。"
      />

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* 身份卡 */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="surface-card overflow-hidden rounded-[26px]">
            <div className="relative h-24 bg-[radial-gradient(120%_140%_at_0%_0%,var(--accent-light),transparent_60%)]">
              <span className="absolute inset-x-0 bottom-0 h-px bg-[var(--hairline)]" />
            </div>
            <div className="px-6 pb-6">
              <div className="-mt-9 flex items-end justify-between">
                <span className="rounded-full ring-4 ring-[var(--surface-solid)]">
                  <Avatar name={displayName} size={68} />
                </span>
                <span className="mb-1 rounded-full border border-[var(--hairline)] bg-[var(--field-bg)] px-2.5 py-1 text-[10.5px] font-medium text-muted">
                  {role === 'admin' ? '管理员' : role === 'visitor' ? '游客' : '用户'}
                </span>
              </div>

              <h2 className="mt-4 truncate text-[17px] font-semibold tracking-[-0.015em]">
                {displayName || '未命名用户'}
              </h2>
              <p className="mt-1 truncate text-[12px] text-subtle">{displayEmail}</p>

              <div className="my-5 h-px bg-[var(--hairline)]" />

              <dl className="space-y-3 text-[12px]">
                <div className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-2 text-subtle">
                    <Icon name="calendar" size={13} />
                    加入时间
                  </dt>
                  <dd className="text-muted">
                    {profile?.created_at ? formatDate(profile.created_at) : '—'}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-2 text-subtle">
                    <Icon name="shield" size={13} />
                    账户角色
                  </dt>
                  <dd className="text-muted">{role === 'admin' ? '管理员' : '普通用户'}</dd>
                </div>
              </dl>

              {profile?.bio && (
                <>
                  <div className="my-5 h-px bg-[var(--hairline)]" />
                  <p className="text-[12px] leading-relaxed text-muted">{profile.bio}</p>
                </>
              )}
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          {/* 基本信息 */}
          <form onSubmit={handleProfileUpdate} className="surface-card rounded-[26px] p-6">
            <div className="mb-5">
              <h2 className="text-[15px] font-semibold tracking-[-0.01em]">基本信息</h2>
              <p className="mt-1 text-[11.5px] text-subtle">这些内容可能会出现在照片详情中。</p>
            </div>

            {message && (
              <div className="mb-4">
                <Notice tone={message.tone}>{message.text}</Notice>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="profile-username" className="field-label">
                  用户名
                </label>
                <div className="field-wrap relative">
                  <Icon name="user" size={15} className="field-icon" />
                  <input
                    id="profile-username"
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className="field !pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="profile-email" className="field-label">
                  邮箱
                </label>
                <div className="field-wrap relative">
                  <Icon name="mail" size={15} className="field-icon" />
                  <input
                    id="profile-email"
                    type="email"
                    value={email}
                    disabled
                    className="field !pl-10 cursor-not-allowed opacity-55"
                  />
                </div>
                <p className="field-hint">邮箱作为登录凭据，暂不支持修改。</p>
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="profile-bio" className="field-label">
                个人简介
              </label>
              <textarea
                id="profile-bio"
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                rows={3}
                className="field"
                placeholder="用一句话介绍自己，或写下你喜欢的拍摄主题…"
              />
            </div>

            <div className="mt-5 flex justify-end">
              <button type="submit" disabled={loading} className="btn btn-primary btn-sm">
                {loading ? '保存中…' : '保存资料'}
              </button>
            </div>
          </form>

          {/* 修改密码 */}
          <form onSubmit={handlePasswordChange} className="surface-card rounded-[26px] p-6">
            <div className="mb-5">
              <h2 className="text-[15px] font-semibold tracking-[-0.01em]">登录安全</h2>
              <p className="mt-1 text-[11.5px] text-subtle">
                定期更换密码可以更好地保护你的照片。
              </p>
            </div>

            {passMsg && (
              <div className="mb-4">
                <Notice tone={passMsg.tone}>{passMsg.text}</Notice>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="current-password" className="field-label">
                  当前密码
                </label>
                <div className="field-wrap relative">
                  <Icon name="lock" size={15} className="field-icon" />
                  <input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    className="field !pl-10"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="new-password" className="field-label">
                    新密码
                  </label>
                  <div className="field-wrap relative">
                    <Icon name="key" size={15} className="field-icon" />
                    <input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      className="field !pl-10"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="confirm-password" className="field-label">
                    确认新密码
                  </label>
                  <div className="field-wrap relative">
                    <Icon name="key" size={15} className="field-icon" />
                    <input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      className="field !pl-10"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button type="submit" disabled={passLoading} className="btn btn-primary btn-sm">
                {passLoading ? '更新中…' : '更新密码'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
