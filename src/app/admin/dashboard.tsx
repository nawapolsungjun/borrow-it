import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../../components/AdminLayout'; // สร้าง Layout Component สำหรับ Admin

interface Stats {
  totalItems: number;
  availableItems: number;
  borrowedItems: number;
  totalUsers: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    // Basic client-side role check (should be done on server for security)
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'ADMIN') {
      router.push('/auth/login'); // Redirect if not admin
    }

    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/dashboard-stats'); // API for dashboard stats
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          console.error('Failed to fetch dashboard stats');
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };
    fetchStats();
  }, [router]);

  if (!stats) {
    return <AdminLayout><p className="p-4">Loading dashboard...</p></AdminLayout>;
  }

  return (
    <AdminLayout>
      <Head>
        <title>Admin Dashboard - ระบบยืม-คืนอุปกรณ์</title>
      </Head>
      <h1 className="text-3xl font-bold mb-6">ภาพรวมระบบ (Admin)</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">อุปกรณ์ทั้งหมด</h3>
          <p className="text-4xl font-bold text-blue-600">{stats.totalItems}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">อุปกรณ์ว่าง</h3>
          <p className="text-4xl font-bold text-green-600">{stats.availableItems}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">อุปกรณ์ถูกยืม</h3>
          <p className="text-4xl font-bold text-yellow-600">{stats.borrowedItems}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">ผู้ใช้ทั้งหมด</h3>
          <p className="text-4xl font-bold text-purple-600">{stats.totalUsers}</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">การจัดการ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => router.push('/admin/items')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md text-lg"
          >
            จัดการอุปกรณ์
          </button>
          <button
            onClick={() => router.push('/admin/borrow-records')}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg shadow-md text-lg"
          >
            ดูบันทึกการยืม
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}