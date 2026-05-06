'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function UserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!session?.user) {
    return (
      <Link
        href="/auth/login"
        className="px-4 py-2 rounded-full bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition"
      >
        登录
      </Link>
    );
  }

  const role = (session.user as any).role;

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full glass hover:bg-[var(--glass-bg-strong)] transition"
      >
        <div className="w-7 h-7 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-xs font-bold">
          {session.user.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <span className="text-sm font-medium max-w-[100px] truncate hidden sm:block">
          {session.user.name}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 glass-strong p-1.5 space-y-0.5 z-50">
          <div className="px-3 py-2 text-xs text-foreground/50 border-b border-foreground/10 mb-1">
            {session.user.email}
            <span className="ml-2 px-1.5 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--accent)] text-xs">
              {role === 'admin' ? '管理员' : '用户'}
            </span>
          </div>

          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm hover:bg-foreground/5 transition"
          >
            个人空间
          </Link>

          {role === 'admin' && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm hover:bg-foreground/5 transition"
            >
              管理后台
            </Link>
          )}

          <hr className="border-foreground/10 my-1" />

          <button
            onClick={() => { setOpen(false); signOut(); }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/5 transition"
          >
            退出登录
          </button>
        </div>
      )}
    </div>
  );
}
