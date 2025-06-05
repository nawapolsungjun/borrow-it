// components/LogoutButton.tsx
"use client"; // ทำให้เป็น Client Component

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, message } from 'antd'; // นำเข้า Button และ message
import { LogoutOutlined } from '@ant-design/icons'; // ไอคอนสำหรับ Logout

interface LogoutButtonProps {
  className?: string; // สำหรับ Tailwind CSS หรือ class อื่นๆ
  buttonText?: string; // ข้อความบนปุ่ม
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ className, buttonText = "ออกจากระบบ" }) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        message.success('ออกจากระบบสำเร็จ');
        router.push('/login'); // เปลี่ยนเส้นทางไปหน้า Login
      } else {
        const errorData = await response.json();
        message.error(errorData.message || 'ออกจากระบบไม่สำเร็จ');
      }
    } catch (error) {
      console.error('Logout error:', error);
      message.error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์เพื่อออกจากระบบ');
    }
  };

  return (
    <Button
      type="primary" // หรือ 'default', 'link' ตามดีไซน์ที่คุณต้องการ
      danger // ทำให้เป็นสีแดง
      icon={<LogoutOutlined />} // ใส่ไอคอน
      onClick={handleLogout}
      className={className}
    >
      {buttonText}
    </Button>
  );
};

export default LogoutButton;