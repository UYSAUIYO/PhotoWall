'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import UserMenu from './UserMenu';
import ThemeToggle from '@/components/ui/ThemeToggle';
import Logo from '@/components/ui/Logo';

export default function GlassNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 不显示导航栏的路径
  if (
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/dashboard')
  ) {
    return null;
  }

  const isGallery = pathname === '/';

  return (
    <nav className="glass-nav" data-scrolled={scrolled}>
      <div className="mx-auto flex h-full w-full max-w-[1760px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-7">
          <Logo href="/" />
          <div className="hidden items-center gap-1 sm:flex">
            <Link
              href="/"
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
                isGallery
                  ? 'bg-[var(--hover)] text-foreground'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              画廊
            </Link>
            {session?.user && (
              <Link
                href="/dashboard"
                className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-muted transition hover:text-foreground"
              >
                个人空间
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <span className="mx-1 hidden h-5 w-px bg-[var(--hairline)] sm:block" />
          <UserMenu />
        </div>
      </div>
    </nav>
  );
}
