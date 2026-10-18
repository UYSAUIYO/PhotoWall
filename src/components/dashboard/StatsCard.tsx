'use client';

import Icon, { type IconName } from '@/components/ui/Icon';

type StatIcon = 'photos' | 'public' | 'private' | 'size' | 'users' | 'admin';

const iconMap: Record<StatIcon, IconName> = {
  photos: 'images',
  public: 'globe',
  private: 'lock',
  size: 'hardDrive',
  users: 'users',
  admin: 'shield',
};

interface StatsCardProps {
  icon: StatIcon;
  label: string;
  value: string | number;
  hint?: string;
}

export default function StatsCard({ icon, label, value, hint }: StatsCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-[22px] border border-[var(--hairline)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] backdrop-blur-md transition-all duration-500 hover:-translate-y-0.5 hover:border-[var(--hairline-strong)] hover:shadow-[var(--shadow-md)]">
      <div className="flex items-start justify-between gap-3">
        <span className="pt-0.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-subtle">
          {label}
        </span>
        <span className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--hairline)] bg-[var(--field-bg)] text-muted transition-colors duration-300 group-hover:text-foreground">
          <Icon name={iconMap[icon]} size={17} strokeWidth={1.7} />
        </span>
      </div>
      <p className="mt-5 text-[30px] font-semibold leading-none tracking-[-0.035em] tabular">
        {value}
      </p>
      {hint && <p className="mt-2.5 text-[11.5px] leading-snug text-subtle">{hint}</p>}
    </div>
  );
}
