// src/hooks/useAxios.ts
'use client';

import { useState, useCallback } from 'react';

export function useAxios<T>() {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<any>(null);

    const execute = useCallback(async (apiCallFn: () => Promise<T>) => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiCallFn();
            setData(res);
            return res;
        } catch (err: any) {
            setError(err);
            // Không `throw err` nữa để tránh unhandledRejection trên giao diện
            console.error('API Error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { data, loading, error, execute };
}