'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Logo from './Logo';
import Avatar from './Avatar';
import Icon, { type IconName } from './Icon';
import ThemeToggle from './ThemeToggle';

export interface SideNavItem {
  href: string;
  label: string;
  icon: IconName;
}

interface SideNavProps {
  variant: 'dashboard' | 'admin';
  items: SideNavItem[];
}

export default function SideNav({ variant, items }: SideNavProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const user = session?.user;
  const role = (user as { role?: string } | undefined)?.role;
  const isAdmin = role === 'admin';

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && href !== '/admin' && pathname.startsWith(`${href}/`));

  const brandHref = variant === 'admin' ? '/admin' : '/dashboard';

  const navItems: SideNavItem[] = [...items];
  if (variant === 'dashboard' && isAdmin) {
    navItems.push({ href: '/admin', label: '管理后台', icon: 'shield' });
  }
  if (variant === 'admin') {
    navItems.push({ href: '/dashboard', label: '个人空间', icon: 'user' });
  }

  const content = (
    <>
      <div className="flex items-center justify-between px-2 pb-6 pt-2">
        <Logo href={brandHref} />
        {variant === 'admin' && (
          <span className="rounded-full border border-[var(--hairline)] bg-[var(--field-bg)] px-2 py-[3px] text-[10px] font-semibold tracking-[0.08em] text-subtle">
            管理
          </span>
        )}
      </div>

      <div className="mx-1 mb-5 flex items-center gap-3 rounded-2xl border border-[var(--hairline)] bg-[var(--field-bg)] p-3">
        {user ? (
          <>
            <Avatar name={user.name} size={38} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-semibold leading-tight">
                {user.name || '未命名用户'}
              </p>
              <p className="mt-1 truncate text-[11px] leading-tight text-subtle">{user.email}</p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-[3px] text-[10px] font-medium ${
                isAdmin ? 'bg-[var(--accent-light)] text-[var(--accent)]' : 'bg-[var(--hover)] text-muted'
              }`}
            >
              {isAdmin ? '管理员' : '用户'}
            </span>
          </>
        ) : (
          <>
            <span className="skeleton h-[38px] w-[38px] rounded-full" />
            <div className="flex-1 space-y-1.5">
              <span className="skeleton block h-3 w-20 rounded-full" />
              <span className="skeleton block h-2.5 w-28 rounded-full" />
            </div>
          </>
        )}
      </div>

      <nav className="space-y-1" aria-label={variant === 'admin' ? '管理导航' : '个人空间导航'}>
        <p className="eyebrow px-3 pb-1.5">菜单</p>
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              className={`group flex items-center gap-3 rounded-[13px] px-3 py-2.5 text-[13.5px] font-medium transition-all ${
                active
                  ? 'bg-foreground text-background shadow-[0_10px_22px_-16px_rgba(0,0,0,0.7)]'
                  : 'text-muted hover:bg-[var(--hover)] hover:text-foreground'
              }`}
            >
              <Icon name={item.icon} size={18} strokeWidth={active ? 2 : 1.8} />
              <span className="flex-1">{item.label}</span>
              {active && <span className="h-1 w-1 rounded-full bg-background/70" />}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-0.5 pt-5">
        <div className="mb-2 border-t border-[var(--hairline)] pt-2">
          <Link href="/" className="menu-item">
            <Icon name="arrowLeft" size={17} />
            <span>返回画廊</span>
          </Link>
          <ThemeToggle variant="row" />
          <button
            type="button"
            onClick={() => signOut()}
            className="menu-item !text-[var(--danger)] hover:!bg-[var(--danger-bg)]"
          >
            <Icon name="logout" size={17} />
            <span>退出登录</span>
          </button>
        </div>
        <p className="px-3 pt-1 text-[10px] tracking-[0.08em] text-subtle">
          PHOTOWALL · {new Date().getFullYear()}
        </p>
      </div>
    </>
  );

  return (
    <>
      {/* 桌面侧栏 */}
      <aside className="sticky top-0 hidden h-screen w-[272px] shrink-0 p-3 lg:block">
        <div className="glass flex h-full flex-col overflow-y-auto rounded-[28px] p-3 no-scrollbar">
          {content}
        </div>
      </aside>

      {/* 移动端顶栏 */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-[var(--hairline)] bg-background/80 px-4 backdrop-blur-xl lg:hidden">
        <Logo href={brandHref} />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="icon-btn border border-[var(--hairline)]"
          aria-label="打开菜单"
        >
          <Icon name="menu" size={19} />
        </button>
      </header>

      {/* 移动端抽屉 */}
      {open && (
        <div className="fixed inset-0 z-[150] lg:hidden">
          <div
            className="absolute inset-0 bg-black/35 backdrop-blur-[3px] anim-fade dark:bg-black/60"
            onClick={() => setOpen(false)}
          />
          <div className="glass-strong anim-slide-left absolute inset-y-0 left-0 flex w-[290px] max-w-[86vw] flex-col overflow-y-auto rounded-r-[30px] border-l-0 p-4">
            <div className="mb-1 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="icon-btn icon-btn-sm hover:bg-[var(--hover)]"
                aria-label="关闭菜单"
              >
                <Icon name="x" size={17} />
              </button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
}
