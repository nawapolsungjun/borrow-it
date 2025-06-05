import React from "react";
import { redirect } from "next/navigation";
import { message } from "antd";
import EditItemForm from "@/components/items/EditItemForm";

// กำหนด Type
interface ItemDataType {
  id: number;
  name: string;
  serialNumber: string;
  status: "AVAILABLE" | "BORROWED";
  description?: string;
}

interface EditItemPageProps {
  params: {
    id: string;
  };
}

// Component สำหรับหน้าแก้ไขอุปกรณ์
const EditItemPage = async ({ params }: EditItemPageProps) => {
  const itemId = params.id; // ดึง ID อุปกรณ์จาก URL
  let initialItemData: ItemDataType | null = null; // State สำหรับเก็บข้อมูลอุปกรณ์เริ่มต้น

  // ตรวจสอบความถูกต้องของ itemId
  if (!itemId || isNaN(parseInt(itemId))) {
    message.error("ID อุปกรณ์ไม่ถูกต้อง");
    redirect("/admin/item"); // Redirect กลับไปหน้าตารางอุปกรณ์หาก ID ไม่ถูกต้อง
  }

  try {
    // ดึงข้อมูลอุปกรณ์จาก API โดยตรง
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/auth/item/${itemId}`,
      {
        cache: "no-store", // ระบุว่าไม่ให้ cache ข้อมูล (ดึงข้อมูลใหม่ทุกครั้ง)
      }
    );

    // หาก response ไม่ OK Redirect กลับไปหน้าตารางอุปกรณ์
    if (!response.ok) {
      console.error(
        `Failed to fetch item ${itemId}: ${response.status} ${response.statusText}`
      );

      redirect("/admin/item");
    }

    initialItemData = await response.json();
  } catch (error) {
    
    // จัดการข้อผิดพลาดที่เกิดจากการดึงข้อมูล Redirect กลับไปหน้าตารางอุปกรณ์
    console.error(`Error fetching item ${itemId} in Server Component:`, error);
    redirect("/admin/item");
  }

  // หากไม่พบข้อมูลอุปกรณ์ Redirect กลับไปหน้าตารางอุปกรณ์
  if (!initialItemData) {
    redirect("/admin/item");
  }

  // ส่งข้อมูลอุปกรณ์เริ่มต้นและ itemId ไปยัง EditItemForm
  return <EditItemForm initialItemData={initialItemData} itemId={itemId} />;
};

export default EditItemPage;
