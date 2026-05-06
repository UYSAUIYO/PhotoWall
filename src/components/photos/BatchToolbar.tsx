'use client';

interface BatchToolbarProps {
  selectedCount: number;
  onCancel: () => void;
  onDelete: () => void;
  onCategorize: () => void;
  onSetVisibility: (visibility: 'public' | 'private') => void;
}

export default function BatchToolbar({
  selectedCount,
  onCancel,
  onDelete,
  onCategorize,
  onSetVisibility,
}: BatchToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="glass-strong flex items-center gap-2 px-4 py-2 sticky top-[var(--nav-height)] z-40">
      <button
        onClick={onCancel}
        className="p-1.5 rounded-lg hover:bg-foreground/5 transition"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      <span className="text-sm font-medium">
        已选 <span className="text-[var(--accent)]">{selectedCount}</span> 张
      </span>

      <div className="flex-1" />

      <button
        onClick={onCategorize}
        className="px-3 py-1.5 rounded-lg text-sm glass hover:bg-foreground/5 transition"
      >
        改分类
      </button>

      <button
        onClick={() => onSetVisibility('public')}
        className="px-3 py-1.5 rounded-lg text-sm glass hover:bg-foreground/5 transition"
      >
        设为公开
      </button>

      <button
        onClick={() => onSetVisibility('private')}
        className="px-3 py-1.5 rounded-lg text-sm glass hover:bg-foreground/5 transition"
      >
        设为私有
      </button>

      <button
        onClick={onDelete}
        className="px-3 py-1.5 rounded-lg text-sm bg-red-500/10 text-red-500 hover:bg-red-500/20 transition"
      >
        删除
      </button>
    </div>
  );
}
