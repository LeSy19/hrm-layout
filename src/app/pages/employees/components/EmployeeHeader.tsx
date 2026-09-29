'use client';

import { Button, Space, Typography } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface EmployeeHeaderProps {
    searchTerm: string;
    onRefresh: () => void,
    onSearchChange: (value: string) => void;
    onOpenCreateModal: () => void;
}

export default function EmployeeHeader({ searchTerm, onRefresh, onSearchChange, onOpenCreateModal }: EmployeeHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Quản lý Nhân viên</h1>
                <p className="text-sm text-gray-500">Danh sách và thông tin nhân sự trong hệ thống</p>
            </div>

            <div className="flex items-center gap-3">
                {/* Ô Tìm kiếm */}
                <input
                    type="text"
                    placeholder="Tìm tên, email, mã NV..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Nút Refresh */}
                <button
                    onClick={onRefresh}
                    className="flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                    ↻ Refresh
                </button>

                {/* Nút Thêm mới */}
                <button
                    onClick={onOpenCreateModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                    + Thêm nhân viên
                </button>
            </div>
        </div>
    );
}