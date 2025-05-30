// action.ts
'use server';

import prisma from '@/lib/prisma'; // <-- เพิ่มบรรทัดนี้เพื่อนำเข้า Prisma Client

export async function login(username: string, password: string) {
  // แก้ไข syntax error ตรงนี้: ลบคอมม่าออก
  const user = await prisma.user.findFirst({ where: { username: username } });

  if (user) {
    // ในแอปพลิเคชันจริง ควรใช้การเปรียบเทียบรหัสผ่านที่ถูกแฮช (hashed password)
    // ไม่ควรเก็บหรือเปรียบเทียบรหัสผ่านแบบ Plain Text เพื่อความปลอดภัย
    if (user.password === password) {
      return true;
    } else {
      return false; // รหัสผ่านไม่ตรง
    }
  } else {
    return false; // ไม่พบผู้ใช้งาน
  }
}