'use client';

import { getPhotoUrl } from '@/lib/upload';
import type { Photo } from '@/types';

interface PhotoCardProps {
  photo: Photo;
  selected?: boolean;
  onSelect?: (id: number) => void;
  onClick?: (photo: Photo) => void;
  selectMode?: boolean;
  showVisibility?: boolean;
}

export default function PhotoCard({
  photo,
  selected = false,
  onSelect,
  onClick,
  selectMode = false,
  showVisibility = false,
}: PhotoCardProps) {
  const url = getPhotoUrl(photo.user_id, photo.filename);

  function handleClick() {
    if (selectMode && onSelect) {
      onSelect(photo.id);
    } else if (onClick) {
      onClick(photo);
    }
  }

  return (
    <div className="photo-card" onClick={handleClick}>
      <img
        src={url}
        alt={photo.title}
        loading="lazy"
        className="w-full h-full object-cover"
      />

      {/* 选择模式勾选 */}
      {selectMode && (
        <div
          className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            selected
              ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
              : 'border-white/70 bg-black/20'
          }`}
        >
          {selected && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7l3.5 3.5L12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
      )}

      {/* 可见性标签 */}
      {showVisibility && photo.visibility === 'private' && (
        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/50 text-white text-[10px] backdrop-blur-sm">
          私有
        </div>
      )}
    </div>
  );
}
