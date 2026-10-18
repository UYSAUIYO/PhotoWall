'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import Toggle from '@/components/ui/Toggle';
import Notice from '@/components/ui/Notice';
import Icon from '@/components/ui/Icon';
import type { Setting } from '@/types';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [siteName, setSiteName] = useState('');
  const [siteDescription, setSiteDescription] = useState('');
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [maxUploadMb, setMaxUploadMb] = useState('10');
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (!active || !data.success) return;

        const map: Record<string, string> = {};
        (data.data as Setting[]).forEach((setting) => {
          map[setting.key] = setting.value || '';
        });

        setSiteName(map.site_name || 'PhotoWall');
        setSiteDescription(map.site_description || '');
        setAllowRegistration(map.allow_registration !== 'false');
        setMaxUploadMb(String(Math.round((parseInt(map.max_upload_size || '10485760') || 10485760) / 1048576)));
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchSettings();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 3600);
    return () => clearTimeout(timer);
  }, [notice]);

  async function handleSave() {
    const mb = Math.min(100, Math.max(1, parseInt(maxUploadMb || '10') || 10));
    setMaxUploadMb(String(mb));
    setSaving(true);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site_name: siteName.trim() || 'PhotoWall',
          site_description: siteDescription,
          allow_registration: String(allowRegistration),
          max_upload_size: String(mb * 1048576),
        }),
      });
      const data = await res.json();
      setNotice(
        data.success
          ? { tone: 'success', text: '设置已保存' }
          : { tone: 'error', text: data.error || '保存失败' }
      );
    } catch {
      setNotice({ tone: 'error', text: '保存失败，请稍后重试。' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        eyebrow="System"
        title="系统设置"
        description="站点名称、注册开关与上传限制。修改后会立即对新请求生效。"
        actions={
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="btn btn-primary"
          >
            {saving ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70" />
                保存中…
              </>
            ) : (
              <>
                <Icon name="check" size={15} />
                保存更改
              </>
            )}
          </button>
        }
      />

      {notice && (
        <Notice tone={notice.tone} onClose={() => setNotice(null)}>
          {notice.text}
        </Notice>
      )}

      {loading ? (
        <div className="space-y-4">
          <div className="skeleton h-56 rounded-[26px]" />
          <div className="skeleton h-48 rounded-[26px]" />
        </div>
      ) : (
        <>
          <section className="surface-card rounded-[26px] p-6">
            <div className="mb-5">
              <h2 className="text-[15px] font-semibold tracking-[-0.01em]">站点信息</h2>
              <p className="mt-1 text-[11.5px] text-subtle">展示在浏览器标题与页面描述中。</p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="setting-site-name" className="field-label">
                  网站名称
                </label>
                <input
                  id="setting-site-name"
                  type="text"
                  value={siteName}
                  onChange={(event) => setSiteName(event.target.value)}
                  className="field"
                  placeholder="PhotoWall"
                />
              </div>

              <div>
                <label htmlFor="setting-site-description" className="field-label">
                  网站描述
                </label>
                <textarea
                  id="setting-site-description"
                  value={siteDescription}
                  onChange={(event) => setSiteDescription(event.target.value)}
                  rows={3}
                  className="field"
                  placeholder="一句话介绍这个画廊…"
                />
                <p className="field-hint">会用于搜索引擎与分享卡片中的简介。</p>
              </div>
            </div>
          </section>

          <section className="surface-card rounded-[26px] p-6">
            <div className="mb-5">
              <h2 className="text-[15px] font-semibold tracking-[-0.01em]">注册与上传</h2>
              <p className="mt-1 text-[11.5px] text-subtle">控制新成员的进入方式与照片体积上限。</p>
            </div>

            <div className="space-y-6">
              <Toggle
                id="allow-registration"
                label="允许新用户注册"
                description="关闭后，注册入口将不可用，仅现有账号可以登录。"
                checked={allowRegistration}
                onChange={setAllowRegistration}
              />

              <div className="h-px bg-[var(--hairline)]" />

              <div>
                <label htmlFor="max-upload" className="field-label">
                  单张照片大小上限
                </label>
                <div className="relative max-w-[220px]">
                  <input
                    id="max-upload"
                    type="number"
                    min={1}
                    max={100}
                    value={maxUploadMb}
                    onChange={(event) => setMaxUploadMb(event.target.value)}
                    className="field !pr-14 tabular"
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-subtle">
                    MB
                  </span>
                </div>
                <p className="field-hint">
                  当前上限 {maxUploadMb || '10'} MB，建议保持在 1–100 MB 之间。
                </p>
              </div>
            </div>
          </section>

          <div className="flex items-center gap-2 px-1 text-[11px] text-subtle">
            <Icon name="info" size={13} />
            设置保存在数据库中，页面刷新后依然有效。
          </div>
        </>
      )}
    </div>
  );
}
