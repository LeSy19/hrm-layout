'use client';

import React, {
    useState,
    useEffect,
    useCallback,
    useMemo,
} from 'react';

import {
    Card,
    Input,
    Button,
    Space,
    message,
    Pagination,
    Select,
} from 'antd';

import { SearchOutlined } from '@ant-design/icons';

import { AgGridReact } from 'ag-grid-react';

import type { ColDef } from 'ag-grid-community';

import {
    ModuleRegistry,
    PaginationModule,
    QuickFilterModule,
    themeQuartz,
} from 'ag-grid-community';

import dayjs from 'dayjs';

import {
    LeaveRequestFilterRequestDTO,
    UnpaidLeaveSummaryDto,
} from '@/interfaces/leaverequest.interface';

import { LeaveRequestService } from '@/service/leaverequest.service';

import MainLayout from '@/app/layouts/MainLayout';


// ===============================
// AG GRID MODULES
// ===============================

ModuleRegistry.registerModules([
    PaginationModule,
    QuickFilterModule,
]);


export default function UnpaidLeaveSummaryPage() {

    // ===============================
    // STATE
    // ===============================

    const [loading, setLoading] = useState<boolean>(false);

    // Toàn bộ dữ liệu backend trả về
    const [allData, setAllData] = useState<UnpaidLeaveSummaryDto[]>([]);
    const [quickFilterText, setQuickFilterText] = useState('');

    // Dữ liệu đang hiển thị trên trang hiện tại
    const [rowData, setRowData] = useState<UnpaidLeaveSummaryDto[]>([]);

    const [searchTerm, setSearchTerm] = useState<string>('');

    const [pageIndex, setPageIndex] = useState<number>(1);

    const [pageSize, setPageSize] = useState<number>(10);

    const [month, setMonth] = useState<number>(
        dayjs().month() + 1
    );

    const [year, setYear] = useState<number>(
        dayjs().year()
    );


    // ===============================
    // FETCH DATA
    // ===============================

    const fetchSummary = useCallback(async () => {

        setLoading(true);

        try {

            const params: LeaveRequestFilterRequestDTO = {
                searchTerm:
                    searchTerm.trim() || undefined,

                month,

                year,
            };

            const response =
                await LeaveRequestService.GetUnpaidLeaveSummary(
                    params
                );

            // Backend trả về trực tiếp mảng
            const data = Array.isArray(response)
                ? response
                : [];

            setAllData(data);

            // Sau khi tìm kiếm / đổi tháng / đổi năm
            // luôn quay về trang đầu
            setPageIndex(1);

        } catch (error: any) {

            console.error(
                'Get unpaid leave summary error:',
                error
            );

            message.error(
                error?.response?.data?.message ||
                'Không thể lấy dữ liệu thống kê nghỉ không lương.'
            );

            setAllData([]);

            setRowData([]);

        } finally {

            setLoading(false);

        }

    }, [
        searchTerm,
        month,
        year,
    ]);


    // ===============================
    // LOAD API
    // ===============================

    useEffect(() => {

        fetchSummary();

    }, [fetchSummary]);


    // ===============================
    // FRONTEND PAGINATION
    // ===============================

    useEffect(() => {

        const startIndex =
            (pageIndex - 1) * pageSize;

        const endIndex =
            startIndex + pageSize;

        const currentPageData =
            allData.slice(
                startIndex,
                endIndex
            );

        setRowData(currentPageData);

    }, [
        allData,
        pageIndex,
        pageSize,
    ]);


    // ===============================
    // SEARCH
    // ===============================

    const handleSearch = () => {

        setPageIndex(1);

        fetchSummary();

    };


    // ===============================
    // CHANGE MONTH
    // ===============================

    const handleMonthChange = (
        value: number
    ) => {

        setMonth(value);

        setPageIndex(1);

    };


    // ===============================
    // CHANGE YEAR
    // ===============================

    const handleYearChange = (
        value: number
    ) => {

        setYear(value);

        setPageIndex(1);

    };


    // ===============================
    // COLUMN DEFINITIONS
    // ===============================

    const columnDefs = useMemo<
        ColDef<UnpaidLeaveSummaryDto>[]
    >(
        () => [

            {
                field: 'employeeCode',
                headerName: 'Mã NV',
                flex: 0.9,
                minWidth: 120,
                sortable: true,
                getQuickFilterText: params => params.value ?? '',
            },

            {
                field: 'fullName',
                headerName: 'Họ và tên',
                flex: 1.4,
                minWidth: 180,
                sortable: true,
                getQuickFilterText: params => params.value ?? '',
            },

            {
                field: 'departmentName',
                headerName: 'Phòng ban',
                flex: 1.2,
                minWidth: 160,
                sortable: true,
                getQuickFilterText: params => params.value ?? '',

                valueFormatter: (
                    params
                ) =>
                    params.value ||
                    'Chưa phân phòng ban',
            },

            {
                field: 'month',
                headerName: 'Tháng',
                width: 100,
                sortable: true,

                valueFormatter: (
                    params
                ) =>
                    params.value
                        ? `Tháng ${params.value}`
                        : '',
            },

            {
                field: 'year',
                headerName: 'Năm',
                width: 100,
                sortable: true,
            },

            {
                field: 'totalUnpaidDays',
                headerName: 'Ngày nghỉ không lương',
                flex: 1.3,
                minWidth: 190,
                sortable: true,

                cellRenderer: (params: any) => (
                    <span
                        style={{
                            fontWeight: 600,
                            color: '#cf1322',
                        }}
                    >
                        {params.value ?? 0} ngày
                    </span>
                ),
            },

        ],
        []
    );


    // ===============================
    // YEAR OPTIONS
    // ===============================

    const yearOptions = useMemo(() => {

        const currentYear =
            dayjs().year();

        return Array.from(
            { length: 5 },
            (_, index) => {

                const value =
                    currentYear - index;

                return {
                    value,
                    label: `${value}`,
                };
            }
        );

    }, []);


    // ===============================
    // RENDER
    // ===============================

    return (

        <MainLayout>

            <div
                style={{
                    padding: 24,
                }}
            >

                <Card

                    title="Thống kê nghỉ không lương"

                    extra={

                        <Space wrap>

                            {/* SEARCH */}

                            <Input
                                placeholder="Tìm mã NV, họ tên, phòng ban..."
                                prefix={<SearchOutlined />}
                                value={quickFilterText}
                                onChange={(e) => setQuickFilterText(e.target.value)}
                                allowClear
                                style={{ width: 320 }}
                            />


                            {/* MONTH */}

                            <Select

                                value={month}

                                onChange={
                                    handleMonthChange
                                }

                                style={{
                                    width: 130,
                                }}

                                options={Array.from(
                                    { length: 12 },
                                    (_, index) => ({
                                        value:
                                            index + 1,

                                        label:
                                            `Tháng ${index + 1}`,
                                    })
                                )}

                            />


                            {/* YEAR */}

                            <Select

                                value={year}

                                onChange={
                                    handleYearChange
                                }

                                style={{
                                    width: 100,
                                }}

                                options={
                                    yearOptions
                                }

                            />


                            {/* SEARCH BUTTON */}

                            <Button

                                type="primary"

                                icon={
                                    <SearchOutlined />
                                }

                                onClick={
                                    handleSearch
                                }

                            >
                                Thống kê
                            </Button>

                        </Space>
                    }

                >

                    {/* ===============================
                        AG GRID
                    =============================== */}

                    <div
                        className="ag-theme-alpine"
                        style={{
                            height: 500,
                            width: '100%',
                        }}
                    >

                        <AgGridReact
                            rowData={rowData}
                            columnDefs={columnDefs}
                            theme={themeQuartz}
                            quickFilterText={quickFilterText}
                            pagination={false}
                            loading={loading}
                            animateRows={true}
                        />

                    </div>


                    {/* ===============================
                        PAGINATION
                    =============================== */}

                    <div
                        style={{
                            marginTop: 16,

                            display: 'flex',

                            justifyContent:
                                'space-between',

                            alignItems:
                                'center',
                        }}
                    >

                        {/* TOTAL */}

                        <div
                            style={{
                                color: '#666',
                                fontSize: 14,
                            }}
                        >

                            Tổng cộng:{' '}

                            <strong>
                                {allData.length}
                            </strong>{' '}

                            nhân viên

                        </div>


                        {/* PAGINATION */}

                        <Pagination

                            current={pageIndex}

                            pageSize={pageSize}

                            total={allData.length}

                            showSizeChanger

                            pageSizeOptions={[
                                10,
                                20,
                                50,
                                100,
                            ]}

                            showTotal={(
                                total,
                                range
                            ) =>
                                `${range[0]}-${range[1]} / ${total}`
                            }

                            onChange={(
                                page,
                                size
                            ) => {

                                if (
                                    size !== pageSize
                                ) {

                                    setPageSize(
                                        size
                                    );

                                    setPageIndex(
                                        1
                                    );

                                } else {

                                    setPageIndex(
                                        page
                                    );

                                }

                            }}

                        />

                    </div>

                </Card>

            </div>

        </MainLayout>
    );
}