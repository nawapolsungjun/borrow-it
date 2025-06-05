"use client";

import React from "react";
import { Button, Form, Input, Select, message } from "antd";
import { useRouter } from "next/navigation";
import { ArrowLeftOutlined } from "@ant-design/icons";

const { Option } = Select;

// กำหนด Type สำหรับค่าในฟอร์มเพิ่มอุปกรณ์
interface ItemFormValues {
  name: string;
  serialNumber: string;
  status: "AVAILABLE" | "BORROWED";
  description?: string;
}

const AddItemPage: React.FC = () => {
  const router = useRouter();
  const [form] = Form.useForm();

  // ฟังก์ชันจัดการเมื่อฟอร์มถูกส่ง (เพิ่มอุปกรณ์)
  const onFinish = async (values: ItemFormValues) => {
    try {
      // ส่งคำขอเพิ่มอุปกรณ์ไปยัง API
      const response = await fetch("/api/auth/item/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add item");
      }

      message.success("เพิ่มอุปกรณ์ใหม่สำเร็จ");
      form.resetFields();
      router.push("/admin/item"); // กลับไปหน้า Item List
    } catch (error) {
      message.error("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
      console.error("Error adding item:", error);
      message.error("ไม่สามารถเพิ่มอุปกรณ์ได้");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center mb-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/admin/item")}
          className="mr-4"
        >
          กลับ
        </Button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto">
        <h1 className="text-center text-3xl font-bold text-gray-800 krub-regular">
          เพิ่มอุปกรณ์ใหม่
        </h1>
        <Form
          form={form}
          layout="vertical"
          name="add_item_form"
          onFinish={onFinish}
          initialValues={{ status: "AVAILABLE" }} // กำหนดสถานะเริ่มต้น
        >
          <Form.Item
            name="name"
            label="ชื่ออุปกรณ์"
            rules={[{ required: true, message: "กรุณาป้อนชื่ออุปกรณ์!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="serialNumber"
            label="Serial Number"
            rules={[{ required: true, message: "กรุณาป้อน Serial Number!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="status"
            label="สถานะ"
            rules={[{ required: true, message: "กรุณาเลือกสถานะ!" }]}
          >
            <Select placeholder="เลือกสถานะ">
              <Option value="AVAILABLE">พร้อมใช้งาน</Option>
              <Option value="BORROWED">กำลังยืม</Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="คำอธิบาย">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full">
              บันทึกอุปกรณ์
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default AddItemPage;
