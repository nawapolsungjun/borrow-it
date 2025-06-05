"use client";

import MenuBar from "@/components/user/MenuBar";
import { useEffect, useState } from "react";
import { Button, Table, message, Modal } from "antd";
import { RollbackOutlined } from "@ant-design/icons";

// กำหนด Type สำหรับข้อมูล Item
interface Item {
  id: number;
  name: string;
  serialNumber: string;
  status: string;
  description: string | null;
}

// กำหนด Type สำหรับข้อมูล BorrowRecord
interface BorrowRecord {
  id: number;
  itemId: number;
  userId: number;
  borrowedAt: string;
  returnedAt: string | null;
  item: Item;
}

export default function UserBorrowPage() {
  const [borrowRecords, setBorrowRecords] = useState<BorrowRecord[]>([]); // State สำหรับเก็บรายการบันทึกการยืม
  const [loading, setLoading] = useState(true); // State สำหรับสถานะการโหลดข้อมูล
  const [isReturnModalVisible, setIsReturnModalVisible] = useState(false); // State สำหรับควบคุมการแสดง Modal ยืนยันการคืนอุปกรณ์
  const [selectedRecord, setSelectedRecord] = useState<BorrowRecord | null>( // State สำหรับเก็บข้อมูลบันทึกการยืมที่ถูกเลือกเพื่อคืน
    null
  );

  // ฟังก์ชันดึงข้อมูลบันทึกการยืมจาก API
  const fetchBorrowRecords = async () => {
    try {
      const response = await fetch("/api/user/borrowRecords"); // เรียก API เพื่อดึงข้อมูลประวัติการยืมของผู้ใช้
      if (!response.ok) {
        throw new Error("Failed to fetch borrow records");
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

  useEffect(() => {
    fetchBorrowRecords();
  }, []);

  // ฟังก์ชันสำหรับแสดง Modal ยืนยันการคืนอุปกรณ์
  const showReturnModal = (record: BorrowRecord) => {
    setSelectedRecord(record);
    setIsReturnModalVisible(true);
  };

   // ฟังก์ชันสำหรับยกเลิกการคืนอุปกรณ์
  const handleCancelReturn = () => {
    setIsReturnModalVisible(false);
    setSelectedRecord(null);
  };

  // ฟังก์ชันจัดการการคืนอุปกรณ์
  const handleReturn = async () => {
    if (!selectedRecord) return;

    try {
      const response = await fetch("/api/user/return", { // ส่งคำขอคืนอุปกรณ์ไปยัง API
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          borrowRecordId: selectedRecord.id, // ส่ง ID ของบันทึกการยืม
        }),
      });

      if (response.ok) {
        // แสดงข้อความสำเร็จพร้อมชื่ออุปกรณ์และ Serial Number
        message.success(
          `คืนอุปกรณ์ "${selectedRecord.item.name}" (S/N: ${selectedRecord.item.serialNumber}) สำเร็จ`
        );
        handleCancelReturn();
        fetchBorrowRecords();
      } else {
        const errorData = await response.json();
        message.error(errorData.message || "เกิดข้อผิดพลาดในการคืนอุปกรณ์");
      }
    } catch (error: unknown) {
      console.error("Error returning item:", error);
      message.error("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์เพื่อคืนอุปกรณ์");
    }
  };

  // กำหนดคอลัมน์
  const columns = [
    {
      title: "ชื่ออุปกรณ์",
      dataIndex: ["item", "name"],
      key: "itemName",
    },
    {
      title: "หมายเลขซีเรียล",
      dataIndex: ["item", "serialNumber"],
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
        text
          ? new Date(text).toLocaleDateString("th-TH", {
              year: "numeric",
              month: "numeric",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "ยังไม่คืน",
    },
    {
      title: "สถานะ",
      key: "status",
      render: (text: string, record: BorrowRecord) => (
        <span
          style={{
            color: record.returnedAt === null ? "orange" : "green",
            fontWeight: "bold",
          }}
        >
          {record.returnedAt === null ? "ยังไม่คืน" : "คืนแล้ว"}
        </span>
      ),
    },
    {
      title: "การดำเนินการ",
      key: "actions",
      render: (text: string, record: BorrowRecord) => (
        <Button
          type="primary"
          icon={<RollbackOutlined />}
          onClick={() => showReturnModal(record)}
          disabled={record.returnedAt !== null}
        >
          คืน
        </Button>
      ),
    },
  ];

  return (
    <div>
      <MenuBar page={"แดชบอร์ด"} />
      <div className="p-5">
        <h2 className="text-3xl font-bold mb-5 krub-regular">แดชบอร์ดของคุณ</h2>
        <Table
          dataSource={borrowRecords}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />

        <Modal
          title="ยืนยันการคืนอุปกรณ์"
          open={isReturnModalVisible}
          onOk={handleReturn}
          onCancel={handleCancelReturn}
          okText="ยืนยันการคืน"
          cancelText="ยกเลิก"
        >
          <p>
            คุณต้องการคืนอุปกรณ์ **{selectedRecord?.item.name}** (S/N: **
            {selectedRecord?.item.serialNumber}**) ใช่หรือไม่?
          </p>
        </Modal>
      </div>
    </div>
  );
}
