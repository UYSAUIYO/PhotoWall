'use client';

import { useState } from 'react';
import type { Photo } from '@/types';
import { formatDate, parseTags, tagsToString } from '@/lib/utils';

interface InfoPanelProps {
  photo: Photo;
  editable?: boolean;
  onSave?: (data: { title: string; description: string; category: string; tags: string; visibility: string }) => void;
  onDelete?: () => void;
}

const PRESET_CATEGORIES = ['风景', '人物', '动物', '建筑', '美食', '其他'];

export default function InfoPanel({ photo, editable = false, onSave, onDelete }: InfoPanelProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(photo.title);
  const [description, setDescription] = useState(photo.description || '');
  const [category, setCategory] = useState(photo.category);
  const [tags, setTags] = useState(photo.tags);
  const [visibility, setVisibility] = useState(photo.visibility);

  function handleSave() {
    onSave?.({ title, description, category, tags, visibility });
    setEditing(false);
  }

  function handleCancel() {
    setTitle(photo.title);
    setDescription(photo.description || '');
    setCategory(photo.category);
    setTags(photo.tags);
    setVisibility(photo.visibility);
    setEditing(false);
  }

  const tagList = parseTags(editing ? tags : photo.tags);

  return (
    <div className="glass-strong p-4 space-y-3">
      {editing ? (
        <>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition"
            placeholder="照片标题"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition resize-none"
            rows={2}
            placeholder="描述..."
          />
          <div className="flex gap-1.5 flex-wrap">
            {PRESET_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-2.5 py-1 rounded-full text-xs transition ${
                  category === cat
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
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition"
            placeholder="标签（逗号分隔）"
          />
          <div className="flex gap-2">
            {(['public', 'private'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setVisibility(v)}
                className={`px-3 py-1 rounded-full text-xs transition ${
                  visibility === v
                    ? v === 'public' ? 'bg-green-500/20 text-green-600' : 'bg-orange-500/20 text-orange-600'
                    : 'bg-black/5 dark:bg-white/10'
                }`}
              >
                {v === 'public' ? '公开' : '私有'}
              </button>
            ))}
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleCancel}
              className="px-4 py-1.5 rounded-lg text-sm glass hover:bg-foreground/5 transition"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg text-sm bg-[var(--accent)] text-white hover:opacity-90 transition"
            >
              保存
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">{photo.title || '未命名'}</h3>
            <div className="flex items-center gap-2">
              {photo.visibility === 'private' && (
                <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-xs">
                  私有
                </span>
              )}
              {editable && (
                <button
                  onClick={() => setEditing(true)}
                  className="p-1.5 rounded-lg hover:bg-foreground/5 transition"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {photo.description && (
            <p className="text-sm text-foreground/60">{photo.description}</p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--accent)] text-xs">
              {photo.category || '其他'}
            </span>
            {tagList.map((t) => (
              <span key={t} className="px-2 py-0.5 rounded-full glass text-xs text-foreground/60">
                {t}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-foreground/40">
            <span>{photo.username}</span>
            <span>{formatDate(photo.created_at)}</span>
          </div>

          {editable && onDelete && (
            <button
              onClick={onDelete}
              className="text-xs text-red-400 hover:text-red-500 transition"
            >
              删除照片
            </button>
          )}
        </>
      )}
    </div>
  );
}
