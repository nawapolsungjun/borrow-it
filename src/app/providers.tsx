// app/providers.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import React from 'react';
import { Session } from 'next-auth'; // <--- เพิ่มการนำเข้า Session Type

interface ProvidersProps {
  children: React.ReactNode;
  session: Session | null; // <--- เปลี่ยนจาก any เป็น Session | null
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
}