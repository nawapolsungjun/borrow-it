// src/app/api/user/items/route.ts
import { NextResponse } from 'next/server';

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';


export async function GET() {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    if (!authToken) {
      return NextResponse.json({ message: 'ไม่ได้รับอนุญาต' }, { status: 401 });
    }

    const user = verifyToken(authToken);

    if (!user || user.role !== 'USER') {
      return NextResponse.json({ message: 'ไม่ได้รับอนุญาต' }, { status: 403 });
    }

    const items = await prisma.item.findMany({
      where: {
        status: "AVAILABLE"
      }
    });

    return NextResponse.json(items, { status: 200 });
  } catch (error: unknown) { // แก้ไข: เปลี่ยนเป็น unknown
    console.error("Failed to fetch available items for user:", error);
    // เพิ่มการตรวจสอบ Type เพื่อเข้าถึง error.message หากจำเป็น
    const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลอุปกรณ์';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}