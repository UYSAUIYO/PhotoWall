'use client';

import { useEffect, useMemo, useState } from 'react';
import Icon from '@/components/ui/Icon';
import Notice from '@/components/ui/Notice';
import type { PhotoVisibility } from '@/types';

const PRESET_CATEGORIES = ['风景', '人物', '动物', '建筑', '美食', '其他'];

interface UploadEntry {
  title: string;
  description: string;
  category: string;
  tags: string;
  visibility: PhotoVisibility;
}

interface UploadModalProps {
  files: File[];
  onUpload: (data: UploadEntry[]) => Promise<void>;
  onClose: () => void;
}

export default function UploadModal({ files, onUpload, onClose }: UploadModalProps) {
  const [entries, setEntries] = useState<UploadEntry[]>(
    files.map((file) => ({
      title: file.name.replace(/\.[^.]+$/, ''),
      description: '',
      category: '其他',
      tags: '',
      visibility: 'public',
    }))
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const previews = useMemo(
    () => files.map((file) => URL.createObjectURL(file)),
    [files]
  );

  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  async function handleUpload() {
    setUploading(true);
    setError('');
    try {
      await onUpload(entries);
      onClose();
    } catch {
      setError('上传失败，请检查网络后重试。');
      setUploading(false);
    }
  }

  function updateEntry(index: number, patch: Partial<UploadEntry>) {
    setEntries((prev) => prev.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));
  }

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <div className="fixed inset-0 z-[220] flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-[6px] anim-fade dark:bg-black/65"
        onClick={() => {
          if (!uploading) onClose();
        }}
      />

      <div className="glass-strong anim-pop relative flex max-h-[92vh] w-full max-w-[560px] flex-col overflow-hidden rounded-t-[28px] sm:rounded-[28px]">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[var(--hairline)] px-6 py-5">
          <div>
            <p className="eyebrow">Upload</p>
            <h2 className="mt-1.5 text-[17px] font-semibold tracking-[-0.01em]">
              上传 {files.length} 张照片
            </h2>
            <p className="mt-1 text-[11.5px] text-subtle">
              共 {(totalSize / 1024 / 1024).toFixed(1)} MB · 为每张照片补充信息
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className="icon-btn icon-btn-sm shrink-0 disabled:opacity-40"
            aria-label="关闭上传窗口"
          >
            <Icon name="x" size={17} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-5">
          {error && <Notice tone="error">{error}</Notice>}

          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="rounded-[20px] border border-[var(--hairline)] bg-[var(--field-bg)] p-4"
            >
              <div className="flex gap-3.5">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[13px] bg-[var(--surface-solid)]">
                  <img
                    src={previews[index]}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium">{file.name}</p>
                  <p className="mt-1 text-[11px] text-subtle">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                  <input
                    type="text"
                    value={entries[index].title}
                    onChange={(event) => updateEntry(index, { title: event.target.value })}
                    placeholder="照片标题"
                    className="field !mt-2.5 !h-9 !rounded-[11px] !text-[12.5px]"
                  />
                </div>
              </div>

              <div className="mt-3 space-y-2.5">
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_CATEGORIES.map((category) => {
                    const active = entries[index].category === category;
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => updateEntry(index, { category })}
                        className={`chip !h-7 !px-3 !text-[11.5px] ${
                          active ? '' : '!bg-transparent'
                        }`}
                        data-active={active}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>

                <input
                  type="text"
                  value={entries[index].tags}
                  onChange={(event) => updateEntry(index, { tags: event.target.value })}
                  placeholder="标签，用逗号分隔"
                  className="field !h-9 !rounded-[11px] !text-[12.5px]"
                />

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-subtle">可见性</span>
                  <div className="seg !bg-transparent !p-0 !border-0">
                    {(['public', 'private'] as const).map((visibility) => (
                      <button
                        key={visibility}
                        type="button"
                        onClick={() => updateEntry(index, { visibility })}
                        data-active={entries[index].visibility === visibility}
                        className="seg-btn !h-7 !px-2.5 !text-[11.5px]"
                      >
                        <Icon name={visibility === 'public' ? 'globe' : 'lock'} size={12} />
                        {visibility === 'public' ? '公开' : '私有'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="shrink-0 border-t border-[var(--hairline)] px-6 py-4">
          {uploading && (
            <div className="mb-3 h-1 overflow-hidden rounded-full bg-[var(--field-bg)]">
              <div className="h-full w-1/3 animate-[progress-indeterminate_1.4s_ease-in-out_infinite] rounded-full bg-foreground/70" />
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="btn btn-glass flex-1 disabled:opacity-50"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className="btn btn-primary flex-[1.6]"
            >
              {uploading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70" />
                  正在上传…
                </>
              ) : (
                <>
                  <Icon name="upload" size={15} />
                  上传 {files.length} 张照片
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
