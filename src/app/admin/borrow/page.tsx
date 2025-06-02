// src/app/admin/borrow/page.tsx
"use client"; // ต้องเป็น Client Component เพื่อใช้ useEffect, useState, และเรียก API

import MenuBar from "@/components/admin/MenuBar"; // ใช้ MenuBar ของ Admin
import { useEffect, useState } from "react";
import { Table, message, Tag } from "antd"; // นำเข้า Tag สำหรับแสดงสถานะ

// กำหนด Type สำหรับ Item, User และ BorrowRecord ตาม schema.prisma
interface Item {
  id: number;
  name: string;
  serialNumber: string;
  status: string;
  description: string | null;
}

interface User {
  username: string; // เราเลือกแค่ username ใน API
}

interface BorrowRecord {
  id: number;
  itemId: number;
  userId: number;
  borrowedAt: string; // ISO string from Date
  returnedAt: string | null; // ISO string or null
  item: Item; // ข้อมูล Item ที่รวมมา
  user: User; // ข้อมูล User ที่รวมมา
  username: string; // เพิ่มมาจากการ format ใน API เพื่อให้ Table เข้าถึงง่าย
}

const AdminBorrowPage = () => {
  const [borrowRecords, setBorrowRecords] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Note: For production, consider moving auth check to middleware or layout for server component.
  // This client-side check is for demonstration if page directly navigates.
  // The API itself also enforces authentication.
  useEffect(() => {
    const checkAuthAndFetchRecords = async () => {
      // No client-side auth check here, relying on API to handle auth (more secure)
      // and redirect if needed.
      // If this page was a Server Component, auth would be done like in src/app/admin/page.tsx
      try {
        const response = await fetch('/api/admin/borrowRecords');
        if (!response.ok) {
          // ถ้าไม่ OK อาจจะเพราะไม่ได้เป็น ADMIN หรือไม่มี Token
          const errorData = await response.json();
          if (response.status === 401 || response.status === 403) {
            message.error(errorData.message || 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้ กรุณาเข้าสู่ระบบในฐานะ Admin');
            // setTimeout(() => redirect('/login'), 1500); // Redirect หลังจากแสดงข้อความ
            return; // หยุดการทำงาน
          }
          throw new Error(errorData.message || 'Failed to fetch borrow records');
        }
        const data: BorrowRecord[] = await response.json();
        setBorrowRecords(data);
      } catch (error: unknown) {
        console.error("Error fetching borrow records:", error);
        message.error("ไม่สามารถดึงข้อมูลประวัติการยืมได้");
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchRecords();
  }, []);

  // กำหนด Columns สำหรับ Table
  const columns = [
    {
      title: 'ผู้ยืม',
      dataIndex: 'username', // ใช้ username ที่เราเพิ่มเข้ามาใน object
      key: 'username',
    },
    {
      title: 'ชื่ออุปกรณ์',
      dataIndex: ['item', 'name'], // เข้าถึงชื่ออุปกรณ์จาก object item
      key: 'itemName',
    },
    {
      title: 'หมายเลขซีเรียล',
      dataIndex: ['item', 'serialNumber'], // เข้าถึง serialNumber จาก object item
      key: 'serialNumber',
    },
    {
      title: 'วันที่ยืม',
      dataIndex: 'borrowedAt',
      key: 'borrowedAt',
      render: (text: string) => new Date(text).toLocaleDateString('th-TH', {
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }),
    },
    {
      title: 'วันที่คืน',
      dataIndex: 'returnedAt',
      key: 'returnedAt',
      render: (text: string | null) => text ? new Date(text).toLocaleDateString('th-TH', {
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }) : <Tag color="orange">ยังไม่คืน</Tag>, // แสดง Tag สำหรับยังไม่คืน
    },
    {
      title: 'สถานะการยืม',
      key: 'borrowStatus',
      render: (text: string, record: BorrowRecord) => (
        record.returnedAt === null ? (
          <Tag color="volcano">กำลังยืม</Tag> // ใช้สีแดง/ส้มสำหรับกำลังยืม
        ) : (
          <Tag color="green">คืนแล้ว</Tag> // ใช้สีเขียวสำหรับคืนแล้ว
        )
      ),
    },
  ];

  return (
    <div>
      <MenuBar page={"ประวัติการยืม"} />
      <div className="p-5">
        <h2 className="text-3xl font-bold mb-5">ประวัติการยืมทั้งหมด</h2>
        <Table
          dataSource={borrowRecords}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>
    </div>
  );
};

export default AdminBorrowPage;