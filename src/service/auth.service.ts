import apiClient, { setAccessToken } from '@/lib/axiosClient';

export interface LoginFormValues {
    username: string;
    password?: string;
}

export interface LoginResponse {
    user: {
        userId: string;
        username: string;
        email: string;
        roleName: string;
    };
    accessToken: string;
}

export const authService = {
    login: async (values: LoginFormValues): Promise<LoginResponse> => {
        // Do axiosClient interceptor đã unwrap (trả về thẳng response.data),
        // nên response ở đây chính là dữ liệu LoginResponse từ Backend.
        const response = await apiClient.post<any, LoginResponse>('/auth/login', values);

        if (response?.accessToken) {
            // 1. Lưu vào bộ nhớ RAM của Axios Client để đính kèm Request ngay lập tức
            setAccessToken(response.accessToken);

            // 2. Lưu vào localStorage để duy trì khi F5 trang
            if (typeof window !== 'undefined') {
                localStorage.setItem('access_token', response.accessToken);

                if (response.user) {
                    localStorage.setItem(
                        'user_info',
                        JSON.stringify({
                            userId: response.user.userId,
                            username: response.user.username,
                            email: response.user.email,
                            roleName: response.user.roleName,
                        })
                    );
                }
            }
        }

        return response;
    },

    logout: async () => {
        // Gọi Backend để xóa HttpOnly Cookie Refresh Token
        try {
            await apiClient.post('/auth/logout');
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            // Cập nhật lại bộ nhớ RAM trong Axios Client
            setAccessToken(null);

            // Xóa sạch LocalStorage ở Frontend
            if (typeof window !== 'undefined') {
                localStorage.removeItem('access_token');
                localStorage.removeItem('user_info');
            }
        }
    },
};