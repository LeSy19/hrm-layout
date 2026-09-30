'use client';

import React from 'react';
import { Card, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EmployeeOnLeaveTodayDto } from '@/interfaces/dashboard.interface';
import dayjs from 'dayjs';

interface EmployeesOnLeaveTableProps {
    data: EmployeeOnLeaveTodayDto[];
    loading: boolean;
}

export const EmployeesOnLeaveTable: React.FC<EmployeesOnLeaveTableProps> = ({ data, loading }) => {
    const columns: ColumnsType<EmployeeOnLeaveTodayDto> = [
        {
            title: 'Mã NV',
            dataIndex: 'employeeCode',
            key: 'employeeCode',
            width: 100,
        },
        {
            title: 'Họ Và Tên',
            dataIndex: 'fullName',
            key: 'fullName',
            render: (text) => <b>{text}</b>,
        },
        {
            title: 'Phòng Ban',
            dataIndex: 'departmentName',
            key: 'departmentName',
        },
        {
            title: 'Loại Phép',
            dataIndex: 'leaveTypeName',
            key: 'leaveTypeName',
            render: (text) => <Tag color="blue">{text}</Tag>,
        },
        {
            title: 'Thời Gian Nghỉ',
            key: 'time',
            render: (_, record) => (
                <span>
                    {dayjs(record.startDate).format('DD/MM/YYYY')} - {dayjs(record.endDate).format('DD/MM/YYYY')}
                </span>
            ),
        },
        {
            title: 'Số Ngày',
            dataIndex: 'totalDays',
            key: 'totalDays',
            render: (val) => <Tag color="magenta">{val} ngày</Tag>,
        },
    ];

    return (
        <Card title="Danh Sách Nhân Viên Nghỉ Phép Hôm Nay" style={{ borderRadius: 8 }}>
            <Table
                columns={columns}
                dataSource={data}
                rowKey="employeeId"
                loading={loading}
                pagination={{ pageSize: 5 }}
                size="small"
            />
        </Card>
    );
};