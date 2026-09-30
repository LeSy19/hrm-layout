'use client';

import React from 'react';
import { Card, Input, Select, Button, Space } from 'antd';
import {
    SearchOutlined,
    UserAddOutlined,
    GroupOutlined,
    ReloadOutlined,
} from '@ant-design/icons';

interface LeaveBalanceHeaderProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    selectedYear: number;
    onYearChange: (year: number) => void;
    isAdminOrManager: boolean;
    onOpenAssignDrawer: () => void;
    onOpenBulkDrawer: () => void;
    onRefresh: () => void;
}

export const LeaveBalanceHeader: React.FC<LeaveBalanceHeaderProps> = ({
    searchTerm,
    onSearchChange,
    selectedYear,
    onYearChange,
    isAdminOrManager,
    onOpenAssignDrawer,
    onOpenBulkDrawer,
    onRefresh,
}) => {
    const currentYear = new Date().getFullYear();

    const yearOptions = [
        currentYear - 2,
        currentYear - 1,
        currentYear,
        currentYear + 1,
    ];

    return (
        <Card style={{ marginBottom: 16 }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                }}
            >
                {/* Bộ lọc Tìm kiếm & Chọn Năm */}
                <Space wrap>
                    <Input
                        placeholder="Tìm theo Mã hoặc Tên NV..."
                        prefix={<SearchOutlined />}
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        allowClear
                        style={{ width: 260 }}
                    />

                    <Select
                        value={selectedYear}
                        onChange={onYearChange}
                        style={{ width: 120 }}
                    >
                        {yearOptions.map((year) => (
                            <Select.Option
                                key={year}
                                value={year}
                            >
                                Năm {year}
                            </Select.Option>
                        ))}
                    </Select>

                    <Button
                        icon={<ReloadOutlined />}
                        onClick={onRefresh}
                    >
                        Tải lại
                    </Button>
                </Space>

                {/* Chỉ Admin / Manager mới thấy các nút cấp phép */}
                {isAdminOrManager && (
                    <Space wrap>
                        <Button
                            type="primary"
                            icon={<UserAddOutlined />}
                            onClick={onOpenAssignDrawer}
                        >
                            Cấp Phép Cá Nhân
                        </Button>

                        <Button
                            style={{
                                backgroundColor: '#52c41a',
                                borderColor: '#52c41a',
                                color: '#fff',
                            }}
                            icon={<GroupOutlined />}
                            onClick={onOpenBulkDrawer}
                        >
                            Cấp Phép Hàng Loạt
                        </Button>
                    </Space>
                )}
            </div>
        </Card>
    );
};

export default LeaveBalanceHeader;