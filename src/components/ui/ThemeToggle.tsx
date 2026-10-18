'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import Icon from './Icon';

interface ThemeToggleProps {
  variant?: 'icon' | 'row';
  className?: string;
}

export default function ThemeToggle({ variant = 'icon', className = '' }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === 'dark';
  const toggle = () => setTheme(isDark ? 'light' : 'dark');

  if (variant === 'row') {
    return (
      <button
        type="button"
        onClick={toggle}
        className={`menu-item ${className}`}
        aria-label={mounted && isDark ? '切换到浅色模式' : '切换到深色模式'}
      >
        <Icon name={mounted && isDark ? 'sun' : 'moon'} size={17} />
        <span>{mounted && isDark ? '浅色外观' : '深色外观'}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`icon-btn ${className}`}
      aria-label={mounted ? (isDark ? '切换到浅色模式' : '切换到深色模式') : '切换主题'}
      title={mounted ? (isDark ? '浅色模式' : '深色模式') : '切换主题'}
    >
      {mounted ? (
        <span className="relative block h-[18px] w-[18px]">
          <Icon
            name="sun"
            size={18}
            className={`absolute inset-0 transition-all duration-300 ${
              isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-50 opacity-0'
            }`}
          />
          <Icon
            name="moon"
            size={18}
            className={`absolute inset-0 transition-all duration-300 ${
              isDark ? 'rotate-90 scale-50 opacity-0' : 'rotate-0 scale-100 opacity-100'
            }`}
          />
        </span>
      ) : (
        <span className="block h-[18px] w-[18px]" />
      )}
    </button>
  );
}
