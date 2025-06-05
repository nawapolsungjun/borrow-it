"use client";

import MenuBar from "@/components/admin/MenuBar";
import { useEffect, useState } from "react";
import { Table, message, Tag } from "antd";

// กำหนด Type
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
  borrowedAt: string;
  returnedAt: string | null;
  item: Item;
  user: User;
  username: string;
}

const AdminBorrowPage = () => {
  const [borrowRecords, setBorrowRecords] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndFetchRecords = async () => {
      try {
        const response = await fetch("/api/admin/borrowRecords");
        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 401 || response.status === 403) {
            message.error(
              errorData.message ||
                "คุณไม่มีสิทธิ์เข้าถึงหน้านี้ กรุณาเข้าสู่ระบบในฐานะ Admin"
            );
            return; // หยุดการทำงาน
          }
          throw new Error(
            errorData.message || "Failed to fetch borrow records"
          );
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
      title: "ผู้ยืม",
      dataIndex: "username", // ใช้ username ที่เราเพิ่มเข้ามาใน object
      key: "username",
    },
    {
      title: "ชื่ออุปกรณ์",
      dataIndex: ["item", "name"], // เข้าถึงชื่ออุปกรณ์จาก object item
      key: "itemName",
    },
    {
      title: "หมายเลขซีเรียล",
      dataIndex: ["item", "serialNumber"], // เข้าถึง serialNumber จาก object item
      key: "serialNumber",
    },
    {
      title: "วันที่ยืม",
      dataIndex: "borrowedAt",
      key: "borrowedAt",
      render: (text: string) =>
        new Date(text).toLocaleDateString("th-TH", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
    {
      title: "วันที่คืน",
      dataIndex: "returnedAt",
      key: "returnedAt",
      render: (text: string | null) =>
        text ? (
          new Date(text).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        ) : (
          <Tag color="orange">ยังไม่คืน</Tag>
        ), // แสดง Tag สำหรับยังไม่คืน
    },
    {
      title: "สถานะการยืม",
      key: "borrowStatus",
      render: (text: string, record: BorrowRecord) =>
        record.returnedAt === null ? (
          <Tag color="volcano">กำลังยืม</Tag> // ใช้สีแดง/ส้มสำหรับกำลังยืม
        ) : (
          <Tag color="green">คืนแล้ว</Tag> // ใช้สีเขียวสำหรับคืนแล้ว
        ),
    },
  ];

  return (
    <div>
      <MenuBar page={"ประวัติการยืม"} />
      <div className="p-5">
        <h2 className="text-3xl font-bold mb-5 krub-regular">
          ประวัติการยืมทั้งหมด
        </h2>
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
