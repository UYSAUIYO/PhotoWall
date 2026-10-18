'use client';

import Icon from '@/components/ui/Icon';

interface BatchToolbarProps {
  selectedCount: number;
  active: boolean;
  onCancel: () => void;
  onDelete: () => void;
  onCategorize: () => void;
  onSetVisibility: (visibility: 'public' | 'private') => void;
}

export default function BatchToolbar({
  selectedCount,
  active,
  onCancel,
  onDelete,
  onCategorize,
  onSetVisibility,
}: BatchToolbarProps) {
  if (!active) return null;

  return (
    <div className="fixed inset-x-0 bottom-5 z-[120] flex justify-center px-4 sm:bottom-7">
      <div className="glass-strong anim-pop flex max-w-full items-center gap-1 rounded-full p-1.5 pl-2 shadow-[var(--shadow-lg)]">
        <button
          type="button"
          onClick={onCancel}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted transition hover:bg-[var(--hover)] hover:text-foreground"
          aria-label="退出选择"
        >
          <Icon name="x" size={15} />
        </button>

        <span className="shrink-0 whitespace-nowrap px-1 text-[12.5px] font-medium">
          {selectedCount > 0 ? (
            <>
              已选 <span className="tabular text-[var(--accent)]">{selectedCount}</span> 张
            </>
          ) : (
            <span className="text-muted">选择照片</span>
          )}
        </span>

        <span className="mx-1 h-5 w-px shrink-0 bg-[var(--hairline)]" />

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={onCategorize}
            disabled={selectedCount === 0}
            className="flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[12px] text-muted transition hover:bg-[var(--hover)] hover:text-foreground disabled:opacity-35 sm:px-3"
            title="批量设置分类"
          >
            <Icon name="folder" size={14} />
            <span className="hidden sm:inline">分类</span>
          </button>
          <button
            type="button"
            onClick={() => onSetVisibility('public')}
            disabled={selectedCount === 0}
            className="flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[12px] text-muted transition hover:bg-[var(--hover)] hover:text-foreground disabled:opacity-35 sm:px-3"
            title="设为公开"
          >
            <Icon name="globe" size={14} />
            <span className="hidden sm:inline">公开</span>
          </button>
          <button
            type="button"
            onClick={() => onSetVisibility('private')}
            disabled={selectedCount === 0}
            className="flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[12px] text-muted transition hover:bg-[var(--hover)] hover:text-foreground disabled:opacity-35 sm:px-3"
            title="设为私有"
          >
            <Icon name="lock" size={14} />
            <span className="hidden sm:inline">私有</span>
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={selectedCount === 0}
            className="flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[12px] text-[var(--danger)] transition hover:bg-[var(--danger-bg)] disabled:opacity-35 sm:px-3"
            title="删除所选"
          >
            <Icon name="trash" size={14} />
            <span className="hidden sm:inline">删除</span>
          </button>
        </div>
      </div>
    </div>
  );
}
