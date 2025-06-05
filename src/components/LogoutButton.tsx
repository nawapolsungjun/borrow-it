"use client"; 

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, message } from 'antd'; 
import { LogoutOutlined } from '@ant-design/icons'; 

interface LogoutButtonProps {
  className?: string;
  buttonText?: string; 
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
// ออกจากระบบให้เปลี่ยนเส้นทางไปหน้า Login
      if (response.ok) {
        message.success('ออกจากระบบสำเร็จ');
        router.push('/login'); 
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
      type="primary" 
      danger // สีแดง
      icon={<LogoutOutlined />} // ใส่ไอคอน
      onClick={handleLogout}
      className={className}
    >
      {buttonText}
    </Button>
  );
};

export default LogoutButton;