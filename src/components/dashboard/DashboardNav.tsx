'use client';

import SideNav, { type SideNavItem } from '@/components/ui/SideNav';

const links: SideNavItem[] = [
  { href: '/dashboard', label: '概览', icon: 'home' },
  { href: '/dashboard/photos', label: '我的照片', icon: 'images' },
  { href: '/dashboard/profile', label: '个人资料', icon: 'user' },
];

export default function DashboardNav() {
  return <SideNav variant="dashboard" items={links} />;
}
