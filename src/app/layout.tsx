import React from 'react';
import { App as AntdApp } from 'antd';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import '@/app/globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <AntdRegistry>
          <AntdApp>
            {children}
          </AntdApp>
        </AntdRegistry>
      </body>
    </html>
  );
}