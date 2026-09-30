import apiClient, { setAccessToken } from '@/lib/axiosClient';

export interface LoginFormValues {
    username: string;
    password?: string;
}

export interface LoginResponse {
    accessToken: string;
    userId: number;
    username: string;
    email: string;
    roleName: string;
    expiresAt: string;
}

export const authService = {
    login: async (
        values: LoginFormValues
    ): Promise<LoginResponse> => {

        const response = await apiClient.post<any, LoginResponse>(
            '/auth/login',
            values
        );
        /*
         * Lưu thông tin user
         *
         * KHÔNG đặt bên trong if(accessToken)
         * vì backend hiện tại trả accessToken = ""
         */
        if (typeof window !== 'undefined') {
            localStorage.setItem(
                'user_info',
                JSON.stringify({
                    userId: response.userId,
                    username: response.username,
                    email: response.email,
                    roleName: response.roleName,
                })
            );
        }

        /*
         * Nếu backend có trả accessToken thì lưu.
         * Hiện tại backend đang trả "" nên đoạn này không làm gì.
         */
        if (response?.accessToken) {
            setAccessToken(response.accessToken);
        }

        return response;
    },

    logout: async () => {
        try {
            await apiClient.post('/auth/logout');
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            setAccessToken(null);

            if (typeof window !== 'undefined') {
                localStorage.removeItem('user_info');
                localStorage.removeItem('access_token');
            }
        }
    },
};