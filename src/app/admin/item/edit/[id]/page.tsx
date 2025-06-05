// src/app/admin/item/edit/[id]/page.tsx
// ไม่มี "use client"; แล้ว --> นี่คือ Server Component

import React from "react";
import { redirect } from "next/navigation";
import { message } from "antd";
import EditItemForm from "@/components/items/EditItemForm";

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

const EditItemPage = async ({ params }: EditItemPageProps) => {
  const itemId = params.id;
  let initialItemData: ItemDataType | null = null;

  if (!itemId || isNaN(parseInt(itemId))) {
    message.error("ID อุปกรณ์ไม่ถูกต้อง");
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
