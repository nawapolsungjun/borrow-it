// pages/api/auth/login.ts
// (หรือ app/api/auth/login/route.ts ถ้าคุณใช้ App Router และ Route Handlers)


import { NextResponse } from 'next/server'; // สำหรับ App Router (ถ้าใช้ Route Handlers)
import prisma from '../../../lib/prisma'; // Path ไปยัง Prisma Client ของคุณ
import bcrypt from 'bcryptjs'; // สำหรับเปรียบเทียบรหัสผ่านที่ Hashed


 export async function POST(req: Request) { // สำหรับ App Router Route Handlers
  if (req.method !== 'POST') {

 return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 }); // App Router
  }

  // ดึง username และ password จาก body ของ Request

 const { username, password } = await req.json(); 

  try {
    // 1. ดึงข้อมูลผู้ใช้จากฐานข้อมูลด้วย username
    const user = await prisma.user.findUnique({
      where: { username: username }, // ค้นหาผู้ใช้ด้วย username ที่รับมา
    });

    // 2. ตรวจสอบว่าพบผู้ใช้หรือไม่
    if (!user) {

     return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 }); // App Router
    }

    // 3. เปรียบเทียบรหัสผ่านที่กรอกมากับรหัสผ่านที่ Hashed ในฐานข้อมูล
    // user.password คือรหัสผ่านที่ Hashed ในฐานข้อมูล
    // password คือรหัสผ่าน Plain Text ที่ผู้ใช้กรอกมา
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
     
    return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 }); // App Router
    }

    // 4. หาก Login สำเร็จ
    // สร้าง object ผู้ใช้ใหม่ โดยไม่รวม property password เพื่อไม่ให้ส่งรหัสผ่านกลับไปที่ Client
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user; 
    
    // ส่งข้อมูลผู้ใช้ (ที่ไม่รวมรหัสผ่าน) และข้อความสำเร็จกลับไป
     return NextResponse.json({ message: 'Login successful', user: userWithoutPassword }, { status: 200 }); // App Router

  } catch (error: unknown) { // แก้ไข error: any เป็น error: unknown
    console.error('Error during login:', error);

    // คุณสามารถเพิ่มการจัดการ Prisma Error เฉพาะได้ที่นี่ (เช่น P2002)
    // if (error instanceof PrismaClientKnownRequestError) { ... }

    
     return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 }); // App Router
  }
}