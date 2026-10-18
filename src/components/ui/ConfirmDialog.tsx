'use client';

import { useEffect } from 'react';
import Icon from './Icon';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'default';
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = '确认',
  cancelLabel = '取消',
  tone = 'danger',
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[6px] anim-fade dark:bg-black/60"
        onClick={onCancel}
      />
      <div className="glass-strong anim-pop relative w-full max-w-[380px] rounded-[26px] p-6 shadow-[var(--shadow-lg)]">
        <div
          className={`mb-4 grid h-11 w-11 place-items-center rounded-2xl ${
            tone === 'danger' ? 'bg-[var(--danger-bg)] text-[var(--danger)]' : 'bg-[var(--accent-light)] text-[var(--accent)]'
          }`}
        >
          <Icon name={tone === 'danger' ? 'trash' : 'info'} size={19} />
        </div>

        <h2 id="confirm-title" className="text-[17px] font-semibold tracking-[-0.01em]">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-[13px] leading-relaxed text-muted">{description}</p>
        )}

        <div className="mt-6 flex items-center justify-end gap-2">
          <button type="button" onClick={onCancel} className="btn btn-ghost btn-sm !h-9 !px-4">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            autoFocus
            className={`btn btn-sm !h-9 !px-4 text-white ${
              tone === 'danger' ? 'bg-[var(--danger)] hover:brightness-110' : 'btn-accent'
            }`}
          >
            {busy ? '处理中…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
