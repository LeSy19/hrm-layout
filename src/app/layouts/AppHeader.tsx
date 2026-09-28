'use client';

import React from 'react';
import {
    Layout,
    Dropdown,
    Avatar,
    Typography,
    Badge,
    Divider,
} from 'antd';

import {
    UserOutlined,
    LogoutOutlined,
    SettingOutlined,
    BellOutlined,
    DownOutlined,
} from '@ant-design/icons';

import type { MenuProps } from 'antd';
import { useAuth } from '@/hooks/useAuth';

const { Header } = Layout;
const { Text } = Typography;

export const AppHeader: React.FC = () => {
    const { logout } = useAuth();

    const currentUser =
        typeof window !== 'undefined'
            ? JSON.parse(localStorage.getItem('user_info') || '{}')
            : {};

    const userName =
        currentUser?.fullName ||
        currentUser?.username ||
        'Admin User';

    const userRole =
        currentUser?.roleName ||
        currentUser?.role?.name ||
        'Administrator';

    // =========================
    // USER DROPDOWN
    // =========================

    const items: MenuProps['items'] = [
        {
            key: 'account',
            label: (
                <div style={{ padding: '8px 4px' }}>
                    <div
                        style={{
                            fontWeight: 600,
                            fontSize: 14,
                            color: '#262626',
                        }}
                    >
                        {userName}
                    </div>

                    <div
                        style={{
                            fontSize: 12,
                            color: '#8c8c8c',
                            marginTop: 3,
                        }}
                    >
                        {userRole}
                    </div>
                </div>
            ),
            disabled: true,
        },

        {
            type: 'divider',
        },

        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Thông tin tài khoản',
        },

        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Cài đặt',
        },

        {
            type: 'divider',
        },

        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            danger: true,
            onClick: () => logout(),
        },
    ];

    return (
        <Header
            style={{
                height: 72,
                padding: '0 28px',
                background: '#ffffff',
                borderBottom: '1px solid #f0f0f0',

                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',

                boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
            }}
        >
            {/* =========================
                RIGHT ACTIONS
            ========================= */}

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 18,
                }}
            >
                {/* Notification */}

                <div
                    className="header-icon-button"
                    style={{
                        width: 38,
                        height: 38,
                        borderRadius: 8,

                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',

                        cursor: 'pointer',

                        color: '#595959',

                        transition: 'all 0.2s ease',
                    }}
                >
                    <Badge
                        count={0}
                        size="small"
                        offset={[-2, 2]}
                    >
                        <BellOutlined
                            style={{
                                fontSize: 19,
                            }}
                        />
                    </Badge>
                </div>

                {/* Divider */}

                <Divider
                    orientation="vertical"
                    style={{
                        height: 30,
                        margin: 0,
                    }}
                />

                {/* User */}

                <Dropdown
                    menu={{ items }}
                    placement="bottomRight"
                    trigger={['click']}
                >
                    <div
                        className="header-user"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,

                            padding: '6px 9px',
                            borderRadius: 10,

                            cursor: 'pointer',

                            transition: 'all 0.2s ease',
                        }}
                    >
                        {/* Avatar */}

                        <Avatar
                            size={40}
                            icon={<UserOutlined />}
                            style={{
                                background:
                                    'linear-gradient(135deg, #f2a900, #d48806)',

                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',

                                fontSize: 17,

                                boxShadow:
                                    '0 3px 8px rgba(242, 169, 0, 0.18)',
                            }}
                        />

                        {/* User information */}

                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                lineHeight: 1.2,
                                minWidth: 100,
                            }}
                        >
                            <Text
                                strong
                                style={{
                                    fontSize: 14,
                                    color: '#262626',
                                }}
                            >
                                {userName}
                            </Text>

                            <Text
                                type="secondary"
                                style={{
                                    fontSize: 11,
                                    marginTop: 3,
                                }}
                            >
                                {userRole}
                            </Text>
                        </div>

                        <DownOutlined
                            style={{
                                fontSize: 10,
                                color: '#8c8c8c',
                                marginLeft: 3,
                            }}
                        />
                    </div>
                </Dropdown>
            </div>
        </Header>
    );
};

export default AppHeader;