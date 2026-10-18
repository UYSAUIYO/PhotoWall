'use client';

import { useEffect, useState } from 'react';
import ImageViewer from './ImageViewer';
import InfoPanel from './InfoPanel';
import ThumbnailStrip from './ThumbnailStrip';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Icon from '@/components/ui/Icon';
import { getPhotoUrl } from '@/lib/upload';
import type { Photo, PhotoVisibility } from '@/types';

interface LightboxProps {
  photos: Photo[];
  currentIndex: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  editable?: boolean;
  onSave?: (
    photoId: number,
    data: {
      title: string;
      description: string;
      category: string;
      tags: string;
      visibility: PhotoVisibility;
    }
  ) => void | Promise<void>;
  onDelete?: (photoId: number) => void | Promise<void>;
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
  const [infoOpen, setInfoOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < photos.length - 1;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        !!target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (event.key === 'Escape') {
        if (confirmOpen) setConfirmOpen(false);
        else if (infoOpen) setInfoOpen(false);
        else onClose();
        return;
      }

      if (typing) return;

      if (event.key === 'ArrowLeft' && hasPrev) onIndexChange(currentIndex - 1);
      if (event.key === 'ArrowRight' && hasNext) onIndexChange(currentIndex + 1);
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [currentIndex, hasPrev, hasNext, onClose, onIndexChange, confirmOpen, infoOpen]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // 预取相邻照片
  useEffect(() => {
    [currentIndex - 1, currentIndex + 1].forEach((index) => {
      const photo = photos[index];
      if (!photo) return;
      const image = new window.Image();
      image.src = getPhotoUrl(photo.user_id, photo.filename);
    });
  }, [currentIndex, photos]);

  if (!current) return null;

  const url = getPhotoUrl(current.user_id, current.filename);

  async function handleDelete() {
    if (!current || !onDelete) return;
    setDeleting(true);
    try {
      await onDelete(current.id);
      onClose();
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  return (
    <div className="dark lightbox-overlay fixed inset-0 z-[200] flex flex-col overflow-hidden bg-[#05060a] text-white">
      {/* 环境底色：来自当前照片的模糊延展 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 scale-125 bg-cover bg-center opacity-25 blur-3xl"
        style={{ backgroundImage: `url("${url}")` }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/80"
      />

      <header className="relative z-10 flex shrink-0 items-center justify-between gap-3 px-3 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="glass-dark grid h-9 w-9 shrink-0 place-items-center rounded-full text-white/75 transition hover:bg-white/15 hover:text-white"
            aria-label="关闭灯箱"
          >
            <Icon name="x" size={17} />
          </button>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-white/90">
              {current.title || '未命名'}
            </p>
            <p className="mt-0.5 text-[10.5px] tabular text-white/40">
              {currentIndex + 1} / {photos.length}
              {current.category ? ` · ${current.category}` : ''}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => setInfoOpen(true)}
            className="glass-dark grid h-9 w-9 place-items-center rounded-full text-white/70 transition hover:bg-white/15 hover:text-white lg:hidden"
            aria-label="照片信息"
          >
            <Icon name="info" size={16} />
          </button>
          <a
            href={url}
            download={current.filename}
            className="glass-dark hidden h-9 items-center gap-2 rounded-full px-3.5 text-[12px] font-medium text-white/75 transition hover:bg-white/15 hover:text-white sm:flex"
            title="下载原图"
          >
            <Icon name="download" size={14} />
            下载
          </a>
        </div>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1">
        <section className="flex min-w-0 flex-1 flex-col">
          <ImageViewer
            photo={current}
            hasPrev={hasPrev}
            hasNext={hasNext}
            onPrev={() => onIndexChange(currentIndex - 1)}
            onNext={() => onIndexChange(currentIndex + 1)}
          />

          {photos.length > 1 && (
            <ThumbnailStrip
              photos={photos}
              currentIndex={currentIndex}
              onSelect={onIndexChange}
            />
          )}
        </section>

        <aside className="hidden w-[340px] shrink-0 border-l border-white/10 bg-white/[0.03] backdrop-blur-2xl lg:block">
          <InfoPanel
            key={current.id}
            photo={current}
            editable={editable}
            onSave={onSave ? (data) => onSave(current.id, data) : undefined}
            onDelete={onDelete ? () => setConfirmOpen(true) : undefined}
          />
        </aside>
      </div>

      {/* 移动端信息抽屉 */}
      {infoOpen && (
        <div className="absolute inset-0 z-30 lg:hidden">
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-sm anim-fade"
            onClick={() => setInfoOpen(false)}
          />
          <div className="anim-sheet absolute inset-x-0 bottom-0 max-h-[80vh] overflow-hidden rounded-t-[28px] border-t border-white/10 bg-[#141519]/95 shadow-[0_-30px_80px_rgba(0,0,0,0.6)]">
            <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-white/20" />
            <div className="max-h-[76vh] overflow-y-auto">
              <InfoPanel
                key={current.id}
                photo={current}
                editable={editable}
                onSave={onSave ? (data) => onSave(current.id, data) : undefined}
                onDelete={onDelete ? () => setConfirmOpen(true) : undefined}
              />
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="删除这张照片？"
        description="照片记录与存储文件都会被移除，此操作无法撤销。"
        confirmLabel="删除"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
