'use client';

import React, { useState } from 'react';
import { Layout, Menu, Button, Tooltip } from 'antd';

import {
    DashboardOutlined,
    ApartmentOutlined,
    TeamOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
} from '@ant-design/icons';

import { useRouter, usePathname } from 'next/navigation';
import { APP_ROUTES } from '@/constants/routes';

const { Sider } = Layout;

export const AppSidebar: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();

    const [collapsed, setCollapsed] = useState(false);

    const menuItems = [
        {
            key: APP_ROUTES.DASHBOARD,
            icon: (
                <Tooltip
                    title={collapsed ? 'Tổng quan' : ''}
                    placement="right"
                >
                    <DashboardOutlined />
                </Tooltip>
            ),
            label: 'Tổng quan',
        },
        {
            key: APP_ROUTES.DEPARTMENT,
            icon: (
                <Tooltip
                    title={collapsed ? 'Phòng ban' : ''}
                    placement="right"
                >
                    <ApartmentOutlined />
                </Tooltip>
            ),
            label: 'Phòng ban',
        },
        {
            key: APP_ROUTES.EMPLOYEES,
            icon: (
                <Tooltip
                    title={collapsed ? 'Nhân viên' : ''}
                    placement="right"
                >
                    <TeamOutlined />
                </Tooltip>
            ),
            label: 'Nhân viên',
        },
    ];

    return (
        <Sider
            width={250}
            collapsedWidth={72}
            collapsed={collapsed}
            theme="light"
            className="corehr-sidebar"
        >
            {/* =================================
                BRAND
            ================================= */}

            <div className="sidebar-brand">
                <div className="sidebar-brand-logo">
                    HR
                </div>

                {!collapsed && (
                    <div className="sidebar-brand-info">
                        <div className="sidebar-brand-title">
                            CoreHR
                        </div>

                        <div className="sidebar-brand-subtitle">
                            Human Resource
                        </div>
                    </div>
                )}
            </div>

            {/* =================================
                HAMBURGER
            ================================= */}

            <div
                className={
                    collapsed
                        ? 'sidebar-toggle-wrapper collapsed'
                        : 'sidebar-toggle-wrapper'
                }
            >
                <Button
                    type="text"
                    className="sidebar-toggle"
                    icon={
                        collapsed ? (
                            <MenuUnfoldOutlined />
                        ) : (
                            <MenuFoldOutlined />
                        )
                    }
                    onClick={() => setCollapsed(!collapsed)}
                />
            </div>

            {/* =================================
                NAVIGATION
            ================================= */}

            <div className="sidebar-navigation">
                <Menu
                    mode="inline"
                    selectedKeys={[pathname]}
                    items={menuItems}
                    onClick={({ key }) => router.push(key)}
                />
            </div>

            {/* =================================
                FOOTER
            ================================= */}

            <div className="sidebar-bottom">
                <div className="sidebar-status">
                    <span className="sidebar-status-dot" />

                    {!collapsed && (
                        <span>System Online</span>
                    )}
                </div>

                {!collapsed && (
                    <div className="sidebar-footer-text">
                        CoreHR Management System
                    </div>
                )}
            </div>
        </Sider>
    );
};

export default AppSidebar;