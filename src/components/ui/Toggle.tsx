'use client';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  id?: string;
}

export default function Toggle({ checked, onChange, label, description, id }: ToggleProps) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="min-w-0">
        <label htmlFor={id} className="block text-sm font-medium">
          {label}
        </label>
        {description && <p className="mt-1 text-xs leading-relaxed text-muted">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-[26px] w-[46px] shrink-0 rounded-full transition-colors duration-300 ${
          checked ? 'bg-foreground' : 'bg-foreground/15'
        }`}
      >
        <span
          className={`absolute top-[3px] h-5 w-5 rounded-full bg-background shadow-[0_1px_3px_rgba(0,0,0,0.25)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            checked ? 'left-[23px]' : 'left-[3px]'
          }`}
        />
      </button>
    </div>
  );
}
