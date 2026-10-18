'use client';

import { useState } from 'react';
import Icon from '@/components/ui/Icon';
import Notice from '@/components/ui/Notice';
import {
  formatDateTime,
  formatDimensions,
  formatFileSize,
  parseTags,
} from '@/lib/utils';
import type { Photo, PhotoVisibility } from '@/types';

const PRESET_CATEGORIES = ['风景', '人物', '动物', '建筑', '美食', '其他'];

interface InfoPanelProps {
  photo: Photo;
  editable?: boolean;
  onSave?: (data: {
    title: string;
    description: string;
    category: string;
    tags: string;
    visibility: PhotoVisibility;
  }) => void | Promise<void>;
  onDelete?: () => void;
}

export default function InfoPanel({ photo, editable = false, onSave, onDelete }: InfoPanelProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [title, setTitle] = useState(photo.title);
  const [description, setDescription] = useState(photo.description || '');
  const [category, setCategory] = useState(photo.category);
  const [tags, setTags] = useState(photo.tags || '');
  const [visibility, setVisibility] = useState<PhotoVisibility>(photo.visibility);

  function resetForm() {
    setTitle(photo.title);
    setDescription(photo.description || '');
    setCategory(photo.category);
    setTags(photo.tags || '');
    setVisibility(photo.visibility);
    setError('');
  }

  function handleCancel() {
    resetForm();
    setEditing(false);
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      await onSave?.({ title, description, category, tags, visibility });
      setEditing(false);
    } catch {
      setError('保存失败，请稍后重试。');
    } finally {
      setSaving(false);
    }
  }

  const tagList = parseTags(editing ? tags : photo.tags);

  if (editing) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between px-6 pb-2 pt-6">
          <div>
            <p className="eyebrow !text-white/40">Edit</p>
            <h2 className="mt-1.5 text-[17px] font-semibold">编辑照片</h2>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="grid h-8 w-8 place-items-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
            aria-label="关闭编辑"
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
          {error && <Notice tone="error">{error}</Notice>}

          <div>
            <label htmlFor="info-title" className="field-label !text-white/50">
              标题
            </label>
            <input
              id="info-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="field"
              placeholder="给这张照片一个名字"
            />
          </div>

          <div>
            <label htmlFor="info-description" className="field-label !text-white/50">
              描述
            </label>
            <textarea
              id="info-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="field"
              rows={3}
              placeholder="记录下这一刻…"
            />
          </div>

          <div>
            <label htmlFor="info-category" className="field-label !text-white/50">
              分类
            </label>
            <input
              id="info-category"
              type="text"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="field"
              placeholder="分类名称"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {PRESET_CATEGORIES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`chip !h-7 !px-3 !text-[11.5px] ${
                    category === item
                      ? '!bg-white !text-black'
                      : '!bg-white/5 !text-white/60 hover:!bg-white/10 hover:!text-white'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="info-tags" className="field-label !text-white/50">
              标签
            </label>
            <input
              id="info-tags"
              type="text"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              className="field"
              placeholder="用逗号分隔，例如：城市, 夜景"
            />
          </div>

          <div>
            <span className="field-label !text-white/50">可见性</span>
            <div className="seg !bg-white/5 !border-white/10">
              {(['public', 'private'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setVisibility(value)}
                  data-active={visibility === value}
                  className="seg-btn !text-white/60 data-[active=true]:!bg-white data-[active=true]:!text-black"
                >
                  <Icon name={value === 'public' ? 'globe' : 'lock'} size={13} />
                  {value === 'public' ? '公开' : '私有'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-white/10 px-6 py-4">
          <button type="button" onClick={handleCancel} className="btn btn-glass btn-sm flex-1">
            取消
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary btn-sm flex-1"
          >
            {saving ? '保存中…' : '保存更改'}
          </button>
        </div>
      </div>
    );
  }

  const meta = [
    { label: '尺寸', value: formatDimensions(photo.width, photo.height) },
    { label: '大小', value: formatFileSize(photo.file_size) },
    { label: '上传者', value: photo.username || '—' },
    { label: '上传时间', value: formatDateTime(photo.created_at) },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-6 pb-6 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="eyebrow !text-white/40">Photo</p>
            <h2 className="mt-2 text-[20px] font-semibold leading-snug tracking-[-0.015em] text-white">
              {photo.title || '未命名'}
            </h2>
          </div>
          {editable && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white"
              aria-label="编辑照片信息"
              title="编辑"
            >
              <Icon name="pencil" size={15} />
            </button>
          )}
        </div>

        <p className="mt-3 text-[13px] leading-relaxed text-white/55">
          {photo.description || '这张照片还没有描述。'}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-1.5">
          {photo.category && (
            <span className="tag !border-white/10 !bg-white/5 !text-white/75">
              <Icon name="folder" size={11} />
              {photo.category}
            </span>
          )}
          {photo.visibility === 'private' && (
            <span className="tag !border-amber-400/20 !bg-amber-400/10 !text-amber-300">
              <Icon name="lock" size={11} />
              私有
            </span>
          )}
          {tagList.map((tag) => (
            <span key={tag} className="tag !border-white/10 !bg-white/5 !text-white/55">
              #{tag}
            </span>
          ))}
        </div>

        <div className="my-6 h-px bg-white/10" />

        <dl className="grid grid-cols-2 gap-x-4 gap-y-5">
          {meta.map((item) => (
            <div key={item.label}>
              <dt className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/35">
                {item.label}
              </dt>
              <dd className="mt-1.5 truncate text-[13px] text-white/80 tabular" title={item.value}>
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-auto border-t border-white/10 px-6 py-4">
        <p className="flex items-center gap-2 text-[9.5px] uppercase tracking-[0.16em] text-white/30">
          <Icon name="shield" size={12} />
          照片版权归上传者所有
        </p>
      </div>

      {editable && onDelete && (
        <div className="border-t border-white/10 px-6 py-4">
          <button
            type="button"
            onClick={onDelete}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 py-2.5 text-[12.5px] font-medium text-red-300 transition hover:bg-red-500/20"
          >
            <Icon name="trash" size={14} />
            删除这张照片
          </button>
        </div>
      )}
    </div>
  );
}
