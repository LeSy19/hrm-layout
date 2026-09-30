'use client';

import React, { useState, useEffect, useCallback } from 'react';
import MainLayout from '@/app/layouts/MainLayout';
import { SummaryCards } from './components/SummaryCards';
import { DashboardService } from '@/service/dashboard.service';
import {
    DashboardSummaryDto,
    DepartmentEmployeeCountDto,
    EmployeeOnLeaveTodayDto,
    MonthlyLeaveStatusDto,
} from '@/interfaces/dashboard.interface';
import { Button, message, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { EmployeesOnLeaveTable } from '@/app/pages/dashboard/components/EmployeesOnLeaveTable';
import { DashboardCharts } from '@/app/pages/dashboard/components/DashboardCharts';

export default function DashboardPage() {
    const [loading, setLoading] = useState<boolean>(true);
    const [summary, setSummary] = useState<DashboardSummaryDto | null>(null);
    const [deptStatus, setDeptStatus] = useState<DepartmentEmployeeCountDto[]>([]);
    const [employeesOnLeave, setEmployeesOnLeave] = useState<EmployeeOnLeaveTodayDto[]>([]);
    const [leaveStatus, setLeaveStatus] = useState<MonthlyLeaveStatusDto | null>(null);

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            const [summaryRes,
                deptRes,
                leaveTodayRes,
                leaveStatusRes
            ] = await Promise.all([
                DashboardService.getSummary(),
                DashboardService.getDepartmentCounts(),
                DashboardService.getEmployeesOnLeaveToday(),
                DashboardService.getMonthlyLeaveStatus(),
            ]);

            setSummary(summaryRes);
            setDeptStatus(deptRes);
            setEmployeesOnLeave(leaveTodayRes);
            setLeaveStatus(leaveStatusRes);
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Lỗi khi tải dữ liệu Dashboard');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return (
        <MainLayout>
            <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
                {/* Header Dashboard */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 style={{ margin: 0 }}>Tổng Quan Nhân Sự (Dashboard)</h2>
                    <Button icon={<ReloadOutlined />} onClick={fetchDashboardData} loading={loading}>
                        Tải Lại Dữ Liệu
                    </Button>
                </div>

                {/* 1. Chỉ số tổng quan */}
                <SummaryCards summary={summary} loading={loading} />

                {/* 2. Biểu đồ thống kê phòng ban & Đơn nghỉ phép */}
                <DashboardCharts departmentStats={deptStatus} leaveStats={leaveStatus} loading={loading} />

                {/* 3. Bảng danh sách nhân viên nghỉ phép hôm nay */}
                <div style={{ marginTop: 16 }}>
                    <EmployeesOnLeaveTable data={employeesOnLeave} loading={loading} />
                </div>
            </div>
        </MainLayout>
    );
}