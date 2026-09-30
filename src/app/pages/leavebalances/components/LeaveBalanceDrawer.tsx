'use client';

import React, { useEffect, useState } from 'react';
import {
    Drawer,
    Form,
    InputNumber,
    Button,
    Space,
    Alert,
    Typography,
    message,
    Select,
} from 'antd';
import { LeaveBalancesService } from '@/service/leavebalance.service';
import {
    AssignLeaveBalanceDto,
    BulkAssignLeaveBalanceDto,
} from '@/interfaces/leavebalance.interface';
import { EmployeeResponseDTO } from '@/interfaces/employee.interface';
import { employeeService } from '@/service/employee.service';
import { LeaveTypeResponseDto } from '@/interfaces/leavetype.interface';
import { leavetypeService } from '@/service/leavetype.service';

const { Text } = Typography;

interface LeaveBalanceDrawerProps {
    type: 'assign' | 'bulk';
    open: boolean;
    onClose: () => void;
    selectedYear: number;
    initialData?: AssignLeaveBalanceDto | null;
    onSuccess: () => void;
}

export const LeaveBalanceDrawer: React.FC<LeaveBalanceDrawerProps> = ({
    type,
    open,
    onClose,
    selectedYear,
    initialData,
    onSuccess,
}) => {
    const [form] = Form.useForm();
    const [employees, setEmployees] = useState<EmployeeResponseDTO[]>([]);
    const [leaveTypes, setLeaveTypes] = useState<LeaveTypeResponseDto[]>([]);

    const isAssignMode = type === 'assign';
    const isEditMode = isAssignMode && !!initialData;

    useEffect(() => {
        const loadEmployees = async () => {
            try {
                const res = await employeeService.getAllEmployees({
                    pageIndex: 1,
                    pageSize: 1000,
                });

                setEmployees(res?.items || []);
            } catch (error) {
                console.error(error);
            }
        };

        if (open && type === 'assign') {
            loadEmployees();
        }
    }, [open, type]);

    useEffect(() => {
        const loadLeaveTypes = async () => {
            try {
                const res =
                    await leavetypeService.getAllLeaveTypes({
                        pageIndex: 1,
                        pageSize: 1000,
                    });

                setLeaveTypes(res?.items || []);
            } catch (error) {
                console.error(error);
            }
        };

        if (open) {
            loadLeaveTypes();
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;

        form.resetFields();

        if (isAssignMode) {
            if (initialData) {
                // Chỉnh sửa quỹ phép cá nhân
                form.setFieldsValue({
                    employeeId: initialData.employeeId,
                    leaveTypeId: initialData.leaveTypeId,
                    year: initialData.year,
                    totalDays: initialData.totalDays,
                });
            } else {
                // Cấp mới cá nhân
                form.setFieldsValue({
                    year: selectedYear,
                    totalDays: 12,
                });
            }
        } else {
            // Cấp hàng loạt
            form.setFieldsValue({
                year: selectedYear,
                totalDays: 12,
            });
        }
    }, [
        open,
        isAssignMode,
        initialData,
        selectedYear,
        form,
    ]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            if (isAssignMode) {
                const data: AssignLeaveBalanceDto = {
                    employeeId: values.employeeId,
                    leaveTypeId: values.leaveTypeId,
                    year: values.year,
                    totalDays: values.totalDays,
                };

                console.log('Assign leave balance:', data);

                await LeaveBalancesService.assignLeaveBalance(data);

                message.success(
                    isEditMode
                        ? 'Cập nhật quỹ phép cá nhân thành công!'
                        : 'Cấp quỹ phép cá nhân thành công!'
                );
            } else {
                const data: BulkAssignLeaveBalanceDto = {
                    leaveTypeId: values.leaveTypeId,
                    year: values.year,
                    totalDays: values.totalDays,
                };

                console.log('Bulk assign leave balance:', data);

                await LeaveBalancesService.bulkAssignLeaveBalance(data);

                message.success(
                    `Cấp quỹ phép hàng loạt cho năm ${values.year} thành công!`
                );
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Leave balance error:', error);

            if (error?.response?.data?.message) {
                message.error(error.response.data.message);
            } else if (error?.message) {
                message.error(error.message);
            } else {
                message.error('Có lỗi xảy ra khi xử lý quỹ phép.');
            }
        }
    };

    return (
        <Drawer
            title={
                isAssignMode
                    ? isEditMode
                        ? 'Chỉnh sửa quỹ phép cá nhân'
                        : 'Cấp quỹ phép cá nhân'
                    : 'Cấp quỹ phép hàng loạt'
            }
            size={480}
            open={open}
            onClose={onClose}
            destroyOnHidden
            extra={
                <Space>
                    <Button onClick={onClose}>
                        Hủy
                    </Button>

                    <Button
                        type="primary"
                        onClick={handleSubmit}
                    >
                        {isAssignMode
                            ? isEditMode
                                ? 'Lưu thay đổi'
                                : 'Cấp phép'
                            : 'Xác nhận cấp hàng loạt'}
                    </Button>
                </Space>
            }
        >
            {!isAssignMode && (
                <Alert
                    title="Thông báo nghiệp vụ"
                    description={
                        <span>
                            Hệ thống sẽ áp dụng cho tất cả nhân viên có trạng thái{' '}
                            <Text strong>ACTIVE</Text>, sau đó khởi tạo hoặc cập nhật{' '}
                            <Text strong>TotalDays</Text> và tính lại{' '}
                            <Text strong>RemainingDays</Text> cho năm được chọn.
                        </span>
                    }
                    type="warning"
                    showIcon
                    style={{ marginBottom: 20 }}
                />
            )}

            <Form
                form={form}
                layout="vertical"
            >
                {/* =========================
                    CẤP CÁ NHÂN
                ========================== */}
                {isAssignMode && (
                    <Form.Item
                        name="employeeId"
                        label="Nhân viên"
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng chọn nhân viên',
                            },
                        ]}
                    >
                        <Select
                            size="large"
                            showSearch
                            placeholder="Chọn nhân viên"
                            optionFilterProp="label"
                            disabled={isEditMode}
                            options={employees.map((employee) => ({
                                value: employee.id,
                                label: `${employee.employeeCode} - ${employee.fullName}`,
                            }))}
                        />
                    </Form.Item>
                )}

                {/* =========================
                    LOẠI PHÉP
                ========================== */}
                <Form.Item
                    name="leaveTypeId"
                    label="Loại phép"
                    rules={[
                        {
                            required: true,
                            message: 'Vui lòng chọn loại phép',
                        },
                    ]}
                >
                    <Select
                        size="large"
                        showSearch
                        placeholder="Chọn loại phép"
                        optionFilterProp="label"
                        options={leaveTypes.map((leaveType) => ({
                            value: leaveType.id,
                            label: leaveType.name,
                        }))}
                    />
                </Form.Item>

                {/* =========================
                    NĂM
                ========================== */}
                <Form.Item
                    name="year"
                    label="Năm áp dụng"
                    rules={[
                        {
                            required: true,
                            message: 'Vui lòng nhập năm áp dụng',
                        },
                    ]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        min={2020}
                        max={2100}
                    />
                </Form.Item>

                {/* =========================
                    TỔNG NGÀY PHÉP
                ========================== */}
                <Form.Item
                    name="totalDays"
                    label="Tổng số ngày phép"
                    rules={[
                        {
                            required: true,
                            message: 'Vui lòng nhập số ngày phép',
                        },
                        {
                            type: 'number',
                            min: 0,
                            message: 'Số ngày phép không được nhỏ hơn 0',
                        },
                    ]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        step={0.5}
                        placeholder="Ví dụ: 12"
                    />
                </Form.Item>
            </Form>
        </Drawer>
    );
};

export default LeaveBalanceDrawer;