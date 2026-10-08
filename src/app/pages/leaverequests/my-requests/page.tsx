'use client';

import React, {
    useState,
    useEffect,
    useCallback,
    useMemo,
} from 'react';

import {
    Button,
    Drawer,
    Form,
    DatePicker,
    Input,
    Tag,
    message,
    Card,
    Space,
    Descriptions,
    Divider,
    Popconfirm,
    Pagination,
    Switch,
} from 'antd';

import {
    PlusOutlined,
    CloseCircleOutlined,
    SearchOutlined,
    EyeOutlined,
} from '@ant-design/icons';

import { AgGridReact } from 'ag-grid-react';

import {
    ColDef,
    ICellRendererParams,
    themeQuartz,
} from 'ag-grid-community';

import dayjs from 'dayjs';

import {
    LeaveRequestResponseDto,
    CreateLeaveRequestDto,
} from '@/interfaces/leaverequest.interface';

import { LeaveRequestService } from '@/service/leaverequest.service';

import MainLayout from '@/app/layouts/MainLayout';

const { RangePicker } = DatePicker;

export default function MyLeaveRequestsPage() {
    // =====================================================
    // DATA
    // =====================================================

    const [loading, setLoading] = useState<boolean>(false);

    const [rowData, setRowData] = useState<
        LeaveRequestResponseDto[]
    >([]);

    // =====================================================
    // PAGINATION
    // =====================================================

    const [pageIndex, setPageIndex] = useState<number>(1);

    const [pageSize, setPageSize] = useState<number>(10);

    const [totalCount, setTotalCount] = useState<number>(0);

    const [totalPages, setTotalPages] = useState<number>(0);

    // =====================================================
    // SEARCH
    // =====================================================

    // Giá trị đang nhập trong ô search
    const [searchTerm, setSearchTerm] =
        useState<string>('');

    // Giá trị thực sự được gửi lên API
    const [searchKeyword, setSearchKeyword] =
        useState<string>('');

    // =====================================================
    // DRAWER TẠO ĐƠN
    // =====================================================

    const [isCreateDrawerOpen, setIsCreateDrawerOpen] =
        useState<boolean>(false);

    // =====================================================
    // DRAWER CHI TIẾT
    // =====================================================

    const [isDetailDrawerOpen, setIsDetailDrawerOpen] =
        useState<boolean>(false);

    const [selectedRequest, setSelectedRequest] =
        useState<LeaveRequestResponseDto | null>(null);

    // =====================================================
    // SUBMIT
    // =====================================================

    const [submitting, setSubmitting] =
        useState<boolean>(false);

    const [form] = Form.useForm();

    // =====================================================
    // FETCH DATA
    // =====================================================

    const fetchData = useCallback(async () => {
        setLoading(true);

        try {
            const res =
                await LeaveRequestService.GetMyRequests({
                    pageIndex,
                    pageSize,
                    searchTerm:
                        searchKeyword.trim() || undefined,
                });

            // Danh sách hiện tại
            setRowData(res.items || []);

            // Tổng số record
            setTotalCount(res.totalCount || 0);

            // Tổng số page
            setTotalPages(res.totalPages || 0);
        } catch (err: any) {
            message.error(
                err?.response?.data?.message ||
                'Không thể tải danh sách đơn nghỉ phép.'
            );
        } finally {
            setLoading(false);
        }
    }, [
        pageIndex,
        pageSize,
        searchKeyword,
    ]);

    // Khi page / pageSize / searchKeyword thay đổi
    // tự động gọi API
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // =====================================================
    // SEARCH
    // =====================================================

    const handleSearch = () => {
        setPageIndex(1);
        setSearchKeyword(searchTerm);
    };

    // =====================================================
    // STATUS TAG
    // =====================================================

    const renderStatusTag = (
        status: string
    ) => {
        switch (status) {
            case 'PENDING':
                return (
                    <Tag color="gold">
                        Chờ duyệt
                    </Tag>
                );

            case 'APPROVED':
                return (
                    <Tag color="green">
                        Đã duyệt
                    </Tag>
                );

            case 'REJECTED':
                return (
                    <Tag color="red">
                        Từ chối
                    </Tag>
                );

            case 'CANCELLED':
                return (
                    <Tag color="default">
                        Đã hủy
                    </Tag>
                );

            default:
                return (
                    <Tag>
                        {status}
                    </Tag>
                );
        }
    };

    // =====================================================
    // XEM CHI TIẾT
    // =====================================================

    const handleViewDetail = (
        request: LeaveRequestResponseDto
    ) => {
        setSelectedRequest(request);
        setIsDetailDrawerOpen(true);
    };

    // =====================================================
    // HỦY ĐƠN
    //
    // PENDING  -> được hủy
    // APPROVED -> được hủy
    // REJECTED -> không được hủy
    // CANCELLED -> không được hủy
    // =====================================================

    const handleCancel = async (
        request: LeaveRequestResponseDto
    ) => {
        if (
            request.status !== 'PENDING' &&
            request.status !== 'APPROVED'
        ) {
            message.warning('Đơn này không thể hủy.');
            return;
        }

        try {
            await LeaveRequestService.cancelLeaveRequest(
                request.id
            );

            message.success(
                'Đã hủy đơn xin nghỉ phép thành công.'
            );

            // Đóng drawer nếu đang xem chi tiết
            setIsDetailDrawerOpen(false);
            setSelectedRequest(null);

            // Reload table
            await fetchData();
        } catch (err: any) {
            message.error(
                err?.response?.data?.message ||
                'Xảy ra lỗi khi hủy đơn.'
            );
        }
    };
    // =====================================================
    // AG GRID
    // =====================================================

    const columnDefs = useMemo<
        ColDef<LeaveRequestResponseDto>[]
    >(
        () => [
            {
                field: 'leaveTypeName',
                headerName: 'Loại phép',
                flex: 1.2,
            },

            {
                field: 'isPaid',
                headerName: 'Hưởng lương',
                flex: 0.9,

                cellRenderer: (
                    params: ICellRendererParams
                ) => (
                    <Tag
                        color={
                            params.value
                                ? 'blue'
                                : 'orange'
                        }
                    >
                        {params.value
                            ? 'Có lương'
                            : 'Không lương'}
                    </Tag>
                ),
            },

            {
                field: 'startDate',
                headerName: 'Từ ngày',
                flex: 1,

                valueFormatter: (params) =>
                    params.value
                        ? dayjs(
                            params.value
                        ).format('DD/MM/YYYY')
                        : '-',
            },

            {
                field: 'endDate',
                headerName: 'Đến ngày',
                flex: 1,

                valueFormatter: (params) =>
                    params.value
                        ? dayjs(
                            params.value
                        ).format('DD/MM/YYYY')
                        : '-',
            },

            {
                field: 'totalRequestedDays',
                headerName: 'Số ngày',
                flex: 0.8,
            },

            {
                field: 'createdAt',
                headerName: 'Ngày tạo',
                flex: 1.2,

                valueFormatter: (params) =>
                    params.value
                        ? dayjs(
                            params.value
                        ).format(
                            'DD/MM/YYYY HH:mm'
                        )
                        : '-',
            },

            {
                field: 'reason',
                headerName: 'Lý do',
                flex: 1.5,

                valueFormatter: (params) =>
                    params.value || '-',
            },

            {
                field: 'status',
                headerName: 'Trạng thái',
                flex: 1,

                cellRenderer: (
                    params: ICellRendererParams
                ) =>
                    renderStatusTag(
                        params.value
                    ),
            },

            {
                field: 'approverName',
                headerName: 'Người duyệt',
                flex: 1,

                valueFormatter: (params) =>
                    params.value || '-',
            },

            {
                field: 'rejectionReason',
                headerName: 'Lý do từ chối',
                flex: 1.2,

                valueFormatter: (params) =>
                    params.value || '-',
            },

            // =================================================
            // THAO TÁC
            // =================================================

            {
                headerName: 'Thao tác',
                flex: 1.5,
                minWidth: 170,

                sortable: false,
                filter: false,

                cellRenderer: (
                    params: ICellRendererParams
                ) => {
                    const data =
                        params.data as LeaveRequestResponseDto;

                    if (!data) {
                        return null;
                    }

                    return (
                        <Space size={6}>
                            {/* XEM */}
                            <Button
                                type="text"
                                icon={<EyeOutlined />}
                                onClick={() => handleViewDetail(data)}
                                style={{
                                    color: '#1677ff',
                                    fontWeight: 500,
                                    padding: '4px 10px',
                                    height: 32,
                                    borderRadius: 6,
                                }}
                            >
                                Xem
                            </Button>

                            {/* HỦY */}
                            {(data.status === 'PENDING' ||
                                data.status === 'APPROVED') && (
                                    <Popconfirm
                                        title={
                                            data.status === 'APPROVED'
                                                ? 'Hủy đơn đã được duyệt?'
                                                : 'Hủy đơn nghỉ phép?'
                                        }
                                        description={
                                            data.status === 'APPROVED'
                                                ? 'Đơn đã được duyệt. Bạn có chắc chắn muốn hủy đơn này không?'
                                                : 'Bạn có chắc chắn muốn hủy đơn nghỉ phép này không?'
                                        }
                                        okText="Hủy đơn"
                                        cancelText="Không"
                                        okButtonProps={{
                                            danger: true,
                                        }}
                                        onConfirm={() => handleCancel(data)}
                                    >
                                        <Button
                                            type="text"
                                            danger
                                            icon={<CloseCircleOutlined />}
                                            style={{
                                                fontWeight: 500,
                                                padding: '4px 10px',
                                                height: 32,
                                                borderRadius: 6,
                                            }}
                                        >
                                            Hủy
                                        </Button>
                                    </Popconfirm>
                                )}
                        </Space>
                    );
                },
            },
        ],
        []
    );

    // =====================================================
    // CREATE REQUEST
    // =====================================================

    const handleCreateSubmit =
        async () => {
            try {
                const values =
                    await form.validateFields();

                const [
                    startDate,
                    endDate,
                ] = values.dateRange;

                /*
                 * Backend CreateLeaveRequestDto hiện tại:
                 *
                 * LeaveTypeId
                 * StartDate
                 * EndDate
                 * Reason
                 * IsPaid
                 *
                 */

                const dto: CreateLeaveRequestDto = {
                    leaveTypeId:
                        values.leaveTypeId,

                    isPaid: values.isPaid ?? true,

                    startDate:
                        startDate.format(
                            'YYYY-MM-DD'
                        ),

                    endDate:
                        endDate.format(
                            'YYYY-MM-DD'
                        ),

                    reason:
                        values.reason,
                };

                setSubmitting(true);

                await LeaveRequestService.createLeaveRequest(
                    dto
                );

                message.success(
                    'Tạo đơn xin nghỉ phép thành công.'
                );

                setIsCreateDrawerOpen(false);

                form.resetFields();

                // Sau khi tạo đơn:
                // quay về page 1
                setPageIndex(1);

                // Reload dữ liệu
                // fetchData sẽ chạy khi pageIndex/search thay đổi.
                //
                // Nếu pageIndex hiện tại đã là 1,
                // gọi trực tiếp để reload.
                if (pageIndex === 1) {
                    await fetchData();
                }
            } catch (err: any) {
                if (
                    err?.response?.data
                        ?.message
                ) {
                    message.error(
                        err.response.data.message
                    );
                }
            } finally {
                setSubmitting(false);
            }
        };

    // =====================================================
    // CLOSE CREATE DRAWER
    // =====================================================

    const handleCloseCreateDrawer =
        () => {
            if (!submitting) {
                setIsCreateDrawerOpen(false);
                form.resetFields();
            }
        };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <MainLayout>
            <div
                style={{
                    padding: 24,
                }}
            >
                <Card
                    title="Danh sách nghỉ phép của tôi"
                    extra={
                        <Button
                            type="primary"
                            icon={
                                <PlusOutlined />
                            }
                            onClick={() =>
                                setIsCreateDrawerOpen(
                                    true
                                )
                            }
                        >
                            Tạo đơn xin nghỉ
                        </Button>
                    }
                >
                    {/* =================================================
                        SEARCH
                    ================================================= */}

                    <Space
                        style={{
                            marginBottom: 16,
                        }}
                    >
                        <Input
                            placeholder="Tìm kiếm lý do / loại phép..."
                            value={searchTerm}
                            onChange={(e) =>
                                setSearchTerm(
                                    e.target.value
                                )
                            }
                            onPressEnter={
                                handleSearch
                            }
                            style={{
                                width: 300,
                            }}
                            prefix={
                                <SearchOutlined />
                            }
                            allowClear
                        />

                        <Button
                            type="primary"
                            onClick={
                                handleSearch
                            }
                        >
                            Tìm kiếm
                        </Button>
                    </Space>

                    {/* =================================================
                        AG GRID
                    ================================================= */}

                    <div
                        style={{
                            height: 520,
                            width: '100%',
                        }}
                    >
                        <AgGridReact
                            rowData={rowData}
                            columnDefs={
                                columnDefs
                            }
                            theme={
                                themeQuartz
                            }
                            loading={
                                loading
                            }
                            suppressCellFocus={
                                true
                            }
                        />
                    </div>

                    {/* =================================================
                        PAGINATION
                        
                        QUAN TRỌNG:
                        Không đặt trong selectedRequest &&
                    ================================================= */}

                    <div
                        style={{
                            width: '100%',
                            marginTop: 15,
                            paddingTop: 16,
                            borderTop:
                                '1px solid #f0f0f0',

                            display: 'flex',
                            justifyContent:
                                'flex-end',
                            alignItems:
                                'center',
                            gap: 24,
                        }}
                    >
                        {/* PAGE SIZE */}

                        <div
                            style={{
                                display:
                                    'flex',
                                alignItems:
                                    'center',
                                gap: 8,
                                fontSize: 14,
                            }}
                        >
                            <span>
                                Page Size:
                            </span>

                            <select
                                value={
                                    pageSize
                                }
                                onChange={(
                                    e
                                ) => {
                                    const newSize =
                                        Number(
                                            e
                                                .target
                                                .value
                                        );

                                    setPageSize(
                                        newSize
                                    );

                                    setPageIndex(
                                        1
                                    );
                                }}
                                style={{
                                    height: 34,
                                    minWidth: 70,
                                    padding:
                                        '0 8px',
                                    border:
                                        '1px solid #d9d9d9',
                                    borderRadius: 6,
                                    background:
                                        '#fff',
                                    cursor:
                                        'pointer',
                                }}
                            >
                                <option value={10}>
                                    10
                                </option>

                                <option value={20}>
                                    20
                                </option>

                                <option value={50}>
                                    50
                                </option>

                                <option value={100}>
                                    100
                                </option>
                            </select>
                        </div>

                        {/* RANGE */}

                        <span
                            style={{
                                fontSize: 14,
                            }}
                        >
                            {totalCount ===
                                0
                                ? '0 to 0 of 0'
                                : `${Math.min(
                                    (pageIndex -
                                        1) *
                                    pageSize +
                                    1,
                                    totalCount
                                )} to ${Math.min(
                                    pageIndex *
                                    pageSize,
                                    totalCount
                                )} of ${totalCount}`}
                        </span>

                        {/* PAGE X OF Y */}

                        <span
                            style={{
                                fontSize: 14,
                            }}
                        >
                            Page{' '}
                            <strong>
                                {
                                    pageIndex
                                }
                            </strong>{' '}
                            of{' '}
                            <strong>
                                {Math.max(
                                    1,
                                    totalPages ||
                                    Math.ceil(
                                        totalCount /
                                        pageSize
                                    )
                                )}
                            </strong>
                        </span>

                        {/* ANT DESIGN PAGINATION */}

                        <Pagination
                            current={
                                pageIndex
                            }
                            pageSize={
                                pageSize
                            }
                            total={
                                totalCount
                            }
                            onChange={(
                                page
                            ) => {
                                setPageIndex(
                                    page
                                );
                            }}
                            showSizeChanger={
                                false
                            }
                            showLessItems
                            disabled={
                                loading
                            }
                        />
                    </div>
                </Card>

                {/* =================================================
                    DRAWER TẠO ĐƠN
                ================================================= */}

                <Drawer
                    title="Tạo đơn xin nghỉ phép"
                    open={
                        isCreateDrawerOpen
                    }
                    onClose={
                        handleCloseCreateDrawer
                    }
                    size="large"
                    destroyOnHidden
                    footer={
                        <div
                            style={{
                                display:
                                    'flex',
                                justifyContent:
                                    'flex-end',
                                gap: 8,
                            }}
                        >
                            <Button
                                onClick={
                                    handleCloseCreateDrawer
                                }
                                disabled={
                                    submitting
                                }
                            >
                                Hủy
                            </Button>

                            <Button
                                type="primary"
                                loading={
                                    submitting
                                }
                                onClick={
                                    handleCreateSubmit
                                }
                            >
                                Gửi đơn
                            </Button>
                        </div>
                    }
                >
                    <Form
                        form={form}
                        layout="vertical"
                    >
                        {/* LOẠI PHÉP */}

                        <Form.Item
                            name="leaveTypeId"
                            label="Loại phép"
                            rules={[
                                {
                                    required:
                                        true,
                                    message:
                                        'Vui lòng nhập ID loại phép',
                                },
                            ]}
                        >
                            <Input
                                type="number"
                                size="large"
                                placeholder="Nhập ID loại phép"
                            />
                        </Form.Item>

                        <Form.Item
                            name="isPaid"
                            label="Hưởng lương"
                            valuePropName="checked"
                        >
                            <Switch
                                checkedChildren="Có lương"
                                unCheckedChildren="Không lương"
                            />
                        </Form.Item>

                        {/* THỜI GIAN */}

                        <Form.Item
                            name="dateRange"
                            label="Thời gian nghỉ"
                            rules={[
                                {
                                    required:
                                        true,
                                    message:
                                        'Vui lòng chọn thời gian nghỉ',
                                },
                            ]}
                        >
                            <RangePicker
                                style={{
                                    width:
                                        '100%',
                                }}
                                size="large"
                                format="DD/MM/YYYY"
                                disabledDate={(
                                    current
                                ) =>
                                    current &&
                                    current <
                                    dayjs().startOf(
                                        'day'
                                    )
                                }
                            />
                        </Form.Item>

                        {/* LÝ DO */}

                        <Form.Item
                            name="reason"
                            label="Lý do nghỉ"
                        >
                            <Input.TextArea
                                rows={5}
                                placeholder="Nhập lý do xin nghỉ..."
                                showCount
                                maxLength={500}
                            />
                        </Form.Item>
                    </Form>
                </Drawer>

                {/* =================================================
                    DRAWER CHI TIẾT
                ================================================= */}

                <Drawer
                    title="Chi tiết đơn nghỉ phép"
                    open={
                        isDetailDrawerOpen
                    }
                    onClose={() =>
                        setIsDetailDrawerOpen(
                            false
                        )
                    }
                    size="large"
                >
                    {selectedRequest && (
                        <>
                            <Descriptions
                                bordered
                                column={1}
                                size="middle"
                            >
                                <Descriptions.Item label="Mã đơn">
                                    #
                                    {
                                        selectedRequest.id
                                    }
                                </Descriptions.Item>

                                <Descriptions.Item label="Loại phép">
                                    {
                                        selectedRequest.leaveTypeName
                                    }
                                </Descriptions.Item>

                                <Descriptions.Item label="Hưởng lương">
                                    {selectedRequest.isPaid ? (
                                        <Tag color="blue">
                                            Có lương
                                        </Tag>
                                    ) : (
                                        <Tag color="orange">
                                            Không lương
                                        </Tag>
                                    )}
                                </Descriptions.Item>

                                <Descriptions.Item label="Từ ngày">
                                    {dayjs(
                                        selectedRequest.startDate
                                    ).format(
                                        'DD/MM/YYYY'
                                    )}
                                </Descriptions.Item>

                                <Descriptions.Item label="Đến ngày">
                                    {dayjs(
                                        selectedRequest.endDate
                                    ).format(
                                        'DD/MM/YYYY'
                                    )}
                                </Descriptions.Item>

                                <Descriptions.Item label="Số ngày nghỉ">
                                    {
                                        selectedRequest.totalRequestedDays
                                    }
                                </Descriptions.Item>

                                <Descriptions.Item label="Ngày tạo">
                                    {dayjs(
                                        selectedRequest.createdAt
                                    ).format(
                                        'DD/MM/YYYY HH:mm'
                                    )}
                                </Descriptions.Item>

                                <Descriptions.Item label="Trạng thái">
                                    {renderStatusTag(
                                        selectedRequest.status
                                    )}
                                </Descriptions.Item>

                                <Descriptions.Item label="Người duyệt">
                                    {selectedRequest.approverName ||
                                        '-'}
                                </Descriptions.Item>

                                <Descriptions.Item label="Lý do">
                                    {selectedRequest.reason ||
                                        '-'}
                                </Descriptions.Item>

                                {selectedRequest.status ===
                                    'REJECTED' && (
                                        <Descriptions.Item label="Lý do từ chối">
                                            {selectedRequest.rejectionReason ||
                                                '-'}
                                        </Descriptions.Item>
                                    )}
                            </Descriptions>

                            <Divider />

                            {/* =================================================
                                HỦY ĐƠN
                                
                                PENDING + APPROVED
                            ================================================= */}

                            {(selectedRequest.status === 'PENDING' ||
                                selectedRequest.status === 'APPROVED') && (
                                    <Popconfirm
                                        title="Hủy đơn nghỉ phép"
                                        description={
                                            selectedRequest.status === 'APPROVED'
                                                ? 'Đơn đã được duyệt. Bạn có chắc chắn muốn hủy đơn này không?'
                                                : 'Bạn có chắc chắn muốn hủy đơn này không?'
                                        }
                                        okText="Hủy đơn"
                                        cancelText="Không"
                                        okButtonProps={{
                                            danger: true,
                                        }}
                                        onConfirm={() => handleCancel(selectedRequest)}
                                    >
                                        <Button
                                            danger
                                            type="primary"
                                            icon={<CloseCircleOutlined />}
                                            size="large"
                                        >
                                            Hủy đơn
                                        </Button>
                                    </Popconfirm>
                                )}

                            {/* REJECTED */}

                            {selectedRequest.status ===
                                'REJECTED' && (
                                    <div
                                        style={{
                                            color: '#ff4d4f',
                                            fontSize: 14,
                                        }}
                                    >
                                        Đơn đã bị từ
                                        chối.
                                    </div>
                                )}

                            {/* CANCELLED */}

                            {selectedRequest.status ===
                                'CANCELLED' && (
                                    <div
                                        style={{
                                            color: '#8c8c8c',
                                            fontSize: 14,
                                        }}
                                    >
                                        Đơn đã được
                                        hủy.
                                    </div>
                                )}
                        </>
                    )}
                </Drawer>
            </div>
        </MainLayout>
    );
}