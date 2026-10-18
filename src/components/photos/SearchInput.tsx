'use client';

import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/ui/Icon';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = '搜索照片、描述…',
  className = '',
}: SearchInputProps) {
  const [local, setLocal] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  useEffect(() => {
    if (local === value) return;
    const timer = setTimeout(() => onChange(local), 320);
    return () => clearTimeout(timer);
  }, [local, value, onChange]);

  // ⌘K / Ctrl K 聚焦搜索，/ 快捷聚焦
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing =
        !!target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if ((event.key === 'k' || event.key === 'K') && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        return;
      }
      if (event.key === '/' && !typing) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const hasValue = local.length > 0;

  return (
    <div className={`search ${className}`}>
      <Icon
        name="search"
        size={16}
        className="pointer-events-none absolute left-3.5 text-subtle"
      />
      <input
        ref={inputRef}
        type="text"
        value={local}
        onChange={(event) => setLocal(event.target.value)}
        placeholder={placeholder}
        aria-label="搜索照片"
        spellCheck={false}
      />
      {hasValue ? (
        <button
          type="button"
          onClick={() => {
            setLocal('');
            onChange('');
            inputRef.current?.focus();
          }}
          className="absolute right-2 grid h-6 w-6 place-items-center rounded-full text-subtle transition hover:bg-[var(--hover)] hover:text-foreground"
          aria-label="清除搜索"
        >
          <Icon name="x" size={13} />
        </button>
      ) : (
        <kbd aria-hidden="true">Ctrl K</kbd>
      )}
    </div>
  );
}
