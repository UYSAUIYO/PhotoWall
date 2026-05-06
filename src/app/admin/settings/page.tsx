'use client';

import { useState, useEffect } from 'react';
import type { Setting } from '@/types';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [siteName, setSiteName] = useState('');
  const [siteDescription, setSiteDescription] = useState('');
  const [allowRegistration, setAllowRegistration] = useState('true');
  const [maxUploadSize, setMaxUploadSize] = useState('10485760');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchSettings() {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
        const map: Record<string, string> = {};
        data.data.forEach((s: Setting) => { map[s.key] = s.value || ''; });
        setSiteName(map.site_name || 'PhotoWall');
        setSiteDescription(map.site_description || '');
        setAllowRegistration(map.allow_registration || 'true');
        setMaxUploadSize(map.max_upload_size || '10485760');
      }
    }
    fetchSettings();
  }, []);

  async function handleSave() {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        site_name: siteName,
        site_description: siteDescription,
        allow_registration: allowRegistration,
        max_upload_size: maxUploadSize,
      }),
    });
    const data = await res.json();
    setMessage(data.success ? '设置已保存' : data.error || '保存失败');
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold">系统设置</h1>

      {message && (
        <div className={`text-sm px-4 py-2 rounded-xl ${message.includes('失败') ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
          {message}
        </div>
      )}

      <div className="glass p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">网站名称</label>
          <input
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">网站描述</label>
          <textarea
            value={siteDescription}
            onChange={(e) => setSiteDescription(e.target.value)}
            rows={2}
            className="w-full px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">允许注册</label>
          <select
            value={allowRegistration}
            onChange={(e) => setAllowRegistration(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
          >
            <option value="true">是</option>
            <option value="false">否</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">最大上传大小 (MB)</label>
          <input
            type="number"
            value={Math.floor(parseInt(maxUploadSize || '10485760') / 1048576)}
            onChange={(e) => setMaxUploadSize(String(parseInt(e.target.value) * 1048576))}
            className="w-full px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
          />
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition"
        >
          保存设置
        </button>
      </div>
    </div>
  );
}
