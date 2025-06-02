import React from 'react';
import MenuBar from "@/components/admin/MenuBar";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const AdminPage = async () => {
  // อ่าน cookie จาก request ใน Server Component
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token')?.value;

  let user: { id: number; username: string; role: string } | null = null;

  if (authToken) {
    user = verifyToken(authToken);
  }

  // ถ้าไม่มี Token หรือ Token ไม่ถูกต้อง หรือ Role ไม่ใช่ ADMIN
  if (!user || user.role !== 'ADMIN') {
    redirect('/login'); // เปลี่ยนเส้นทางไปหน้า Login
  }

  return (
    <div>
      <MenuBar page={"หน้าหลัก"} />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        <div className="flex justify-center">
          <div className="p-4 bg-red-600 mb-4 w-80 h-50 mt-5 m-auto rounded-xl">
            <h2 className="text-3xl text-center mt-4"></h2>
            <p className="text-center text-5xl text-white font-bold">
              คลังอุปกรณ์
            </p>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="p-4 bg-red-600 mb-4 w-80 h-50 mt-5 m-auto rounded-xl">
            <h2 className="text-3xl text-center mt-4"></h2>
            <p className="text-center text-5xl text-white font-bold">
              กำลังยืม
            </p>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="p-4 bg-red-600 mb-4 w-80 h-50 mt-5 m-auto rounded-xl">
            <h2 className="text-3xl text-center mt-4"></h2>
            <p className="text-center text-5xl text-white font-bold">คืนแล้ว</p>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="p-4 bg-red-600 mb-4 w-80 h-50 mt-5 m-auto rounded-xl">
            <h2 className="text-3xl text-center mt-4"></h2>
            <p className="text-center text-5xl text-white font-bold">
              ล่าช้า
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;