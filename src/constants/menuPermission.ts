import { APP_ROUTES } from "@/constants/routes";
import { EndPoint } from "@/hooks/endpoint";

/**
 * Mỗi trang cần quyền GET endpoint nào mới được vào (dùng cho menu và chặn truy cập).
 * Key là đường dẫn trang trong APP_ROUTES, value là endpoint trong EndPoint.
 */
export const ROUTE_ENDPOINT: Record<string, string> = {
    [APP_ROUTES.DASHBOARD]: EndPoint.Dashboard.GetSummaryMetrics,
    [APP_ROUTES.DEPARTMENT]: EndPoint.Departments.GetAllDepartments,
    [APP_ROUTES.EMPLOYEES]: EndPoint.Employees.GetAllEmployees,
    [APP_ROUTES.JOBTITLES]: EndPoint.JobTitles.GetAllJobTitles,
    [APP_ROUTES.LEAVETYPES]: EndPoint.LeaveTypes.GetAllLeaveTypes,
    [APP_ROUTES.LEAVEBALANCES]: EndPoint.LeaveBalances.GetAllBalances,
    [APP_ROUTES.LEAVEREQUESTS]: EndPoint.LeaveRequests.GetAllLeaveRequests,
    [APP_ROUTES.MY_REQUEST]: EndPoint.LeaveRequests.GetMyLeaveRequests,
    [APP_ROUTES.PENDING_REQUEST]: EndPoint.LeaveRequests.GetPendingLeaveRequests,
    [APP_ROUTES.UNPAID_SUMMARY]: EndPoint.LeaveRequests.GetUnpaidLeaveSummary,
};

/** Tìm endpoint cần quyền cho một pathname (khớp key dài nhất) */
export const getRequiredEndpoint = (pathname: string): string | undefined => {
    const key = Object.keys(ROUTE_ENDPOINT)
        .filter((k) => pathname === k || pathname.startsWith(k + "/"))
        .sort((a, b) => b.length - a.length)[0];
    return key ? ROUTE_ENDPOINT[key] : undefined;
};