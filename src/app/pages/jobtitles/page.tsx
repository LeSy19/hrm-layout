'use client'

import MainLayout from "@/app/layouts/MainLayout";
import JobTitleDrawer from "@/app/pages/jobtitles/components/JobTitleDrawer";
import JobTitleGrid from "@/app/pages/jobtitles/components/JobTitleGrid";
import JobTitleHeader from "@/app/pages/jobtitles/components/JobTitleHeader";
import { CreateJobTitleDto, JobTitleResponseDto, UpdateJobTitleDto } from "@/interfaces/jobtitle.interface";
import { PaginatedResult } from "@/interfaces/pagination.interface";
import { jobtitleService } from "@/service/jobtitle.service";
import { message, Pagination } from "antd";
import { useCallback, useEffect, useState } from "react";

const JobTitlePage = () => {

    const [data, setData] = useState<PaginatedResult<JobTitleResponseDto> | null>(null);
    const [loading, setLoading] = useState(true);
    // Drawer states
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedJobTitle, setSelectedJobTitle] = useState<JobTitleResponseDto | null>(null);

    // States bộ lọc
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");

    //Lấy dữ liệu danh sách jobtitles
    const fetchJobTiles = useCallback(async () => {
        try {
            setLoading(true);
            const result: any = await jobtitleService.GetAllJobTitle({ pageIndex, pageSize, searchTerm });
            // Bắt mọi trường hợp trả về dữ liệu (có hoặc không có bọc .data)
            const paginatedData = result?.data || result;

            setData(paginatedData);

        } catch (error) {
            message.error('Không thể tải danh sách phòng ban!');
        } finally {
            setLoading(false);
        }
    }, [pageIndex, pageSize, searchTerm])


    useEffect(() => {
        fetchJobTiles();
    }, [fetchJobTiles]);

    //Lưu thông tin form
    const handleSubmitDrawerJobTitle = async (formData: CreateJobTitleDto | UpdateJobTitleDto) => {
        try {
            if (selectedJobTitle) {
                await jobtitleService.updateJobTitle(selectedJobTitle.id, formData as UpdateJobTitleDto);
                message.success('Cập nhật chức danh thành công!');
            } else {
                await jobtitleService.createJobTitle(formData as CreateJobTitleDto);
                message.success('Thêm mới chức danh thành công!');
            }
            setIsDrawerOpen(false);
            fetchJobTiles();
        } catch (err: any) {
            message.error(err?.response?.data?.message || 'Có lỗi xảy ra!');
        }
    }


    //Xoá jobtitle
    const handleDelete = async (id: number) => {
        try {
            await jobtitleService.deleteJobTitle(id);
            message.success("Xoá chức danh thành công!");
            fetchJobTiles();
        } catch (error) {
            message.error('Không thể xóa chức danh này!');
        }
    }

    return (
        <MainLayout>
            <div className="p-4 max-w-365 mx-auto">
                <JobTitleHeader
                    searchTerm={searchTerm}
                    onSearchChange={(val) => {
                        setSearchTerm(val);
                        setPageIndex(1);
                    }}
                    onOpenJobTitleDrawer={() => {
                        setSelectedJobTitle(null);
                        setIsDrawerOpen(true);
                    }}
                />

                <JobTitleGrid
                    jobtitles={data?.items || []}
                    loading={loading}
                    onEditJobtitle={(jobtitle) => {
                        setSelectedJobTitle(jobtitle);
                        setIsDrawerOpen(true);
                    }}
                    onDeleteJobTitle={handleDelete}
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

                <JobTitleDrawer
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    onSubmitJobTitle={handleSubmitDrawerJobTitle}
                    editingJobTitle={selectedJobTitle}
                />
            </div>
        </MainLayout>
    );
}

export default JobTitlePage;