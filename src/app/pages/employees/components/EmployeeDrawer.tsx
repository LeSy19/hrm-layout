"use client";

import { useState, useEffect } from "react";
import { Drawer, Select } from "antd";
import {
    EmployeeResponseDTO,
    CreateEmployeeDTO,
    UpdateEmployeeDTO,
} from "@/interfaces/employee.interface";
import { departmentService } from "@/service/department.service";
import { jobtitleService } from "@/service/jobtitle.service";
import { employeeService } from "@/service/employee.service";

interface EmployeeDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateEmployeeDTO | UpdateEmployeeDTO) => Promise<void>;
    employee: EmployeeResponseDTO | null; // Null -> Create, có dữ liệu -> Update
}

interface OptionType {
    id: number;
    name: string;
}

export default function EmployeeDrawer({
    isOpen,
    onClose,
    onSubmit,
    employee,
}: EmployeeDrawerProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        fullName: "",
        phone: "",
        hireDate: new Date().toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
        status: "ACTIVE",
        roleId: 3,
        departmentId: "" as number | string,
        jobTitleId: "" as number | string,
        managerId: "" as number | string,
    });

    const [departments, setDepartments] = useState<OptionType[]>([]);
    const [jobTitles, setJobTitles] = useState<OptionType[]>([]);
    const [managers, setManagers] = useState<OptionType[]>([]);
    const [showPassword, setShowPassword] = useState(false);

    // 1. Tải dữ liệu dropdown khi mở
    useEffect(() => {
        if (isOpen) {
            const fetchDropdownOptions = async () => {
                try {
                    const deptRes = await departmentService.getAllDepartments({ pageIndex: 1, pageSize: 100 });
                    setDepartments(deptRes.items.map((d) => ({ id: d.id, name: d.name })));

                    const jobRes = await jobtitleService.GetAllJobTitle({ pageIndex: 1, pageSize: 100 });
                    setJobTitles(jobRes.items.map((j) => ({ id: j.id, name: j.titleName })));

                    const activeManagerIds = new Set(
                        deptRes.items
                            .map((d) => d.managerId)
                            .filter((id): id is number => id !== null && id !== undefined)
                    );

                    const empRes = await employeeService.getAllEmployees({ pageIndex: 1, pageSize: 100 });

                    setManagers(
                        empRes.items
                            .filter(
                                (e) =>
                                    e.id !== employee?.id &&
                                    e.status === "ACTIVE" &&
                                    activeManagerIds.has(e.id)
                            )
                            .map((e) => ({
                                id: e.id,
                                name: `${e.fullName} (${e.employeeCode})`,
                            }))
                    );
                } catch (error) {
                    console.error("Lỗi khi tải dữ liệu Dropdown:", error);
                }
            };

            fetchDropdownOptions();
        }
    }, [isOpen, employee]);

    // 2. Đồng bộ dữ liệu Form
    useEffect(() => {
        if (employee) {
            setFormData({
                username: employee.username,
                email: employee.email,
                password: "",
                fullName: employee.fullName,
                phone: employee.phone || "",
                hireDate: employee.hireDate ? employee.hireDate.split("T")[0] : "",
                endDate: employee.endDate ? employee.endDate.split("T")[0] : "",
                status: employee.status,
                roleId: employee.roleId || 3,
                departmentId: employee.departmentId || "",
                jobTitleId: employee.jobTitleId || "",
                managerId: employee.managerId || "",
            });
        } else {
            setFormData({
                username: "",
                email: "",
                password: "123456",
                fullName: "",
                phone: "",
                hireDate: new Date().toISOString().split("T")[0],
                endDate: new Date().toISOString().split("T")[0],
                status: "PROBATION",
                roleId: 3,
                departmentId: "",
                jobTitleId: "",
                managerId: "",
            });
        }
    }, [employee, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (employee) {
                const updateData: UpdateEmployeeDTO = {
                    email: formData.email,
                    fullName: formData.fullName,
                    phone: formData.phone || null,
                    hireDate: formData.hireDate,
                    endDate: formData.endDate,
                    status: formData.status,
                    roleId: Number(formData.roleId),
                    departmentId: formData.departmentId ? Number(formData.departmentId) : null,
                    jobTitleId: formData.jobTitleId ? Number(formData.jobTitleId) : null,
                    managerId: formData.managerId ? Number(formData.managerId) : null,
                };
                await onSubmit(updateData);
            } else {
                const createData: CreateEmployeeDTO = {
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    fullName: formData.fullName,
                    phone: formData.phone || null,
                    hireDate: formData.hireDate,
                    endDate: formData.endDate,
                    status: formData.status,
                    roleId: Number(formData.roleId),
                    departmentId: formData.departmentId ? Number(formData.departmentId) : null,
                    jobTitleId: formData.jobTitleId ? Number(formData.jobTitleId) : null,
                    managerId: formData.managerId ? Number(formData.managerId) : null,
                };
                await onSubmit(createData);
            }
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Component Form JSX để tái sử dụng
    const renderFormContent = () => (
        <form id="employee-form"
            onSubmit={handleSubmit}
            className="employee-form">
            {/* Username (Chỉ hiện khi tạo mới) */}
            {!employee && (
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Username *</label>
                    <input
                        required
                        type="text"
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                </div>
            )}



            {/* Họ và tên */}
            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Họ và tên *</label>
                <input
                    required
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
            </div>

            {/* Email & Số điện thoại */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Email *</label>
                    <input
                        required
                        type="email"
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Số điện thoại</label>
                    <input
                        type="text"
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                </div>
            </div>

            {/* Mật khẩu (Chỉ hiện khi tạo mới) */}
            {!employee && (
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Mật khẩu *
                    </label>

                    <div className="relative">
                        <input
                            required
                            type={showPassword ? 'text' : 'password'}
                            className="w-full border rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    password: e.target.value,
                                })
                            }
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        >
                            {showPassword ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 013.157-4.694M6.228 6.228A9.97 9.97 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.97 9.97 0 01-2.157 3.594M6.228 6.228L3 3m3.228 3.228L21 21"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Trạng thái & Phòng ban */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Trạng thái</label>
                    <select
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                        <option value="PROBATION">PROBATION (Thử việc)</option>
                        <option value="ACTIVE">ACTIVE (Chính thức)</option>
                        <option value="ON_LEAVE">ON_LEAVE (Nghỉ phép)</option>
                        <option value="TERMINATED">TERMINATED (Đã nghỉ)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Phòng ban
                    </label>

                    <Select
                        className="w-full"
                        placeholder="-- Chọn phòng ban --"
                        value={formData.departmentId || null}
                        onChange={(value) =>
                            setFormData({
                                ...formData,
                                departmentId: value,
                            })
                        }
                        options={departments.map((d) => ({
                            value: d.id,
                            label: d.name,
                        }))}
                        listHeight={192}
                        style={{ width: '100%' }}
                        styles={{
                            placeholder: {
                                color: '#333',
                                opacity: 1,
                            },
                        }}
                    />
                </div>
            </div>

            {/* Quản lý & Chức danh */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Người quản lý (Manager)</label>
                    <Select
                        className="w-full"
                        placeholder="-- Chọn quản lý --"
                        value={formData.managerId || undefined}
                        onChange={(value) =>
                            setFormData({
                                ...formData,
                                managerId: value,
                            })
                        }
                        options={managers.map((m) => ({
                            value: m.id,
                            label: m.name,
                        }))}
                        listHeight={192}
                        style={{ width: '100%' }}
                        styles={{
                            placeholder: {
                                color: '#333',
                                opacity: 1,
                            },
                        }}
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Chức danh (Job Title)
                    </label>

                    <Select
                        className="w-full"
                        placeholder="-- Chọn chức danh --"
                        value={formData.jobTitleId || null}
                        onChange={(value) =>
                            setFormData({
                                ...formData,
                                jobTitleId: value,
                            })
                        }
                        options={jobTitles.map((j) => ({
                            value: j.id,
                            label: j.name,
                        }))}
                        listHeight={192}
                        style={{ width: '100%' }}
                        styles={{
                            placeholder: {
                                color: '#333',
                                opacity: 1,
                            },
                        }}
                    />
                </div>
            </div>

            {/* Ngày vào làm & Ngày kết thúc */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Ngày vào làm</label>
                    <input
                        type="date"
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.hireDate}
                        onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Ngày kết thúc</label>
                    <input
                        type="date"
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                </div>
            </div>


        </form>
    );

    // DÙNG DRAWER CHO CẢ THÊM VÀ SỬA
    // ================================
    return (
        <Drawer
            title={
                <div className="employee-drawer-title">
                    <div className="employee-drawer-title-main">
                        {employee
                            ? 'Chỉnh sửa nhân viên'
                            : 'Thêm nhân viên mới'}
                    </div>

                    <div className="employee-drawer-title-sub">
                        {employee
                            ? 'Cập nhật thông tin nhân viên'
                            : 'Nhập thông tin để tạo nhân viên mới'}
                    </div>
                </div>
            }
            placement="right"
            size="large"
            open={isOpen}
            onClose={onClose}
            destroyOnHidden
            className="employee-drawer"
            styles={{
                body: {
                    padding: 0,
                },
                footer: {
                    padding: 0,
                },
            }}
            footer={
                <div className="employee-drawer-footer">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="employee-btn employee-btn-cancel"
                    >
                        Hủy
                    </button>

                    <button
                        type="submit"
                        form="employee-form"
                        disabled={loading}
                        className="employee-btn employee-btn-primary"
                    >
                        {loading
                            ? 'Đang xử lý...'
                            : employee
                                ? 'Lưu thay đổi'
                                : 'Tạo nhân viên'}
                    </button>
                </div>
            }
        >
            <div className="employee-drawer-body">
                {renderFormContent()}
            </div>
        </Drawer>
    );
}