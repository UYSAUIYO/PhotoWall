'use client';

import { useCallback, useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import SearchInput from '@/components/photos/SearchInput';
import Icon from '@/components/ui/Icon';
import Notice from '@/components/ui/Notice';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import { formatDateTime, formatFileSize } from '@/lib/utils';
import type { PhotoWithUser } from '@/types';

export default function AdminPhotosPage() {
  const [photos, setPhotos] = useState<PhotoWithUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PhotoWithUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPhotos = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        params.set('limit', '200');
        const res = await fetch(`/api/admin/photos?${params}`, { signal });
        const data = await res.json();
        if (data.success) {
          setPhotos(data.data);
          setTotal(data.total ?? data.data.length);
        }
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setNotice({ tone: 'error', text: '加载照片失败，请刷新重试。' });
        }
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [search]
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

  async function handleDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/photos/${pendingDelete.id}`, { method: 'DELETE' });
    const data = await res.json();
    setDeleting(false);
    setPendingDelete(null);
    setNotice(
      data.success
        ? { tone: 'success', text: '照片已删除' }
        : { tone: 'error', text: data.error || '删除失败' }
    );
    if (data.success) fetchPhotos();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Content"
        title="照片管理"
        description={`全站共 ${total} 张照片，检查内容或移除不合适的照片。`}
        actions={
          <button type="button" onClick={() => fetchPhotos()} className="btn btn-glass btn-sm !h-9">
            <Icon name="refresh" size={13} />
            刷新
          </button>
        }
      />

      {notice && (
        <Notice tone={notice.tone} onClose={() => setNotice(null)}>
          {notice.text}
        </Notice>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="w-full max-w-[300px]">
          <SearchInput value={search} onChange={setSearch} placeholder="搜索标题或文件名…" />
        </div>
        <span className="hidden shrink-0 text-[11.5px] text-subtle sm:block">
          {search ? `找到 ${total} 张` : `共 ${total} 张`}
        </span>
      </div>

      <div className="surface-card overflow-hidden rounded-[26px]" aria-busy={loading}>
        {loading && photos.length === 0 ? (
          <div className="space-y-px">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4 px-5 py-4">
                <span className="skeleton h-12 w-12 rounded-[12px]" />
                <div className="flex-1 space-y-2">
                  <span className="skeleton block h-3 w-40 rounded-full" />
                  <span className="skeleton block h-2.5 w-24 rounded-full" />
                </div>
                <span className="skeleton h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : photos.length === 0 ? (
          <div className="p-6">
            <EmptyState
              compact
              icon={search ? 'search' : 'image'}
              title={search ? '没有匹配的照片' : '还没有照片'}
              description={search ? '换一个关键词试试。' : '当用户上传照片后，会在这里出现。'}
            />
          </div>
        ) : (
          <div className={`overflow-x-auto transition-opacity ${loading ? 'opacity-60' : ''}`}>
            <table className="w-full min-w-[880px] text-left">
              <thead>
                <tr className="border-b border-[var(--hairline)] bg-[var(--field-bg)]">
                  {['照片', '上传者', '分类', '可见性', '大小', '上传时间', '操作'].map(
                    (label, index) => (
                      <th
                        key={label}
                        className={`px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-subtle ${
                          index === 6 ? 'text-right' : ''
                        }`}
                      >
                        {label}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--hairline)]">
                {photos.map((photo) => (
                  <tr key={photo.id} className="group transition-colors hover:bg-[var(--hover)]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-[12px] bg-[var(--field-bg)]">
                          <img
                            src={`/uploads/${photo.user_id}/${photo.filename}`}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="max-w-[240px] truncate text-[13px] font-medium">
                            {photo.title || '未命名'}
                          </p>
                          <p className="mt-0.5 max-w-[240px] truncate text-[10.5px] text-subtle">
                            {photo.filename}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[12.5px] text-muted">
                      <span className="block max-w-[140px] truncate">@{photo.username}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="tag !h-6 !border-[var(--hairline)] !bg-[var(--field-bg)] !text-[10.5px]">
                        {photo.category || '其他'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-medium ${
                          photo.visibility === 'public'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        <span
                          className={`h-1 w-1 rounded-full ${
                            photo.visibility === 'public' ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                        />
                        {photo.visibility === 'public' ? '公开' : '私有'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[12px] tabular text-muted">
                      {formatFileSize(photo.file_size)}
                    </td>
                    <td className="px-5 py-3 text-[11.5px] tabular text-muted">
                      {formatDateTime(photo.created_at)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setPendingDelete(photo)}
                        className="grid h-8 w-8 place-items-center rounded-full text-subtle transition hover:bg-[var(--danger-bg)] hover:text-[var(--danger)]"
                        title="删除照片"
                        aria-label={`删除 ${photo.title || '未命名'}`}
                      >
                        <Icon name="trash" size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        title={`删除照片「${pendingDelete?.title || '未命名'}」？`}
        description="照片记录与存储文件都会被移除，此操作无法撤销。"
        confirmLabel="删除照片"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
