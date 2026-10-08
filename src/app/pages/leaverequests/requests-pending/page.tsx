'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
    Button,
    Card,
    Drawer,
    Input,
    Modal,
    Tabs,
    Tag,
    message,
    Pagination,
    Form,
} from 'antd';

import {
    SearchOutlined,
    EyeOutlined,
    CheckOutlined,
    CloseOutlined,
    CalendarOutlined,
    UserOutlined,
    FileTextOutlined,
} from '@ant-design/icons';

import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';

import {
    _ColumnFilterModule,
    ColumnApiModule,
    ModuleRegistry,
    PaginationModule,
    QuickFilterModule,
    RowSelectionModule,
    themeQuartz,

} from 'ag-grid-community';

import dayjs from 'dayjs';

import MainLayout from '@/app/layouts/MainLayout';

import {
    LeaveRequestFilterRequestDTO,
    LeaveRequestResponseDto,
} from '@/interfaces/leaverequest.interface';

import { LeaveRequestService } from '@/service/leaverequest.service';


ModuleRegistry.registerModules([
    PaginationModule,
    RowSelectionModule,
    _ColumnFilterModule,
    QuickFilterModule,
    ColumnApiModule,
]);


type RequestTab = 'PENDING' | 'ALL';


const requestStatusConfig: Record<
    LeaveRequestResponseDto['status'],
    {
        label: string;
        color: string;
    }
> = {
    PENDING: {
        label: 'Chờ duyệt',
        color: 'gold',
    },

    APPROVED: {
        label: 'Đã duyệt',
        color: 'green',
    },

    REJECTED: {
        label: 'Từ chối',
        color: 'red',
    },

    CANCELLED: {
        label: 'Đã huỷ',
        color: 'default',
    },
};


