'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import PageHeader from '@/components/ui/PageHeader';
import UploadZone from '@/components/upload/UploadZone';
import UploadModal from '@/components/upload/UploadModal';
import PhotoGrid, { PhotoGridSkeleton } from '@/components/photos/PhotoGrid';
import CategoryChips from '@/components/photos/CategoryChips';
import SearchInput from '@/components/photos/SearchInput';
import LayoutToggle from '@/components/photos/LayoutToggle';
import BatchToolbar from '@/components/photos/BatchToolbar';
import Lightbox from '@/components/lightbox/Lightbox';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import PromptDialog from '@/components/ui/PromptDialog';
import Notice from '@/components/ui/Notice';
import Icon from '@/components/ui/Icon';
import type { LayoutMode, Photo, PhotoVisibility } from '@/types';

interface UploadEntry {
  title: string;
  description: string;
  category: string;
  tags: string;
  visibility: PhotoVisibility;
}

export default function MyPhotosPage() {
  const { data: session } = useSession();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [categories, setCategories] = useState<{ category: string; count: number }[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid');
  const [loading, setLoading] = useState(true);

  const [uploaderOpen, setUploaderOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [categorizeOpen, setCategorizeOpen] = useState(false);
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    const saved = window.localStorage.getItem('photowall:layout');
    if (saved === 'grid' || saved === 'masonry') setLayoutMode(saved);
  }, []);

  const fetchPhotos = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeCategory) params.set('category', activeCategory);
      if (search) params.set('search', search);
      params.set('limit', '50');

      try {
        const res = await fetch(`/api/photos/my?${params}`, { signal });
        const data = await res.json();
        if (data.success) {
          setPhotos(data.data);
          if (!activeCategory && !search) {
            setCategories(
              (data.data as Photo[]).reduce(
                (acc: { category: string; count: number }[], photo) => {
                  const existing = acc.find((item) => item.category === photo.category);
                  if (existing) existing.count++;
                  else acc.push({ category: photo.category, count: 1 });
                  return acc;
                },
                []
              )
            );
          }
        }
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          console.error('加载照片失败', error);
        }
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [activeCategory, search]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchPhotos(controller.signal);
    return () => controller.abort();
  }, [fetchPhotos]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 3600);
    return () => clearTimeout(timer);
  }, [notice]);

  const publicCount = photos.filter((photo) => photo.visibility === 'public').length;
  const privateCount = photos.filter((photo) => photo.visibility === 'private').length;
  const filtering = Boolean(search || activeCategory);

  function handleLayout(mode: LayoutMode) {
    setLayoutMode(mode);
    window.localStorage.setItem('photowall:layout', mode);
  }

  function handleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function resetSelection() {
    setSelectedIds(new Set());
    setSelectMode(false);
  }

  function resetFilters() {
    setSearch('');
    setActiveCategory(null);
  }

  async function handleUpload(entries: UploadEntry[]) {
    for (let i = 0; i < uploadFiles.length; i++) {
      const formData = new FormData();
      formData.append('file', uploadFiles[i]);
      formData.append('title', entries[i].title);
      formData.append('description', entries[i].description);
      formData.append('category', entries[i].category);
      formData.append('tags', entries[i].tags);
      formData.append('visibility', entries[i].visibility);

      const res = await fetch('/api/photos', { method: 'POST', body: formData });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || '上传失败');
    }
    setUploaderOpen(false);
    setNotice({ tone: 'success', text: `已上传 ${entries.length} 张照片` });
    await fetchPhotos();
  }

  async function handleBatchDelete() {
    const res = await fetch('/api/photos/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', ids: Array.from(selectedIds) }),
    });
    const data = await res.json();
    setConfirmDeleteOpen(false);
    if (data.success) {
      setNotice({ tone: 'success', text: `已删除 ${selectedIds.size} 张照片` });
      resetSelection();
      await fetchPhotos();
    } else {
      setNotice({ tone: 'error', text: data.error || '删除失败' });
    }
  }

  async function handleBatchCategorize(category: string) {
    const res = await fetch('/api/photos/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'categorize', ids: Array.from(selectedIds), category }),
    });
    const data = await res.json();
    setCategorizeOpen(false);
    if (data.success) {
      setNotice({ tone: 'success', text: `已归类为「${category}」` });
      resetSelection();
      await fetchPhotos();
    } else {
      setNotice({ tone: 'error', text: data.error || '操作失败' });
    }
  }

  async function handleBatchVisibility(visibility: PhotoVisibility) {
    const res = await fetch('/api/photos/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'visibility', ids: Array.from(selectedIds), visibility }),
    });
    const data = await res.json();
    if (data.success) {
      setNotice({
        tone: 'success',
        text: `已设为${visibility === 'public' ? '公开' : '私有'}`,
      });
      resetSelection();
      await fetchPhotos();
    } else {
      setNotice({ tone: 'error', text: data.error || '操作失败' });
    }
  }

  async function handleSavePhoto(photoId: number, data: Record<string, unknown>) {
    const res = await fetch(`/api/photos/${photoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error || '保存失败');
    setNotice({ tone: 'success', text: '照片信息已更新' });
    await fetchPhotos();
  }

  async function handleDeletePhoto(photoId: number) {
    const res = await fetch(`/api/photos/${photoId}`, { method: 'DELETE' });
    const result = await res.json();
    if (!result.success) throw new Error(result.error || '删除失败');
    setNotice({ tone: 'success', text: '照片已删除' });
    await fetchPhotos();
  }

  function handlePhotoClick(photo: Photo) {
    const index = photos.findIndex((item) => item.id === photo.id);
    setLightboxIndex(Math.max(0, index));
    setLightboxOpen(true);
  }

  return (
    <div className="space-y-6 pb-24">
      <PageHeader
        eyebrow="My Collection"
        title="我的照片"
        description={
          loading
            ? '正在加载你的收藏…'
            : `共 ${photos.length} 张照片 · ${publicCount} 张公开 · ${privateCount} 张私有`
        }
        actions={
          <>
            <button
              type="button"
              onClick={() => {
                if (selectMode) resetSelection();
                else setSelectMode(true);
              }}
              className={`btn btn-glass ${selectMode ? '!bg-foreground !text-background' : ''}`}
            >
              <Icon name={selectMode ? 'check' : 'checkCircle'} size={15} />
              {selectMode ? '完成' : '选择'}
            </button>
            <button
              type="button"
              onClick={() => setUploaderOpen((value) => !value)}
              className="btn btn-primary"
            >
              <Icon name={uploaderOpen ? 'x' : 'plus'} size={15} />
              {uploaderOpen ? '收起上传' : '上传照片'}
            </button>
          </>
        }
      />

      {notice && (
        <Notice tone={notice.tone} onClose={() => setNotice(null)}>
          {notice.text}
        </Notice>
      )}

      {uploaderOpen && (
        <div className="anim-rise">
          <UploadZone
            onFiles={(files) => {
              setUploadFiles(files);
              setShowUploadModal(true);
            }}
          />
        </div>
      )}

      {/* 筛选栏 */}
      <div className="sticky top-[76px] z-30 lg:top-3">
        <div className="glass flex flex-wrap items-center gap-2 rounded-[22px] p-2 sm:flex-nowrap sm:gap-3 sm:rounded-full sm:p-1.5 sm:pl-2">
          <div className="order-1 min-w-0 flex-1 sm:max-w-[300px] sm:flex-none">
            <SearchInput value={search} onChange={setSearch} />
          </div>
          <div className="order-2 shrink-0 sm:order-3">
            <LayoutToggle mode={layoutMode} onChange={handleLayout} />
          </div>
          <div className="order-3 w-full min-w-0 border-[var(--hairline)] sm:order-2 sm:w-auto sm:flex-1 sm:border-l sm:pl-3">
            <CategoryChips
              categories={categories}
              active={activeCategory}
              onSelect={setActiveCategory}
            />
          </div>
        </div>
      </div>

      {/* 照片列表 */}
      {loading && photos.length === 0 ? (
        <PhotoGridSkeleton layoutMode={layoutMode} count={8} />
      ) : (
        <div className={`transition-opacity duration-300 ${loading ? 'opacity-60' : 'opacity-100'}`}>
          <PhotoGrid
            photos={photos}
            layoutMode={layoutMode}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onPhotoClick={handlePhotoClick}
            selectMode={selectMode}
            showVisibility
            empty={
              filtering ? (
                <EmptyState
                  icon="search"
                  title="没有找到匹配的照片"
                  description="试试换一个关键词，或清除当前筛选条件。"
                  action={
                    <button type="button" onClick={resetFilters} className="btn btn-glass btn-sm !h-9">
                      清除筛选
                    </button>
                  }
                />
              ) : (
                <EmptyState
                  icon="camera"
                  title="你的照片墙还没有内容"
                  description={
                    session?.user?.name
                      ? `${session.user.name}，从第一张照片开始吧。`
                      : '从第一张照片开始吧。'
                  }
                  action={
                    <button
                      type="button"
                      onClick={() => setUploaderOpen(true)}
                      className="btn btn-primary btn-sm !h-9"
                    >
                      <Icon name="upload" size={14} />
                      上传照片
                    </button>
                  }
                />
              )
            }
          />
        </div>
      )}

      <BatchToolbar
        active={selectMode}
        selectedCount={selectedIds.size}
        onCancel={resetSelection}
        onDelete={() => setConfirmDeleteOpen(true)}
        onCategorize={() => setCategorizeOpen(true)}
        onSetVisibility={handleBatchVisibility}
      />

      {showUploadModal && uploadFiles.length > 0 && (
        <UploadModal
          files={uploadFiles}
          onUpload={handleUpload}
          onClose={() => setShowUploadModal(false)}
        />
      )}

      <ConfirmDialog
        open={confirmDeleteOpen}
        title={`删除选中的 ${selectedIds.size} 张照片？`}
        description="删除后照片记录与存储文件都会被移除，此操作无法撤销。"
        confirmLabel="全部删除"
        onConfirm={handleBatchDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
      />

      <PromptDialog
        open={categorizeOpen}
        title="批量设置分类"
        description={`将选中的 ${selectedIds.size} 张照片移动到同一个分类。`}
        label="分类名称"
        placeholder="例如：旅行 / 城市"
        presets={['风景', '人物', '动物', '建筑', '美食', '其他']}
        confirmLabel="应用"
        onSubmit={handleBatchCategorize}
        onCancel={() => setCategorizeOpen(false)}
      />

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
