'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    router.push('/auth/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
        <nav className="flex-grow">
          <ul>
            <li className="mb-4">
              <Link href="/admin/dashboard" className={`block py-2 px-4 rounded ${router.pathname === '/admin/dashboard' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
                แดชบอร์ด
              </Link>
            </li>
            <li className="mb-4">
              <Link href="/admin/items" className={`block py-2 px-4 rounded ${router.pathname === '/admin/items' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
                จัดการอุปกรณ์
              </Link>
            </li>
            <li className="mb-4">
              <Link href="/admin/borrow-records" className={`block py-2 px-4 rounded ${router.pathname === '/admin/borrow-records' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
                บันทึกการยืม
              </Link>
            </li>
          </ul>
        </nav>
        <button
          onClick={handleLogout}
          className="mt-auto bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          ออกจากระบบ
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}