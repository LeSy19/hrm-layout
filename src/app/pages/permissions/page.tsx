"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Alert,
    Button,
    Card,
    Input,
    Select,
    Space,
    Tag,
    Typography,
    message,
} from "antd";
import {
    ReloadOutlined,
    SaveOutlined,
    SyncOutlined,
} from "@ant-design/icons";
import { AgGridReact } from "ag-grid-react";
import {
    AllCommunityModule,
    ModuleRegistry,
    type CellValueChangedEvent,
    type ColDef,
    type GridApi,
    type GridReadyEvent,
    type ICellRendererParams,
} from "ag-grid-community";

import { permissionService } from "@/service/permission.service";
import type { Permission, Role } from "@/interfaces/permission.interface";
import MainLayout from "@/app/layouts/MainLayout";

ModuleRegistry.registerModules([AllCommunityModule]);

const { Title, Text } = Typography;

const METHOD_COLORS: Record<string, string> = {
    GET: "green",
    POST: "blue",
    PUT: "orange",
    PATCH: "gold",
    DELETE: "red",
};

const isAdminRole = (role?: Role) => role?.name?.toUpperCase() === "ADMIN";

const sameSet = (a: number[], b: number[]) => {
    if (a.length !== b.length) return false;
    const s = new Set(a);
    return b.every((x) => s.has(x));
};

