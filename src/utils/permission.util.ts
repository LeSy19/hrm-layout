import type { MyPermission } from "@/interfaces/permission.interface";

/**
 * Chuẩn hóa route để so sánh:
 *  - bỏ query, bỏ "/" đầu, bỏ tiền tố "api/", chuyển chữ thường
 *  - mọi tham số dạng {id}, {id:int}... đều thành "{}"
 */
const toSegments = (value: string): string[] =>
    value
        .split("?")[0]
        .toLowerCase()
        .replace(/\{[^}]+\}/g, "{}")
        .replace(/^\/+/, "")
        .replace(/^api\//, "")
        .replace(/\/+$/, "")
        .split("/");

/** Kiểm tra một đường dẫn thật (vd "/employees/5") có khớp route template của backend (vd "api/Employees/{id}") */
export const matchRoute = (template: string, path: string): boolean => {
    const t = toSegments(template);
    const p = toSegments(path);
    if (t.length !== p.length) return false;
    return t.every((seg, i) => seg === "{}" || seg === p[i]);
};

/** Danh sách permission có cho phép gọi `method path` không */
export const hasEndpointPermission = (
    permissions: MyPermission[],
    method: string,
    path: string
): boolean => {
    const m = method.toUpperCase();
    return permissions.some(
        (p) => p.httpMethod.toUpperCase() === m && matchRoute(p.routeTemplate, path)
    );
};