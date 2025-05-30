import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../../components/AdminLayout';

interface BorrowRecord {
  id: number;
  itemId: number;
  userId: number;
  borrowedAt: string;
  returnedAt: string;
  item: {
    name: string;
    serialNumber: string;
  };
  user: {
    username: string;
  };
}

export default function AdminBorrowRecordsPage() {
  const router = useRouter();
  const [records, setRecords] = useState<BorrowRecord[]>([]);

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'ADMIN') {
      router.push('/auth/login');
    }
    fetchBorrowRecords();
  }, [router]);

  const fetchBorrowRecords = async () => {
    try {
      const response = await fetch('/api/admin/borrow-records');
      if (response.ok) {
        const data = await response.json();
        setRecords(data.records);
      } else {
        console.error('Failed to fetch borrow records');
      }
    } catch (error) {
      console.error('Error fetching borrow records:', error);
    }
  };

  const handleReturnItem = async (recordId: number, itemId: number) => {
    if (!confirm('ยืนยันการคืนอุปกรณ์?')) return;
    try {
      const response = await fetch(`/api/admin/borrow-records/${recordId}/return`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }), // ส่ง itemId ไปด้วยเพื่อเปลี่ยนสถานะอุปกรณ์
      });
      if (response.ok) {
        fetchBorrowRecords(); // Refresh records
        alert('บันทึกการคืนสำเร็จ');
      } else {
        alert('ไม่สามารถบันทึกการคืนได้');
      }
    } catch (error) {
      console.error('Error returning item:', error);
      alert('เกิดข้อผิดพลาดในการคืนอุปกรณ์');
    }
  };


  return (
    <AdminLayout>
      <Head>
        <title>บันทึกการยืม-คืน - ระบบยืม-คืนอุปกรณ์</title>
      </Head>
      <h1 className="text-3xl font-bold mb-6">บันทึกการยืม-คืน</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  อุปกรณ์
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  ผู้ยืม
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  วันที่ยืม
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  วันที่คืน
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{record.item.name}</p>
                    <p className="text-gray-600 whitespace-no-wrap text-xs">SN: {record.item.serialNumber}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{record.user.username}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">
                      {new Date(record.borrowedAt).toLocaleString()}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">
                      {record.returnedAt ? new Date(record.returnedAt).toLocaleString() : (
                        <span className="text-yellow-600 font-semibold">ยังไม่คืน</span>
                      )}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                    {!record.returnedAt && (
                      <button
                        onClick={() => handleReturnItem(record.id, record.itemId)}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                      >
                        บันทึกคืน
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}