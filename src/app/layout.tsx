// app/layout.tsx
// นี่คือ Server Component โดยค่าเริ่มต้น
import { Inter } from 'next/font/google';
import './globals.css'; // Global styles
import { Providers } from './providers'; // นำเข้า Providers Component

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ระบบยืม-คืนอุปกรณ์',
  description: 'ระบบยืม-คืนอุปกรณ์สำหรับ Admin และ User',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ใน App Router, คุณต้องดึง session จาก Server Side
  // วิธีที่แนะนำคือใช้ `getServerSession` ใน Layout หรือ Page ที่ต้องการ
  // เนื่องจาก layout.tsx เป็น Server Component, เราสามารถเรียก API ได้ตรงๆ
  // หรือดึง session โดยใช้ getServerSession
  // เพื่อความเรียบง่าย, ผมจะสมมติว่าคุณส่ง session ผ่าน props หรือ Fetch ใน Client Component
  // แต่ถ้าใช้ NextAuth v5 (Beta) หรือใหม่กว่า, คุณสามารถใช้ auth() function ได้

  // สำหรับ NextAuth.js v4 (ที่คุณน่าจะใช้อยู่)
  // คุณต้องสร้างไฟล์ API route เพื่อดึง session หรือใช้ getServerSession ใน Server Component

  // ในตัวอย่างนี้ ผมจะสมมติว่า session object มาจากไหนสักที่
  // หรือหากคุณต้องการให้ sessionProvider จัดการเองทั้งหมด, คุณอาจจะแค่ส่ง null ไปก่อน
  // แล้วจัดการ redirection/auth logic ใน client component
  const session = null; // หรือใช้ await getServerSession(authOptions) ถ้าคุณตั้งค่า

  return (
    <html lang="th">
      <body className={inter.className}>
        <Providers session={session}> {/* ใช้ Providers ที่สร้างขึ้น */}
          {children}
        </Providers>
      </body>
    </html>
  );
}