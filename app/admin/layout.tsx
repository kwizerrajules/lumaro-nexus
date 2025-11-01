'use client';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-6 bg-gray-800 flex-1">{children}</main>
      </div>
    </div>
  );
}
