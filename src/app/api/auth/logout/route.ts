// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

// --- สำหรับ POST Request (วิธีที่แนะนำ) ---
export async function POST() {
  try {
    const cookie = clearAuthCookie();
    return new NextResponse(
      JSON.stringify({ message: 'ออกจากระบบสำเร็จ' }),
      {
        status: 200,
        headers: {
          'Set-Cookie': cookie,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการออกจากระบบ' },
      { status: 500 }
    );
  }
}

// --- สำหรับ GET Request (ถ้าคุณต้องการใช้ Link ตรงๆ - ไม่แนะนำสำหรับ Logout) ---
// การทำ logout ด้วย GET request อาจมีช่องโหว่ด้านความปลอดภัยบางอย่าง
// เช่น CSRF หรือการที่บราวเซอร์อาจ cache request ได้
export async function GET() {
  try {
    const cookie = clearAuthCookie();
    return new NextResponse(
      JSON.stringify({ message: 'ออกจากระบบสำเร็จ (GET)' }),
      {
        status: 200,
        headers: {
          'Set-Cookie': cookie,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Logout GET error:', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการออกจากระบบ (GET)' },
      { status: 500 }
    );
  }
}