import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import '@/lib/fontawesome';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "多语言学习中台",
  description: "专业的语言学习系统，助力你的语言学习之旅",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
