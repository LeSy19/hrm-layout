'use client';

import { useEffect, useState } from 'react';
import { Drawer, Form, Input, Select } from 'antd';

import {
    DepartmentResponseDto,
    CreateDepartmentDto,
} from '@/interfaces/department.interface';

import { employeeService } from '@/service/employee.service';

interface DepartmentModalProps {
    isOpen: boolean;
    editingDepartment: DepartmentResponseDto | null;
    onClose: () => void;
    onSubmit: (values: CreateDepartmentDto) => void | Promise<void>;
}

interface EmployeeOption {
    id: number;
    fullName: string;
    employeeCode: string;
}

export default function DepartmentDrawer({
    isOpen,
    editingDepartment,
    onClose,
    onSubmit,
}: DepartmentModalProps) {
    const [form] = Form.useForm();

    const [employees, setEmployees] = useState<EmployeeOption[]>([]);
    const [loadingEmployees, setLoadingEmployees] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // LẤY DANH SÁCH NHÂN VIÊN
    useEffect(() => {
        if (!isOpen) return;

        const fetchEmployees = async () => {
            try {
                setLoadingEmployees(true);

                const res = await employeeService.getAllEmployees({
                    pageIndex: 1,
                    pageSize: 100,
                });

                const activeEmployees = res.items
                    .filter((e) => e.status === 'ACTIVE')
                    .map((e) => ({
                        id: e.id,
                        fullName: e.fullName,
                        employeeCode: e.employeeCode,
                    }));

                setEmployees(activeEmployees);
            } catch (error) {
                console.error(
                    'Lỗi khi tải danh sách nhân viên:',
                    error
                );
            } finally {
                setLoadingEmployees(false);
            }
        };

        fetchEmployees();

        // =========================
        // EDIT
        // =========================
        if (editingDepartment) {
            form.setFieldsValue({
                code: editingDepartment.code,
                name: editingDepartment.name,
                managerId: editingDepartment.managerId ?? undefined,
            });
        }
        // CREATE
        else {
            form.resetFields();
        }
    }, [isOpen, editingDepartment, form]);

    // =========================
    // SUBMIT
    // =========================
    const handleFormSubmit = async (values: CreateDepartmentDto) => {
        try {
            setSubmitting(true);

            await onSubmit(values);

            form.resetFields();
        } catch (error) {
            console.error('Lỗi khi submit:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Drawer
            title={
                <div>
                    <div className="text-lg font-semibold text-gray-800">
                        {editingDepartment
                            ? 'Cập nhật phòng ban'
                            : 'Thêm mới phòng ban'}
                    </div>

                    <div className="text-sm text-gray-500 font-normal mt-1">
                        {editingDepartment
                            ? 'Chỉnh sửa thông tin phòng ban'
                            : 'Nhập thông tin để tạo phòng ban mới'}
                    </div>
                </div>
            }
            placement="right"
            open={isOpen}
            onClose={onClose}
            size="large"
            destroyOnHidden
            styles={{
                body: {
                    padding: '24px',
                },
            }}
            footer={
                <div className="flex justify-end gap-2 pt-4 border-t mt-5 mb-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Hủy
                    </button>

                    <button
                        type="button"
                        onClick={() => form.submit()}
                        disabled={submitting}
                        className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {submitting
                            ? 'Đang xử lý...'
                            : editingDepartment
                                ? 'Cập nhật'
                                : 'Tạo mới'}
                    </button>
                </div>
            }
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFormSubmit}
                requiredMark="optional"
            >
                {/* =========================
                    MÃ PHÒNG BAN
                ========================= */}
                <Form.Item
                    name="code"
                    label={
                        <span className="font-medium">
                            Mã phòng ban
                        </span>
                    }
                    rules={[
                        {
                            required: true,
                            message: 'Vui lòng nhập mã phòng ban!',
                        },
                        {
                            whitespace: true,
                            message:
                                'Mã phòng ban không được để trống!',
                        },
                    ]}
                >
                    <Input
                        placeholder="VD: HR, IT, FIN, MKT, SALES"
                        disabled={!!editingDepartment}
                        maxLength={20}
                        size="large"
                    />
                </Form.Item>

                {/* =========================
                    TÊN PHÒNG BAN
                ========================= */}
                <Form.Item
                    name="name"
                    label={
                        <span className="font-medium">
                            Tên phòng ban
                        </span>
                    }
                    rules={[
                        {
                            required: true,
                            message:
                                'Vui lòng nhập tên phòng ban!',
                        },
                        {
                            whitespace: true,
                            message:
                                'Tên phòng ban không được để trống!',
                        },
                    ]}
                >
                    <Input
                        placeholder="VD: Phòng Nhân sự"
                        maxLength={100}
                        size="large"
                    />
                </Form.Item>

                {/* =========================
                    TRƯỞNG PHÒNG
                ========================= */}
                <Form.Item
                    name="managerId"
                    label={
                        <span className="font-medium">
                            Trưởng phòng
                        </span>
                    }
                    tooltip="Chọn nhân viên sẽ làm trưởng phòng. Có thể bỏ trống nếu chưa phân công."
                >
                    <Select
                        placeholder="-- Chọn trưởng phòng --"
                        loading={loadingEmployees}
                        allowClear
                        showSearch
                        size="large"
                        options={employees.map((employee) => ({
                            value: employee.id,
                            label: `${employee.fullName} (${employee.employeeCode})`,
                        }))}
                        listHeight={200}
                    />
                </Form.Item>
            </Form>
        </Drawer>
    );
}