import axiosClient from "@/lib/axiosClient";
import { EndPoint } from "@/hooks/endpoint";
import { AssignLeaveBalanceDto, BulkAssignLeaveBalanceDto, LeaveBalanceFilterRequestDTO, LeaveBalanceResponseDto } from "@/interfaces/leavebalance.interface";
import { PaginatedResult } from "@/interfaces/pagination.interface";

export const LeaveBalancesService = {
    // Lấy danh sách phân trang + lọc
    async getAllLeaveBalances(params: LeaveBalanceFilterRequestDTO): Promise<PaginatedResult<LeaveBalanceResponseDto>> {
        const response = await axiosClient.get<any, PaginatedResult<LeaveBalanceResponseDto>>(
            EndPoint.LeaveBalances.GetAllBalances,
            { params }
        );
        return response;
    },

    async getMyBalance(params: LeaveBalanceFilterRequestDTO): Promise<PaginatedResult<LeaveBalanceResponseDto>> {
        const response = await axiosClient.get<any, PaginatedResult<LeaveBalanceResponseDto>>(
            EndPoint.LeaveBalances.GetMyBalance,
            { params }
        );
        return response;
    },


    // Cấp phép cho 1 nhân viên
    async assignLeaveBalance(data: AssignLeaveBalanceDto): Promise<LeaveBalanceResponseDto> {
        const response = await axiosClient.post<LeaveBalanceResponseDto>(EndPoint.LeaveBalances.AssignLeaveBalance, data);
        return response.data;
    },

    // Cấp phép cho toàn bộ nhân viên
    async bulkAssignLeaveBalance(data: BulkAssignLeaveBalanceDto): Promise<LeaveBalanceResponseDto> {
        const response = await axiosClient.post<LeaveBalanceResponseDto>(EndPoint.LeaveBalances.BulkAssignLeaveBalance, data);
        return response.data;
    },


};