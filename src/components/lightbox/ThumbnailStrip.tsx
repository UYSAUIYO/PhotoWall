'use client';

import { useRef, useEffect } from 'react';
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
    if (containerRef.current) {
      const el = containerRef.current.children[currentIndex] as HTMLElement | undefined;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [currentIndex]);

  return (
    <div
      ref={containerRef}
      className="flex gap-1.5 overflow-x-auto px-4 py-2 glass"
    >
      {photos.map((photo, i) => (
        <button
          key={photo.id}
          onClick={() => onSelect(i)}
          className={`flex-shrink-0 w-14 h-14 rounded-md overflow-hidden transition-all ${
            i === currentIndex
              ? 'ring-2 ring-[var(--accent)] opacity-100'
              : 'opacity-50 hover:opacity-80'
          }`}
        >
          <img
            src={getPhotoUrl(photo.user_id, photo.filename)}
            alt=""
            className="w-full h-full object-cover"
            draggable={false}
          />
        </button>
      ))}
    </div>
  );
}
