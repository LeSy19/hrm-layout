
export interface LeaveTypeFilterRequestDTO {
    pageIndex?: number;
    pageSize?: number;
    searchTerm?: string;
}

export interface LeaveTypeResponseDto {
    id: number;
    name: string;
    daysAllowed: number;
    isPaid: boolean;
    isActive: boolean;
}

export interface CreateLeaveTypeDto {
    name: string;
    daysAllowed: number;
    isPaid: boolean;
}

export interface UpdateLeaveTypeDto {
    name: string;
    daysAllowed: number;
    isPaid: boolean;
    isActive: boolean;
}