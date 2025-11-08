'use client';
import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-950 p-6 flex flex-col">
      <h1 className="text-2xl font-bold mb-8">Admin Panel</h1>
      <nav className="flex flex-col gap-4">
        <Link href="/admin/dashboard" className="hover:text-gray-300">
          Dashboard
        </Link>
        <Link href="#" className="hover:text-gray-300">
          Users
        </Link>
        <Link href="#" className="hover:text-gray-300">
          Settings
        </Link>
      </nav>
    </aside>
  );
}
