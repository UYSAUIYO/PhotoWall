'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthShell from './AuthShell';
import Icon from '@/components/ui/Icon';
import Notice from '@/components/ui/Notice';

function passwordScore(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const strengthLabels = ['偏弱', '一般', '良好', '很强'];

export default function RegisterForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const score = passwordScore(password);
  const mismatch = confirmPassword.length > 0 && confirmPassword !== password;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致。');
      return;
    }

    if (password.length < 6) {
      setError('密码长度至少 6 位。');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || '注册失败，请稍后重试。');
        setLoading(false);
        return;
      }

      await signIn('credentials', { email, password, redirect: false });
      router.push('/');
      router.refresh();
    } catch {
      setError('注册失败，请稍后重试。');
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <div className="mb-8">
        <p className="eyebrow">Create account</p>
        <h1 className="mt-3 text-[30px] font-semibold tracking-[-0.035em]">注册 PhotoWall</h1>
        <p className="mt-2.5 text-[13px] leading-relaxed text-muted">
          创建账号，开始收藏属于你的光影片段。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {error && <Notice tone="error">{error}</Notice>}

        <div>
          <label htmlFor="register-username" className="field-label">
            用户名
          </label>
          <div className="field-wrap relative">
            <Icon name="user" size={16} className="field-icon" />
            <input
              id="register-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="field !pl-11"
              placeholder="你的名字"
              autoComplete="username"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="register-email" className="field-label">
            邮箱
          </label>
          <div className="field-wrap relative">
            <Icon name="mail" size={16} className="field-icon" />
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field !pl-11"
              placeholder="your@email.com"
              autoComplete="email"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="register-password" className="field-label">
            密码
          </label>
          <div className="field-wrap relative">
            <Icon name="lock" size={16} className="field-icon" />
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field !pl-11 !pr-11"
              placeholder="至少 6 位字符"
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-subtle transition hover:bg-[var(--hover)] hover:text-foreground"
              aria-label={showPassword ? '隐藏密码' : '显示密码'}
            >
              <Icon name={showPassword ? 'eyeOff' : 'eye'} size={15} />
            </button>
          </div>

          {password.length > 0 && (
            <div className="mt-2.5 flex items-center gap-2">
              <div className="flex flex-1 gap-1">
                {Array.from({ length: 4 }).map((_, index) => (
                  <span
                    key={index}
                    className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                      index < score ? 'bg-foreground' : 'bg-foreground/15'
                    }`}
                  />
                ))}
              </div>
              <span className="w-8 text-right text-[10.5px] text-subtle">
                {strengthLabels[Math.max(0, score - 1)]}
              </span>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="register-confirm" className="field-label">
            确认密码
          </label>
          <div className="field-wrap relative">
            <Icon name="key" size={16} className="field-icon" />
            <input
              id="register-confirm"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`field !pl-11 ${mismatch ? '!border-red-400/60' : ''}`}
              placeholder="再次输入密码"
              autoComplete="new-password"
              required
            />
          </div>
          {mismatch && (
            <p className="mt-1.5 text-[11.5px] text-red-500">两次输入的密码不一致</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary !mt-5 !h-11 w-full !text-[13.5px]"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70" />
              创建中…
            </>
          ) : (
            <>
              创建账号
              <Icon name="arrowRight" size={15} />
            </>
          )}
        </button>
      </form>

      <p className="mt-7 text-center text-[13px] text-muted">
        已有账号？{' '}
        <Link
          href="/auth/login"
          className="font-medium text-foreground underline-offset-4 transition hover:underline"
        >
          直接登录
        </Link>
      </p>

      <p className="mt-8 text-center text-[11.5px] text-subtle">
        <Link href="/" className="transition hover:text-foreground">
          ← 返回画廊
        </Link>
      </p>
    </AuthShell>
  );
}
