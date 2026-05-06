'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UserMenu from './UserMenu';

export default function GlassNav() {
  const pathname = usePathname();

  // 不显示导航栏的路径
  if (pathname.startsWith('/auth/') || pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) {
    return null;
  }

  return (
    <nav className="glass-nav flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-lg font-bold tracking-tight">
          <span className="text-[var(--accent)]">Photo</span>Wall
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <UserMenu />
      </div>
    </nav>
  );
}
