// pages/api/auth/login.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'; // นำเข้าสำหรับ error handling

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { username, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Successful login: You might want to generate a JWT here for better security
    // For simplicity, we'll just return user info (excluding password)
    // ปิดการใช้งาน ESLint warning สำหรับบรรทัดนี้
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user; 
    res.status(200).json({ message: 'Login successful', user: userWithoutPassword });

  } catch (error: unknown) { // แก้ไข error: any เป็น error: unknown
    console.error('Error during login:', error);

    // เพิ่มการจัดการ Prisma Error (ถ้ามี)
    if (error instanceof PrismaClientKnownRequestError) {
      // สามารถเพิ่ม logic สำหรับ Prisma Error โดยเฉพาะได้ที่นี่
      // เช่น if (error.code === 'P2002') ...
    }

    res.status(500).json({ message: 'Internal Server Error' });
  }
}