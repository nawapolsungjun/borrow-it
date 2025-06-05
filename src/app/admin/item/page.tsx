// src/app/admin/item/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Space, Table, Tag, Button, Modal } from "antd";
import type { TableProps } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import MenuBar from "@/components/admin/MenuBar";

// กำหนด Type สำหรับข้อมูลอุปกรณ์แต่ละรายการ
interface ItemDataType {
  id: number;
  name: string;
  serialNumber: string;
  status: "AVAILABLE" | "BORROWED";
  description?: string;
}
// กำหนดคอลัมน์สำหรับตารางแสดงอุปกรณ์
const ItemTableColumns = (
  onView: (item: ItemDataType) => void,
  onEdit: (item: ItemDataType) => void,
  onDelete: (id: number) => void
): TableProps<ItemDataType>["columns"] => [
  {
    title: "ชื่ออุปกรณ์",
    dataIndex: "name",
    key: "name",
    width: "20%",
  },
  {
    title: "Serial Number",
    dataIndex: "serialNumber",
    key: "serialNumber",
    width: "20%",
  },
  {
    title: "สถานะ",
    dataIndex: "status",
    key: "status",
    width: "15%",
    render: (status: ItemDataType["status"]) => {
      const color = status === "AVAILABLE" ? "green" : "blue";
      return <Tag color={color}>{status.toUpperCase()}</Tag>;
    },
  },
  {
    title: "คำอธิบาย",
    dataIndex: "description",
    key: "description",
    width: "30%",
    render: (text) => text || "-",
  },
  {
    title: "Action", // คอลัมน์ปุ่มต่างๆ
    key: "action",
    width: "15%",
    render: (_, record) => (
      <Space size="small">
        <Button
          size="small"
          icon={<EyeOutlined />} // ไอคอนปุ่มดูรายละเอียด
          onClick={() => onView(record)}
        />
        <Button
          size="small"
          icon={<EditOutlined />}
          onClick={() => onEdit(record)} // ปุ่มแก้ไข
        />
        <Button
          size="small"
          danger
          icon={<DeleteOutlined />} // ปุ่มลบ
          onClick={() => onDelete(record.id)}
        />
      </Space>
    ),
  },
];

