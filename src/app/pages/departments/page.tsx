'use client';

import { useEffect, useState, useCallback } from 'react';
import { message, Pagination } from 'antd';

// Import MainLayout chuẩn cấu trúc dự án
import MainLayout from '@/app/layouts/MainLayout';

// Import Interfaces riêng
import { DepartmentResponseDto, CreateDepartmentDto, UpdateDepartmentDto } from '@/interfaces/department.interface';
import { PaginatedResult } from '@/interfaces/pagination.interface';

// Import Service riêng
import { departmentService } from '@/service/department.service';

// Import Components giao diện
import DepartmentHeader from './components/DepartmentHeader';
import DepartmentGrid from './components/DepartmentGrid';
import DepartmentDrawer from './components/DepartmentDrawer';

export default function DepartmentPage() {
    const [data, setData] = useState<PaginatedResult<DepartmentResponseDto> | null>(null);
    const [loading, setLoading] = useState(true);

    // Drawer states
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState<DepartmentResponseDto | null>(null);

    // States bộ lọc
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");

    // Lấy dữ liệu danh sách phòng ban
    const fetchDepartments = useCallback(async () => {
        try {
            setLoading(true);
            const result: any = await departmentService.getAllDepartments({ pageIndex, pageSize, searchTerm });

            // Bắt mọi trường hợp trả về dữ liệu (có hoặc không có bọc .data)
            const paginatedData = result?.data || result;

            setData(paginatedData);
        } catch (err) {
            message.error('Không thể tải danh sách phòng ban!');
        } finally {
            setLoading(false);
        }
    }, [pageIndex, pageSize, searchTerm]);

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    // Lưu thông tin Form
    const handleSubmitDrawerDepartment = async (formData: CreateDepartmentDto | UpdateDepartmentDto) => {
        try {
            if (selectedDepartment) {
                await departmentService.updateDepartment(selectedDepartment.id, formData as UpdateDepartmentDto);
                message.success('Cập nhật phòng ban thành công!');
            } else {
                await departmentService.createDepartment(formData as CreateDepartmentDto);
                message.success('Thêm mới phòng ban thành công!');
            }
            setIsDrawerOpen(false);
            fetchDepartments();
        } catch (err: any) {
            message.error(err?.response?.data?.message || 'Có lỗi xảy ra!');
        }
    };

    // Xóa phòng ban
    const handleDelete = async (id: number) => {
        try {
            await departmentService.deleteDepartment(id);
            message.success('Xóa phòng ban thành công!');
            fetchDepartments();
        } catch (err) {
            message.error('Không thể xóa phòng ban này!');
        }
    };

    return (
        <MainLayout>
            <div className="p-4 max-w-365 mx-auto">
                <DepartmentHeader
                    searchTerm={searchTerm}
                    onRefresh={fetchDepartments}
                    onSearchChange={(val) => {
                        setSearchTerm(val);
                        setPageIndex(1);
                    }}
                    onOpenCreateDrawer={() => {
                        setSelectedDepartment(null);
                        setIsDrawerOpen(true);
                    }}
                />

                <DepartmentGrid
                    departments={data?.items || []}
                    loading={loading}
                    onEditDepartment={(dept) => {
                        setSelectedDepartment(dept);
                        setIsDrawerOpen(true);
                    }}
                    onDeleteDepartment={handleDelete}
                />

                {data && (
                    <div
                        style={{
                            width: "100%",
                            marginTop: 15,
                            paddingTop: 16,
                            borderTop: "1px solid #f0f0f0",
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "center",
                            gap: 24,
                        }}
                    >
                        {/* Page Size */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                fontSize: 14,
                            }}
                        >
                            <span>Page Size:</span>

                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    const newSize = Number(e.target.value);
                                    setPageSize(newSize);
                                    setPageIndex(1);
                                }}
                                style={{
                                    height: 34,
                                    minWidth: 70,
                                    padding: "0 8px",
                                    border: "1px solid #d9d9d9",
                                    borderRadius: 6,
                                    background: "#fff",
                                }}
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>

                        {/* 1 to 10 of 25 */}
                        <span style={{ fontSize: 14 }}>
                            {data.totalCount === 0
                                ? "0 to 0 of 0"
                                : `${(pageIndex - 1) * pageSize + 1} to ${Math.min(
                                    pageIndex * pageSize,
                                    data.totalCount
                                )} of ${data.totalCount}`}
                        </span>

                        {/* Page 1 of 3 */}
                        <span style={{ fontSize: 14 }}>
                            Page <strong>{pageIndex}</strong> of{" "}
                            <strong>{Math.ceil(data.totalCount / pageSize)}</strong>
                        </span>

                        {/* Pagination */}
                        <Pagination
                            current={pageIndex}
                            pageSize={pageSize}
                            total={data.totalCount}
                            onChange={(page) => setPageIndex(page)}
                            showSizeChanger={false}
                            showLessItems
                        />
                    </div>
                )}

                <DepartmentDrawer
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    onSubmit={handleSubmitDrawerDepartment}
                    editingDepartment={selectedDepartment}
                />
            </div>
        </MainLayout>
    );
}