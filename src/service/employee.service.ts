import axiosClient from "@/lib/axiosClient";
import { EndPoint } from "@/hooks/endpoint";
import {
    EmployeeFilterRequestDTO,
    EmployeeResponseDTO,
    CreateEmployeeDTO,
    UpdateEmployeeDTO,
} from "@/interfaces/employee.interface";
import { PaginatedResult } from "@/interfaces/pagination.interface";

export const employeeService = {
    // Lấy danh sách phân trang + lọc
    async getAllEmployees(params: EmployeeFilterRequestDTO): Promise<PaginatedResult<EmployeeResponseDTO>> {
        const response = await axiosClient.get<any, PaginatedResult<EmployeeResponseDTO>>(
            EndPoint.Employees.GetAllEmployees,
            { params }
        );
        return response;
    },

    // Lấy chi tiết nhân viên theo ID
    async getEmployeeById(id: number): Promise<EmployeeResponseDTO> {
        const response = await axiosClient.get<EmployeeResponseDTO>(EndPoint.Employees.GetEmployeeById(id));
        return response.data;
    },

    // Tạo nhân viên mới
    async createEmployee(data: CreateEmployeeDTO): Promise<EmployeeResponseDTO> {
        const response = await axiosClient.post<EmployeeResponseDTO>(EndPoint.Employees.CreateEmployee, data);
        return response.data;
    },

    // Cập nhật thông tin nhân viên
    async updateEmployee(id: number, data: UpdateEmployeeDTO): Promise<EmployeeResponseDTO> {
        const response = await axiosClient.put<EmployeeResponseDTO>(EndPoint.Employees.UpdateEmployee(id), data);
        return response.data;
    },

    // Xóa nhân viên
    async deleteEmployee(id: number): Promise<boolean> {
        const response = await axiosClient.delete(EndPoint.Employees.DeleteEmployee(id));
        return response.status === 200 || response.status === 204;
    },
};