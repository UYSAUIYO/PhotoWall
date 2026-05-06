'use client';

import PhotoCard from './PhotoCard';
import type { Photo, LayoutMode } from '@/types';

interface PhotoGridProps {
  photos: Photo[];
  layoutMode: LayoutMode;
  selectedIds?: Set<number>;
  onSelect?: (id: number) => void;
  onPhotoClick?: (photo: Photo) => void;
  selectMode?: boolean;
  showVisibility?: boolean;
}

export default function PhotoGrid({
  photos,
  layoutMode,
  selectedIds,
  onSelect,
  onPhotoClick,
  selectMode = false,
  showVisibility = false,
}: PhotoGridProps) {
  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-foreground/40">
        <svg className="w-16 h-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm">还没有照片</p>
      </div>
    );
  }

  const isGrid = layoutMode === 'grid';
  const className = isGrid ? 'photo-grid' : 'photo-masonry';

  return (
    <div className={className}>
      {photos.map((photo) => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          selected={selectedIds?.has(photo.id)}
          onSelect={onSelect}
          onClick={onPhotoClick}
          selectMode={selectMode}
          showVisibility={showVisibility}
        />
      ))}
    </div>
  );
}
