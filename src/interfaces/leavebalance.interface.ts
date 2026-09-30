
export interface LeaveBalanceFilterRequestDTO {
    pageIndex?: number;
    pageSize?: number;
    searchTerm?: string;
}

export interface LeaveBalanceResponseDto {
    id: number;
    employeeId: number;
    employeeName: string;
    employeeCode: string;
    leaveTypeId: number;
    leaveTypeName: string;
    isPaid: boolean;
    year: number;
    totalDays: number;
    usedDays: number;
    remainingDays: number;
}

export interface AssignLeaveBalanceDto {
    employeeId: number;
    leaveTypeId: number;
    year: number;
    totalDays: number;
}

export interface BulkAssignLeaveBalanceDto {
    leaveTypeId: number;
    year: number;
    totalDays: number;
}