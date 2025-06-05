"use client";

import React, { useState, useEffect } from "react";
import { Button, Form, Input, Select, message, Spin } from "antd";
import { useRouter } from "next/navigation";
import { ArrowLeftOutlined } from "@ant-design/icons";

const { Option } = Select;

interface ItemFormValues {
  id: number;
  name: string;
  serialNumber: string;
  status: "AVAILABLE" | "BORROWED";
  description?: string;
}

interface EditItemFormProps {
  initialItemData: ItemFormValues;
  itemId: string;
}

const EditItemForm: React.FC<EditItemFormProps> = ({
  initialItemData,
  itemId,
}) => {
  const router = useRouter();
  const [form] = Form.useForm();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [itemData, setItemData] = useState<ItemFormValues>(initialItemData);

  useEffect(() => {
    form.setFieldsValue(initialItemData);

    setItemData(initialItemData);
  }, [initialItemData, form]);

  const onFinish = async (values: ItemFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/auth/item/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          serialNumber: values.serialNumber,
          status: values.status,
          description: values.description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update item");
      }

      message.success("อัปเดตอุปกรณ์สำเร็จ");
      router.push("/admin/item"); // Redirect to admin item list
    } catch (error) {
      console.error("Error updating item:", error);
      message.error("ไม่สามารถอัปเดตอุปกรณ์ได้:");
    } finally {
      setIsSubmitting(false);
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
        <h1 className="text-center text-3xl font-bold text-gray-800">
          แก้ไขอุปกรณ์: {itemData?.name || ""}
        </h1>
        <Spin spinning={isSubmitting} size="large" tip="กำลังบันทึกข้อมูล...">
          <Form
            form={form}
            layout="vertical"
            name="edit_item_form"
            onFinish={onFinish}
            initialValues={initialItemData}
            key={initialItemData.id}
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
