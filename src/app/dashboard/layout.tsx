import type { Metadata } from 'next';
import DashboardNav from '@/components/dashboard/DashboardNav';

export const metadata: Metadata = {
  title: '个人空间 — PhotoWall',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <DashboardNav />
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
