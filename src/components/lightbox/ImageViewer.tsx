'use client';

import { useEffect, useState } from 'react';
import { getPhotoUrl } from '@/lib/upload';
import Icon from '@/components/ui/Icon';
import type { Photo } from '@/types';

interface ImageViewerProps {
  photo: Photo;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export default function ImageViewer({
  photo,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
}: ImageViewerProps) {
  const url = getPhotoUrl(photo.user_id, photo.filename);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [photo.id]);

  return (
    <div className="relative flex min-h-0 flex-1 items-center justify-center px-3 sm:px-6">
      {!loaded && (
        <div className="absolute inset-0 grid place-items-center" aria-hidden="true">
          <span className="h-7 w-7 animate-spin rounded-full border-2 border-white/25 border-t-white/90" />
        </div>
      )}

      <img
        key={photo.id}
        src={url}
        alt={photo.title || ''}
        onLoad={() => setLoaded(true)}
        draggable={false}
        className={`lightbox-image max-h-full max-w-full select-none rounded-[18px] object-contain shadow-[0_40px_100px_-30px_rgba(0,0,0,0.95)] transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {hasPrev && (
        <button
          type="button"
          onClick={onPrev}
          className="glass-dark absolute left-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-white/75 transition hover:bg-white/15 hover:text-white sm:left-4"
          aria-label="上一张"
        >
          <Icon name="chevronLeft" size={20} />
        </button>
      )}

      {hasNext && (
        <button
          type="button"
          onClick={onNext}
          className="glass-dark absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-white/75 transition hover:bg-white/15 hover:text-white sm:right-4"
          aria-label="下一张"
        >
          <Icon name="chevronRight" size={20} />
        </button>
      )}
    </div>
  );
}
