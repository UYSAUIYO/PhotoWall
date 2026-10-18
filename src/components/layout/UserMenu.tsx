'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Avatar from '@/components/ui/Avatar';
import Icon from '@/components/ui/Icon';

export default function UserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  if (!session?.user) {
    return (
      <Link href="/auth/login" className="btn btn-primary btn-sm h-9 !px-4">
        <Icon name="user" size={15} />
        登录
      </Link>
    );
  }

  const role = (session.user as { role?: string }).role;

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full border border-transparent p-0.5 pr-1 transition hover:border-[var(--edge)] hover:bg-[var(--hover)] sm:pl-1"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="账户菜单"
      >
        <Avatar name={session.user.name} size={30} />
        <span className="hidden max-w-[110px] truncate text-[13px] font-medium sm:block">
          {session.user.name}
        </span>
        <Icon
          name="chevronDown"
          size={14}
          className={`hidden text-subtle transition-transform duration-300 sm:block ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="menu absolute right-0 top-[calc(100%+10px)] z-50 w-[268px] p-2"
        >
          <div className="flex items-center gap-3 rounded-2xl bg-[var(--field-bg)] p-3">
            <Avatar name={session.user.name} size={38} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-semibold">{session.user.name}</p>
              <p className="mt-0.5 truncate text-[11px] text-subtle">{session.user.email}</p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-[3px] text-[10px] font-medium ${
                role === 'admin'
                  ? 'bg-[var(--accent-light)] text-[var(--accent)]'
                  : 'bg-[var(--hover)] text-muted'
              }`}
            >
              {role === 'admin' ? '管理员' : '用户'}
            </span>
          </div>

          <div className="mt-2 space-y-0.5">
            <Link href="/dashboard" onClick={() => setOpen(false)} className="menu-item" role="menuitem">
              <Icon name="images" size={16} />
              个人空间
            </Link>
            <Link
              href="/dashboard/photos"
              onClick={() => setOpen(false)}
              className="menu-item"
              role="menuitem"
            >
              <Icon name="upload" size={16} />
              上传照片
            </Link>
            {role === 'admin' && (
              <Link href="/admin" onClick={() => setOpen(false)} className="menu-item" role="menuitem">
                <Icon name="shield" size={16} />
                管理后台
              </Link>
            )}
          </div>

          <div className="my-1.5 h-px bg-[var(--hairline)]" />

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              signOut();
            }}
            className="menu-item !text-[var(--danger)] hover:!bg-[var(--danger-bg)]"
            role="menuitem"
          >
            <Icon name="logout" size={16} />
            退出登录
          </button>
        </div>
      )}
    </div>
  );
}
