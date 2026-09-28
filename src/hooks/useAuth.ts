'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { message } from 'antd';
import { authService, LoginFormValues } from '@/service/auth.service';
import { APP_ROUTES } from '@/constants/routes';

export function useAuth() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const login = async (values: LoginFormValues) => {
        setLoading(true);
        try {
            await authService.login(values);
            message.success('Đăng nhập thành công!');
            router.push(APP_ROUTES.DASHBOARD);
        } catch (error: any) {
            message.error(error?.message || 'Đăng nhập thất bại!');
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
            message.success('Đã đăng xuất');
            router.push(APP_ROUTES.LOGIN);
        } catch (error) {
            message.error('Có lỗi xảy ra khi đăng xuất');
        }
    };

    return { login, logout, loading };
}