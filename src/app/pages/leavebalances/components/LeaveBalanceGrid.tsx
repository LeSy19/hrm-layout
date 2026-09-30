'use client';

import React, {
    useState,
    useEffect,
    useMemo,
    useCallback,
} from 'react';

import { Tabs, Tag, Button, Pagination, message } from 'antd';
import { AgGridReact } from 'ag-grid-react';

import {
    ModuleRegistry,
    AllCommunityModule,
    themeQuartz,
} from 'ag-grid-community';

import { LeaveBalancesService } from '@/service/leavebalance.service';

import {
    LeaveBalanceResponseDto,
    AssignLeaveBalanceDto,
} from '@/interfaces/leavebalance.interface';

import LeaveBalanceDrawer from './LeaveBalanceDrawer';

import {
    getCurrentUser,
    UserInfo,
} from '@/utils/auth.util';

// Đăng ký toàn bộ AG Grid Community modules
ModuleRegistry.registerModules([AllCommunityModule]);

interface LeaveBalanceGridProps {
    searchTerm: string;
    selectedYear: number;

    isAssignDrawerOpen: boolean;
    setIsAssignDrawerOpen: (open: boolean) => void;

    isBulkDrawerOpen: boolean;
    setIsBulkDrawerOpen: (open: boolean) => void;

    refreshKey: number;
    onRefresh: () => void;
}

