'use client';

import { useState, useEffect } from 'react';
import StatsCard from '@/components/dashboard/StatsCard';
import { formatFileSize } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ users: 0, photos: 0, publicPhotos: 0, totalSize: 0 });

  useEffect(() => {
    async function fetchStats() {
      const [usersRes, photosRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/photos?limit=1000'),
      ]);
      const usersData = await usersRes.json();
      const photosData = await photosRes.json();

      const photos = photosData.data || [];
      setStats({
        users: usersData.total || 0,
        photos: photos.length,
        publicPhotos: photos.filter((p: any) => p.visibility === 'public').length,
        totalSize: photos.reduce((sum: number, p: any) => sum + p.file_size, 0),
      });
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">管理仪表盘</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon="photos" label="用户总数" value={stats.users} />
        <StatsCard icon="photos" label="照片总数" value={stats.photos} />
        <StatsCard icon="public" label="公开照片" value={stats.publicPhotos} />
        <StatsCard icon="size" label="总存储" value={formatFileSize(stats.totalSize)} />
      </div>
    </div>
  );
}
