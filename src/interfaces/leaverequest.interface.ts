export interface LeaveRequestFilterRequestDTO {
    pageIndex?: number;
    pageSize?: number;
    searchTerm?: string;

    month?: number;
    year?: number;
}

export interface LeaveRequestResponseDto {
    id: number;
    employeeId: number;
    employeeName: string;
    employeeCode: string;
    leaveTypeId: number;
    leaveTypeName: string;
    isPaid: boolean;
    startDate: string;
    endDate: string;
    totalRequestedDays: number;
    reason?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
    approvedBy?: number;
    approverName?: string;
    rejectionReason?: string;
    createdAt: string;
}

export interface CreateLeaveRequestDto {
    leaveTypeId: number;
    isPaid: boolean;
    startDate: string;
    endDate: string;
    reason?: string;
}

export interface ApproveLeaveRequestDto {
    isApproved: boolean;
    rejectionReason?: string;
}

export interface UnpaidLeaveSummaryDto {
    employeeId: number;
    employeeCode: string;
    fullName: string;
    departmentName?: string;
    month: number;
    year: number;
    totalUnpaidDays: number;
}
