"use client";

import React from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Form, Input, message } from "antd";
import { useRouter } from "next/navigation"; // นำเข้า useRouter

const LoginPage: React.FC = () => {
  const router = useRouter();

  const onFinish = async (values: { username: string; password: string }) => {
    // แสดงข้อมูลที่ผู้ใช้กรอกใน console
    console.log("Submitting:", values);
    try {
      const response = await fetch("/api/auth/login", {
        // ส่งคำขอเข้าสู่ระบบไปยัง API
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        message.success(data.message);
        console.log("Login successful:", data.user); // แสดงข้อมูลผู้ใช้ที่เข้าสู่ระบบสำเร็จ

        const userRole = data.user.role; // ดึงบทบาทผู้ใช้

        if (userRole === "ADMIN") {
          router.push("/admin");
        } else if (userRole === "USER") {
          router.push("/user");
        } else {
          router.push("/");
        }
      } else {
        // แสดงข้อความผิดพลาดใน LOg หากเข้าสู่ระบบไม่สำเร็จ
        message.error(data.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
        console.error("Login failed:", data.message);
      }
    } catch (error) {
      // จัดการข้อผิดพลาดที่เกิดจากการเชื่อมต่อเครือข่ายหรือเซิร์ฟเวอร์
      message.error("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
      console.error("Network or server error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-500 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-5xl font-bold text-center mb-6 tagesschrift-regular">
          Borrow-IT STT
        </h2>
        <h2 className="text-3xl font-bold text-center mb-6 krub-regular">
          เข้าสู่ระบบ
        </h2>
        <Form
          name="login"
          initialValues={{ remember: true }}
          style={{ maxWidth: 360 }}
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Please input your Username!" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your Password!" }]}
          >
            <Input
              prefix={<LockOutlined />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>
          <Form.Item>
            <Button block type="primary" htmlType="submit">
              Log in
            </Button>
            <div className="mt-5 text-center">
              or <a href="/register">Register now!</a>
            </div>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
