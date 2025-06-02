
import MenuBar from "@/components/user/MenuBar";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const UserPage = async () => {
  // อ่าน cookie จาก request ใน Server Component
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token')?.value;

  let user: { id: number; username: string; role: string } | null = null;

  if (authToken) {
    user = verifyToken(authToken);
  }

  // ถ้าไม่มี Token หรือ Token ไม่ถูกต้อง หรือ Role ไม่ใช่ ADMIN
  if (!user || user.role !== 'USER') {
    redirect('/login'); // เปลี่ยนเส้นทางไปหน้า Login
  }
    return (
        <div>
            <MenuBar page={"หน้าหลัก"} />
            <h1>hi</h1>
        </div>
    )
}

export default UserPage;