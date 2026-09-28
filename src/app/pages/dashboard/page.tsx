'use client';

import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Spin } from 'antd';
import { TeamOutlined, ApartmentOutlined, CalendarOutlined } from '@ant-design/icons';
import MainLayout from '@/app/layouts/MainLayout';
import { formatDateVN } from '@/utils/day.util';
import { APP_ROUTES } from '@/constants/routes';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/service/auth.service';

interface UserInfo {
    username: string;
    email: string;
    roleName: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const pathname = usePathname();
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);

    // State quản lý Menu đang chọn (mặc định lấy theo pathname hoặc APP_ROUTES.DASHBOARD)
    const [selectedKey, setSelectedKey] = useState<string>(pathname || APP_ROUTES.DASHBOARD);

    useEffect(() => {
        // Kiểm tra xác thực (Authentication Check)
        const token = localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('user_info');

        if (!token) {
            router.push('/auth/login');
            return;
        }

        if (storedUser) {
            try {
                setUserInfo(JSON.parse(storedUser));
            } catch (e) {
                console.error('Lỗi parse user_info', e);
            }
        }

        setLoading(false);
    }, [router]);

    // Đồng bộ menu active mỗi khi URL thay đổi
    useEffect(() => {
        if (pathname) {
            setSelectedKey(pathname);
        }
    }, [pathname]);

    // Xử lý Đăng xuất
    const handleLogout = () => {
        authService.logout();
        router.push('/auth/login');
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" description="Đang tải dữ liệu Dashboard..." />
            </div>
        );
    }


    return (
        <MainLayout>

            <>
                {/* Thẻ Thống kê tổng quan */}
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card style={{ borderRadius: 8 }}>
                            <Statistic title="Tổng nhân sự" value={128} prefix={<TeamOutlined style={{ color: '#1677ff' }} />} />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card style={{ borderRadius: 8 }}>
                            <Statistic title="Phòng ban" value={8} prefix={<ApartmentOutlined style={{ color: '#52c41a' }} />} />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card style={{ borderRadius: 8 }}>
                            <Statistic title="Đơn phép chờ duyệt" value={5} prefix={<CalendarOutlined style={{ color: '#faad14' }} />} />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card style={{ borderRadius: 8 }}>
                            <Statistic title="Múi giờ hệ thống" value="UTC+7 (VN)" />
                        </Card>
                    </Col>
                </Row>

                {/* Khối Thông tin chi tiết */}
                <Card title="Thông tin phiên đăng nhập hiện tại" style={{ marginTop: 24, borderRadius: 8 }}>
                    <p><strong>Tài khoản:</strong> {userInfo?.username}</p>
                    <p><strong>Email:</strong> {userInfo?.email}</p>
                    <p><strong>Vai trò (Role):</strong> {userInfo?.roleName}</p>
                    <p><strong>Thời gian truy cập:</strong> {formatDateVN(new Date())}</p>
                </Card>
            </>

        </MainLayout>
    );
}
