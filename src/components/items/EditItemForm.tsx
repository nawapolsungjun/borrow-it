// src/components/items/EditItemForm.tsx
"use client"; // This is a Client Component

import React, { useState, useEffect } from 'react';
import { Button, Form, Input, Select, message, Spin } from 'antd'; // นำเข้า Spin
import { useRouter } from 'next/navigation';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Option } = Select;

interface ItemFormValues {
  id: number;
  name: string;
  serialNumber: string;
  status: 'AVAILABLE' | 'BORROWED';
  description?: string;
}

interface EditItemFormProps {
  initialItemData: ItemFormValues; // Server Component ควรส่งข้อมูลมาให้เสมอ
  itemId: string;
}

const EditItemForm: React.FC<EditItemFormProps> = ({ initialItemData, itemId }) => {
  const router = useRouter();
  const [form] = Form.useForm();
  // State สำหรับควบคุมการโหลดของฟอร์ม (เมื่อมีการ submit)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  // itemData ใน state ตอนนี้ไม่ได้ใช้เพื่อควบคุม initialValues แล้ว
  // แต่ยังคงเป็นแหล่งข้อมูลหลักในกรณีที่ต้องการเปลี่ยนแปลงค่าใน component
  const [itemData, setItemData] = useState<ItemFormValues>(initialItemData);

  // Effect เพื่อตั้งค่าฟอร์มเมื่อ initialItemData เปลี่ยน (มาจาก Server Component)
  // และเพื่อให้ Ant Design Form มีค่าเริ่มต้นที่ถูกต้อง
  useEffect(() => {
    // ต้องตั้งค่าฟอร์มเมื่อ component ถูก mount หรือ initialItemData เปลี่ยน
    form.setFieldsValue(initialItemData);
    // อัปเดต itemData ใน state ให้ตรงกับ prop ที่รับมา
    setItemData(initialItemData);
  }, [initialItemData, form]); // เพิ่ม form ใน dependency array เพื่อความถูกต้องของ useEffect


  const onFinish = async (values: ItemFormValues) => {
    setIsSubmitting(true); // ตั้งค่า loading สำหรับการ submit
    try {
      // URL API ควรจะเป็น /api/auth/item/[id]
      const response = await fetch(`/api/auth/item/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: values.name,
            serialNumber: values.serialNumber,
            status: values.status,
            description: values.description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update item');
      }

      message.success('อัปเดตอุปกรณ์สำเร็จ');
      router.push('/admin/item'); // Redirect to admin item list
    } catch (error) {
      console.error('Error updating item:', error);
      message.error('ไม่สามารถอัปเดตอุปกรณ์ได้:');
    } finally {
      setIsSubmitting(false); // ตั้งค่า loading กลับ
    }
  };

  // เนื่องจาก initialItemData ถูกรับมาจาก Server Component และควรมีค่าเสมอ
  // เราไม่จำเป็นต้องมี loading state แยกสำหรับการ fetch ข้อมูลเริ่มต้นใน Client Component นี้แล้ว
  // แต่เราจะใช้ Spin เพื่อแสดงสถานะการ submit ฟอร์มแทน
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center mb-6">
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/admin/item')} className="mr-4">
          กลับ
        </Button>
        {/* ใช้ itemData จาก state ในกรณีที่มันถูกอัปเดต หรือ initialItemData */}
        
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto">
      <h1 className="text-center text-3xl font-bold text-gray-800">แก้ไขอุปกรณ์: {itemData?.name || ''}</h1>
        <Spin spinning={isSubmitting} size="large" tip="กำลังบันทึกข้อมูล...">
          <Form
            form={form}
            layout="vertical"
            name="edit_item_form"
            onFinish={onFinish}
            initialValues={initialItemData} // ใช้ initialItemData จาก props เป็นค่าเริ่มต้น
            key={initialItemData.id} // ใช้ initialItemData.id เป็น key
          >
            <Form.Item
              name="name"
              label="ชื่ออุปกรณ์"
              rules={[{ required: true, message: 'กรุณาป้อนชื่ออุปกรณ์!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="serialNumber"
              label="Serial Number"
              rules={[{ required: true, message: 'กรุณาป้อน Serial Number!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="status"
              label="สถานะ"
              rules={[{ required: true, message: 'กรุณาเลือกสถานะ!' }]}
            >
              <Select placeholder="เลือกสถานะ">
                <Option value="AVAILABLE">พร้อมใช้งาน</Option>
                <Option value="BORROWED">กำลังยืม</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="description"
              label="คำอธิบาย"
            >
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" className="w-full">
                บันทึกการแก้ไข
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </div>
    </div>
  );
};

export default EditItemForm;