export const LeaveBalanceGrid: React.FC<LeaveBalanceGridProps> = ({
    searchTerm,
    selectedYear,

    isAssignDrawerOpen,
    setIsAssignDrawerOpen,

    isBulkDrawerOpen,
    setIsBulkDrawerOpen,

    refreshKey,
    onRefresh,
}) => {
    // =========================================================
    // STATE
    // =========================================================

    const [activeTab, setActiveTab] =
        useState<string>('my-balance');

    const [loading, setLoading] =
        useState<boolean>(false);

    const [balances, setBalances] =
        useState<LeaveBalanceResponseDto[]>([]);

    // Phân trang
    const [pageIndex, setPageIndex] =
        useState<number>(1);

    const [pageSize, setPageSize] =
        useState<number>(10);

    const [totalCount, setTotalCount] =
        useState<number>(0);

    // Dữ liệu dùng khi chỉnh sửa
    const [selectedInitialData, setSelectedInitialData] =
        useState<AssignLeaveBalanceDto | null>(null);

    // =========================================================
    // AUTH STATE
    // =========================================================

    /**
     * Không gọi getCurrentUser() trực tiếp trong render.
     *
     * Vì getCurrentUser() đọc localStorage nên nếu gọi trực tiếp
     * sẽ gây khác biệt giữa SSR và Client -> Hydration Error.
     */
    const [user, setUser] =
        useState<UserInfo | null>(null);

    /**
     * mounted = false:
     * Server + lần hydrate đầu tiên chỉ render tab cá nhân.
     *
     * mounted = true:
     * Client đã load user_info, lúc này mới kiểm tra role.
     */
    const [mounted, setMounted] =
        useState<boolean>(false);

    // =========================================================
    // LOAD USER SAU KHI CLIENT MOUNT
    // =========================================================

    useEffect(() => {
        const currentUser = getCurrentUser();

        setUser(currentUser);
        setMounted(true);
    }, []);

    // =========================================================
    // CHECK ROLE
    // =========================================================

    const userRole = user?.roleName ?? '';

    const isAdminOrManager =
        mounted &&
        (
            userRole.toUpperCase() === 'ADMIN' ||
            userRole.toUpperCase() === 'MANAGER'
        );

    // =========================================================
    // DEBUG - nếu cần thì bỏ comment
    // =========================================================

    /*
    useEffect(() => {
        console.log('===== LEAVE BALANCE AUTH =====');
        console.log('mounted:', mounted);
        console.log('user:', user);
        console.log('userRole:', userRole);
        console.log('isAdminOrManager:', isAdminOrManager);
        console.log('==============================');
    }, [
        mounted,
        user,
        userRole,
        isAdminOrManager,
    ]);
    */

    // =========================================================
    // BẢO ĐẢM EMPLOYEE KHÔNG THỂ VÀO ALL-BALANCES
    // =========================================================

    useEffect(() => {
        if (
            mounted &&
            !isAdminOrManager &&
            activeTab !== 'my-balance'
        ) {
            setActiveTab('my-balance');
        }
    }, [
        mounted,
        isAdminOrManager,
        activeTab,
    ]);

    // =========================================================
    // RESET PAGINATION
    // =========================================================

    useEffect(() => {
        setPageIndex(1);
    }, [
        activeTab,
        searchTerm,
        selectedYear,
    ]);

    // =========================================================
    // FETCH DATA
    // =========================================================

    const fetchGridData = useCallback(async () => {
        /**
         * Chưa mount thì chưa gọi API.
         *
         * Điều này rất quan trọng vì lúc SSR/client hydrate
         * chúng ta chưa biết user là Admin, Manager hay Employee.
         */
        if (!mounted) {
            return;
        }

        setLoading(true);

        try {
            const params = {
                pageIndex,
                pageSize,
                searchTerm,
                year: selectedYear,
            } as any;

            let res;

            // =====================================================
            // ADMIN / MANAGER
            // =====================================================

            if (
                activeTab === 'all-balances' &&
                isAdminOrManager
            ) {
                res =
                    await LeaveBalancesService.getAllLeaveBalances(
                        params
                    );
            }

            // =====================================================
            // EMPLOYEE / MY BALANCE
            // =====================================================

            else {
                res =
                    await LeaveBalancesService.getMyBalance(
                        params
                    );
            }

            setBalances(res?.items || []);
            setTotalCount(res?.totalCount || 0);

        } catch (error: any) {
            console.error(
                'Leave balance fetch error:',
                error
            );

            if (
                error?.response?.status === 403
            ) {
                message.error(
                    'Bạn không có quyền truy cập dữ liệu này.'
                );
            } else {
                message.error(
                    error?.response?.data?.message ||
                    'Lỗi khi tải dữ liệu số dư phép.'
                );
            }
        } finally {
            setLoading(false);
        }
    }, [
        mounted,
        activeTab,
        selectedYear,
        searchTerm,
        pageIndex,
        pageSize,
        isAdminOrManager,
    ]);

    // =========================================================
    // FETCH SAU KHI USER ĐÃ ĐƯỢC LOAD
    // =========================================================

    useEffect(() => {
        if (!mounted) {
            return;
        }

        fetchGridData();
    }, [
        mounted,
        fetchGridData,
        refreshKey,
    ]);

    // =========================================================
    // AG GRID COLUMNS
    // =========================================================

    const columnDefs = useMemo<any[]>(() => {
        const cols: any[] = [
            {
                headerName: 'Mã NV',
                field: 'employeeCode',
                width: 120,
                pinned: 'left',
            },

            {
                headerName: 'Tên Nhân Viên',
                field: 'employeeName',
                flex: 1.5,
                minWidth: 180,
                pinned: 'left',
            },

            {
                headerName: 'Loại Phép',
                field: 'leaveTypeName',
                flex: 1.2,
                minWidth: 160,
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
                headerName: 'Năm',
                field: 'year',
                width: 100,

                cellStyle: {
                    textAlign: 'center',
                },
            },

            {
                headerName: 'Tổng Ngày (Total)',
                field: 'totalDays',
                width: 150,

                valueFormatter: (params: any) =>
                    `${params.value ?? 0} ngày`,

                cellStyle: {
                    color: '#1677ff',
                    fontWeight: 600,
                },
            },

            {
                headerName: 'Đã Sử Dụng (Used)',
                field: 'usedDays',
                width: 150,

                valueFormatter: (params: any) =>
                    `${params.value ?? 0} ngày`,

                cellStyle: {
                    color: '#cf1322',
                },
            },

            {
                headerName: 'Còn Lại (Remaining)',
                field: 'remainingDays',
                width: 160,

                valueFormatter: (params: any) =>
                    `${params.value ?? 0} ngày`,

                cellStyle: (params: any) => ({
                    color:
                        (params.value ?? 0) > 0
                            ? '#3f8600'
                            : '#cf1322',

                    fontWeight: 'bold',
                }),
            },
        ];

        // =====================================================
        // ACTION COLUMN
        // CHỈ ADMIN / MANAGER + ALL BALANCES
        // =====================================================

        if (
            mounted &&
            activeTab === 'all-balances' &&
            isAdminOrManager
        ) {
            cols.push({
                headerName: 'Thao Tác',
                width: 120,
                pinned: 'right',

                cellRenderer: (params: any) => (
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            setSelectedInitialData({
                                employeeId:
                                    params.data.employeeId,

                                leaveTypeId:
                                    params.data.leaveTypeId,

                                year:
                                    params.data.year,

                                totalDays:
                                    params.data.totalDays,
                            });

                            setIsAssignDrawerOpen(true);
                        }}
                    >
                        Chỉnh sửa
                    </Button>
                ),
            });
        }

        return cols;
    }, [
        mounted,
        activeTab,
        isAdminOrManager,
        setIsAssignDrawerOpen,
    ]);

    // =========================================================
    // TAB ITEMS
    // =========================================================

    /**
     * QUAN TRỌNG:
     *
     * Không tạo tab all-balances trước khi mounted.
     *
     * Server:
     *   mounted = false
     *   => chỉ có my-balance
     *
     * Client hydrate:
     *   mounted = false
     *   => chỉ có my-balance
     *
     * Sau useEffect:
     *   mounted = true
     *   => Admin/Manager mới thêm all-balances
     */
    const tabItems: any[] = [
        {
            key: 'my-balance',

            label: (
                <span style={{ fontSize: 16, fontWeight: 500 }}>
                    Quỹ phép của tôi
                </span>
            ),

            children: (
                <div
                    style={{
                        width: '100%',
                        height: 500,
                    }}
                >
                    <AgGridReact
                        rowData={balances}
                        columnDefs={columnDefs}
                        theme={themeQuartz}
                        pagination={false}
                        loading={loading}
                        animateRows={true}
                        rowSelection={{
                            mode: 'singleRow',
                        }}
                        defaultColDef={{
                            resizable: true,
                            sortable: true,
                            filter: true,
                        }}
                    />
                </div>
            ),
        },
    ];

    // =========================================================
    // ALL BALANCES TAB
    // =========================================================

    if (
        mounted &&
        isAdminOrManager
    ) {
        tabItems.push({
            key: 'all-balances',

            label: (
                <span style={{ fontSize: 16, fontWeight: 500 }}>
                    Quản lý quỹ phép toàn công ty
                </span>
            ),

            children: (
                <div
                    style={{
                        width: '100%',
                        height: 500,
                    }}
                >
                    <AgGridReact
                        rowData={balances}
                        columnDefs={columnDefs}
                        theme={themeQuartz}
                        pagination={false}
                        loading={loading}
                        animateRows={true}
                        rowSelection={{
                            mode: 'singleRow',
                        }}
                        defaultColDef={{
                            resizable: true,
                            sortable: true,
                            filter: true,
                        }}
                    />
                </div>
            ),
        });
    }

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <>
            {/* =================================================
                TABS

                Employee:
                - Quỹ phép của tôi

                Admin / Manager:
                - Quỹ phép của tôi
                - Quản lý quỹ phép toàn công ty
            ================================================== */}

            <Tabs
                activeKey={activeTab}
                onChange={(key) => {
                    setActiveTab(key);
                }}
                items={tabItems}
                type="card"
            />

            {/* =================================================
                PAGINATION
            ================================================== */}

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',

                    background: '#fff',

                    padding: '12px 16px',

                    borderRadius: 8,

                    marginTop: 16,
                }}
            >
                <Pagination
                    current={pageIndex}
                    pageSize={pageSize}
                    total={totalCount}

                    showSizeChanger

                    pageSizeOptions={[
                        '10',
                        '20',
                        '50',
                        '100',
                    ]}

                    onChange={(page, size) => {
                        setPageIndex(page);
                        setPageSize(size);
                    }}

                    showTotal={(total) =>
                        `Tổng số ${total} bản ghi`
                    }
                />
            </div>

            {/* =================================================
                DRAWERS
                CHỈ ADMIN / MANAGER
            ================================================== */}

            {mounted && isAdminOrManager && (
                <>
                    {/* Cấp / chỉnh sửa quỹ phép cá nhân */}

                    <LeaveBalanceDrawer
                        type="assign"

                        open={isAssignDrawerOpen}

                        onClose={() => {
                            setIsAssignDrawerOpen(false);
                            setSelectedInitialData(null);
                        }}

                        selectedYear={selectedYear}

                        initialData={
                            selectedInitialData
                        }

                        onSuccess={onRefresh}
                    />

                    {/* Cấp quỹ phép hàng loạt */}

                    <LeaveBalanceDrawer
                        type="bulk"

                        open={isBulkDrawerOpen}

                        onClose={() => {
                            setIsBulkDrawerOpen(false);
                        }}

                        selectedYear={selectedYear}

                        onSuccess={onRefresh}
                    />
                </>
            )}
        </>
    );
};

export default LeaveBalanceGrid;