'use client';

import { useEffect, useState } from 'react';
import Icon from './Icon';

interface PromptDialogProps {
  open: boolean;
  title: string;
  description?: string;
  label?: string;
  placeholder?: string;
  initialValue?: string;
  presets?: string[];
  confirmLabel?: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}

export default function PromptDialog({
  open,
  title,
  description,
  label = '名称',
  placeholder = '请输入…',
  initialValue = '',
  presets = [],
  confirmLabel = '确定',
  onSubmit,
  onCancel,
}: PromptDialogProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (open) setValue(initialValue);
  }, [open, initialValue]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  const trimmed = value.trim();

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[6px] anim-fade dark:bg-black/60"
        onClick={onCancel}
      />
      <div className="glass-strong anim-pop relative w-full max-w-[380px] rounded-[26px] p-6 shadow-[var(--shadow-lg)]">
        <div className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-[var(--accent-light)] text-[var(--accent)]">
          <Icon name="folder" size={19} />
        </div>
        <h2 className="text-[17px] font-semibold tracking-[-0.01em]">{title}</h2>
        {description && <p className="mt-2 text-[13px] leading-relaxed text-muted">{description}</p>}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (trimmed) onSubmit(trimmed);
          }}
          className="mt-4 space-y-3"
        >
          <div>
            <label htmlFor="prompt-value" className="field-label">
              {label}
            </label>
            <input
              id="prompt-value"
              autoFocus
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className="field"
              placeholder={placeholder}
            />
          </div>

          {presets.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setValue(preset)}
                  className={`chip !h-7 !px-3 !text-[11.5px] ${
                    value === preset ? '' : '!bg-[var(--field-bg)]'
                  }`}
                  data-active={value === preset}
                >
                  {preset}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onCancel} className="btn btn-ghost btn-sm !h-9 !px-4">
              取消
            </button>
            <button type="submit" disabled={!trimmed} className="btn btn-primary btn-sm !h-9 !px-4">
              {confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
