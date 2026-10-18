import type { Metadata } from 'next';
import DashboardNav from '@/components/dashboard/DashboardNav';

export const metadata: Metadata = {
  title: '个人空间',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <DashboardNav />
      <main className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-[1240px] px-4 pb-20 pt-24 sm:px-8 lg:pt-10">
          {children}
        </div>
      </main>
    </div>
  );
}
