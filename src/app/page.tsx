"use client"
import React from 'react';
import type { FormProps } from 'antd';
import { Button, Checkbox, Form, Input } from 'antd';
import { login } from './action';

type FieldType = {
  username: string;
  password: string;
  remember: string;
};

const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
  console.log('Success:', values);
  const isLogin = await login(values.username, values.password)
  if (isLogin) {
    alert('Login Success')
  } else {
    alert('Login Failed')
  }
};

const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
  console.log('Failed:', errorInfo);
};

const LoginPage: React.FC = () => (
  <div className='min-h-screen flex items-center justify-center bg-blue-500 p-4'>
    <div className='bg-white p-8 rounded-2xl shadow-xl w-full max-w-md'>
      <h2 className='text-3xl font-bold text-center mb-6'>เข้าสู่ระบบ</h2>
      <Form
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item<FieldType>
          label="Username"
          name="username"
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item<FieldType>
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item<FieldType> name="remember" valuePropName="checked" label={null}>
          <Checkbox>จดจำฉัน</Checkbox>
        </Form.Item>

        <Form.Item label={null}>
          <Button type="primary" htmlType="submit">
            บันทึก
          </Button>
        </Form.Item>
      </Form>
    </div>
  </div>
);

export default LoginPage;

