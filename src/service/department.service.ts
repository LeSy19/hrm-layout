import { PaginatedResult, PaginationParams } from '@/interfaces/pagination.interface';
import {
    DepartmentResponseDto,
    CreateDepartmentDto,
    UpdateDepartmentDto,
    DepartmentFilterRequestDTO,
} from '../interfaces/department.interface';
import axiosClient from "@/lib/axiosClient";
import { EndPoint } from "@/hooks/endpoint";

export const departmentService = {
    // Lấy danh sách phòng ban phân trang (Trả về toàn bộ đối tượng PaginatedResult)
    getAllDepartments: async (params?: DepartmentFilterRequestDTO): Promise<PaginatedResult<DepartmentResponseDto>> => {
        // Vì axiosClient interceptor đã unwrap response.data,
        // nên response ở đây CHÍNH LÀ đối tượng PaginatedResult<DepartmentResponseDto>
        const response = await axiosClient.get<any, PaginatedResult<DepartmentResponseDto>>(
            EndPoint.Departments.GetAllDepartments,
            { params }
        );
        return response;
    },

    // Lấy chi tiết 1 phòng ban
    getDepartmentById: async (id: number): Promise<DepartmentResponseDto> => {
        const response = await axiosClient.get<DepartmentResponseDto>(EndPoint.Departments.GetDepartmentById(id));
        return response.data;
    },

    // Tạo phòng ban mới
    createDepartment: async (data: CreateDepartmentDto): Promise<DepartmentResponseDto> => {
        const response = await axiosClient.post<DepartmentResponseDto>(EndPoint.Departments.createDepartment, data);
        return response.data;
    },

    // Cập nhật phòng ban
    updateDepartment: async (
        id: number,
        data: UpdateDepartmentDto
    ): Promise<DepartmentResponseDto> => {
        const response = await axiosClient.put<DepartmentResponseDto>(
            EndPoint.Departments.updateDepartment(id),
            data
        );
        return response.data;
    },

    // Xóa phòng ban
    deleteDepartment: async (id: number): Promise<void> => {
        await axiosClient.delete(EndPoint.Departments.deleteDepartment(id));
    },
};

