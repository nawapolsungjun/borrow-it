// lib/auth.ts
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

// ควรเก็บ SECRET_KEY ไว้ใน .env.local และใช้ค่าที่ปลอดภัยและซับซ้อน
// สำหรับโปรเจกต์รายวิชา คุณสามารถใช้ค่าธรรมดาได้ แต่ใน production ต้องเป็นค่าที่คาดเดายากมาก
const SECRET_KEY = process.env.JWT_SECRET || 'your_super_secret_key_for_jwt_development';

interface UserPayload {
  id: number;
  username: string;
  role: string;
}

// ฟังก์ชันสำหรับสร้าง JWT
export const generateToken = (user: UserPayload) => {
  return jwt.sign(user, SECRET_KEY, { expiresIn: '1h' }); // Token หมดอายุใน 1 ชั่วโมง
};

// ฟังก์ชันสำหรับตรวจสอบ JWT
export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, SECRET_KEY) as UserPayload;
  } catch (error) {
    console.error("Registration error:", error);
    return null; // Token ไม่ถูกต้องหรือไม่ถูกต้อง
  }
};

// ฟังก์ชันสำหรับตั้งค่า cookie (สำหรับ Token)
export const setAuthCookie = (token: string) => {
  return serialize('auth_token', token, {
    httpOnly: true, // ป้องกันการเข้าถึงจาก JavaScript ในฝั่ง client
    secure: process.env.NODE_ENV === 'production', // ใช้ HTTPS ใน production
    maxAge: 60 * 60, // 1 ชั่วโมง (ตรงกับ expiresIn ของ JWT)
    path: '/', // ใช้ได้ทุก path
  });
};

// ฟังก์ชันสำหรับลบ cookie
export const clearAuthCookie = () => {
  return serialize('auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0, // ตั้งค่าเป็น 0 เพื่อลบ cookie ทันที
    path: '/',
  });
};