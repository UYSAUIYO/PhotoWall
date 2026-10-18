import { avatarGradient, getInitial } from '@/lib/utils';

interface AvatarProps {
  name?: string | null;
  size?: number;
  className?: string;
}

export default function Avatar({ name, size = 32, className = '' }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-grid shrink-0 place-items-center rounded-full font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, Math.round(size * 0.4)),
        background: avatarGradient(name),
      }}
    >
      {getInitial(name)}
    </span>
  );
}
