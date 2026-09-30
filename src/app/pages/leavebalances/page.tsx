'use client';

import React, { useEffect, useState } from 'react';
import MainLayout from '@/app/layouts/MainLayout';
import LeaveBalanceHeader from '@/app/pages/leavebalances/components/LeaveBalanceHeader';
import LeaveBalanceGrid from '@/app/pages/leavebalances/components/LeaveBalanceGrid';
import { getCurrentUser, UserInfo } from '@/utils/auth.util';

export default function LeaveBalancePage() {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [isAssignDrawerOpen, setIsAssignDrawerOpen] = useState<boolean>(false);
    const [isBulkDrawerOpen, setIsBulkDrawerOpen] = useState<boolean>(false);
    const [refreshKey, setRefreshKey] = useState<number>(0);


    const [user, setUser] = useState<UserInfo | null>(null);
    const [isUserLoaded, setIsUserLoaded] = useState(false);

    useEffect(() => {
        const currentUser = getCurrentUser();

        setUser(currentUser);
        setIsUserLoaded(true);
    }, []);

    const isAdminOrManager =
        isUserLoaded &&
        (
            user?.roleName?.toUpperCase() === 'ADMIN' ||
            user?.roleName?.toUpperCase() === 'MANAGER'
        );

    const handleRefresh = () => {
        setRefreshKey((prev) => prev + 1);
    };

    return (
        <MainLayout>
            <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
                <h1 className="text-xl mb-3 font-bold text-gray-800">Quản Lý Số Dư Phép (Leave Balance)</h1>

                {/* 1. Header bao gồm Tìm kiếm, Lọc năm & Nút chức năng Phân quyền */}
                <LeaveBalanceHeader
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    selectedYear={selectedYear}
                    onYearChange={setSelectedYear}
                    isAdminOrManager={isAdminOrManager}
                    onOpenAssignDrawer={() => setIsAssignDrawerOpen(true)}
                    onOpenBulkDrawer={() => setIsBulkDrawerOpen(true)}
                    onRefresh={handleRefresh}
                />

                {/* 2. Grid bao gồm AG Grid Phân trang Paginated, Chia Tab & Drawers */}
                <LeaveBalanceGrid
                    searchTerm={searchTerm}
                    selectedYear={selectedYear}
                    isAssignDrawerOpen={isAssignDrawerOpen}
                    setIsAssignDrawerOpen={setIsAssignDrawerOpen}
                    isBulkDrawerOpen={isBulkDrawerOpen}
                    setIsBulkDrawerOpen={setIsBulkDrawerOpen}
                    refreshKey={refreshKey}
                    onRefresh={handleRefresh}
                />
            </div>
        </MainLayout>
    );
}