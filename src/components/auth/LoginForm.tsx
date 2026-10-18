'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AuthShell from './AuthShell';
import Icon from '@/components/ui/Icon';
import Notice from '@/components/ui/Notice';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('邮箱或密码不正确，请重试。');
        setLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError('登录失败，请稍后重试。');
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <div className="mb-9">
        <p className="eyebrow">Welcome back</p>
        <h1 className="mt-3 text-[30px] font-semibold tracking-[-0.035em]">登录 PhotoWall</h1>
        <p className="mt-2.5 text-[13px] leading-relaxed text-muted">
          输入邮箱与密码，回到你的光影收藏。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Notice tone="error">{error}</Notice>}

        <div>
          <label htmlFor="login-email" className="field-label">
            邮箱
          </label>
          <div className="field-wrap relative">
            <Icon name="mail" size={16} className="field-icon" />
            <input
              id="login-email"
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
          <label htmlFor="login-password" className="field-label">
            密码
          </label>
          <div className="field-wrap relative">
            <Icon name="lock" size={16} className="field-icon" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field !pl-11 !pr-11"
              placeholder="••••••••"
              autoComplete="current-password"
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
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary !h-11 w-full !text-[13.5px]">
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70" />
              验证中…
            </>
          ) : (
            <>
              登录
              <Icon name="arrowRight" size={15} />
            </>
          )}
        </button>
      </form>

      <p className="mt-7 text-center text-[13px] text-muted">
        还没有账号？{' '}
        <Link
          href="/auth/register"
          className="font-medium text-foreground underline-offset-4 transition hover:underline"
        >
          创建一个
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
