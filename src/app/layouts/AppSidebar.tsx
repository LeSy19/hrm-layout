'use client';

import React, { useMemo, useState } from 'react';
import { Layout, Menu, Button, Tooltip, ConfigProvider } from 'antd';
import type { MenuProps } from 'antd';

import {
    DashboardOutlined,
    ApartmentOutlined,
    TeamOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    IdcardOutlined,
    TagsFilled,
    AccountBookFilled,
    CalendarOutlined,
    FileTextOutlined,
    ClockCircleOutlined,
    BarChartOutlined,
    SafetyCertificateOutlined,
    CloseOutlined,
} from '@ant-design/icons';

import { useRouter, usePathname } from 'next/navigation';
import { APP_ROUTES } from '@/constants/routes';
import { ROUTE_ENDPOINT } from '@/constants/menuPermission';
import { usePermission } from '@/hooks/usePermission';

const { Sider } = Layout;

interface NavItem {
    key: string;
    label: string;
    icon: React.ReactNode;
    adminOnly?: boolean;
    children?: NavItem[];
}

const NAV_ITEMS: NavItem[] = [
    {
        key: APP_ROUTES.DASHBOARD,
        label: 'Tổng quan',
        icon: <DashboardOutlined />,
    },
    {
        key: APP_ROUTES.DEPARTMENT,
        label: 'Phòng ban',
        icon: <ApartmentOutlined />,
    },
    {
        key: APP_ROUTES.EMPLOYEES,
        label: 'Nhân viên',
        icon: <TeamOutlined />,
    },
    {
        key: APP_ROUTES.JOBTITLES,
        label: 'Vị trí công việc',
        icon: <IdcardOutlined />,
    },
    {
        key: APP_ROUTES.LEAVETYPES,
        label: 'Loại nghỉ phép',
        icon: <TagsFilled />,
    },
    {
        key: APP_ROUTES.LEAVEBALANCES,
        label: 'Số dư phép',
        icon: <AccountBookFilled />,
    },
    {
        key: APP_ROUTES.LEAVEREQUESTS,
        label: 'Quản lý nghỉ phép',
        icon: <CalendarOutlined />,
        children: [
            {
                key: APP_ROUTES.MY_REQUEST,
                label: 'Đơn của tôi',
                icon: <FileTextOutlined />,
            },
            {
                key: APP_ROUTES.PENDING_REQUEST,
                label: 'Đơn chờ duyệt',
                icon: <ClockCircleOutlined />,
            },
            {
                key: APP_ROUTES.UNPAID_SUMMARY,
                label: 'Thống kê nghỉ không lương',
                icon: <BarChartOutlined />,
            },
        ],
    },
    {
        key: APP_ROUTES.PERMISSIONS,
        label: 'Phân quyền',
        icon: <SafetyCertificateOutlined />,
        adminOnly: true,
    },
];

