'use client'

import { LeaveTypeResponseDto } from "@/interfaces/leavetype.interface";
import { PaginatedResult } from "@/interfaces/pagination.interface";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { AllCommunityModule, ColDef, ModuleRegistry, PaginationModule, RowSelectionModule, themeQuartz } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { Button, Popconfirm, Space, Tag } from "antd";
import { useMemo } from "react";

ModuleRegistry.registerModules([
    PaginationModule,
    RowSelectionModule,
    AllCommunityModule,
]);

interface LeaveTypeGridProps {
    leavetypes: LeaveTypeResponseDto[],
    loading: boolean,
    onEditingLeaveType: (Record: LeaveTypeResponseDto) => void,
    onDeleteLeaveType: (id: number) => void,
}


const LeaveTypeGrid = ({ leavetypes, loading, onEditingLeaveType, onDeleteLeaveType }: LeaveTypeGridProps) => {

    const columnDefs = useMemo<ColDef<LeaveTypeResponseDto>[]>(
        () => [
            {
                headerName: 'STT',
                valueGetter: (params: any) =>
                    params.node?.rowIndex != null
                        ? params.node.rowIndex + 1
                        : '',
                width: 80,
                pinned: 'left',
                sortable: false,
                filter: false,
            },

            {
                field: 'name',
                headerName: 'Tên loại phép ',
                filter: true,
                sortable: true,
                width: 160,
            },

            {
                field: 'daysAllowed',
                headerName: 'Số ngày nghỉ',
                filter: true,
                sortable: true,
                flex: 1,
                minWidth: 180,
            },
            {
                field: 'isPaid',
                headerName: 'Tính lương',
                filter: true,
                sortable: true,
                flex: 1,
                minWidth: 150,
                cellRenderer: (params: any) => {
                    return params.value ? (
                        <Tag color="green">Có lương</Tag>
                    ) : (
                        <Tag color="red">Không lương</Tag>
                    );
                },
            },
            {
                field: 'isActive',
                headerName: 'Trạng thái',
                filter: true,
                sortable: true,
                flex: 1.5,
                minWidth: 200,

                cellRenderer: (params: any) => {
                    const isActive = params.value;

                    if (isActive === null || isActive === undefined) {
                        return '-';
                    }

                    return isActive ? (
                        <Tag color="green">
                            Đang hoạt động
                        </Tag>
                    ) : (
                        <Tag color="red">
                            Ngưng hoạt động
                        </Tag>
                    );
                },
            },
            {
                headerName: 'Thao tác',
                width: 140,
                pinned: 'right',
                sortable: false,
                filter: false,

                cellRenderer: (params: any) => {
                    const record =
                        params.data as LeaveTypeResponseDto;

                    if (!record) {
                        return null;
                    }

                    return (
                        <Space size="small">
                            {/* EDIT */}
                            <Button
                                type="text"
                                icon={
                                    <EditOutlined
                                        style={{
                                            color: '#1677ff',
                                        }}
                                    />
                                }
                                onClick={() => onEditingLeaveType(record)}
                            />

                            {/* DELETE */}
                            <Popconfirm
                                title="Xác nhận xóa"
                                description="Bạn có chắc chắn muốn xóa phòng ban này?"
                                onConfirm={() =>
                                    onDeleteLeaveType(record.id)
                                }
                                okText="Xóa"
                                cancelText="Hủy"
                                okButtonProps={{
                                    danger: true,
                                }}
                            >
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                />
                            </Popconfirm>
                        </Space>
                    );
                },
            },
        ], [onEditingLeaveType, onDeleteLeaveType]);



    return (
        <div
            style={{
                width: '100%',
                height: 500,
            }}
        >
            <AgGridReact<LeaveTypeResponseDto>
                rowData={leavetypes}
                columnDefs={columnDefs}

                /* AG Grid 36 Theme API */
                theme={themeQuartz}

                //* Tắt phân trang của AG Grid vì Backend đã cắt dữ liệu */
                pagination={false}

                /* Loading */
                loading={loading}

                /* Animation */
                animateRows={true}

                /* Selection */
                rowSelection={{
                    mode: 'singleRow',
                }}

                /* Default column */
                defaultColDef={{
                    resizable: true,
                    sortable: true,
                    filter: true,
                }}
            />
        </div>
    );
};

export default LeaveTypeGrid;