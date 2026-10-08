import axiosClient from "@/lib/axiosClient";
import { EndPoint } from "@/hooks/endpoint";
import { PaginatedResult } from "@/interfaces/pagination.interface";
import { CreateLeaveRequestDto, LeaveRequestFilterRequestDTO, LeaveRequestResponseDto, UnpaidLeaveSummaryDto } from "@/interfaces/leaverequest.interface";

export const LeaveRequestService = {
    // danh sách nghỉ phép của tôi
    async GetMyRequests(params: LeaveRequestFilterRequestDTO): Promise<PaginatedResult<LeaveRequestResponseDto>> {
        const response = await axiosClient.get<any, PaginatedResult<LeaveRequestResponseDto>>(
            EndPoint.LeaveRequests.GetMyLeaveRequests,
            { params }
        );
        return response;
    },

    // danh sách nghỉ phép
    async GetPendingRequests(params: LeaveRequestFilterRequestDTO): Promise<PaginatedResult<LeaveRequestResponseDto>> {
        const response = await axiosClient.get<any, PaginatedResult<LeaveRequestResponseDto>>(
            EndPoint.LeaveRequests.GetPendingLeaveRequests,
            { params }
        );
        console.log('response', response);
        return response;
    },

    // danh sách nghỉ phép
    async GetAllLeaveRequests(params: LeaveRequestFilterRequestDTO): Promise<PaginatedResult<LeaveRequestResponseDto>> {
        const response = await axiosClient.get<any, PaginatedResult<LeaveRequestResponseDto>>(
            EndPoint.LeaveRequests.GetAllLeaveRequests,
            { params }
        );
        console.log('response', response);
        return response;
    },


    async GetUnpaidLeaveSummary(params: LeaveRequestFilterRequestDTO): Promise<UnpaidLeaveSummaryDto> {

        const response =
            await axiosClient.get<any, UnpaidLeaveSummaryDto>(
                EndPoint.LeaveRequests.GetUnpaidLeaveSummary,
                { params }
            );

        console.log('response', response);
        return response;
    },

    // tạo đơn xin nghỉ phép
    async createLeaveRequest(data: CreateLeaveRequestDto): Promise<LeaveRequestResponseDto> {
        const response = await axiosClient.post<LeaveRequestResponseDto>(EndPoint.LeaveRequests.CreateLeaveRequest, data);
        return response.data;
    },

    //xử lý đơn xin nghỉ phép (duyệt hoặc từ chối)
    async processLeaveRequest(id: number, isApproved: boolean, rejectionReason?: string): Promise<LeaveRequestResponseDto> {
        const response = await axiosClient.put<LeaveRequestResponseDto>(EndPoint.LeaveRequests.ProcessLeaveRequest(id), { isApproved, rejectionReason });
        return response.data;
    },

    // hủy đơn xin nghỉ phép
    async cancelLeaveRequest(id: number): Promise<LeaveRequestResponseDto> {
        const response = await axiosClient.put<LeaveRequestResponseDto>(EndPoint.LeaveRequests.CancelLeaveRequest(id));
        return response.data;
    }

};