const ItemAdminPage: React.FC = () => {
  const [items, setItems] = useState<ItemDataType[]>([]); // State สำหรับเก็บรายการอุปกรณ์
  const [loading, setLoading] = useState<boolean>(false); // สถานะการโหลดข้อมูล
  const [isViewModalVisible, setIsViewModalVisible] = useState<boolean>(false); // การแสดง Modal ดูรายละเอียด
  const [viewingItem, setViewingItem] = useState<ItemDataType | null>(null); // เก็บข้อมูลอุปกรณ์ที่กำลังถูกดูรายละเอียด
  const router = useRouter();

  // ฟังก์ชันสำหรับดึงข้อมูลอุปกรณ์จาก API
  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/item/admin"); // เรียก API เพื่อดึงข้อมูลอุปกรณ์
      if (!response.ok) {
        throw new Error("Failed to fetch items");
      }
      const data = await response.json();
      // กรองข้อมูลเฉพาะอุปกรณ์ที่มีสถานะ AVAILABLE หรือ BORROWED
      const filteredData = data.filter(
        (item: ItemDataType) =>
          item.status === "AVAILABLE" || item.status === "BORROWED"
      );
      setItems(filteredData);
    } catch (error: unknown) {
      console.error("Error fetching items:", error);
      const displayMessage =
        error instanceof Error
          ? error.message
          : typeof error === "object" && error !== null && "message" in error
          ? (error as { message: string }).message
          : "ไม่สามารถดึงข้อมูลอุปกรณ์ได้";
      alert(displayMessage);
    } finally {
      setLoading(false);
    }
  };

  // ใช้ useEffect เพื่อเรียก fetchItems เมื่อคอมโพเนนต์ Mount ครั้งแรก
  useEffect(() => {
    fetchItems();
  }, []);

  // ฟังก์ชันสำหรับเพิ่มอุปกรณ์ใหม่
  const handleAddItem = () => {
    router.push("/admin/item/add"); // นำทางไปยังหน้าเพิ่มอุปกรณ์
  };

  // ฟังก์ชันสำหรับแก้ไขอุปกรณ์
  const handleEditItem = (item: ItemDataType) => {
    router.push(`/admin/item/edit/${item.id}`); // นำทางไปยังหน้าแก้ไขอุปกรณ์พร้อม ID
  };

  // ฟังก์ชันสำหรับดูรายละเอียดอุปกรณ์
  const handleViewItem = (item: ItemDataType) => {
    setViewingItem(item); // กำหนดอุปกรณ์ที่จะดู
    setIsViewModalVisible(true); // แสดง Modal
  };

  // ฟังก์ชันสำหรับลบอุปกรณ์
  const handleDeleteItem = (id: number) => {
    console.log("Delete button clicked for ID:", id);

    // ยืนยันการลบกับผู้ใช้
    const isConfirmed = window.confirm(
      `คุณแน่ใจหรือไม่ที่ต้องการลบอุปกรณ์ ID: ${id} นี้?`
    );

    if (isConfirmed) {
      console.log("Browser confirm OK pressed for ID:", id);

      (async () => {
        try {
          // ส่งคำขอลบไปยัง API
          const response = await fetch(`/api/auth/item/${id}`, {
            method: "DELETE",
          });
          if (!response.ok) {
            const errorData = await response
              .json()
              .catch(() => ({ message: "เกิดข้อผิดพลาดไม่ทราบสาเหตุ" }));
            throw new Error(errorData.message || "Failed to delete item");
          }
          alert("ลบอุปกรณ์สำเร็จ!");
          fetchItems();
        } catch (error: unknown) {
          console.error("Error deleting item:", error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : typeof error === "object" &&
                error !== null &&
                "message" in error
              ? (error as { message: string }).message
              : "ไม่สามารถลบอุปกรณ์ได้";
          alert(`ไม่สามารถลบอุปกรณ์ได้: ${errorMessage}`);
        }
      })();
    } else {
      console.log("Delete cancelled for ID:", id);
    }
  };

  // ฟังก์ชันสำหรับปิด Modal ดูรายละเอียด
  const handleViewModalCancel = () => {
    setIsViewModalVisible(false);
    setViewingItem(null);
  };

  const columns = ItemTableColumns(
    handleViewItem,
    handleEditItem,
    handleDeleteItem
  );

  return (
    <div>
      <MenuBar page={"คลังอุปกรณ์"} />
      <Button type="primary" icon={<PlusOutlined />} onClick={handleAddItem}>
        เพิ่มอุปกรณ์
      </Button>
      <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
        <h1 className="text-3xl font-bold text-gray-800 krub-regular">
          รายการอุปกรณ์
        </h1>
        <Table<ItemDataType>
          columns={columns}
          dataSource={items.map((item) => ({
            ...item,
            key: item.id.toString(),
          }))}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
        />
      </div>

      <Modal
        title="รายละเอียดอุปกรณ์"
        open={isViewModalVisible}
        onCancel={handleViewModalCancel}
        footer={[
          <Button key="back" onClick={handleViewModalCancel}>
            ปิด
          </Button>,
        ]}
      >
        {viewingItem && (
          <div className="space-y-2">
            <p>
              <strong>ID:</strong> {viewingItem.id}
            </p>
            <p>
              <strong>ชื่ออุปกรณ์:</strong> {viewingItem.name}
            </p>
            <p>
              <strong>Serial Number:</strong> {viewingItem.serialNumber}
            </p>
            <p>
              <strong>สถานะ:</strong>{" "}
              <Tag
                color={viewingItem.status === "AVAILABLE" ? "green" : "blue"}
              >
                {viewingItem.status.toUpperCase()}
              </Tag>
            </p>
            <p>
              <strong>คำอธิบาย:</strong> {viewingItem.description || "-"}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ItemAdminPage;
