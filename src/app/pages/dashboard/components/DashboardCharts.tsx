'use client';

import React from 'react';
import { Row, Col, Card } from 'antd';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { DepartmentEmployeeCountDto, MonthlyLeaveStatusDto } from '@/interfaces/dashboard.interface';

interface DashboardChartsProps {
    departmentStats: DepartmentEmployeeCountDto[];
    leaveStats: MonthlyLeaveStatusDto | null;
    loading: boolean;
}

const COLORS = ['#faad14', '#52c41a', '#ff4d4f'];

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
    departmentStats,
    leaveStats,
    loading,
}) => {
    // Format data cho biểu đồ đơn nghỉ phép trong tháng
    const pieData = leaveStats
        ? [
            { name: 'Chờ duyệt (Pending)', value: leaveStats.totalPending },
            { name: 'Đã duyệt (Approved)', value: leaveStats.totalApproved },
            { name: 'Từ chối (Rejected)', value: leaveStats.totalRejected },
        ]
        : [];

    return (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            {/* Biểu đồ phân bổ nhân sự theo phòng ban */}
            <Col xs={24} lg={14}>
                <Card title="Phân Bổ Nhân Sự Theo Phòng Ban" loading={loading} style={{ borderRadius: 8 }}>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={departmentStats} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="departmentCode" />
                                <YAxis allowDecimals={false} />
                                <Tooltip formatter={(value) => [`${value} nhân viên`, 'Tổng số']} />
                                <Bar dataKey="totalEmployees" fill="#1890ff" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </Col>

            {/* Biểu đồ trạng thái đơn nghỉ phép trong tháng */}
            <Col xs={24} lg={10}>
                <Card
                    title={`Trạng Thái Đơn Nghỉ Phép (Tháng ${leaveStats?.month || new Date().getMonth() + 1}/${leaveStats?.year || new Date().getFullYear()})`}
                    loading={loading}
                    style={{ borderRadius: 8 }}
                >
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`${value} đơn`, 'Số lượng']} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </Col>
        </Row>
    );
};