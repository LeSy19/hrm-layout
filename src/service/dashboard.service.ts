import axiosClient from "@/lib/axiosClient";
import { EndPoint } from "@/hooks/endpoint";
import {
    DashboardSummaryDto,
    DepartmentEmployeeCountDto,
    EmployeeOnLeaveTodayDto,
    MonthlyLeaveStatusDto,
} from "@/interfaces/dashboard.interface";

export const DashboardService = {
    // 1. Thống kê chỉ số tổng quan
    async getSummary(): Promise<DashboardSummaryDto> {
        const response = await axiosClient.get<any, DashboardSummaryDto>(
            EndPoint.Dashboard.GetSummaryMetrics
        );
        return response;
    },

    // 2. Thống kê nhân sự theo phòng ban
    async getDepartmentCounts(): Promise<DepartmentEmployeeCountDto[]> {
        const response = await axiosClient.get<any, DepartmentEmployeeCountDto[]>(
            EndPoint.Dashboard.GetDepartmentCounts
        );
        return response;
    },

    // 3. Danh sách nhân viên nghỉ phép hôm nay
    async getEmployeesOnLeaveToday(): Promise<EmployeeOnLeaveTodayDto[]> {
        const response = await axiosClient.get<any, EmployeeOnLeaveTodayDto[]>(
            EndPoint.Dashboard.GetEmployeeLeaveToday
        );
        return response;
    },

    // 4. Thống kê trạng thái đơn nghỉ phép trong tháng
    async getMonthlyLeaveStatus(month?: number, year?: number): Promise<MonthlyLeaveStatusDto> {
        const response = await axiosClient.get<any, MonthlyLeaveStatusDto>(
            EndPoint.Dashboard.GetMonthlyLeaveStatus,
            { params: { month, year } }
        );
        return response;
    },
};