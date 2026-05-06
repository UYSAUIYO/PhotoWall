'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import StatsCard from '@/components/dashboard/StatsCard';
import { formatFileSize } from '@/lib/utils';
import type { Photo } from '@/types';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPhotos() {
      const res = await fetch('/api/photos/my?limit=50');
      const data = await res.json();
      if (data.success) setPhotos(data.data);
      setLoading(false);
    }
    fetchPhotos();
  }, []);

  const publicCount = photos.filter((p) => p.visibility === 'public').length;
  const privateCount = photos.filter((p) => p.visibility === 'private').length;
  const totalSize = photos.reduce((sum, p) => sum + p.file_size, 0);
  const recent = photos.slice(0, 8);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">欢迎回来, {session?.user?.name}</h1>
        <p className="text-sm text-foreground/50 mt-1">这里是你的个人空间</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon="photos" label="照片总数" value={photos.length} />
        <StatsCard icon="public" label="公开照片" value={publicCount} />
        <StatsCard icon="private" label="私有照片" value={privateCount} />
        <StatsCard icon="size" label="存储空间" value={formatFileSize(totalSize)} />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">最近上传</h2>
        {loading ? (
          <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        ) : recent.length === 0 ? (
          <p className="text-sm text-foreground/40">还没有上传照片</p>
        ) : (
          <div className="grid grid-cols-4 gap-1">
            {recent.map((p) => (
              <div key={p.id} className="aspect-square rounded-md overflow-hidden bg-foreground/5">
                <img
                  src={`/uploads/${p.user_id}/${p.filename}`}
                  alt={p.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