export default function PermissionPage() {
    const [messageApi, contextHolder] = message.useMessage();

    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [roleId, setRoleId] = useState<number | undefined>();
    const [savedIds, setSavedIds] = useState<number[]>([]); // quyền đang lưu trong DB
    const [currentIds, setCurrentIds] = useState<number[]>([]); // quyền đang tick trên lưới

    const [quickFilter, setQuickFilter] = useState("");
    const [moduleFilter, setModuleFilter] = useState<string | undefined>();

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [syncing, setSyncing] = useState(false);

    const gridApiRef = useRef<GridApi<Permission> | null>(null);
    const [gridReady, setGridReady] = useState(false);

    const selectedRole = useMemo(() => roles.find((r) => r.id === roleId), [roles, roleId]);
    const isAdmin = isAdminRole(selectedRole);
    const dirty = !isAdmin && !sameSet(savedIds, currentIds);

    const modules = useMemo(
        () => Array.from(new Set(permissions.map((p) => p.module))).sort(),
        [permissions]
    );

    // ---------- Tải dữ liệu ----------
    const loadPermissions = useCallback(async () => {
        const data = await permissionService.getAllPermissions();
        setPermissions(data);
        return data;
    }, []);

    const loadRolePermissions = useCallback(
        async (id: number, allPermissions: Permission[], role?: Role) => {
            // ADMIN luôn có toàn quyền nên hiển thị tất cả đều được tick
            const ids = isAdminRole(role)
                ? allPermissions.map((p) => p.id)
                : await permissionService.getPermissionIdsByRole(id);
            setSavedIds(ids);
            setCurrentIds(ids);
        },
        []
    );

    const init = useCallback(async () => {
        setLoading(true);
        try {
            const [roleList, permList] = await Promise.all([
                permissionService.getRoles(),
                permissionService.getAllPermissions(),
            ]);
            setRoles(roleList);
            setPermissions(permList);

            // Mặc định chọn role đầu tiên không phải ADMIN
            const first = roleList.find((r) => !isAdminRole(r)) ?? roleList[0];
            if (first) {
                setRoleId(first.id);
                await loadRolePermissions(first.id, permList, first);
            }
        } catch (e: any) {
            messageApi.error(e?.message ?? "Không tải được dữ liệu phân quyền.");
        } finally {
            setLoading(false);
        }
    }, [loadRolePermissions, messageApi]);

    useEffect(() => {
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleRoleChange = async (id: number) => {
        setRoleId(id);
        setLoading(true);
        try {
            await loadRolePermissions(id, permissions, roles.find((r) => r.id === id));
        } catch (e: any) {
            messageApi.error(e?.message ?? "Không tải được quyền của role.");
        } finally {
            setLoading(false);
        }
    };

    // ---------- Đồng bộ trạng thái tick trên lưới ----------
    useEffect(() => {
        const api = gridApiRef.current;
        if (!api || !gridReady) return;
        const set = new Set(savedIds);
        api.forEachNode((node) => {
            if (node.data) node.setSelected(set.has(node.data.id));
        });
    }, [savedIds, permissions, gridReady]);

    const onSelectionChanged = useCallback(() => {
        const api = gridApiRef.current;
        if (!api) return;
        setCurrentIds(api.getSelectedRows().map((r) => r.id));
    }, []);

    // ---------- Bộ lọc theo module (external filter) ----------
    const isExternalFilterPresent = useCallback(() => !!moduleFilter, [moduleFilter]);
    const doesExternalFilterPass = useCallback(
        (node: { data?: Permission }) => !moduleFilter || node.data?.module === moduleFilter,
        [moduleFilter]
    );
    useEffect(() => {
        gridApiRef.current?.onFilterChanged();
    }, [moduleFilter]);

    // ---------- Hành động ----------
    const handleSave = async () => {
        if (!roleId) return;
        setSaving(true);
        try {
            await permissionService.updateRolePermissions(roleId, currentIds);
            setSavedIds(currentIds);
            messageApi.success(`Đã lưu phân quyền cho role ${selectedRole?.name}.`);
        } catch (e: any) {
            messageApi.error(e?.message ?? "Lưu phân quyền thất bại.");
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        // Trả về trạng thái đã lưu
        setSavedIds([...savedIds]);
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            await permissionService.syncEndpoints();
            const list = await loadPermissions();
            if (roleId) await loadRolePermissions(roleId, list, selectedRole);
            messageApi.success("Đã quét lại endpoint từ backend.");
        } catch (e: any) {
            messageApi.error(e?.message ?? "Đồng bộ endpoint thất bại.");
        } finally {
            setSyncing(false);
        }
    };

    const onCellValueChanged = async (e: CellValueChangedEvent<Permission>) => {
        if (!e.data) return;
        try {
            await permissionService.updatePermissionInfo(e.data.id, {
                name: e.data.name,
                description: e.data.description,
            });
            messageApi.success("Đã cập nhật thông tin permission.");
        } catch (err: any) {
            messageApi.error(err?.message ?? "Cập nhật thất bại.");
            e.node.setDataValue(e.colDef.field as string, e.oldValue); // hoàn tác trên lưới
        }
    };

    // ---------- Cột ----------
    const columnDefs = useMemo<ColDef<Permission>[]>(
        () => [
            { field: "module", headerName: "Module", width: 150, filter: true },
            {
                field: "httpMethod",
                headerName: "Method",
                width: 110,
                filter: true,
                cellRenderer: (p: ICellRendererParams<Permission>) =>
                    p.value ? <Tag color={METHOD_COLORS[p.value] ?? "default"}>{p.value}</Tag> : null,
            },
            { field: "routeTemplate", headerName: "Route", flex: 1.2, minWidth: 220, filter: true },
            { field: "code", headerName: "Mã quyền", flex: 1, minWidth: 180, filter: true },
            {
                field: "name",
                headerName: "Tên hiển thị (nhấp đúp để sửa)",
                flex: 1.2,
                minWidth: 200,
                editable: true,
            },
            {
                field: "description",
                headerName: "Mô tả (nhấp đúp để sửa)",
                flex: 1.2,
                minWidth: 200,
                editable: true,
            },
        ],
        []
    );

    const defaultColDef = useMemo<ColDef>(() => ({ sortable: true, resizable: true }), []);

    return (
        <MainLayout>
            <div style={{ padding: 24 }}>
                {contextHolder}

                <Space orientation="vertical" size={16} style={{ width: "100%" }}>
                    <div>
                        <Title level={3} style={{ marginBottom: 0 }}>
                            Quản lý phân quyền
                        </Title>
                        <Text type="secondary">
                            Chọn role, tick các endpoint được phép sử dụng rồi bấm Lưu. Thay đổi có hiệu lực ngay.
                        </Text>
                    </div>

                    <Card>
                        <Space wrap size={12} style={{ width: "100%", justifyContent: "space-between" }}>
                            <Space wrap size={12}>
                                <Select
                                    style={{ width: 220 }}
                                    placeholder="Chọn role"
                                    value={roleId}
                                    loading={loading}
                                    onChange={handleRoleChange}
                                    options={roles.map((r) => ({
                                        value: r.id,
                                        label: r.description ? `${r.name} - ${r.description}` : r.name,
                                    }))}
                                />
                                <Select
                                    style={{ width: 200 }}
                                    placeholder="Lọc theo module"
                                    allowClear
                                    value={moduleFilter}
                                    onChange={setModuleFilter}
                                    options={modules.map((m) => ({ value: m, label: m }))}
                                />
                                <Input.Search
                                    style={{ width: 260 }}
                                    placeholder="Tìm route, mã quyền, tên..."
                                    allowClear
                                    onChange={(e) => setQuickFilter(e.target.value)}
                                />
                            </Space>

                            <Space wrap size={12}>
                                <Button icon={<SyncOutlined />} loading={syncing} onClick={handleSync}>
                                    Quét lại endpoint
                                </Button>
                                <Button icon={<ReloadOutlined />} disabled={!dirty} onClick={handleReset}>
                                    Hoàn tác
                                </Button>
                                <Button
                                    type="primary"
                                    icon={<SaveOutlined />}
                                    loading={saving}
                                    disabled={!dirty}
                                    onClick={handleSave}
                                >
                                    Lưu phân quyền
                                </Button>
                            </Space>
                        </Space>

                        {isAdmin && (
                            <Alert
                                style={{ marginTop: 16 }}
                                type="info"
                                showIcon
                                title="Role ADMIN luôn có toàn quyền nên không thể chỉnh sửa."
                            />
                        )}

                        <div style={{ marginTop: 12 }}>
                            <Text type="secondary">
                                Đã chọn <b>{currentIds.length}</b> / {permissions.length} endpoint
                                {dirty && <Tag color="warning" style={{ marginLeft: 8 }}>Chưa lưu</Tag>}
                            </Text>
                        </div>
                    </Card>

                    <div
                        className="ag-theme-quartz"
                        style={{
                            height: "calc(100vh - 330px)",
                            minHeight: 400,
                            width: "100%",
                            // Khóa thao tác tick khi xem role ADMIN
                            pointerEvents: isAdmin ? "none" : "auto",
                            opacity: isAdmin ? 0.7 : 1,
                        }}
                    >
                        <AgGridReact<Permission>
                            rowData={permissions}
                            columnDefs={columnDefs}
                            defaultColDef={defaultColDef}
                            getRowId={(p) => String(p.data.id)}
                            rowSelection={{
                                mode: "multiRow",
                                checkboxes: true,
                                headerCheckbox: true,
                                enableClickSelection: false,
                                selectAll: "filtered",
                            }}
                            quickFilterText={quickFilter}
                            isExternalFilterPresent={isExternalFilterPresent}
                            doesExternalFilterPass={doesExternalFilterPass}
                            onGridReady={(e: GridReadyEvent<Permission>) => {
                                gridApiRef.current = e.api;
                                setGridReady(true);
                            }}
                            onSelectionChanged={onSelectionChanged}
                            onCellValueChanged={onCellValueChanged}
                            animateRows
                            loading={loading}
                        />
                    </div>
                </Space>
            </div>
        </MainLayout>
    );
}
