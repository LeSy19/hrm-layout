'use client';

import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
    UserOutlined,
    UsergroupAddOutlined,
    ApartmentOutlined,
    CalendarOutlined,
} from '@ant-design/icons';
import { DashboardSummaryDto } from '@/interfaces/dashboard.interface';

interface SummaryCardsProps {
    summary: DashboardSummaryDto | null;
    loading: boolean;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary, loading }) => {
    return (
        <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
                <Card
                    loading={loading}
                    style={{
                        background: '#e6f7ff',
                        borderRadius: 8,
                        border: '1px solid #91d5ff',
                    }}
                >
                    <Statistic
                        title="Nhân Viên Chính Thức (Active)"
                        value={summary?.totalActiveEmployees || 0}
                        styles={{
                            content: {
                                color: '#0958d9',
                                fontWeight: 'bold',
                            },
                        }}
                        prefix={<UserOutlined style={{ marginRight: 8 }} />}
                    />
                </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
                <Card
                    loading={loading}
                    style={{
                        background: '#f6ffed',
                        borderRadius: 8,
                        border: '1px solid #b7eb8f',
                    }}
                >
                    <Statistic
                        title="Nhân Viên Thử Việc (Probation)"
                        value={summary?.totalProbationEmployees || 0}
                        styles={{
                            content: {
                                color: '#389e0d',
                                fontWeight: 'bold',
                            },
                        }}
                        prefix={<UsergroupAddOutlined style={{ marginRight: 8 }} />}
                    />
                </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
                <Card
                    loading={loading}
                    style={{
                        background: '#fff7e6',
                        borderRadius: 8,
                        border: '1px solid #ffd591',
                    }}
                >
                    <Statistic
                        title="Tổng Số Phòng Ban"
                        value={summary?.totalDepartments || 0}
                        styles={{
                            content: {
                                color: '#d46b08',
                                fontWeight: 'bold',
                            },
                        }}
                        prefix={<ApartmentOutlined style={{ marginRight: 8 }} />}
                    />
                </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
                <Card
                    loading={loading}
                    style={{
                        background: '#fff0f6',
                        borderRadius: 8,
                        border: '1px solid #ffadd2',
                    }}
                >
                    <Statistic
                        title="Đang Nghỉ Phép Hôm Nay"
                        value={summary?.employeesOnLeaveToday || 0}
                        styles={{
                            content: {
                                color: '#c41d7f',
                                fontWeight: 'bold',
                            },
                        }}
                        prefix={<CalendarOutlined style={{ marginRight: 8 }} />}
                    />
                </Card>
            </Col>
        </Row>
    );
};