import Link from 'next/link';

interface LogoProps {
  href?: string;
  showWordmark?: boolean;
  size?: number;
  className?: string;
}

export default function Logo({
  href,
  showWordmark = true,
  size = 30,
  className = '',
}: LogoProps) {
  const mark = (
    <span
      aria-hidden="true"
      className="relative inline-grid shrink-0 place-items-center overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_8px_18px_-10px_rgba(47,107,255,0.7)]"
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.33),
        background: 'var(--brand-gradient)',
      }}
    >
      <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
        <rect x="7" y="7" width="7.4" height="7.4" rx="2.3" fill="#fff" fillOpacity="0.94" />
        <rect x="17.6" y="7" width="7.4" height="7.4" rx="2.3" fill="#fff" fillOpacity="0.55" />
        <rect x="7" y="17.6" width="7.4" height="7.4" rx="2.3" fill="#fff" fillOpacity="0.55" />
        <rect x="17.6" y="17.6" width="7.4" height="7.4" rx="2.3" fill="#fff" fillOpacity="0.94" />
      </svg>
    </span>
  );

  const wordmark = showWordmark ? (
    <span className="text-[17px] font-semibold leading-none tracking-[-0.035em]">
      Photo<span className="font-medium text-muted">Wall</span>
      <span className="ml-[3px] inline-block h-[3px] w-[3px] translate-y-[-1px] rounded-full bg-accent" />
    </span>
  ) : null;

  const content = (
    <>
      {mark}
      {wordmark}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`inline-flex items-center gap-2.5 rounded-xl transition-opacity hover:opacity-80 ${className}`}
        aria-label="PhotoWall 首页"
      >
        {content}
      </Link>
    );
  }

  return <span className={`inline-flex items-center gap-2.5 ${className}`}>{content}</span>;
}
