'use client';

import { useState, useEffect, useCallback } from 'react';
import UploadZone from '@/components/upload/UploadZone';
import UploadModal from '@/components/upload/UploadModal';
import PhotoGrid from '@/components/photos/PhotoGrid';
import CategoryChips from '@/components/photos/CategoryChips';
import SearchInput from '@/components/photos/SearchInput';
import LayoutToggle from '@/components/photos/LayoutToggle';
import BatchToolbar from '@/components/photos/BatchToolbar';
import Lightbox from '@/components/lightbox/Lightbox';
import type { Photo, LayoutMode, PhotoVisibility } from '@/types';

export default function MyPhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [categories, setCategories] = useState<{ category: string; count: number }[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid');
  const [loading, setLoading] = useState(true);

  // Upload
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Selection
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory) params.set('category', activeCategory);
    if (search) params.set('search', search);
    params.set('limit', '100');

    const res = await fetch(`/api/photos/my?${params}`);
    const data = await res.json();
    if (data.success) {
      setPhotos(data.data);
      setCategories(
        (data.data as Photo[]).reduce((acc: { category: string; count: number }[], p: Photo) => {
          const existing = acc.find((c) => c.category === p.category);
          if (existing) existing.count++;
          else acc.push({ category: p.category, count: 1 });
          return acc;
        }, [])
      );
    }
    setLoading(false);
  }, [activeCategory, search]);

  useEffect(() => { fetchPhotos(); }, [fetchPhotos]);

  function handleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function handleUpload(entries: { title: string; description: string; category: string; tags: string; visibility: string }[]) {
    for (let i = 0; i < uploadFiles.length; i++) {
      const formData = new FormData();
      formData.append('file', uploadFiles[i]);
      formData.append('title', entries[i].title);
      formData.append('description', entries[i].description);
      formData.append('category', entries[i].category);
      formData.append('tags', entries[i].tags);
      formData.append('visibility', entries[i].visibility);

      await fetch('/api/photos', { method: 'POST', body: formData });
    }
    setUploadFiles([]);
    fetchPhotos();
  }

  async function handleBatchDelete() {
    if (!confirm(`确定删除选中的 ${selectedIds.size} 张照片？`)) return;
    await fetch('/api/photos/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', ids: Array.from(selectedIds) }),
    });
    setSelectedIds(new Set());
    setSelectMode(false);
    fetchPhotos();
  }

  async function handleBatchCategorize() {
    const category = prompt('请输入分类名：');
    if (!category) return;
    await fetch('/api/photos/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'categorize', ids: Array.from(selectedIds), category }),
    });
    setSelectedIds(new Set());
    setSelectMode(false);
    fetchPhotos();
  }

  async function handleBatchVisibility(visibility: PhotoVisibility) {
    await fetch('/api/photos/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'visibility', ids: Array.from(selectedIds), visibility }),
    });
    setSelectedIds(new Set());
    setSelectMode(false);
    fetchPhotos();
  }

  function handlePhotoClick(photo: Photo) {
    const index = photos.findIndex((p) => p.id === photo.id);
    setLightboxIndex(Math.max(0, index));
    setLightboxOpen(true);
  }

  async function handleSavePhoto(photoId: number, data: any) {
    await fetch(`/api/photos/${photoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    fetchPhotos();
  }

  async function handleDeletePhoto(photoId: number) {
    await fetch(`/api/photos/${photoId}`, { method: 'DELETE' });
    fetchPhotos();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">我的照片</h1>

      {/* 筛选栏 */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 max-w-sm">
            <SearchInput value={search} onChange={setSearch} />
          </div>
          <LayoutToggle mode={layoutMode} onChange={setLayoutMode} />
          <button
            onClick={() => { setSelectMode(!selectMode); if (selectMode) setSelectedIds(new Set()); }}
            className={`px-3 py-2 rounded-xl text-sm font-medium transition ${
              selectMode ? 'bg-[var(--accent)] text-white' : 'glass hover:bg-foreground/5'
            }`}
          >
            {selectMode ? '取消选择' : '选择'}
          </button>
        </div>
        <CategoryChips categories={categories} active={activeCategory} onSelect={setActiveCategory} />
      </div>

      {/* 批量操作栏 */}
      <BatchToolbar
        selectedCount={selectedIds.size}
        onCancel={() => { setSelectMode(false); setSelectedIds(new Set()); }}
        onDelete={handleBatchDelete}
        onCategorize={handleBatchCategorize}
        onSetVisibility={handleBatchVisibility}
      />

      {/* 上传区域 */}
      <UploadZone
        onFiles={(files) => { setUploadFiles(files); setShowUploadModal(true); }}
      />

      {/* 照片网格 */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <PhotoGrid
          photos={photos}
          layoutMode={layoutMode}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onPhotoClick={handlePhotoClick}
          selectMode={selectMode}
          showVisibility
        />
      )}

      {/* 上传弹窗 */}
      {showUploadModal && (
        <UploadModal
          files={uploadFiles}
          onUpload={handleUpload}
          onClose={() => setShowUploadModal(false)}
        />
      )}

      {/* 灯箱 */}
      {lightboxOpen && (
        <Lightbox
          photos={photos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onIndexChange={setLightboxIndex}
          editable
          onSave={handleSavePhoto}
          onDelete={handleDeletePhoto}
        />
      )}
    </div>
  );
}
