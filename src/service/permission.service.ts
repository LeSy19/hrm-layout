import axiosClient from "@/lib/axiosClient";
import { EndPoint } from "@/hooks/endpoint";

import type {
    ModulePermissions,
    MyPermissionsResponse,
    Permission,
    Role,
    RolePermissionIds,
    UpdatePermissionInfoPayload,
} from "@/interfaces/permission.interface";

export const permissionService = {
    // Lấy danh sách role (chỉ ADMIN gọi được)
    async getRoles(): Promise<Role[]> {
        const response = await axiosClient.get<any, Role[]>(
            EndPoint.RolePermissions.GetRoles
        );
        return response;
    },

    // Lấy tất cả endpoint (permission), gộp các nhóm module thành danh sách phẳng
    async getAllPermissions(): Promise<Permission[]> {
        const response = await axiosClient.get<any, ModulePermissions[]>(
            EndPoint.RolePermissions.GetAllPermissions
        );
        return response.flatMap((g) => g.permissions);
    },

    // Lấy danh sách permission id mà một role đang được cấp
    async getPermissionIdsByRole(roleId: number): Promise<number[]> {
        const response = await axiosClient.get<any, RolePermissionIds>(
            EndPoint.RolePermissions.GetPermissionsByRole(roleId)
        );
        return response.permissionIds ?? [];
    },

    // Lưu (ghi đè) danh sách permission của role
    async updateRolePermissions(roleId: number, permissionIds: number[]): Promise<void> {
        await axiosClient.put(
            EndPoint.RolePermissions.UpdateRolePermissions(roleId),
            { permissionIds }
        );
    },

    // Đổi tên/mô tả hiển thị của permission
    async updatePermissionInfo(id: number, data: UpdatePermissionInfoPayload): Promise<void> {
        await axiosClient.put(
            EndPoint.RolePermissions.UpdatePermissionInfo(id),
            data
        );
    },

    // Quét lại toàn bộ endpoint trên backend
    async syncEndpoints(): Promise<void> {
        await axiosClient.post(EndPoint.RolePermissions.SyncEndpoints);
    },

    // Quyền của user đang đăng nhập (dùng ẩn/hiện menu, nút)
    async getMyPermissions(): Promise<MyPermissionsResponse> {
        const response = await axiosClient.get<any, MyPermissionsResponse>(
            EndPoint.Auth.GetMyPermissions
        );
        return response;
    },
};