import React from "react";
import MenuBar from "@/components/admin/MenuBar";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const AdminPage = async () => {
  // อ่าน cookie จาก request ใน Server Component
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value;

  let user: { id: number; username: string; role: string } | null = null;

  if (authToken) {
    user = verifyToken(authToken);
  }

  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }
  const totalItems = await prisma.item.count(); // นับอุปกรณ์ทั้งหมด
  const availableItems = await prisma.item.count({ // นับอุปกรณ์ที่ว่าง
    where: {
      status: "AVAILABLE"
    }
  });
  const borrowedItems = await prisma.item.count({ // นับอุปกรณ์ที่กำลังถูกยืม
    where: {
      status: "BORROWED"
    }
  });

  return (
    <div>
      <MenuBar page={"หน้าหลัก"} />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  gap-4 p-4">
        <div className="flex justify-center">
          <div className="p-4 bg-red-600 mb-4 w-80 h-50 mt-5 m-auto rounded-xl">
            <h2 className="text-3xl text-center mt-4"></h2>
            <p className="text-center text-5xl text-white font-bold">
              อุปกรณ์ที่มี
            </p>
             <h2 className="text-3xl text-center mt-4 text-white font-bold">
              {totalItems}
            </h2>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="p-4 bg-red-600 mb-4 w-80 h-50 mt-5 m-auto rounded-xl">
            <h2 className="text-3xl text-center mt-4"></h2>
            <p className="text-center text-5xl text-white font-bold">
              อุปกรณ์ที่ว่าง
            </p>
             <h2 className="text-3xl text-center mt-4 text-white font-bold">
              {availableItems}
            </h2>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="p-4 bg-red-600 mb-4 w-80 h-50 mt-5 m-auto rounded-xl">
            <h2 className="text-3xl text-center mt-4"></h2>
            <p className="text-center text-5xl text-white font-bold">กำลังยืม</p>
             <h2 className="text-3xl text-center mt-4 text-white font-bold">
              {borrowedItems}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
