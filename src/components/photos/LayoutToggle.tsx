'use client';

import type { LayoutMode } from '@/types';
import Icon from '@/components/ui/Icon';

interface LayoutToggleProps {
  mode: LayoutMode;
  onChange: (mode: LayoutMode) => void;
}

export default function LayoutToggle({ mode, onChange }: LayoutToggleProps) {
  return (
    <div className="seg shrink-0" role="group" aria-label="布局方式">
      <button
        type="button"
        onClick={() => onChange('grid')}
        className="seg-btn"
        data-active={mode === 'grid'}
        aria-pressed={mode === 'grid'}
        title="对齐网格"
      >
        <Icon name="grid" size={14} />
        <span className="hidden sm:inline">网格</span>
      </button>
      <button
        type="button"
        onClick={() => onChange('masonry')}
        className="seg-btn"
        data-active={mode === 'masonry'}
        aria-pressed={mode === 'masonry'}
        title="瀑布流"
      >
        <Icon name="masonry" size={14} />
        <span className="hidden sm:inline">瀑布</span>
      </button>
    </div>
  );
}
