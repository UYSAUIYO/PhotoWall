'use client';

import SideNav, { type SideNavItem } from '@/components/ui/SideNav';

const links: SideNavItem[] = [
  { href: '/admin', label: '仪表盘', icon: 'home' },
  { href: '/admin/users', label: '用户管理', icon: 'users' },
  { href: '/admin/photos', label: '照片管理', icon: 'images' },
  { href: '/admin/settings', label: '系统设置', icon: 'settings' },
];

export default function AdminSidebar() {
  return <SideNav variant="admin" items={links} />;
}
