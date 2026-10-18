import Icon from './Icon';

type Tone = 'success' | 'error' | 'info';

const tones: Record<Tone, { className: string; icon: 'checkCircle' | 'alertCircle' | 'info' }> = {
  success: {
    className: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-300',
    icon: 'checkCircle',
  },
  error: {
    className: 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-300',
    icon: 'alertCircle',
  },
  info: {
    className: 'bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-300',
    icon: 'info',
  },
};

interface NoticeProps {
  tone?: Tone;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export default function Notice({ tone = 'info', children, onClose, className = '' }: NoticeProps) {
  const config = tones[tone];
  return (
    <div
      role="status"
      className={`flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-[13px] leading-relaxed ${config.className} ${className}`}
    >
      <Icon name={config.icon} size={16} className="mt-px shrink-0" />
      <div className="min-w-0 flex-1">{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="-mr-1 shrink-0 rounded-full p-1 opacity-60 transition hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10"
          aria-label="关闭提示"
        >
          <Icon name="x" size={13} />
        </button>
      )}
    </div>
  );
}
