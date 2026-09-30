export interface DashboardSummaryDto {
    totalActiveEmployees: number;
    totalProbationEmployees: number;
    totalDepartments: number;
    employeesOnLeaveToday: number;
}

export interface DepartmentEmployeeCountDto {
    departmentId: number;
    departmentCode: string;
    departmentName: string;
    totalEmployees: number;
}

export interface EmployeeOnLeaveTodayDto {
    employeeId: number;
    employeeCode: string;
    fullName: string;
    departmentName: string;
    leaveTypeName: string;
    startDate: string;
    endDate: string;
    totalDays: number;
}

export interface MonthlyLeaveStatusDto {
    month: number;
    year: number;
    totalPending: number;
    totalApproved: number;
    totalRejected: number;
}