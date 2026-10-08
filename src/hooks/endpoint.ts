export const EndPoint = {
    Dashboard: {
        GetSummaryMetrics: "/dashboard/summary",
        GetDepartmentCounts: "/dashboard/department-counts",
        GetEmployeeLeaveToday: "/dashboard/on-leave-today",
        GetMonthlyLeaveStatus: "/dashboard/monthly-leave-status",
    },
    Employees: {
        GetAllEmployees: "/employees",
        GetEmployeeById: (id: number) => `/employees/${id}`,
        CreateEmployee: "/employees",
        UpdateEmployee: (id: number) => `/employees/${id}`,
        DeleteEmployee: (id: number) => `/employees/${id}`,
    },
    Departments: {
        GetAllDepartments: "/departments",
        GetDepartmentById: (id: number) => `/departments/${id}`,
        createDepartment: "/departments",
        updateDepartment: (id: number) => `/departments/${id}`,
        deleteDepartment: (id: number) => `/departments/${id}`,

    },
    JobTitles: {
        GetAllJobTitles: "/jobtitles",
        GetJobTitleById: (id: number) => `/jobtitles/${id}`,
        createJobTitle: "/jobtitles",
        updateJobTitle: (id: number) => `/jobtitles/${id}`,
        deleteJobTitle: (id: number) => `/jobtitles/${id}`,
    },
    LeaveBalances: {
        GetMyBalance: "/leavebalances/my-balance",
        GetAllBalances: "/leavebalances",
        AssignLeaveBalance: "/leavebalances/assign",
        BulkAssignLeaveBalance: "/leavebalances/bulk-assign",

    },
    LeaveTypes: {
        GetAllLeaveTypes: "/leavetypes",
        GetLeaveTypeById: (id: number) => `/leavetypes/${id}`,
        createLeaveType: "/leavetypes",
        updateLeaveType: (id: number) => `/leavetypes/${id}`,
        deleteLeaveType: (id: number) => `/leavetypes/${id}`,
    },
    LeaveRequests: {
        GetMyLeaveRequests: "/leaverequests/my-requests",
        GetPendingLeaveRequests: "/leaverequests/request-pending",
        GetAllLeaveRequests: "/leaverequests",
        GetUnpaidLeaveSummary: "/leaverequests/unpaid-summary",
        CreateLeaveRequest: "/leaverequests",
        ProcessLeaveRequest: (id: number) => `/leaverequests/${id}/process`,
        CancelLeaveRequest: (id: number) => `/leaverequests/${id}/cancel`,
    },
    // Quản lý phân quyền (chỉ ADMIN)
    RolePermissions: {
        GetRoles: "/rolepermission/roles",
        GetAllPermissions: "/rolepermission/permissions",
        GetPermissionsByRole: (roleId: number) => `/rolepermission/roles/${roleId}/permissions`,
        UpdateRolePermissions: (roleId: number) => `/rolepermission/roles/${roleId}/permissions`,
        UpdatePermissionInfo: (id: number) => `/rolepermission/permissions/${id}`,
        SyncEndpoints: "/rolepermission/sync",
    },
    Auth: {
        GetMyPermissions: "/auth/me/permissions",
    }

} as const