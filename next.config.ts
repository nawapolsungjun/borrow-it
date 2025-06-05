import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   async redirects() {
    return [
      {
        source: '/',         // เมื่อผู้ใช้เข้าถึง URL Path Root (เช่น http://localhost:3000/)
        destination: '/login', // ให้ Redirect ไปยังหน้า /login
        permanent: true,     
      },
    ];
  },
};

export default nextConfig;
