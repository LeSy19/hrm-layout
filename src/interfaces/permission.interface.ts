export interface Permission {
    id: number;
    code: string; // "Controller.Action", ví dụ "Employee.Create"
    name: string;
    description: string;
    module: string;
    action: string;
    httpMethod: string;
    routeTemplate: string;
    displayOrder: number;
}

export interface ModulePermissions {
    module: string;
    permissions: Permission[];
}

export interface Role {
    id: number;
    name: string;
    description: string;
}

export interface RolePermissionIds {
    roleId: number;
    permissionIds: number[];
}

/** Quyền của user đang đăng nhập (từ GET /auth/me/permissions) */
export interface MyPermission {
    code: string;
    httpMethod: string;
    routeTemplate: string;
}

export interface MyPermissionsResponse {
    isAdmin: boolean;
    permissions: MyPermission[];
}

export interface UpdatePermissionInfoPayload {
    name: string;
    description: string;
}