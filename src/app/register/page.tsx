"use client";

import React from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Form, Input, message } from "antd";
import { useRouter } from "next/navigation";

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const [form] = Form.useForm(); //สำหรับการควบคุม Form component (ใช้สำหรับ reset fields)

  const onFinish = async (values: { username: string; password: string }) => {
    console.log("Registering:", values);
    try {
      // ส่งคำขอสมัครสมาชิกไปยัง API
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values), // แปลงข้อมูลที่กรอกเป็น JSON string
      });

      const data = await response.json(); // แปลง response กลับเป็น JSON
      // ตรวจสอบสถานะการตอบกลับจากเซิร์ฟเวอร์ แสดลงเป็น Log
      if (response.ok) {
        message.success(data.message);
        console.log("Registration successful:", data.user);
        form.resetFields();
        router.push("/login");
      } else {
        message.error(data.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก");
        console.error("Registration failed:", data.message);
      }
    } catch (error) {
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
          สมัครสมาชิก
        </h2>
        <Form
          form={form}
          name="register"
          initialValues={{ remember: true }}
          style={{ maxWidth: 360 }}
          onFinish={onFinish} // กำหนดฟังก์ชันที่จะทำงานเมื่อฟอร์มถูกส่ง
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
          <Form.Item
            name="confirm"
            dependencies={["password"]}
            hasFeedback
            rules={[
              {
                required: true,
                message: "Please confirm your password!",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  // ตรวจสอบว่าค่าในช่อง confirm password ตรงกับช่อง password หรือไม่
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(
                      // ถ้าไม่ตรงกัน ให้แสดงข้อความผิดพลาด
                      "The two passwords that you entered do not match!"
                    )
                  );
                },
              }),
            ]}
          >
            <Input
              prefix={<LockOutlined />}
              type="password"
              placeholder="Confirm Password"
            />
          </Form.Item>
          <Form.Item>
            <Button block type="primary" htmlType="submit">
              Register
            </Button>
            <div className="mt-5 text-center">
              or <a href="/login">Already have an account? Log in!</a>
            </div>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default RegisterPage;
