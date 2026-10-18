'use client';

interface CategoryChipsProps {
  categories: { category: string; count: number }[];
  active: string | null;
  onSelect: (category: string | null) => void;
}

export default function CategoryChips({ categories, active, onSelect }: CategoryChipsProps) {
  const total = categories.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="mask-fade-x no-scrollbar flex items-center gap-1 overflow-x-auto py-0.5">
      <button
        type="button"
        onClick={() => onSelect(null)}
        data-active={active === null}
        className="chip"
        aria-pressed={active === null}
      >
        全部
        <span className="chip-count">{total}</span>
      </button>

      {categories.map(({ category, count }) => {
        const isActive = active === category;
        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelect(category)}
            data-active={isActive}
            className="chip"
            aria-pressed={isActive}
          >
            {category}
            <span className="chip-count">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