export default function PendingLeaveRequestsPage() {

    // =========================================================
    // DATA
    // =========================================================

    const [rowData, setRowData] =
        useState<LeaveRequestResponseDto[]>([]);

    const [loading, setLoading] =
        useState(false);


    // =========================================================
    // TAB
    // =========================================================

    const [activeTab, setActiveTab] =
        useState<RequestTab>('PENDING');


    // =========================================================
    // PAGINATION
    // =========================================================

    const [pageIndex, setPageIndex] =
        useState(1);

    const [pageSize, setPageSize] =
        useState(10);

    const [totalCount, setTotalCount] =
        useState(0);


    // =========================================================
    // AG GRID SEARCH
    // =========================================================

    const [gridSearch, setGridSearch] =
        useState('');


    // =========================================================
    // AG GRID REF
    // =========================================================

    const gridRef =
        useRef<AgGridReact<LeaveRequestResponseDto>>(null);


    // =========================================================
    // DRAWER
    // =========================================================

    const [drawerOpen, setDrawerOpen] =
        useState(false);

    const [selectedRequest, setSelectedRequest] =
        useState<LeaveRequestResponseDto | null>(null);


    // =========================================================
    // REJECT MODAL
    // =========================================================

    const [rejectModalOpen, setRejectModalOpen] =
        useState(false);

    const [rejectingRequest, setRejectingRequest] =
        useState<LeaveRequestResponseDto | null>(null);

    const [rejectForm] =
        Form.useForm();


    // =========================================================
    // SORT CREATED AT - FRONTEND
    // =========================================================

    const sortByCreatedAt = useCallback(() => {

        const api = gridRef.current?.api;

        if (!api) {
            return;
        }

        api.applyColumnState({
            state: [
                {
                    colId: 'createdAt',
                    sort: 'desc',
                },
            ],

            defaultState: {
                sort: null,
            },
        });

    }, []);


    // =========================================================
    // FETCH DATA
    // =========================================================

    const fetchData = useCallback(async () => {

        try {

            setLoading(true);

            const params: LeaveRequestFilterRequestDTO = {
                pageIndex,
                pageSize,
            };

            const response =
                activeTab === 'PENDING'
                    ? await LeaveRequestService.GetPendingRequests(
                        params
                    )
                    : await LeaveRequestService.GetAllLeaveRequests(
                        params
                    );

            setRowData(response.items ?? []);

            setTotalCount(
                response.totalCount ?? 0
            );

        } catch (error) {

            console.error(error);

            message.error(
                'Không thể tải danh sách đơn nghỉ phép'
            );

            setRowData([]);

            setTotalCount(0);

        } finally {

            setLoading(false);

        }

    }, [
        activeTab,
        pageIndex,
        pageSize,
    ]);


    useEffect(() => {

        fetchData();

    }, [fetchData]);


    // =========================================================
    // SORT SAU KHI ROW DATA THAY ĐỔI
    // =========================================================

    useEffect(() => {

        if (rowData.length === 0) {
            return;
        }

        // Đợi AG Grid render rowData xong
        requestAnimationFrame(() => {
            sortByCreatedAt();
        });

    }, [
        rowData,
        sortByCreatedAt,
    ]);


    // =========================================================
    // TAB CHANGE
    // =========================================================

    const handleTabChange = (
        key: string
    ) => {

        setActiveTab(
            key as RequestTab
        );

        setPageIndex(1);

        // Reset search
        setGridSearch('');

        // Đóng drawer
        setDrawerOpen(false);

        setSelectedRequest(null);

    };


    // =========================================================
    // DRAWER
    // =========================================================

    const handleViewDetail = (
        record: LeaveRequestResponseDto
    ) => {

        setSelectedRequest(record);

        setDrawerOpen(true);

    };


    const closeDrawer = () => {

        setDrawerOpen(false);

        setSelectedRequest(null);

    };


    // =========================================================
    // APPROVE
    // =========================================================

    const handleApprove = async (
        record: LeaveRequestResponseDto
    ) => {

        try {

            await LeaveRequestService.processLeaveRequest(
                record.id,
                true
            );

            message.success(
                'Phê duyệt đơn nghỉ phép thành công'
            );

            closeDrawer();

            // Load lại dữ liệu
            await fetchData();

        } catch (error) {

            console.error(error);

            message.error(
                'Không thể phê duyệt đơn nghỉ phép'
            );

        }

    };


    // =========================================================
    // OPEN REJECT MODAL
    // =========================================================

    const openRejectModal = (
        record: LeaveRequestResponseDto
    ) => {

        setRejectingRequest(record);

        setRejectModalOpen(true);

        rejectForm.resetFields();

    };


    // =========================================================
    // CLOSE REJECT MODAL
    // =========================================================

    const closeRejectModal = () => {

        setRejectModalOpen(false);

        setRejectingRequest(null);

        rejectForm.resetFields();

    };


    // =========================================================
    // REJECT
    // =========================================================

    const handleReject = async () => {

        try {

            const values =
                await rejectForm.validateFields();

            if (!rejectingRequest) {
                return;
            }

            await LeaveRequestService.processLeaveRequest(
                rejectingRequest.id,
                false,
                values.rejectionReason
            );

            message.success(
                'Đã từ chối đơn nghỉ phép'
            );

            closeRejectModal();

            closeDrawer();

            // Load lại dữ liệu
            await fetchData();

        } catch (error: any) {

            // Ant Design validation error
            if (error?.errorFields) {
                return;
            }

            console.error(error);

            message.error(
                'Không thể từ chối đơn nghỉ phép'
            );

        }

    };


    // =========================================================
    // AG GRID COLUMNS
    // =========================================================

    const columnDefs = useMemo<
        ColDef<LeaveRequestResponseDto>[]
    >(
        () => [

            // =================================================
            // EMPLOYEE CODE
            // =================================================

            {
                headerName: 'Mã nhân viên',

                field: 'employeeCode',

                minWidth: 140,

                flex: 0.9,

                // Chỉ search mã nhân viên
                getQuickFilterText: (params) =>
                    params.value ?? '',
            },


            // =================================================
            // EMPLOYEE NAME
            // =================================================

            {
                headerName: 'Nhân viên',

                field: 'employeeName',

                minWidth: 200,

                flex: 1.3,

                // Chỉ search tên nhân viên
                getQuickFilterText: (params) =>
                    params.value ?? '',
            },


            // =================================================
            // LEAVE TYPE
            // =================================================

            {
                headerName: 'Loại phép',

                field: 'leaveTypeName',

                minWidth: 150,

                flex: 1,

                // Không search
                getQuickFilterText: () => '',
            },


            // =================================================
            // PAID
            // =================================================

            {
                headerName: 'Hưởng lương',

                field: 'isPaid',

                minWidth: 120,

                maxWidth: 130,

                getQuickFilterText: () => '',

                cellRenderer: (params: any) => {

                    return params.value ? (

                        <Tag color="green">
                            Có lương
                        </Tag>

                    ) : (

                        <Tag color="red">
                            Không lương
                        </Tag>

                    );

                },
            },


            // =================================================
            // START DATE
            // =================================================

            {
                headerName: 'Từ ngày',

                field: 'startDate',

                minWidth: 125,

                flex: 0.8,

                getQuickFilterText: () => '',

                valueFormatter: (params) => {

                    if (!params.value) {
                        return '';
                    }

                    return dayjs(
                        params.value
                    ).format(
                        'DD/MM/YYYY'
                    );

                },
            },


            // =================================================
            // END DATE
            // =================================================

            {
                headerName: 'Đến ngày',

                field: 'endDate',

                minWidth: 125,

                flex: 0.8,

                getQuickFilterText: () => '',

                valueFormatter: (params) => {

                    if (!params.value) {
                        return '';
                    }

                    return dayjs(
                        params.value
                    ).format(
                        'DD/MM/YYYY'
                    );

                },
            },


            // =================================================
            // TOTAL DAYS
            // =================================================

            {
                headerName: 'Số ngày',

                field: 'totalRequestedDays',

                minWidth: 100,

                maxWidth: 110,

                getQuickFilterText: () => '',

                valueFormatter: (params) => {

                    return `${params.value ?? 0} ngày`;

                },
            },


            // =================================================
            // STATUS
            // =================================================

            {
                headerName: 'Trạng thái',

                field: 'status',

                minWidth: 125,

                maxWidth: 140,

                getQuickFilterText: () => '',

                cellRenderer: (params: any) => {

                    const config =
                        requestStatusConfig[
                        params.value as LeaveRequestResponseDto['status']
                        ];

                    if (!config) {
                        return params.value;
                    }

                    return (

                        <Tag color={config.color}>
                            {config.label}
                        </Tag>

                    );

                },
            },


            // =================================================
            // CREATED AT
            // =================================================

            {
                headerName: 'Ngày tạo',

                field: 'createdAt',

                minWidth: 150,

                flex: 0.9,

                // Không search ngày tạo
                getQuickFilterText: () => '',

                valueFormatter: (params) => {

                    if (!params.value) {
                        return '';
                    }

                    return dayjs(
                        params.value
                    ).format(
                        'DD/MM/YYYY HH:mm'
                    );

                },

                sortable: true,
            },


            // =================================================
            // ACTION
            // Chỉ còn Xem
            // =================================================

            {
                headerName: 'Thao tác',

                field: 'id',

                minWidth: 110,

                maxWidth: 120,

                sortable: false,

                filter: false,

                getQuickFilterText: () => '',

                cellRenderer: (params: any) => (

                    <Button
                        type="link"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() =>
                            handleViewDetail(
                                params.data
                            )
                        }
                    >
                        Xem
                    </Button>

                ),
            },

        ],
        []
    );


    // =========================================================
    // SELECTED STATUS
    // =========================================================

    const selectedStatus =
        selectedRequest
            ? requestStatusConfig[
            selectedRequest.status
            ]
            : null;


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <MainLayout>

            <div className="p-4 md:p-6">

                {/* =================================================
                    HEADER
                ================================================= */}

                <Card
                    className="mb-4 rounded-xl shadow-sm"

                    styles={{
                        body: {
                            padding: '20px 24px',
                        },
                    }}
                >

                    <div className="flex flex-col gap-4">

                        {/* =================================================
                            TITLE
                        ================================================= */}

                        <div className="flex items-center justify-between">

                            <div>

                                <h1 className="m-0 text-xl font-semibold text-gray-800">
                                    Quản lý đơn nghỉ phép
                                </h1>

                                <p className="mt-1 mb-0 text-sm text-gray-500">
                                    Quản lý và xử lý các đơn nghỉ phép
                                    của nhân viên
                                </p>

                            </div>


                            {/* COUNT */}

                            <div className="hidden md:block">

                                <div className="text-right">

                                    <div className="text-2xl font-bold text-blue-600">
                                        {totalCount}
                                    </div>

                                    <div className="text-xs text-gray-500">

                                        {activeTab === 'PENDING'
                                            ? 'Đơn chờ duyệt'
                                            : 'Tổng số đơn'}

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            TABS
                        ================================================= */}

                        <Tabs
                            activeKey={activeTab}
                            onChange={handleTabChange}

                            items={[
                                {
                                    key: 'PENDING',

                                    label: (
                                        <span className="font-medium">
                                            Đơn chờ duyệt
                                        </span>
                                    ),
                                },

                                {
                                    key: 'ALL',

                                    label: (
                                        <span className="font-medium">
                                            Tất cả đơn
                                        </span>
                                    ),
                                },
                            ]}
                        />


                        {/* =================================================
                            SEARCH
                        ================================================= */}

                        <div className="flex items-center">

                            <Input
                                allowClear

                                size="large"

                                value={gridSearch}

                                onChange={(e) =>
                                    setGridSearch(
                                        e.target.value
                                    )
                                }

                                placeholder="Tìm mã hoặc tên nhân viên..."

                                prefix={
                                    <SearchOutlined className="text-gray-400" />
                                }

                                style={{
                                    width: 320,
                                }}
                            />

                        </div>

                    </div>

                </Card>


                {/* =================================================
                    GRID
                ================================================= */}

                <Card
                    className="rounded-xl shadow-sm"

                    styles={{
                        body: {
                            padding: 0,
                        },
                    }}
                >

                    <div
                        style={{
                            width: '100%',
                            height: 600,
                        }}
                    >

                        <AgGridReact
                            ref={gridRef}

                            rowData={rowData}

                            columnDefs={columnDefs}

                            theme={themeQuartz}

                            // Search realtime
                            quickFilterText={gridSearch}

                            // Sort frontend
                            onGridReady={() => {
                                sortByCreatedAt();
                            }}

                            pagination={false}

                            loading={loading}

                            animateRows={true}

                            defaultColDef={{
                                sortable: true,
                                resizable: true,
                                filter: false,
                            }}

                            overlayNoRowsTemplate={
                                activeTab === 'PENDING'
                                    ? 'Không có đơn chờ duyệt'
                                    : 'Không có đơn nghỉ phép'
                            }
                        />

                    </div>


                    {/* =================================================
                        PAGINATION
                    ================================================= */}

                    <div className="flex items-center justify-between border-t px-5 py-4">

                        <div className="text-sm text-gray-500">

                            Hiển thị{' '}

                            <span className="font-medium text-gray-700">
                                {rowData.length}
                            </span>

                            {' / '}

                            <span className="font-medium text-gray-700">
                                {totalCount}
                            </span>

                            {' '}đơn

                        </div>


                        <Pagination
                            current={pageIndex}

                            pageSize={pageSize}

                            total={totalCount}

                            showSizeChanger

                            showQuickJumper

                            pageSizeOptions={[
                                10,
                                20,
                                50,
                                100,
                            ]}

                            onChange={(page, size) => {

                                setPageIndex(page);

                                setPageSize(size);

                            }}

                            showTotal={(total, range) =>
                                `${range[0]}-${range[1]} / ${total}`
                            }
                        />

                    </div>

                </Card>

            </div>


            {/* =====================================================
                DETAIL DRAWER
            ===================================================== */}

            <Drawer

                title={

                    <div className="flex items-center gap-2">

                        <FileTextOutlined />

                        <span>
                            Chi tiết đơn nghỉ phép
                        </span>

                    </div>
                }

                placement="right"

                size={680}

                open={drawerOpen}

                onClose={closeDrawer}

                footer={

                    selectedRequest?.status === 'PENDING'
                        ? (

                            <div className="flex justify-end gap-2">

                                <Button
                                    danger
                                    icon={<CloseOutlined />}
                                    onClick={() =>
                                        openRejectModal(
                                            selectedRequest
                                        )
                                    }
                                >
                                    Từ chối
                                </Button>


                                <Button
                                    type="primary"
                                    icon={<CheckOutlined />}
                                    onClick={() =>
                                        handleApprove(
                                            selectedRequest
                                        )
                                    }
                                >
                                    Phê duyệt
                                </Button>

                            </div>

                        )
                        : null
                }
            >

                {selectedRequest && (

                    <div className="space-y-5">

                        {/* =================================================
                            STATUS
                        ================================================= */}

                        <div className="rounded-xl bg-gray-50 p-4">

                            <div className="mb-2 text-xs font-medium uppercase text-gray-400">
                                Trạng thái
                            </div>

                            {selectedStatus && (

                                <Tag
                                    color={
                                        selectedStatus.color
                                    }

                                    className="px-3 py-1 text-sm"
                                >
                                    {selectedStatus.label}
                                </Tag>

                            )}

                        </div>


                        {/* =================================================
                            EMPLOYEE
                        ================================================= */}

                        <div className="rounded-xl border p-4">

                            <div className="mb-4 flex items-center gap-2">

                                <UserOutlined className="text-blue-500" />

                                <span className="font-semibold text-gray-800">
                                    Thông tin nhân viên
                                </span>

                            </div>


                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                <div>

                                    <div className="text-xs text-gray-400">
                                        Mã nhân viên
                                    </div>

                                    <div className="mt-1 font-medium">
                                        {
                                            selectedRequest.employeeCode
                                        }
                                    </div>

                                </div>


                                <div>

                                    <div className="text-xs text-gray-400">
                                        Họ và tên
                                    </div>

                                    <div className="mt-1 font-medium">
                                        {
                                            selectedRequest.employeeName
                                        }
                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            LEAVE
                        ================================================= */}

                        <div className="rounded-xl border p-4">

                            <div className="mb-4 flex items-center gap-2">

                                <CalendarOutlined className="text-blue-500" />

                                <span className="font-semibold text-gray-800">
                                    Thông tin nghỉ phép
                                </span>

                            </div>


                            <div className="space-y-4">

                                <div>

                                    <div className="text-xs text-gray-400">
                                        Loại phép
                                    </div>

                                    <div className="mt-1 font-medium">
                                        {
                                            selectedRequest.leaveTypeName
                                        }
                                    </div>

                                </div>


                                <div className="grid grid-cols-2 gap-4">

                                    <div>

                                        <div className="text-xs text-gray-400">
                                            Từ ngày
                                        </div>

                                        <div className="mt-1 font-medium">

                                            {dayjs(
                                                selectedRequest.startDate
                                            ).format(
                                                'DD/MM/YYYY'
                                            )}

                                        </div>

                                    </div>


                                    <div>

                                        <div className="text-xs text-gray-400">
                                            Đến ngày
                                        </div>

                                        <div className="mt-1 font-medium">

                                            {dayjs(
                                                selectedRequest.endDate
                                            ).format(
                                                'DD/MM/YYYY'
                                            )}

                                        </div>

                                    </div>

                                </div>


                                <div className="grid grid-cols-2 gap-4">

                                    <div>

                                        <div className="text-xs text-gray-400">
                                            Tổng số ngày
                                        </div>

                                        <div className="mt-1 text-lg font-semibold text-blue-600">

                                            {
                                                selectedRequest.totalRequestedDays
                                            }

                                            {' '}ngày

                                        </div>

                                    </div>


                                    <div>

                                        <div className="text-xs text-gray-400">
                                            Hưởng lương
                                        </div>

                                        <div className="mt-1">

                                            {selectedRequest.isPaid ? (

                                                <Tag color="green">
                                                    Có lương
                                                </Tag>

                                            ) : (

                                                <Tag color="red">
                                                    Không lương
                                                </Tag>

                                            )}

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            REASON
                        ================================================= */}

                        <div className="rounded-xl border p-4">

                            <div className="mb-2 font-semibold text-gray-800">
                                Lý do nghỉ
                            </div>

                            <div className="rounded-lg bg-gray-50 p-3 text-sm leading-6 text-gray-600">

                                {selectedRequest.reason ||
                                    'Không có lý do'}

                            </div>

                        </div>


                        {/* =================================================
                            APPROVER
                        ================================================= */}

                        {selectedRequest.approverName && (

                            <div className="rounded-xl border p-4">

                                <div className="text-xs text-gray-400">
                                    Người xử lý
                                </div>

                                <div className="mt-1 font-medium">

                                    {
                                        selectedRequest.approverName
                                    }

                                </div>

                            </div>

                        )}


                        {/* =================================================
                            REJECTION REASON
                        ================================================= */}

                        {selectedRequest.rejectionReason && (

                            <div className="rounded-xl border border-red-200 bg-red-50 p-4">

                                <div className="mb-2 font-semibold text-red-700">
                                    Lý do từ chối
                                </div>

                                <div className="text-sm leading-6 text-red-600">

                                    {
                                        selectedRequest.rejectionReason
                                    }

                                </div>

                            </div>

                        )}


                        {/* =================================================
                            CREATED AT
                        ================================================= */}

                        <div className="text-xs text-gray-400">

                            Tạo lúc:{' '}

                            {dayjs(
                                selectedRequest.createdAt
                            ).format(
                                'DD/MM/YYYY HH:mm'
                            )}

                        </div>

                    </div>

                )}

            </Drawer>


            {/* =========================================================
                REJECT MODAL
            ========================================================= */}

            <Modal

                title="Từ chối đơn nghỉ phép"

                open={rejectModalOpen}

                onCancel={closeRejectModal}

                onOk={handleReject}

                okText="Từ chối"

                cancelText="Huỷ"

                okButtonProps={{
                    danger: true,
                }}

                destroyOnHidden
            >

                <Form
                    form={rejectForm}
                    layout="vertical"
                >

                    <Form.Item
                        name="rejectionReason"

                        label="Lý do từ chối"

                        rules={[
                            {
                                required: true,

                                message:
                                    'Vui lòng nhập lý do từ chối',
                            },
                        ]}
                    >

                        <Input.TextArea
                            rows={4}

                            placeholder="Nhập lý do từ chối..."

                            maxLength={500}

                            showCount
                        />

                    </Form.Item>

                </Form>

            </Modal>

        </MainLayout>
    );
}