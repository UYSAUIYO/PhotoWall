'use client';

import { useEffect, useRef } from 'react';
import { getPhotoUrl } from '@/lib/upload';
import type { Photo } from '@/types';

interface ThumbnailStripProps {
  photos: Photo[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

export default function ThumbnailStrip({ photos, currentIndex, onSelect }: ThumbnailStripProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const active = container.children[currentIndex] as HTMLElement | undefined;
    active?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [currentIndex]);

  return (
    <div className="shrink-0 border-t border-white/10 bg-black/25 px-3 py-3 backdrop-blur-xl">
      <div
        ref={containerRef}
        className="no-scrollbar mask-fade-x flex items-center justify-start gap-2 overflow-x-auto"
      >
        {photos.map((photo, index) => {
          const active = index === currentIndex;
          return (
            <button
              key={photo.id}
              type="button"
              onClick={() => onSelect(index)}
              className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-[10px] transition-all duration-300 sm:h-14 sm:w-14 ${
                active
                  ? 'scale-[1.06] ring-2 ring-white/90'
                  : 'opacity-45 hover:opacity-80'
              }`}
              aria-label={`查看第 ${index + 1} 张：${photo.title || '未命名'}`}
              aria-current={active}
            >
              <img
                src={getPhotoUrl(photo.user_id, photo.filename)}
                alt=""
                className="h-full w-full object-cover"
                draggable={false}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
