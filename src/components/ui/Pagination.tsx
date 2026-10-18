'use client';

import Icon from './Icon';

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

function buildPages(page: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, 'ellipsis', total];
  if (page >= total - 3) return [1, 'ellipsis', total - 4, total - 3, total - 2, total - 1, total];
  return [1, 'ellipsis', page - 1, page, page + 1, 'ellipsis', total];
}

export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = buildPages(page, totalPages);

  return (
    <nav className="flex items-center justify-center gap-1.5" aria-label="分页">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="btn btn-glass btn-sm !px-3 disabled:opacity-35"
        aria-label="上一页"
      >
        <Icon name="chevronLeft" size={15} />
      </button>

      <div className="hidden items-center gap-1 sm:flex">
        {pages.map((item, index) =>
          item === 'ellipsis' ? (
            <span key={`e-${index}`} className="px-1.5 text-xs text-subtle">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onChange(item)}
              aria-current={item === page ? 'page' : undefined}
              className={`h-8 min-w-8 rounded-full px-2.5 text-[12.5px] font-medium tabular transition ${
                item === page
                  ? 'bg-foreground text-background shadow-sm'
                  : 'text-muted hover:bg-[var(--hover)] hover:text-foreground'
              }`}
            >
              {item}
            </button>
          )
        )}
      </div>

      <span className="px-2 text-xs tabular text-muted sm:hidden">
        {page} / {totalPages}
      </span>

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="btn btn-glass btn-sm !px-3 disabled:opacity-35"
        aria-label="下一页"
      >
        <Icon name="chevronRight" size={15} />
      </button>
    </nav>
  );
}
