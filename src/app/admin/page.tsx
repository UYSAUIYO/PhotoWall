'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import StatsCard from '@/components/dashboard/StatsCard';
import Avatar from '@/components/ui/Avatar';
import Icon from '@/components/ui/Icon';
import Notice from '@/components/ui/Notice';
import { formatFileSize, formatShortDate } from '@/lib/utils';
import type { PhotoWithUser } from '@/types';

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
}

interface PhotoStats {
  total: number;
  publicTotal: number;
  totalSize: number;
}

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [photos, setPhotos] = useState<PhotoWithUser[]>([]);
  const [userTotal, setUserTotal] = useState(0);
  const [photoStats, setPhotoStats] = useState<PhotoStats>({ total: 0, publicTotal: 0, totalSize: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [usersRes, photosRes] = await Promise.all([
          fetch('/api/admin/users?limit=50'),
          fetch('/api/admin/photos?limit=200'),
        ]);
        const usersData = await usersRes.json();
        const photosData = await photosRes.json();

        if (!active) return;

        if (usersData.success) {
          setUsers(usersData.data || []);
          setUserTotal(usersData.total || 0);
        }
        if (photosData.success) {
          setPhotos(photosData.data || []);
          setPhotoStats(
            photosData.stats || {
              total: photosData.total || 0,
              publicTotal: (photosData.data || []).filter(
                (photo: PhotoWithUser) => photo.visibility === 'public'
              ).length,
              totalSize: (photosData.data || []).reduce(
                (sum: number, photo: PhotoWithUser) => sum + photo.file_size,
                0
              ),
            }
          );
        }
      } catch {
        if (active) setError('加载管理数据失败，请刷新重试。');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const recentPhotos = photos.slice(0, 6);
  const recentUsers = users.slice(0, 5);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin Console"
        title="管理概览"
        description="站点内容、成员与存储的整体状态，保持一切清晰有序。"
        actions={
          <Link href="/" className="btn btn-glass btn-sm !h-9">
            查看前台
            <Icon name="arrowUpRight" size={13} />
          </Link>
        }
      />

      {error && <Notice tone="error">{error}</Notice>}

      <div className="grid grid-cols-2 gap-3.5 xl:grid-cols-4">
        <StatsCard
          icon="users"
          label="用户总数"
          value={loading ? '—' : userTotal}
          hint="已注册的账户数量"
        />
        <StatsCard
          icon="photos"
          label="照片总数"
          value={loading ? '—' : photoStats.total}
          hint="全站上传的照片"
        />
        <StatsCard
          icon="public"
          label="公开照片"
          value={loading ? '—' : photoStats.publicTotal}
          hint="在公共画廊中可见"
        />
        <StatsCard
          icon="size"
          label="总存储"
          value={loading ? '—' : formatFileSize(photoStats.totalSize)}
          hint="原图文件合计大小"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="surface-card rounded-[26px] p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-semibold tracking-[-0.01em]">最近上传</h2>
              <p className="mt-1 text-[11.5px] text-subtle">最新加入画廊的 6 张照片</p>
            </div>
            <Link
              href="/admin/photos"
              className="inline-flex items-center gap-1 text-[12px] text-muted transition hover:text-foreground"
            >
              管理照片
              <Icon name="arrowUpRight" size={13} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="skeleton aspect-[4/3] rounded-[16px]" />
              ))}
            </div>
          ) : recentPhotos.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-[var(--hairline-strong)] py-12 text-center">
              <Icon name="image" size={22} className="text-subtle" />
              <p className="mt-3 text-[12.5px] text-muted">还没有上传照片</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {recentPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative aspect-[4/3] overflow-hidden rounded-[16px] bg-[var(--field-bg)]"
                  title={photo.title || '未命名'}
                >
                  <img
                    src={`/uploads/${photo.user_id}/${photo.filename}`}
                    alt={photo.title || ''}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                  />
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-2.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span className="truncate text-[11px] font-medium text-white">
                      {photo.title || '未命名'}
                    </span>
                    <span className="shrink-0 text-[10px] text-white/70">@{photo.username}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="surface-card flex flex-col rounded-[26px] p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-semibold tracking-[-0.01em]">最新用户</h2>
              <p className="mt-1 text-[11.5px] text-subtle">最近注册的 5 位成员</p>
            </div>
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-1 text-[12px] text-muted transition hover:text-foreground"
            >
              全部用户
              <Icon name="arrowUpRight" size={13} />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="skeleton h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <span className="skeleton block h-2.5 w-24 rounded-full" />
                    <span className="skeleton block h-2 w-32 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentUsers.length === 0 ? (
            <p className="py-8 text-center text-[12.5px] text-muted">暂无用户</p>
          ) : (
            <ul className="divide-y divide-[var(--hairline)]">
              {recentUsers.map((user) => (
                <li key={user.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <Avatar name={user.username} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-medium">{user.username}</p>
                    <p className="mt-0.5 truncate text-[10.5px] text-subtle">{user.email}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span
                      className={`rounded-full px-2 py-[2px] text-[9.5px] font-medium ${
                        user.role === 'admin'
                          ? 'bg-[var(--accent-light)] text-[var(--accent)]'
                          : 'bg-[var(--field-bg)] text-muted'
                      }`}
                    >
                      {user.role === 'admin' ? '管理员' : '用户'}
                    </span>
                    <span className="text-[9.5px] tabular text-subtle">
                      {formatShortDate(user.created_at)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
