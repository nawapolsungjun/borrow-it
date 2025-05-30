import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface UserLayoutProps {
  children: React.ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    router.push('/auth/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-800 text-white p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-8">User Panel</h2>
        <nav className="flex-grow">
          <ul>
            <li className="mb-4">
              <Link href="/user/dashboard" className={`block py-2 px-4 rounded ${router.pathname === '/user/dashboard' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}>
                ยืมอุปกรณ์
              </Link>
            </li>
            <li className="mb-4">
              <Link href="/user/my-borrows" className={`block py-2 px-4 rounded ${router.pathname === '/user/my-borrows' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}>
                ประวัติการยืมของฉัน
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