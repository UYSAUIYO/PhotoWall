'use client';

import { useState, useEffect } from 'react';
import { formatDate, formatFileSize } from '@/lib/utils';
import type { PhotoWithUser } from '@/types';

export default function AdminPhotosPage() {
  const [photos, setPhotos] = useState<PhotoWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [message, setMessage] = useState('');

  async function fetchPhotos() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter) params.set('search', filter);
    params.set('limit', '200');
    const res = await fetch(`/api/admin/photos?${params}`);
    const data = await res.json();
    if (data.success) setPhotos(data.data);
    setLoading(false);
  }

  useEffect(() => { fetchPhotos(); }, [filter]);

  async function handleDelete(photoId: number) {
    if (!confirm('确定删除这张照片？')) return;
    const res = await fetch(`/api/admin/photos/${photoId}`, { method: 'DELETE' });
    const data = await res.json();
    setMessage(data.success ? '已删除' : data.error || '删除失败');
    if (data.success) fetchPhotos();
  }

  const roleColors: Record<string, string> = {
    admin: 'bg-purple-500/20 text-purple-500',
    user: 'bg-blue-500/20 text-blue-500',
    visitor: 'bg-gray-500/20 text-gray-500',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">照片管理</h1>
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="搜索照片..."
          className="px-4 py-2 rounded-xl bg-black/5 dark:bg-white/10 border border-foreground/10 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition w-64"
        />
      </div>

      {message && (
        <div className="text-sm px-4 py-2 rounded-xl bg-green-500/10 text-green-500">{message}</div>
      )}

      <div className="glass overflow-hidden rounded-2xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-foreground/10">
              <th className="text-left px-4 py-3 font-medium text-foreground/50">缩略图</th>
              <th className="text-left px-4 py-3 font-medium text-foreground/50">标题</th>
              <th className="text-left px-4 py-3 font-medium text-foreground/50">上传者</th>
              <th className="text-left px-4 py-3 font-medium text-foreground/50">分类</th>
              <th className="text-left px-4 py-3 font-medium text-foreground/50">可见性</th>
              <th className="text-left px-4 py-3 font-medium text-foreground/50">大小</th>
              <th className="text-left px-4 py-3 font-medium text-foreground/50">日期</th>
              <th className="text-right px-4 py-3 font-medium text-foreground/50">操作</th>
            </tr>
          </thead>
          <tbody>
            {photos.map((photo: any) => (
              <tr key={photo.id} className="border-b border-foreground/5 hover:bg-foreground/[0.02]">
                <td className="px-4 py-2">
                  <img
                    src={`/uploads/${photo.user_id}/${photo.filename}`}
                    alt=""
                    className="w-10 h-10 rounded-md object-cover"
                  />
                </td>
                <td className="px-4 py-2 max-w-[200px] truncate" title={photo.title}>
                  {photo.title || '未命名'}
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${roleColors[photo.user_role] || roleColors.visitor}`}>
                      {photo.user_role === 'admin' ? '管理员' : photo.user_role === 'user' ? '用户' : '游客'}
                    </span>
                    {photo.username}
                  </div>
                </td>
                <td className="px-4 py-2 text-foreground/60">{photo.category}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    photo.visibility === 'public'
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-orange-500/10 text-orange-500'
                  }`}>
                    {photo.visibility === 'public' ? '公开' : '私有'}
                  </span>
                </td>
                <td className="px-4 py-2 text-foreground/40">{formatFileSize(photo.file_size)}</td>
                <td className="px-4 py-2 text-foreground/40">{formatDate(photo.created_at)}</td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => handleDelete(photo.id)}
                    className="text-xs text-red-400 hover:text-red-500 transition"
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
