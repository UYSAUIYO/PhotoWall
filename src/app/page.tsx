'use client';

import { useState, useEffect, useCallback } from 'react';
import GlassNav from '@/components/layout/GlassNav';
import CategoryChips from '@/components/photos/CategoryChips';
import SearchInput from '@/components/photos/SearchInput';
import LayoutToggle from '@/components/photos/LayoutToggle';
import PhotoGrid from '@/components/photos/PhotoGrid';
import Lightbox from '@/components/lightbox/Lightbox';
import type { Photo, LayoutMode } from '@/types';

export default function HomePage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [categories, setCategories] = useState<{ category: string; count: number }[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('masonry');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory) params.set('category', activeCategory);
    if (search) params.set('search', search);
    params.set('page', String(page));
    params.set('limit', '40');

    const res = await fetch(`/api/photos?${params}`);
    const data = await res.json();
    if (data.success) {
      setPhotos(data.data);
      setTotalPages(data.totalPages);
    }
    setLoading(false);
  }, [activeCategory, search, page]);

  const fetchCategories = useCallback(async () => {
    const res = await fetch('/api/categories');
    const data = await res.json();
    if (data.success) setCategories(data.data);
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { setPage(1); fetchPhotos(); }, [activeCategory, search, fetchPhotos]);
  useEffect(() => { fetchPhotos(); }, [page, fetchPhotos]);

  function handlePhotoClick(photo: Photo) {
    const index = photos.findIndex((p) => p.id === photo.id);
    setLightboxIndex(Math.max(0, index));
    setLightboxOpen(true);
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <GlassNav />

      <div className="sticky top-[var(--nav-height)] z-40 glass py-3 px-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 max-w-sm">
            <SearchInput value={search} onChange={setSearch} />
          </div>
          <LayoutToggle mode={layoutMode} onChange={setLayoutMode} />
        </div>
        <CategoryChips categories={categories} active={activeCategory} onSelect={setActiveCategory} />
      </div>

      <div className="px-1">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <PhotoGrid photos={photos} layoutMode={layoutMode} onPhotoClick={handlePhotoClick} />
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-6">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded-lg text-sm transition ${
                page === i + 1 ? 'bg-[var(--accent)] text-white' : 'glass hover:bg-foreground/5'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

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
