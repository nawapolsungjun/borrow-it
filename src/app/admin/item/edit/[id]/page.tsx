// src/app/admin/item/edit/[id]/page.tsx
// ไม่มี "use client"; แล้ว --> นี่คือ Server Component

import React from "react";
import { redirect } from "next/navigation";
// import { message } from "antd"; // message ของ antd มักจะใช้ใน Client Component
// ถ้าต้องการใช้ message ใน Server Component อาจต้องพิจารณาใช้ไลบรารีอื่น
// หรือส่งผลลัพธ์ผ่าน props ไปยัง Client Component ที่แสดง message

import EditItemForm from "@/components/items/EditItemForm";

interface ItemDataType {
  id: number;
  name: string;
  serialNumber: string;
  status: "AVAILABLE" | "BORROWED";
  description?: string;
}

interface EditItemPageProps {
  // เปลี่ยน Type ของ params ให้เป็น Promise
  params: Promise<{
    id: string;
  }>;
}

const EditItemPage = async ({ params }: EditItemPageProps) => {
  // ใช้ await เพื่อ deconstruct ค่าจาก params
  const { id: itemId } = await params; // เข้าถึงค่า id จาก Promise

  let initialItemData: ItemDataType | null = null;

  // การใช้ message.error ใน Server Component อาจมีปัญหา
  // ควรจะใช้ try/catch และ redirect หรือส่งข้อมูล error ไปที่ Client Component แทน
  if (!itemId || isNaN(parseInt(itemId))) {
    // message.error("ID อุปกรณ์ไม่ถูกต้อง"); // อันนี้อาจจะ error เพราะ antd message ใช้ client-side context
    console.error("ID อุปกรณ์ไม่ถูกต้อง หรือไม่มี");
    redirect("/admin/item");
  }

  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/auth/item/${itemId}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error(
        `Failed to fetch item ${itemId}: ${response.status} ${response.statusText}`
      );
      redirect("/admin/item");
    }

    initialItemData = await response.json();
  } catch (error) {
    console.error(`Error fetching item ${itemId} in Server Component:`, error);
    redirect("/admin/item");
  }

  if (!initialItemData) {
    redirect("/admin/item");
  }

  return <EditItemForm initialItemData={initialItemData} itemId={itemId} />;
};

export default EditItemPage;