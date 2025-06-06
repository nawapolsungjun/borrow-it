"use client";

import MenuBar from "@/components/user/MenuBar";
import { useEffect, useState } from "react";
import { Button, Table, message, Modal } from "antd";
import { BookOutlined } from "@ant-design/icons";

// กำหนด Type สำหรับข้อมูล Item
interface Item {
  id: number;
  name: string;
  serialNumber: string;
  status: string;
  description: string | null;
}

export default function UserItem() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch("/api/user/items"); // เรียก API เพื่อดึงรายการอุปกรณ์ที่ "AVAILABLE"
        if (!response.ok) {
          throw new Error("Failed to fetch items");
        }
        const data: Item[] = await response.json();
        setItems(data);
      } catch (error: unknown) {
        console.error("Error fetching items:", error);
        message.error("ไม่สามารถดึงข้อมูลอุปกรณ์ได้");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // ฟังก์ชันสำหรับแสดง Modal ยืนยันการยืม
  const showBorrowConfirmModal = (item: Item) => {
    setSelectedItem(item);
    setIsModalVisible(true);
  };

  // ฟังก์ชันสำหรับยกเลิกการยืม
  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedItem(null);
  };

  // ฟังก์ชันจัดการการยืมอุปกรณ์จริง
  const handleBorrow = async () => {
    if (!selectedItem) return;

    try {
      const response = await fetch("/api/user/borrow", {
        // ส่งคำขอยืมอุปกรณ์ไปยัง API
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId: selectedItem.id,
        }),
      });

      // แสดงข้อความสำเร็จพร้อมชื่ออุปกรณ์และ Serial Number
      if (response.ok) {
        message.success(
          `ยืมอุปกรณ์ "${selectedItem.name}" (S/N: ${selectedItem.serialNumber}) สำเร็จ`
        );
        handleCancel();

        // ลบรายการที่ยืมออกจากรายการที่แสดงเพราะสถานะเปลี่ยนไปแล้ว
        setItems((prevItems) =>
          prevItems.filter((item) => item.id !== selectedItem.id)
        );
      } else {
        const errorData = await response.json();
        message.error(errorData.message || "เกิดข้อผิดพลาดในการยืมอุปกรณ์");
      }
    } catch (error: unknown) {
      console.error("Error borrowing item:", error);
      message.error("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์เพื่อยืมอุปกรณ์");
    }
  };

  // กำหนดคอลัมน์
  const columns = [
    {
      title: "ชื่ออุปกรณ์",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "หมายเลขซีเรียล",
      dataIndex: "serialNumber",
      key: "serialNumber",
    },
    {
      title: "คำอธิบาย",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      render: (text: string) => (
        <span
          style={{
            color: text === "AVAILABLE" ? "green" : "red",
            fontWeight: "bold",
          }}
        >
          {text}
        </span>
      ),
    },
    {
      title: "การดำเนินการ",
      key: "actions",
      render: (text: string, record: Item) => (
        <Button
          type="primary"
          icon={<BookOutlined />}
          onClick={() => showBorrowConfirmModal(record)}
          disabled={record.status !== "AVAILABLE"}
        >
          ยืม
        </Button>
      ),
    },
  ];

  return (
    <div>
      <MenuBar page={"คลังอุปกรณ์"} />
      <div className="p-5">
        <h2 className="text-3xl font-bold mb-5 krub-regular">
          คลังอุปกรณ์ที่พร้อมให้ยืม
        </h2>
        <Table
          dataSource={items}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />

        <Modal
          title="ยืนยันการยืมอุปกรณ์"
          open={isModalVisible}
          onOk={handleBorrow}
          onCancel={handleCancel}
          okText="ยืนยัน"
          cancelText="ยกเลิก"
        >
          <p>
            คุณต้องการยืมอุปกรณ์ **{selectedItem?.name}** (S/N: **
            {selectedItem?.serialNumber}**) ใช่หรือไม่?
          </p>
        </Modal>
      </div>
    </div>
  );
}
