import type { Metadata } from 'next';
import AdminSidebar from '@/components/admin/AdminSidebar';

export const metadata: Metadata = {
  title: '管理后台',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-[1280px] px-4 pb-20 pt-24 sm:px-8 lg:pt-10">
          {children}
        </div>
      </main>
    </div>
  );
}
