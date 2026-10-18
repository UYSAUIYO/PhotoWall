'use client';

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { getPhotoUrl } from '@/lib/upload';
import Icon from '@/components/ui/Icon';
import type { LayoutMode, Photo } from '@/types';

interface PhotoCardProps {
  photo: Photo;
  layoutMode?: LayoutMode;
  index?: number;
  selected?: boolean;
  onSelect?: (id: number) => void;
  onClick?: (photo: Photo) => void;
  selectMode?: boolean;
  showVisibility?: boolean;
}

export default function PhotoCard({
  photo,
  layoutMode = 'masonry',
  index = 0,
  selected = false,
  onSelect,
  onClick,
  selectMode = false,
  showVisibility = false,
}: PhotoCardProps) {
  const url = getPhotoUrl(photo.user_id, photo.filename);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, []);

  const rawRatio = photo.width && photo.height ? photo.width / photo.height : 4 / 3;
  const ratio = layoutMode === 'grid' ? 1 : Math.min(2.4, Math.max(0.62, rawRatio));

  function activate() {
    if (selectMode && onSelect) onSelect(photo.id);
    else onClick?.(photo);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      activate();
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={activate}
      onKeyDown={handleKeyDown}
      className="photo-card anim-rise"
      data-selected={selected}
      style={{ aspectRatio: String(ratio), ['--i' as string]: index % 12 } as CSSProperties}
      aria-label={photo.title || '未命名照片'}
      aria-pressed={selectMode ? selected : undefined}
    >
      {!loaded && !failed && <div className="skeleton absolute inset-0" />}

      {failed ? (
        <div className="absolute inset-0 grid place-items-center bg-[var(--field-bg)] text-subtle">
          <Icon name="image" size={26} strokeWidth={1.4} />
        </div>
      ) : (
        <img
          ref={imgRef}
          src={url}
          alt={photo.title || ''}
          loading="lazy"
          decoding="async"
          draggable={false}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setFailed(true);
            setLoaded(true);
          }}
          className={`photo-media ${loaded ? 'is-loaded' : ''}`}
        />
      )}

      <div className="photo-scrim" aria-hidden="true" />

      <div className="photo-meta">
        <p className="truncate text-[13px] font-medium leading-snug">{photo.title || '未命名'}</p>
        <p className="mt-1 flex items-center gap-1.5 text-[11px] text-white/70">
          <span className="truncate">{photo.category || '其他'}</span>
          {photo.username && (
            <>
              <span className="opacity-50">·</span>
              <span className="truncate">@{photo.username}</span>
            </>
          )}
        </p>
      </div>

      {showVisibility && photo.visibility === 'private' && (
        <span className="photo-badge">
          <Icon name="lock" size={10} strokeWidth={2} />
          私有
        </span>
      )}

      {selectMode && (
        <span className="photo-check" data-selected={selected} aria-hidden="true">
          {selected && <Icon name="check" size={14} strokeWidth={2.4} />}
        </span>
      )}
    </div>
  );
}
