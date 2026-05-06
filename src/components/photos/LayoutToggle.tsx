'use client';

import type { LayoutMode } from '@/types';

interface LayoutToggleProps {
  mode: LayoutMode;
  onChange: (mode: LayoutMode) => void;
}

export default function LayoutToggle({ mode, onChange }: LayoutToggleProps) {
  return (
    <div className="flex glass p-0.5 rounded-xl">
      {/* 对齐网格 */}
      <button
        onClick={() => onChange('grid')}
        className={`p-2 rounded-lg transition-all ${
          mode === 'grid' ? 'bg-white/80 dark:bg-white/20 shadow-sm' : 'text-foreground/50 hover:text-foreground'
        }`}
        title="对齐网格"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
          <rect x="1" y="1" width="7" height="7" rx="1" />
          <rect x="10" y="1" width="7" height="7" rx="1" />
          <rect x="1" y="10" width="7" height="7" rx="1" />
          <rect x="10" y="10" width="7" height="7" rx="1" />
        </svg>
      </button>

      {/* 瀑布流 */}
      <button
        onClick={() => onChange('masonry')}
        className={`p-2 rounded-lg transition-all ${
          mode === 'masonry' ? 'bg-white/80 dark:bg-white/20 shadow-sm' : 'text-foreground/50 hover:text-foreground'
        }`}
        title="瀑布流"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
          <rect x="1" y="1" width="5" height="6" rx="1" />
          <rect x="8" y="1" width="5" height="9" rx="1" />
          <rect x="15" y="1" width="5" height="4" rx="1" />
          <rect x="1" y="9" width="5" height="8" rx="1" />
          <rect x="8" y="12" width="5" height="5" rx="1" />
          <rect x="15" y="7" width="5" height="7" rx="1" />
        </svg>
      </button>
    </div>
  );
}
