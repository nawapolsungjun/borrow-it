// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

// ไม่ต้อง import อะไรเพิ่มเติมที่นี่ เพราะ type augmentation จะถูกโหลดโดย TypeScript
// และทำให้ global.prisma ถูกรู้จักแล้ว

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  // Ensure the PrismaClient is reused in development to prevent too many connections
  // TypeScript จะรู้จัก global.prisma แล้วจากการประกาศใน global.d.ts
  if (!(global as unknown as { prisma: PrismaClient }).prisma) { // Alternative: Cast to unknown then to specific type
  // หรือแค่
  // if (!global.prisma) {
    (global as unknown as { prisma: PrismaClient }).prisma = new PrismaClient()
  }
  prisma = (global as unknown as { prisma: PrismaClient }).prisma
}

export default prisma