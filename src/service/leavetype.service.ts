import axiosClient from "@/lib/axiosClient";
import { EndPoint } from "@/hooks/endpoint";

import { PaginatedResult } from "@/interfaces/pagination.interface";
import { CreateLeaveTypeDto, LeaveTypeFilterRequestDTO, LeaveTypeResponseDto, UpdateLeaveTypeDto } from "@/interfaces/leavetype.interface";

export const leavetypeService = {
    // Lấy danh sách phân trang + lọc
    async getAllLeaveTypes(params: LeaveTypeFilterRequestDTO): Promise<PaginatedResult<LeaveTypeResponseDto>> {
        const response = await axiosClient.get<any, PaginatedResult<LeaveTypeResponseDto>>(
            EndPoint.LeaveTypes.GetAllLeaveTypes,
            { params }
        );
        return response;
    },

    // Lấy chi tiết leavetype theo ID
    async getLeaveTypeById(id: number): Promise<LeaveTypeResponseDto> {
        const response = await axiosClient.get<LeaveTypeResponseDto>(EndPoint.LeaveTypes.GetLeaveTypeById(id));
        return response.data;
    },

    // Tạo mới
    async createLeaveType(data: CreateLeaveTypeDto): Promise<LeaveTypeResponseDto> {
        const response = await axiosClient.post<LeaveTypeResponseDto>(EndPoint.LeaveTypes.createLeaveType, data);
        return response.data;
    },

    // Cập nhật thông tin
    async updateLeaveType(id: number, data: UpdateLeaveTypeDto): Promise<LeaveTypeResponseDto> {
        const response = await axiosClient.put<LeaveTypeResponseDto>(EndPoint.LeaveTypes.updateLeaveType(id), data);
        return response.data;
    },

    // Xóa 
    async deleteLeaveType(id: number): Promise<boolean> {
        const response = await axiosClient.delete(EndPoint.LeaveTypes.deleteLeaveType(id));
        return response.status === 200 || response.status === 204;
    },
};