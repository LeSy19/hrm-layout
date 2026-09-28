
import axiosClient from "@/lib/axiosClient";
import { EndPoint } from "@/hooks/endpoint";
import { CreateJobTitleDto, JobTitleFilterRequestDTO, JobTitleResponseDto, UpdateJobTitleDto } from "@/interfaces/jobtitle.interface";
import { PaginatedResult } from "@/interfaces/pagination.interface";


export const jobtitleService = {

    //Lay danh sach jobtitle phan trang + loc
    async GetAllJobTitle(params: JobTitleFilterRequestDTO): Promise<PaginatedResult<JobTitleResponseDto>> {
        const response = await axiosClient.get<any, PaginatedResult<JobTitleResponseDto>>(EndPoint.JobTitles.GetAllJobTitles, {
            params,
        });
        return response;
    },

    //Lay jobtitle theo id
    async GetJobTitleById(id: number): Promise<JobTitleResponseDto> {
        const response = await axiosClient.get<JobTitleResponseDto>(EndPoint.JobTitles.GetJobTitleById(id));
        return response.data;
    },

    //Tao moi
    async createJobTitle(data: CreateJobTitleDto): Promise<JobTitleResponseDto> {
        const response = await axiosClient.post<JobTitleResponseDto>(EndPoint.JobTitles.createJobTitle, data);
        return response.data;
    },

    async updateJobTitle(id: number, data: UpdateJobTitleDto): Promise<JobTitleResponseDto> {
        const response = await axiosClient.put<JobTitleResponseDto>(EndPoint.JobTitles.updateJobTitle(id), data);
        return response.data;
    },

    //xoa
    async deleteJobTitle(id: number): Promise<boolean> {
        const response = await axiosClient.delete<JobTitleResponseDto>(EndPoint.JobTitles.deleteJobTitle(id));
        return response.status === 200 || response.status === 204;
    },
}