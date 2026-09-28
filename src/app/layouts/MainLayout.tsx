'use client';

import React from 'react';
import { Layout } from 'antd';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';

const { Content } = Layout;

export const MainLayout = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <AppSidebar />

            <Layout>
                <AppHeader />

                <Content
                    style={{
                        padding: '24px',
                        background: '#f7f7f8',
                        minHeight: 'calc(100vh - 72px)',
                    }}
                >
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;