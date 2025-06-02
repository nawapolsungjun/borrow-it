// LoginPage.tsx
"use client";

import React from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Form, Input, message } from "antd";
import { useRouter } from "next/navigation"; // นำเข้า useRouter

const LoginPage: React.FC = () => {
  const router = useRouter();

  const onFinish = async (values: { username: string; password: string }) => {
    console.log("Submitting:", values);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json(); // อ่าน JSON body ก่อน

      if (response.ok) {
        message.success(data.message);
        console.log("Login successful:", data.user);

        const userRole = data.user.role;

        if (userRole === "ADMIN") {
          router.push("/admin");
        } else if (userRole === "USER") {
          router.push("/user");
        } else {
          router.push("/");
        }
      } else {
        message.error(data.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
        console.error("Login failed:", data.message);
      }
    } catch (error) {
      message.error("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
      console.error("Network or server error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-500 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6">เข้าสู่ระบบ</h2>
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
