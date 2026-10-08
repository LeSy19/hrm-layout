'use client';

import React from 'react';
import { Layout, Result, Spin } from 'antd';
import { usePathname } from 'next/navigation';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import { APP_ROUTES } from '@/constants/routes';
import { PermissionProvider, usePermission } from '@/hooks/usePermission';
import { getRequiredEndpoint } from '@/constants/menuPermission';

const { Content } = Layout;

/** Chặn truy cập trực tiếp bằng URL vào trang mà role không được cấp quyền */
const AccessGuard = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const { loading, isAdmin, can } = usePermission();

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
                <Spin size="large" />
            </div>
        );
    }

    const adminOnly = pathname === APP_ROUTES.PERMISSIONS;
    const endpoint = getRequiredEndpoint(pathname);
    const allowed = adminOnly ? isAdmin : !endpoint || can('GET', endpoint);

    if (!allowed) {
        return (
            <Result
                status="403"
                title="403"
                subTitle="Bạn không có quyền truy cập trang này."
            />
        );
    }

    return <>{children}</>;
};

export const MainLayout = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    return (
        <PermissionProvider>
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
                        <AccessGuard>{children}</AccessGuard>
                    </Content>
                </Layout>
            </Layout>
        </PermissionProvider>
    );
};

export default MainLayout;
