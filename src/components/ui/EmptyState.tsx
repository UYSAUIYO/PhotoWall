import Icon from './Icon';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: 'camera' | 'search' | 'image' | 'users' | 'folder';
  compact?: boolean;
  className?: string;
}

export default function EmptyState({
  title,
  description,
  action,
  icon = 'camera',
  compact = false,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-[28px] border border-dashed border-[var(--hairline-strong)] bg-[var(--surface)] px-6 text-center ${
        compact ? 'py-10' : 'py-20 sm:py-24'
      } ${className}`}
    >
      <div className={`relative ${compact ? 'mb-4 h-12 w-16' : 'mb-6 h-20 w-28'}`} aria-hidden="true">
        <span
          className={`absolute left-0 top-3 block -rotate-6 rounded-xl border border-[var(--edge)] bg-gradient-to-br from-[var(--accent-light)] to-transparent ${
            compact ? 'h-9 w-11' : 'h-14 w-20'
          }`}
        />
        <span
          className={`absolute right-0 top-0 block rotate-3 rounded-xl border border-[var(--edge)] bg-gradient-to-br from-pink-500/15 to-transparent shadow-sm ${
            compact ? 'h-11 w-12' : 'h-16 w-24'
          }`}
        />
        <span
          className={`absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[var(--edge)] bg-[var(--surface-strong)] text-muted shadow-sm ${
            compact ? 'h-8 w-8' : 'h-11 w-11'
          }`}
        >
          <Icon name={icon} size={compact ? 15 : 19} strokeWidth={1.6} />
        </span>
      </div>

      <h3 className={`font-semibold tracking-[-0.01em] ${compact ? 'text-[15px]' : 'text-lg'}`}>
        {title}
      </h3>
      {description && (
        <p className="mt-2 max-w-[22rem] text-[13px] leading-relaxed text-muted">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
