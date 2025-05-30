import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import UserLayout from '../../components/UserLayout';

interface Item {
  id: number;
  name: string;
  serialNumber: string;
  status: string;
  description: string | null;
}

export default function UserDashboardPage() {
  const router = useRouter();
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    const storedUserId = localStorage.getItem('userId');
    if (userRole !== 'USER' || !storedUserId) {
      router.push('/auth/login');
    } else {
      setUserId(storedUserId);
    }
    fetchAvailableItems();
  }, [router]);

  const fetchAvailableItems = async () => {
    try {
      const response = await fetch('/api/user/available-items'); // API for available items
      if (response.ok) {
        const data = await response.json();
        setAvailableItems(data.items);
      } else {
        console.error('Failed to fetch available items');
      }
    } catch (error) {
      console.error('Error fetching available items:', error);
    }
  };

  const handleBorrowItem = async (itemId: number) => {
    if (!userId) {
      alert('User not logged in or ID not found.');
      return;
    }
    if (!confirm('ยืนยันการยืมอุปกรณ์นี้?')) return;

    try {
      const response = await fetch('/api/user/borrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, userId: parseInt(userId) }),
      });

      if (response.ok) {
        alert('ยืมอุปกรณ์สำเร็จ!');
        fetchAvailableItems(); // Refresh the list of available items
      } else {
        const data = await response.json();
        alert(`ไม่สามารถยืมอุปกรณ์ได้: ${data.message || 'เกิดข้อผิดพลาด'}`);
      }
    } catch (error) {
      console.error('Error borrowing item:', error);
      alert('เกิดข้อผิดพลาดในการยืมอุปกรณ์');
    }
  };

  return (
    <UserLayout>
      <Head>
        <title>ยืมอุปกรณ์ - ระบบยืม-คืนอุปกรณ์</title>
      </Head>
      <h1 className="text-3xl font-bold mb-6">อุปกรณ์ที่พร้อมให้ยืม</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  ชื่ออุปกรณ์
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  หมายเลขซีเรียล
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  คำอธิบาย
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
              </tr>
            </thead>
            <tbody>
              {availableItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-5 border-b border-gray-200 bg-white text-center text-sm">
                    ไม่มีอุปกรณ์ที่พร้อมให้ยืมในขณะนี้
                  </td>
                </tr>
              ) : (
                availableItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      {item.name}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      {item.serialNumber}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      {item.description || '-'}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                      <button
                        onClick={() => handleBorrowItem(item.id)}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                      >
                        ยืม
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </UserLayout>
  );
}