'use client'

import MainLayout from "@/app/layouts/MainLayout";
import LeaveTypeDrawer from "@/app/pages/leavetypes/components/LeaveTypeDrawer";
import LeaveTypeGrid from "@/app/pages/leavetypes/components/LeaveTypeGrid";
import LeaveTypeHeader from "@/app/pages/leavetypes/components/LeaveTypeHeader";
import { CreateLeaveTypeDto, LeaveTypeResponseDto, UpdateLeaveTypeDto } from "@/interfaces/leavetype.interface";
import { PaginatedResult } from "@/interfaces/pagination.interface";
import { leavetypeService } from "@/service/leavetype.service";
import { message, Pagination } from "antd";
import { useCallback, useEffect, useState } from "react";

const LeaveTypePage = () => {

    const [data, setData] =
        useState<PaginatedResult<LeaveTypeResponseDto> | null>(null);
    const [loading, setLoading] = useState(true);
    // Drawer states
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveTypeResponseDto | null>(null);

    // States bộ lọc
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    //Lay danh sach nghi phep
    const fetchLeaveTypes = useCallback(async () => {
        try {
            setLoading(true);
            const result = await leavetypeService.getAllLeaveTypes({ pageIndex, pageSize });

            setData(result);

        } catch (error) {
            message.error('Không thể tải danh sách loại phép!');
        } finally {
            setLoading(false);
        }
    }, [pageIndex, pageSize])

    useEffect(() => {
        fetchLeaveTypes();
    }, [fetchLeaveTypes])

    //Lưu thông tin form
    const handleSubmitDrawerLeaveType = async (formData: CreateLeaveTypeDto | UpdateLeaveTypeDto) => {
        try {
            if (selectedLeaveType) {
                await leavetypeService.updateLeaveType(selectedLeaveType.id, formData as UpdateLeaveTypeDto);
                message.success('Cập nhật loại phép thành công!');
            } else {
                await leavetypeService.createLeaveType(formData as CreateLeaveTypeDto);
                message.success('Thêm mới loại phép thành công!');
            }
            setIsDrawerOpen(false);
            fetchLeaveTypes();
        } catch (err: any) {
            message.error(err?.response?.data?.message || 'Có lỗi xảy ra!');
        }
    }

    //Xoá 
    const handleDelete = async (id: number) => {
        try {
            await leavetypeService.deleteLeaveType(id);
            message.success("Xoá loại phép thành công!");
            fetchLeaveTypes();
        } catch (error) {
            message.error('Không thể xóa loại phép này!');
        }
    }


    return (
        <MainLayout>
            <div className="p-4 max-w-365 mx-auto">
                <LeaveTypeHeader
                    onRefresh={fetchLeaveTypes}
                    onOpenLeaveTypeDrawer={() => {
                        setSelectedLeaveType(null);
                        setIsDrawerOpen(true);
                    }}
                />

                <LeaveTypeGrid
                    leavetypes={data?.items || []}
                    loading={loading}
                    onEditingLeaveType={(leavetype) => {
                        setSelectedLeaveType(leavetype);
                        setIsDrawerOpen(true);
                    }}
                    onDeleteLeaveType={handleDelete}
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

                <LeaveTypeDrawer
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    onSubmitLeaveType={handleSubmitDrawerLeaveType}
                    editingLeaveType={selectedLeaveType}
                />
            </div>
        </MainLayout>
    );
};

export default LeaveTypePage;