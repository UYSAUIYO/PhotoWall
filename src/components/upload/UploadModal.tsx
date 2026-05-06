'use client';

import { useState } from 'react';

const PRESET_CATEGORIES = ['风景', '人物', '动物', '建筑', '美食', '其他'];

interface UploadModalProps {
  files: File[];
  onUpload: (data: {
    title: string;
    description: string;
    category: string;
    tags: string;
    visibility: 'public' | 'private';
  }[]) => Promise<void>;
  onClose: () => void;
}

export default function UploadModal({ files, onUpload, onClose }: UploadModalProps) {
  const [entries, setEntries] = useState(
    files.map((f) => ({
      title: f.name.replace(/\.[^.]+$/, ''),
      description: '',
      category: '其他',
      tags: '',
      visibility: 'public' as const,
    }))
  );
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function handleUpload() {
    setUploading(true);
    setProgress(0);
    await onUpload(entries);
    setProgress(100);
    setTimeout(() => onClose(), 300);
  }

  function updateEntry(index: number, field: string, value: string) {
    setEntries((prev) =>
      prev.map((e, i) => (i === index ? { ...e, [field]: value } : e))
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="glass-strong w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">上传 {files.length} 张照片</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-foreground/5 transition"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {files.map((file, i) => (
            <div key={i} className="glass p-4 space-y-3 rounded-xl">
              <div className="flex gap-3">
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-foreground/40">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
              </div>

              <input
                type="text"
                value={entries[i].title}
                onChange={(e) => updateEntry(i, 'title', e.target.value)}
                placeholder="照片标题"
                className="w-full px-3 py-2 rounded-lg bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition"
              />

              <div className="flex gap-2 flex-wrap">
                {PRESET_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => updateEntry(i, 'category', cat)}
                    className={`px-3 py-1 rounded-full text-xs transition ${
                      entries[i].category === cat
                        ? 'bg-[var(--accent)] text-white'
                        : 'bg-black/5 dark:bg-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={entries[i].tags}
                onChange={(e) => updateEntry(i, 'tags', e.target.value)}
                placeholder="标签（逗号分隔）"
                className="w-full px-3 py-2 rounded-lg bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition"
              />

              <div className="flex gap-2">
                {(['public', 'private'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => updateEntry(i, 'visibility', v)}
                    className={`px-3 py-1 rounded-full text-xs transition ${
                      entries[i].visibility === v
                        ? v === 'public' ? 'bg-green-500/20 text-green-600' : 'bg-orange-500/20 text-orange-600'
                        : 'bg-black/5 dark:bg-white/10'
                    }`}
                  >
                    {v === 'public' ? '公开' : '私有'}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {uploading && (
          <div className="w-full h-1.5 rounded-full bg-foreground/10 overflow-hidden">
            <div
              className="h-full bg-[var(--accent)] rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl glass hover:bg-foreground/5 transition text-sm"
          >
            取消
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="flex-1 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {uploading ? `上传中 ${progress}%` : '开始上传'}
          </button>
        </div>
      </div>
    </div>
  );
}