export const AppSidebar: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();

    const { loading, isAdmin, can } = usePermission();

    const [collapsed, setCollapsed] = useState(false);

    /**
     * Kiểm tra permission của menu
     */
    const isVisible = (item: NavItem) => {
        if (item.adminOnly) {
            return isAdmin;
        }

        const endpoint = ROUTE_ENDPOINT[item.key];

        if (!endpoint) {
            return true;
        }

        return can('GET', endpoint);
    };

    /**
     * Tạo menu theo permission
     */
    const menuItems = useMemo<MenuProps['items']>(() => {
        if (loading) {
            return [];
        }

        const result: MenuProps['items'] = [];

        for (const item of NAV_ITEMS) {
            /**
             * ==============================
             * MENU CÓ CHILDREN
             * ==============================
             */
            if (item.children) {
                const visibleChildren = item.children.filter(isVisible);

                if (visibleChildren.length === 0) {
                    continue;
                }

                result.push({
                    key: item.key,

                    icon: (
                        <Tooltip
                            title={collapsed ? item.label : undefined}
                            placement="right"
                        >
                            <span
                                className="
                                    flex
                                    h-6
                                    w-6
                                    shrink-0
                                    items-center
                                    justify-center
                                    text-[18px]
                                "
                            >
                                {item.icon}
                            </span>
                        </Tooltip>
                    ),

                    label: (
                        <span className="truncate">
                            {item.label}
                        </span>
                    ),

                    children: visibleChildren.map((child) => ({
                        key: child.key,

                        icon: (
                            <span
                                className="
                                    flex
                                    h-6
                                    w-6
                                    shrink-0
                                    items-center
                                    justify-center
                                    text-[17px]
                                "
                            >
                                {child.icon}
                            </span>
                        ),

                        label: (
                            <span className="truncate">
                                {child.label}
                            </span>
                        ),
                    })),
                });

                continue;
            }

            /**
             * ==============================
             * MENU THƯỜNG
             * ==============================
             */
            if (!isVisible(item)) {
                continue;
            }

            result.push({
                key: item.key,

                icon: (
                    <Tooltip
                        title={collapsed ? item.label : undefined}
                        placement="right"
                    >
                        <span
                            className="
                                flex
                                h-6
                                w-6
                                shrink-0
                                items-center
                                justify-center
                                text-[18px]
                            "
                        >
                            {item.icon}
                        </span>
                    </Tooltip>
                ),

                label: (
                    <span className="truncate">
                        {item.label}
                    </span>
                ),
            });
        }

        return result;
    }, [loading, isAdmin, can, collapsed]);

    /**
     * Xác định menu cha cần mở
     */
    const defaultOpenKeys = useMemo(() => {
        const leaveRoutes = [
            APP_ROUTES.MY_REQUEST,
            APP_ROUTES.PENDING_REQUEST,
            APP_ROUTES.UNPAID_SUMMARY,
        ];

        if (leaveRoutes.includes(pathname)) {
            return [APP_ROUTES.LEAVEREQUESTS];
        }

        return [];
    }, [pathname]);

    /**
     * Click menu
     */
    const handleMenuClick = ({ key }: { key: string }) => {
        router.push(key);
    };

    return (
        <Sider
            width={260}
            collapsedWidth={76}
            collapsed={collapsed}
            theme="light"
            trigger={null}
            breakpoint="lg"
            onBreakpoint={(broken) => {
                setCollapsed(broken);
            }}
            className="
                !sticky
                !top-0
                !left-0
                !h-screen
                !min-h-screen
                !overflow-hidden
                !bg-white
                border-r
                border-gray-200
                shadow-sm
            "
        >
            <div className="flex h-full min-h-0 flex-col bg-white">

                {/* =====================================================
                    HEADER / BRAND
                ====================================================== */}
                <div
                    className={`
                        flex
                        h-[76px]
                        shrink-0
                        items-center
                        border-b
                        border-gray-100
                        px-3
                        transition-all
                        duration-200
                        ${collapsed ? 'justify-center' : 'gap-3 px-4'}
                    `}
                >
                    {/* Logo */}
                    <div
                        className="
                            flex
                            h-11
                            w-11
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            bg-gradient-to-br
                            from-blue-600
                            to-indigo-600
                            text-sm
                            font-bold
                            tracking-wide
                            text-white
                            shadow-md
                            shadow-blue-500/20
                        "
                    >
                        HR
                    </div>

                    {/* Brand */}
                    {!collapsed && (
                        <div className="min-w-0">
                            <div className="truncate text-[17px] font-bold text-gray-800">
                                CoreHR
                            </div>

                            <div className="mt-0.5 truncate text-[11px] font-medium uppercase tracking-wider text-gray-400">
                                Human Resource
                            </div>
                        </div>
                    )}
                </div>

                {/* =====================================================
                    TOGGLE
                ====================================================== */}
                <div
                    className={`
                        flex
                        h-[58px]
                        shrink-0
                        items-center
                        border-b
                        border-gray-100
                        px-3
                        ${collapsed ? 'justify-center' : 'justify-end'}
                    `}
                >
                    <Tooltip
                        title={
                            collapsed
                                ? 'Mở rộng sidebar'
                                : 'Thu gọn sidebar'
                        }
                        placement="right"
                    >
                        <Button
                            type="text"
                            onClick={() => setCollapsed((prev) => !prev)}
                            icon={
                                collapsed ? (
                                    <MenuUnfoldOutlined />
                                ) : (
                                    <MenuFoldOutlined />
                                )
                            }
                            className="
                                !flex
                                !h-9
                                !w-9
                                !items-center
                                !justify-center
                                !rounded-lg
                                !text-gray-500
                                hover:!bg-blue-50
                                hover:!text-blue-600
                            "
                        />
                    </Tooltip>
                </div>

                {/* =====================================================
                    NAVIGATION
                ====================================================== */}
                <div
                    className="
                        min-h-0
                        flex-1
                        overflow-y-auto
                        overflow-x-hidden
                        px-3
                        py-4

                        [&::-webkit-scrollbar]:w-1.5
                        [&::-webkit-scrollbar-track]:bg-transparent
                        [&::-webkit-scrollbar-thumb]:rounded-full
                        [&::-webkit-scrollbar-thumb]:bg-gray-200
                        hover:[&::-webkit-scrollbar-thumb]:bg-gray-300
                    "
                >
                    {!collapsed && (
                        <div
                            className="
                                mb-2
                                px-3
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-[0.12em]
                                text-gray-400
                            "
                        >
                            Navigation
                        </div>
                    )}

                    <ConfigProvider
                        theme={{
                            components: {
                                Menu: {
                                    itemHeight: 46,
                                    itemBorderRadius: 10,

                                    itemColor: '#6b7280',
                                    itemHoverColor: '#2563eb',
                                    itemHoverBg: '#eff6ff',

                                    itemSelectedColor: '#2563eb',
                                    itemSelectedBg: '#eff6ff',

                                    itemActiveBg: '#eff6ff',

                                    subMenuItemBg: '#ffffff',

                                    groupTitleColor: '#9ca3af',
                                },
                            },
                        }}
                    >
                        <Menu
                            mode="inline"
                            selectedKeys={[pathname]}
                            defaultOpenKeys={defaultOpenKeys}
                            items={menuItems}
                            inlineCollapsed={collapsed}
                            onClick={handleMenuClick}
                            className="
                                !border-0
                                !bg-transparent

                                /* =============================
                                   MENU ITEM
                                ============================== */
                                [&_.ant-menu-item]:!mb-1
                                [&_.ant-menu-item]:!font-medium

                                /* Icon luôn cùng kích thước */
                                [&_.ant-menu-item_.ant-menu-item-icon]:!flex
                                [&_.ant-menu-item_.ant-menu-item-icon]:!h-6
                                [&_.ant-menu-item_.ant-menu-item-icon]:!w-6
                                [&_.ant-menu-item_.ant-menu-item-icon]:!items-center
                                [&_.ant-menu-item_.ant-menu-item-icon]:!justify-center
                                [&_.ant-menu-item_.ant-menu-item-icon]:!mr-3

                                /* =============================
                                   SUBMENU
                                ============================== */
                                [&_.ant-menu-submenu-title]:!mb-1
                                [&_.ant-menu-submenu-title]:!font-medium

                                [&_.ant-menu-submenu-title_.ant-menu-item-icon]:!flex
                                [&_.ant-menu-submenu-title_.ant-menu-item-icon]:!h-6
                                [&_.ant-menu-submenu-title_.ant-menu-item-icon]:!w-6
                                [&_.ant-menu-submenu-title_.ant-menu-item-icon]:!items-center
                                [&_.ant-menu-submenu-title_.ant-menu-item-icon]:!justify-center
                                [&_.ant-menu-submenu-title_.ant-menu-item-icon]:!mr-3

                                /* =============================
                                   SELECTED
                                ============================== */
                                [&_.ant-menu-item-selected]:!font-semibold

                                [&_.ant-menu-submenu-selected>.ant-menu-submenu-title]:!text-blue-600

                                /* =============================
                                   SUBMENU BACKGROUND
                                ============================== */
                                [&_.ant-menu-submenu-inline>.ant-menu-sub]:!bg-gray-50
                                [&_.ant-menu-submenu-inline>.ant-menu-sub]:!rounded-xl
                                [&_.ant-menu-submenu-inline>.ant-menu-sub]:!py-1

                                /* =============================
                                   COLLAPSED
                                   ICON CĂN GIỮA 1 TRỤC
                                ============================== */
                                [&.ant-menu-inline-collapsed]:!w-full

                                [&.ant-menu-inline-collapsed_.ant-menu-item]:!px-0
                                [&.ant-menu-inline-collapsed_.ant-menu-item]:!mx-0
                                [&.ant-menu-inline-collapsed_.ant-menu-item]:!w-full

                                [&.ant-menu-inline-collapsed_.ant-menu-submenu-title]:!px-0
                                [&.ant-menu-inline-collapsed_.ant-menu-submenu-title]:!mx-0
                                [&.ant-menu-inline-collapsed_.ant-menu-submenu-title]:!w-full

                                [&.ant-menu-inline-collapsed_.ant-menu-item-icon]:!mr-0

                                [&.ant-menu-inline-collapsed_.ant-menu-item-icon]:!h-6
                                [&.ant-menu-inline-collapsed_.ant-menu-item-icon]:!w-6

                                [&.ant-menu-inline-collapsed_.ant-menu-item-icon]:!flex
                                [&.ant-menu-inline-collapsed_.ant-menu-item-icon]:!items-center
                                [&.ant-menu-inline-collapsed_.ant-menu-item-icon]:!justify-center

                                [&.ant-menu-inline-collapsed_.ant-menu-submenu-title]:!flex
                                [&.ant-menu-inline-collapsed_.ant-menu-submenu-title]:!items-center
                                [&.ant-menu-inline-collapsed_.ant-menu-submenu-title]:!justify-center

                                /* Ẩn text khi collapsed */
                                [&.ant-menu-inline-collapsed_.ant-menu-title-content]:!hidden
                            "
                        />
                    </ConfigProvider>
                </div>

                {/* =====================================================
                    FOOTER
                ====================================================== */}
                <div
                    className="
                        shrink-0
                        border-t
                        border-gray-100
                        bg-gray-50/70
                        p-3
                    "
                >
                    <div
                        className={`
                            flex
                            items-center
                            rounded-xl
                            border
                            border-gray-100
                            bg-white
                            px-3
                            py-2.5
                            shadow-sm
                            ${collapsed ? 'justify-center' : 'gap-2.5'}
                        `}
                    >
                        {/* Online */}
                        <span className="relative flex h-2.5 w-2.5 shrink-0">
                            <span
                                className="
                                    absolute
                                    inline-flex
                                    h-full
                                    w-full
                                    animate-ping
                                    rounded-full
                                    bg-emerald-400
                                    opacity-50
                                "
                            />

                            <span
                                className="
                                    relative
                                    inline-flex
                                    h-2.5
                                    w-2.5
                                    rounded-full
                                    bg-emerald-500
                                "
                            />
                        </span>

                        {!collapsed && (
                            <div className="min-w-0">
                                <div className="text-xs font-semibold text-gray-700">
                                    System Online
                                </div>

                                <div className="text-[10px] text-gray-400">
                                    All services operational
                                </div>
                            </div>
                        )}
                    </div>

                    {!collapsed && (
                        <div
                            className="
                                mt-3
                                truncate
                                text-center
                                text-[10px]
                                font-medium
                                text-gray-400
                            "
                        >
                            CoreHR Management System
                        </div>
                    )}
                </div>
            </div>
        </Sider>
    );
};

export default AppSidebar;