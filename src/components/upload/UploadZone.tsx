'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Icon from '@/components/ui/Icon';

interface UploadZoneProps {
  onFiles: (files: File[]) => void;
}

export default function UploadZone({ onFiles }: UploadZoneProps) {
  const [error, setError] = useState('');

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError('');
      if (acceptedFiles.length > 0) onFiles(acceptedFiles);
    },
    [onFiles]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/gif': ['.gif'],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: true,
  });

  const rejected = fileRejections.length > 0;

  return (
    <div>
      <div
        {...getRootProps()}
        className={`group relative flex cursor-pointer flex-col items-center gap-4 overflow-hidden rounded-[24px] border border-dashed px-5 py-6 text-center transition-all duration-300 sm:flex-row sm:text-left ${
          isDragActive
            ? 'border-[var(--accent)] bg-[var(--accent-light)]'
            : 'border-[var(--hairline-strong)] bg-[var(--surface)] hover:border-foreground/25 hover:bg-[var(--field-bg)]'
        }`}
      >
        <input {...getInputProps()} aria-label="选择照片文件" />
        <span
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border transition-colors ${
            isDragActive
              ? 'border-[var(--accent)]/30 bg-[var(--accent)] text-white'
              : 'border-[var(--hairline)] bg-[var(--field-bg)] text-muted group-hover:text-foreground'
          }`}
        >
          <Icon name="upload" size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-medium">
            {isDragActive ? '松开鼠标，开始上传' : '拖拽照片到这里'}
          </p>
          <p className="mt-1 text-[11.5px] leading-relaxed text-subtle">
            支持 JPG / PNG / WebP / GIF，单张最大 10MB
          </p>
        </div>
        <span className="btn btn-glass btn-sm pointer-events-none !h-9 shrink-0">
          <Icon name="image" size={14} />
          选择文件
        </span>
      </div>

      {(error || rejected) && (
        <p className="mt-2 px-1 text-[11.5px] text-[var(--danger)]">
          {error ||
            '部分文件未能添加：仅支持 JPG / PNG / WebP / GIF，且单张不能超过 10MB。'}
        </p>
      )}
    </div>
  );
}
