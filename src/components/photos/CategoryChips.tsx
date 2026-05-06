'use client';

interface CategoryChipsProps {
  categories: { category: string; count: number }[];
  active: string | null;
  onSelect: (category: string | null) => void;
}

export default function CategoryChips({ categories, active, onSelect }: CategoryChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      <button
        onClick={() => onSelect(null)}
        className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
          active === null
            ? 'bg-[var(--accent)] text-white'
            : 'glass text-foreground/70 hover:text-foreground'
        }`}
      >
        全部
      </button>

      {categories.map(({ category, count }) => (
        <button
          key={category}
          onClick={() => onSelect(category)}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            active === category
              ? 'bg-[var(--accent)] text-white'
              : 'glass text-foreground/70 hover:text-foreground'
          }`}
        >
          {category}
          <span className="ml-1.5 text-xs opacity-60">{count}</span>
        </button>
      ))}
    </div>
  );
}
