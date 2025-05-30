// scripts/createAdmin.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
// นำเข้า PrismaClientKnownRequestError
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'; 

const prisma = new PrismaClient();

async function main() {
  const username = 'admin'; // กำหนดชื่อผู้ใช้
  const password = '123'; // กำหนดรหัสผ่าน (ควรเปลี่ยนเป็นรหัสที่ซับซ้อน)
  const hashedPassword = await bcrypt.hash(password, 10); // Hash รหัสผ่านเพื่อความปลอดภัย

  try {
    const adminUser = await prisma.user.create({
      data: {
        username: username,
        password: hashedPassword,
        role: 'ADMIN', // กำหนด role เป็น ADMIN
      },
    });
    console.log('User created successfully:', adminUser);
  } catch (e: unknown) { // ใช้ unknown เพื่อความปลอดภัย
    // ตรวจสอบว่าเป็น PrismaClientKnownRequestError หรือไม่
    if (e instanceof PrismaClientKnownRequestError) {
      // P2002: Unique constraint failed (เช่น username ซ้ำ)
      if (e.code === 'P2002' && e.meta?.target && Array.isArray(e.meta.target) && e.meta.target.includes('username')) {
        console.log(`User with username '${username}' already exists. Skipping creation.`);
      } else {
        // หากเป็น Prisma Error อื่นๆ ที่เราไม่ได้จัดการ
        console.error('Prisma Error creating user:', e.message);
      }
    } else {
      // หากเป็น Error ประเภทอื่นๆ ที่ไม่ใช่ Prisma Error
      console.error('Unknown error creating user:', e);
    }
  } finally {
    await prisma.$disconnect(); // ปิดการเชื่อมต่อ Prisma Client
  }
}

main();