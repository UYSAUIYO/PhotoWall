'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import PageHeader from '@/components/ui/PageHeader';
import StatsCard from '@/components/dashboard/StatsCard';
import Lightbox from '@/components/lightbox/Lightbox';
import EmptyState from '@/components/ui/EmptyState';
import Icon from '@/components/ui/Icon';
import { formatFileSize } from '@/lib/utils';
import type { Photo } from '@/types';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState('');

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    setToday(
      new Intl.DateTimeFormat('zh-CN', {
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      }).format(new Date())
    );
  }, []);

  const fetchPhotos = useCallback(async () => {
    try {
      const res = await fetch('/api/photos/my?limit=50');
      const data = await res.json();
      if (data.success) setPhotos(data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const publicCount = photos.filter((photo) => photo.visibility === 'public').length;
  const privateCount = photos.filter((photo) => photo.visibility === 'private').length;
  const totalSize = photos.reduce((sum, photo) => sum + photo.file_size, 0);
  const recent = photos.slice(0, 6);

  const categoryMap = photos.reduce<Record<string, number>>((acc, photo) => {
    const key = photo.category || '其他';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const categoryStats = Object.entries(categoryMap)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
  const maxCategory = categoryStats[0]?.count || 1;

  async function handleSavePhoto(photoId: number, data: Record<string, unknown>) {
    const res = await fetch(`/api/photos/${photoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error || '保存失败');
    await fetchPhotos();
  }

  async function handleDeletePhoto(photoId: number) {
    await fetch(`/api/photos/${photoId}`, { method: 'DELETE' });
    await fetchPhotos();
  }

  function openPhoto(photo: Photo) {
    const index = photos.findIndex((item) => item.id === photo.id);
    setLightboxIndex(Math.max(0, index));
    setLightboxOpen(true);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={today || '个人空间'}
        title={
          <>
            欢迎回来{session?.user?.name ? `，${session.user.name}` : ''}
          </>
        }
        description="在这里查看你的收藏概览，整理分类，或继续上传新的光影。"
        actions={
          <Link href="/dashboard/photos" className="btn btn-primary">
            <Icon name="upload" size={16} />
            上传照片
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3.5 xl:grid-cols-4">
        <StatsCard
          icon="photos"
          label="照片总数"
          value={loading ? '—' : photos.length}
          hint="你上传的全部照片"
        />
        <StatsCard
          icon="public"
          label="公开照片"
          value={loading ? '—' : publicCount}
          hint="出现在公共画廊中"
        />
        <StatsCard
          icon="private"
          label="私有照片"
          value={loading ? '—' : privateCount}
          hint="仅你自己可见"
        />
        <StatsCard
          icon="size"
          label="存储占用"
          value={loading ? '—' : formatFileSize(totalSize)}
          hint="按原图大小统计"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <section className="surface-card rounded-[26px] p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-semibold tracking-[-0.01em]">最近上传</h2>
              <p className="mt-1 text-[11.5px] text-subtle">最近 6 张照片</p>
            </div>
            <Link
              href="/dashboard/photos"
              className="inline-flex items-center gap-1 text-[12px] text-muted transition hover:text-foreground"
            >
              查看全部
              <Icon name="arrowUpRight" size={13} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="skeleton aspect-[4/3] rounded-[16px]" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <EmptyState
              compact
              icon="camera"
              title="还没有上传照片"
              description="从第一张开始，慢慢把这面墙填满。"
              action={
                <Link href="/dashboard/photos" className="btn btn-primary btn-sm !h-9">
                  <Icon name="upload" size={14} />
                  去上传
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {recent.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => openPhoto(photo)}
                  className="group relative aspect-[4/3] overflow-hidden rounded-[16px] bg-[var(--field-bg)]"
                  title={photo.title || '未命名'}
                >
                  <img
                    src={`/uploads/${photo.user_id}/${photo.filename}`}
                    alt={photo.title || ''}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                  />
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 truncate p-2.5 text-left text-[11px] font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    {photo.title || '未命名'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="surface-card flex flex-col rounded-[26px] p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="text-[15px] font-semibold tracking-[-0.01em]">分类分布</h2>
            <p className="mt-1 text-[11.5px] text-subtle">按照片数量排序</p>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="skeleton h-3 w-24 rounded-full" />
                  <div className="skeleton h-1.5 w-full rounded-full" />
                </div>
              ))}
            </div>
          ) : categoryStats.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--field-bg)] text-subtle">
                <Icon name="folder" size={18} />
              </span>
              <p className="mt-3 text-[12.5px] text-muted">上传照片后，这里会显示分类分布</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {categoryStats.map((item, index) => (
                <li key={item.category}>
                  <div className="mb-1.5 flex items-center justify-between text-[12px]">
                    <span className="flex items-center gap-1.5 font-medium">
                      {item.category}
                      {index === 0 && (
                        <span className="rounded-full bg-[var(--accent-light)] px-1.5 py-[1px] text-[9px] font-medium text-[var(--accent)]">
                          最多
                        </span>
                      )}
                    </span>
                    <span className="text-subtle tabular">{item.count}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[var(--field-bg)]">
                    <div
                      className={`h-full rounded-full ${
                        index === 0 ? 'bg-foreground' : 'bg-foreground/25'
                      }`}
                      style={{ width: `${Math.max(6, (item.count / maxCategory) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-auto pt-6">
            <div className="flex items-center justify-between rounded-2xl border border-[var(--hairline)] bg-[var(--field-bg)] px-4 py-3">
              <div className="flex items-center gap-2 text-[11.5px] text-muted">
                <Icon name="sparkles" size={14} />
                分类会随照片一起更新
              </div>
              <Link
                href="/dashboard/photos"
                className="text-[11.5px] font-medium text-foreground underline-offset-4 hover:underline"
              >
                整理
              </Link>
            </div>
          </div>
        </section>
      </div>

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
