'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import GlassNav from '@/components/layout/GlassNav';
import CategoryChips from '@/components/photos/CategoryChips';
import SearchInput from '@/components/photos/SearchInput';
import LayoutToggle from '@/components/photos/LayoutToggle';
import PhotoGrid, { PhotoGridSkeleton } from '@/components/photos/PhotoGrid';
import Lightbox from '@/components/lightbox/Lightbox';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import Icon from '@/components/ui/Icon';
import type { LayoutMode, Photo } from '@/types';

export default function HomePage() {
  const { data: session } = useSession();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [categories, setCategories] = useState<{ category: string; count: number }[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('masonry');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

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
      params.set('page', String(page));
      params.set('limit', '40');

      try {
        const res = await fetch(`/api/photos?${params}`, { signal });
        const data = await res.json();
        if (data.success) {
          setPhotos(data.data);
          setTotal(data.total ?? data.data.length);
          setTotalPages(Math.max(1, data.totalPages ?? 1));
        }
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          console.error('加载照片失败', error);
        }
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [activeCategory, search, page]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchPhotos(controller.signal);
    return () => controller.abort();
  }, [fetchPhotos]);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCategories(data.data);
      })
      .catch(() => {});
  }, []);

  function handleCategory(category: string | null) {
    setActiveCategory(category);
    setPage(1);
  }

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleLayout(mode: LayoutMode) {
    setLayoutMode(mode);
    window.localStorage.setItem('photowall:layout', mode);
  }

  function handlePhotoClick(photo: Photo) {
    const index = photos.findIndex((item) => item.id === photo.id);
    setLightboxIndex(Math.max(0, index));
    setLightboxOpen(true);
  }

  function resetFilters() {
    setActiveCategory(null);
    setSearch('');
    setPage(1);
  }

  const filtering = Boolean(search || activeCategory);
  const meta = loading && photos.length === 0
    ? '正在整理照片…'
    : filtering
      ? `筛选出 ${total} 张照片${activeCategory ? ` · ${activeCategory}` : ''}${search ? ` · “${search}”` : ''}`
      : `共 ${total} 张照片${categories.length ? ` · ${categories.length} 个分类` : ''}`;

  return (
    <div className="flex min-h-screen flex-col">
      <GlassNav />

      <main className="mx-auto flex w-full max-w-[1760px] flex-1 flex-col px-4 pb-10 sm:px-6 lg:px-8">
        {/* 标题区 */}
        <section className="flex flex-col gap-7 pb-8 pt-10 sm:pb-9 sm:pt-14 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 max-w-3xl">
            <p className="eyebrow flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-[var(--accent)]" />
              Photo Gallery
            </p>
            <h1 className="mt-3.5 text-[34px] font-semibold leading-[1.06] tracking-[-0.04em] sm:text-[46px] lg:text-[54px]">
              收藏光影
              <span className="text-subtle">，</span>
              <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/45 bg-clip-text text-transparent">
                留住瞬间
              </span>
            </h1>
            <p className="mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] text-muted sm:text-sm">
              <span>{meta}</span>
              <span className="hidden h-3 w-px bg-[var(--hairline)] sm:block" />
              <span className="hidden text-subtle sm:block">一个安静、克制的私人画廊</span>
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {session?.user ? (
              <Link href="/dashboard/photos" className="btn btn-primary">
                <Icon name="upload" size={16} />
                上传照片
              </Link>
            ) : (
              <p className="hidden items-center gap-2 text-[11.5px] text-subtle lg:flex">
                <Icon name="globe" size={14} />
                公开画廊 · 无需登录即可浏览
              </p>
            )}
          </div>
        </section>

        {/* 筛选工具条 */}
        <div
          className="sticky z-40 pt-3"
          style={{ top: 'calc(var(--nav-height) + 4px)' }}
        >
          <div className="glass flex flex-wrap items-center gap-2 rounded-[22px] p-2 sm:flex-nowrap sm:gap-3 sm:rounded-full sm:p-1.5 sm:pl-2">
            <div className="order-1 min-w-0 flex-1 sm:max-w-[320px] sm:flex-none">
              <SearchInput value={search} onChange={handleSearch} />
            </div>

            <div className="order-2 shrink-0 sm:order-3">
              <LayoutToggle mode={layoutMode} onChange={handleLayout} />
            </div>

            <div className="order-3 w-full min-w-0 border-[var(--hairline)] sm:order-2 sm:w-auto sm:flex-1 sm:border-l sm:pl-3">
              <CategoryChips categories={categories} active={activeCategory} onSelect={handleCategory} />
            </div>
          </div>
        </div>

        {/* 照片墙 */}
        <section className="flex-1 pt-6" aria-busy={loading}>
          {loading && photos.length === 0 ? (
            <PhotoGridSkeleton layoutMode={layoutMode} count={10} />
          ) : (
            <div className={`transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
              <PhotoGrid
                photos={photos}
                layoutMode={layoutMode}
                onPhotoClick={handlePhotoClick}
                empty={
                  filtering ? (
                    <EmptyState
                      icon="search"
                      title="没有找到匹配的照片"
                      description="换一个关键词或分类试试，也许光影藏在别处。"
                      action={
                        <button type="button" onClick={resetFilters} className="btn btn-glass btn-sm !h-9">
                          清除筛选
                        </button>
                      }
                    />
                  ) : (
                    <EmptyState
                      icon="camera"
                      title={
                        session?.user ? '照片墙还空着' : '还没有照片'
                      }
                      description={
                        session?.user
                          ? '上传第一张照片，让这面墙开始有光。'
                          : '登录后即可上传照片，建立属于你的光影收藏。'
                      }
                      action={
                        session?.user ? (
                          <Link href="/dashboard/photos" className="btn btn-primary btn-sm !h-9">
                            <Icon name="upload" size={15} />
                            上传第一张照片
                          </Link>
                        ) : (
                          <Link href="/auth/login" className="btn btn-primary btn-sm !h-9">
                            <Icon name="user" size={15} />
                            登录并开始收藏
                          </Link>
                        )
                      }
                    />
                  )
                }
              />
            </div>
          )}

          {totalPages > 1 && !loading && (
            <div className="pt-10">
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </div>
          )}

          {!loading && photos.length > 0 && (
            <div className="flex items-center justify-center gap-3.5 pt-16 text-[10px] uppercase tracking-[0.18em] text-subtle">
              <span className="h-px w-10 bg-[var(--hairline)]" />
              End of wall · 共 {total} 张
              <span className="h-px w-10 bg-[var(--hairline)]" />
            </div>
          )}
        </section>

        <footer className="mt-16 flex flex-col items-center gap-2 border-t border-[var(--hairline)] py-8 text-[11px] text-subtle sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} PhotoWall</span>
          <span className="tracking-[0.04em]">以克制的方式，收藏光影。</span>
        </footer>
      </main>

      {lightboxOpen && (
        <Lightbox
          photos={photos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onIndexChange={setLightboxIndex}
        />
      )}
    </div>
  );
}
