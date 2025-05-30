// pages/user/my-borrows.tsx
'use client'; // ถ้าเป็น App Router
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // หรือ 'next/router' ถ้าเป็น Pages Router
import Head from 'next/head';
import UserLayout from '../../components/UserLayout';

interface BorrowRecord {
  id: number;
  itemId: number;
  userId: number;
  borrowedAt: string;
  returnedAt: string | null;
  item: {
    name: string;
    serialNumber: string;
  };
}

export default function MyBorrowsPage() {
  const router = useRouter();
  const [myRecords, setMyRecords] = useState<BorrowRecord[]>([]);
  // const [userId, setUserId] = useState<string | null>(null); // <-- ลบบรรทัดนี้ออก

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    const storedUserId = localStorage.getItem('userId');
    if (userRole !== 'USER' || !storedUserId) {
      router.push('/auth/login');
    } else {
      // setUserId(storedUserId); // <-- ลบบรรทัดนี้ออก
      fetchMyBorrowRecords(storedUserId); // ใช้ storedUserId ตรงๆ
    }
  }, [router]);

  const fetchMyBorrowRecords = async (currentUserId: string) => {
    try {
      const response = await fetch(`/api/user/my-records?userId=${currentUserId}`);
      if (response.ok) {
        const data = await response.json();
        setMyRecords(data.records);
      } else {
        console.error('Failed to fetch my borrow records');
      }
    } catch (error) {
      console.error('Error fetching my borrow records:', error);
    }
  };

  return (
    <UserLayout>
      <Head>
        <title>ประวัติการยืมของฉัน - ระบบยืม-คืนอุปกรณ์</title>
      </Head>
      <h1 className="text-3xl font-bold mb-6">ประวัติการยืมของฉัน</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  อุปกรณ์
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  วันที่ยืม
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  วันที่คืน
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  สถานะ
                </th>
              </tr>
            </thead>
            <tbody>
              {myRecords.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-5 border-b border-gray-200 bg-white text-center text-sm">
                    คุณยังไม่มีประวัติการยืม
                  </td>
                </tr>
              ) : (
                myRecords.map((record) => (
                  <tr key={record.id}>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">{record.item.name}</p>
                      <p className="text-gray-600 whitespace-no-wrap text-xs">SN: {record.item.serialNumber}</p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">
                        {new Date(record.borrowedAt).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">
                        {record.returnedAt ? new Date(record.returnedAt).toLocaleString() : 'ยังไม่คืน'}
                      </p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${record.returnedAt ? 'text-green-900' : 'text-yellow-900'}`}>
                        <span aria-hidden="true" className={`absolute inset-0 opacity-50 rounded-full ${record.returnedAt ? 'bg-green-200' : 'bg-yellow-200'}`}></span>
                        <span className="relative">{record.returnedAt ? 'คืนแล้ว' : 'กำลังยืม'}</span>
                      </span>
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