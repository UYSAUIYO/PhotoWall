'use client';

import { useEffect, useCallback } from 'react';
import ImageViewer from './ImageViewer';
import InfoPanel from './InfoPanel';
import ThumbnailStrip from './ThumbnailStrip';
import type { Photo } from '@/types';

interface LightboxProps {
  photos: Photo[];
  currentIndex: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  editable?: boolean;
  onSave?: (photoId: number, data: any) => void;
  onDelete?: (photoId: number) => void;
}

export default function Lightbox({
  photos,
  currentIndex,
  onClose,
  onIndexChange,
  editable = false,
  onSave,
  onDelete,
}: LightboxProps) {
  const current = photos[currentIndex];
  if (!current) return null;

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < photos.length - 1;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onIndexChange(currentIndex - 1);
      if (e.key === 'ArrowRight' && hasNext) onIndexChange(currentIndex + 1);
    },
    [currentIndex, hasPrev, hasNext, onClose, onIndexChange]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  return (
    <div
      className="lightbox-overlay fixed inset-0 z-[200] bg-black/90 flex flex-col"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-white/60 text-sm">
          {currentIndex + 1} / {photos.length}
        </span>
        <div className="flex gap-2">
          {editable && onDelete && (
            <button
              onClick={() => {
                if (confirm('确定删除这张照片？')) {
                  onDelete(current.id);
                  onClose();
                }
              }}
              className="px-3 py-1.5 rounded-lg text-sm text-red-400 hover:text-red-300 transition"
            >
              删除
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white/60 hover:text-white transition"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* 图片展示区 */}
      <ImageViewer
        photo={current}
        onPrev={() => onIndexChange(currentIndex - 1)}
        onNext={() => onIndexChange(currentIndex + 1)}
        hasPrev={hasPrev}
        hasNext={hasNext}
      />

      {/* 底部面板 */}
      <div className="flex-shrink-0 max-w-2xl mx-auto w-full px-4 pb-4 space-y-3">
        <InfoPanel
          photo={current}
          editable={editable}
          onSave={(data) => onSave?.(current.id, data)}
          onDelete={onDelete ? () => onDelete(current.id) : undefined}
        />

        {photos.length > 1 && (
          <ThumbnailStrip
            photos={photos}
            currentIndex={currentIndex}
            onSelect={onIndexChange}
          />
        )}
      </div>
    </div>
  );
}
