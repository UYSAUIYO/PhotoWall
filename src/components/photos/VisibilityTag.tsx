'use client';

interface VisibilityTagProps {
  visibility: 'public' | 'private';
  onChange: (value: 'public' | 'private') => void;
}

export default function VisibilityTag({ visibility, onChange }: VisibilityTagProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange('public')}
        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
          visibility === 'public'
            ? 'bg-green-500/20 text-green-600 dark:text-green-400'
            : 'glass text-foreground/40'
        }`}
      >
        公开
      </button>
      <button
        onClick={() => onChange('private')}
        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
          visibility === 'private'
            ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400'
            : 'glass text-foreground/40'
        }`}
      >
        私有
      </button>
    </div>
  );
}
