'use client';

import { useEffect, useState } from 'react';
import Logo from '@/components/ui/Logo';
import ThemeToggle from '@/components/ui/ThemeToggle';
import Icon from '@/components/ui/Icon';
import { getPhotoUrl } from '@/lib/upload';
import type { Photo } from '@/types';

interface AuthShellProps {
  children: React.ReactNode;
}

export default function AuthShell({ children }: AuthShellProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    let active = true;
    fetch('/api/photos?limit=3')
      .then((res) => res.json())
      .then((data) => {
        if (active && data.success) setPhotos((data.data as Photo[]).slice(0, 3));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const cards: (Photo | null)[] = [photos[0] ?? null, photos[1] ?? null, photos[2] ?? null];

  return (
    <div className="relative min-h-screen lg:grid lg:grid-cols-[1.06fr_0.94fr]">
      {/* 品牌侧 */}
      <aside className="relative hidden flex-col overflow-hidden border-r border-[var(--hairline)] px-10 py-9 lg:flex xl:px-14 xl:py-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_90%_at_10%_0%,var(--accent-light),transparent_55%)]"
        />

        <div className="flex items-center justify-between">
          <Logo href="/" size={32} />
          <span className="eyebrow">Private Gallery</span>
        </div>

        <div className="mt-14 max-w-[460px] xl:mt-20">
          <h2 className="text-[44px] font-semibold leading-[1.02] tracking-[-0.05em] xl:text-[56px]">
            把光影，
            <br />
            <span className="text-subtle">留在墙上。</span>
          </h2>
          <p className="mt-5 max-w-[360px] text-[13.5px] leading-relaxed text-muted">
            收藏、整理与分享你的每一张照片。一个安静、克制的私人画廊，让值得记住的瞬间停在原地。
          </p>
        </div>

        <div className="relative mt-10 min-h-[230px]">
          <div className="flex w-full max-w-[520px] items-end">
            {cards.map((photo, index) => {
              const rotations = [-6, 4, 9];
              const offsets = [16, -8, 28];
              return (
                <figure
                  key={photo?.id ?? `placeholder-${index}`}
                  className={`relative w-[43%] rounded-[20px] border border-white/50 bg-white/35 p-1.5 shadow-[0_30px_70px_-34px_rgba(20,20,26,0.5)] backdrop-blur-xl transition-transform duration-500 hover:z-20 ${
                    index > 0 ? '-ml-8 sm:-ml-10' : ''
                  }`}
                  style={{
                    transform: `translateY(${offsets[index]}px) rotate(${rotations[index]}deg)`,
                    zIndex: 3 - index,
                  }}
                >
                  <div className="aspect-[4/3] overflow-hidden rounded-[14px] bg-[var(--field-bg)]">
                    {photo ? (
                      <img
                        src={getPhotoUrl(photo.user_id, photo.filename)}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-gradient-to-br from-[var(--accent-light)] via-purple-500/10 to-pink-500/15 text-muted">
                        <Icon name="camera" size={22} strokeWidth={1.4} />
                      </div>
                    )}
                  </div>
                </figure>
              );
            })}
          </div>
        </div>

        <div className="mt-auto flex items-center gap-3 pt-10 text-[10px] uppercase tracking-[0.16em] text-subtle">
          <span className="h-px w-8 bg-[var(--hairline-strong)]" />
          © {new Date().getFullYear()} PhotoWall
        </div>
      </aside>

      {/* 表单侧 */}
      <main className="relative flex min-h-screen flex-col items-center justify-center px-5 py-12 sm:px-8">
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-[420px]">
          <div className="mb-10 flex items-center justify-between lg:hidden">
            <Logo href="/" />
          </div>
          {children}
        </div>

        <p className="mt-12 text-center text-[10.5px] tracking-[0.06em] text-subtle lg:hidden">
          © {new Date().getFullYear()} PhotoWall · 以克制的方式，收藏光影。
        </p>
      </main>
    </div>
  );
}
