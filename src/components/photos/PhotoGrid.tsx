'use client';

import PhotoCard from './PhotoCard';
import type { LayoutMode, Photo } from '@/types';

interface PhotoGridProps {
  photos: Photo[];
  layoutMode: LayoutMode;
  selectedIds?: Set<number>;
  onSelect?: (id: number) => void;
  onPhotoClick?: (photo: Photo) => void;
  selectMode?: boolean;
  showVisibility?: boolean;
  empty?: React.ReactNode;
}

export default function PhotoGrid({
  photos,
  layoutMode,
  selectedIds,
  onSelect,
  onPhotoClick,
  selectMode = false,
  showVisibility = false,
  empty,
}: PhotoGridProps) {
  if (photos.length === 0) {
    return <>{empty ?? null}</>;
  }

  const className = layoutMode === 'grid' ? 'photo-grid' : 'photo-masonry';

  return (
    <div className={className} data-count={photos.length}>
      {photos.map((photo, index) => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          index={index}
          layoutMode={layoutMode}
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

export function PhotoGridSkeleton({
  layoutMode = 'masonry',
  count = 10,
}: {
  layoutMode?: LayoutMode;
  count?: number;
}) {
  const ratios = [4 / 3, 3 / 4, 1, 4 / 3, 3 / 4, 1.2, 3 / 4, 4 / 3, 1, 0.8];
  const isGrid = layoutMode === 'grid';

  return (
    <div className={isGrid ? 'photo-grid' : 'photo-masonry'} aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="photo-card skeleton !cursor-default"
          style={{ aspectRatio: String(isGrid ? 1 : ratios[index % ratios.length]) }}
        />
      ))}
    </div>
  );
}
