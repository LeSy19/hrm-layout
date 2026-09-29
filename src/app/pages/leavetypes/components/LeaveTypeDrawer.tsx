'use client'

import { CreateLeaveTypeDto, LeaveTypeResponseDto } from "@/interfaces/leavetype.interface";
import { Drawer, Form, Input, InputNumber, Select, Switch } from "antd";
import { useEffect, useState } from "react";

interface LeaveTypeDrawerProps {
    isOpen: boolean,
    editingLeaveType: LeaveTypeResponseDto | null,
    onClose: () => void,
    onSubmitLeaveType: (values: CreateLeaveTypeDto) => void | Promise<void>,

}
const LeaveTypeDrawer = ({ isOpen, editingLeaveType, onClose, onSubmitLeaveType }: LeaveTypeDrawerProps) => {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    //Lay danh sach
    useEffect(() => {
        if (!isOpen) return;

        if (editingLeaveType) {
            form.setFieldsValue({
                name: editingLeaveType.name,
                daysAllowed: editingLeaveType.daysAllowed,
                isPaid: editingLeaveType.isPaid,
                isActive: editingLeaveType.isActive,
            });
        } else {
            form.resetFields();
        }
    }, [isOpen, editingLeaveType, form])

    //Xu ly submit
    const handleSubmitLeaveTypesForm = async (values: CreateLeaveTypeDto) => {
        try {
            setSubmitting(true);
            await onSubmitLeaveType(values);
            form.resetFields();
        } catch (error) {
            console.error('Lỗi khi submit:', error);
        } finally {
            setSubmitting(false);
        }
    }
    return (
        <Drawer
            title={
                <div>
                    <div className="text-lg font-semibold text-gray-800">
                        {editingLeaveType
                            ? 'Cập nhật loại phép'
                            : 'Thêm mới loại phép'}
                    </div>

                    <div className="text-sm text-gray-500 font-normal mt-1">
                        {editingLeaveType
                            ? 'Chỉnh sửa thông tin loại phép'
                            : 'Nhập thông tin để tạo loại phép mới'}
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
                            : editingLeaveType
                                ? 'Cập nhật'
                                : 'Tạo mới'}
                    </button>
                </div>
            }
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmitLeaveTypesForm}
                requiredMark="optional"
            >

                <Form.Item
                    name="name"
                    label={
                        <span className="font-medium">
                            Tên loại phép
                        </span>
                    }
                    rules={[
                        {
                            required: true,
                            message: 'Vui lòng nhập tên loại phép!',
                        },
                        {
                            whitespace: true,
                            message: 'Tên loại phép không được để trống!',
                        },
                    ]}
                >
                    <Input
                        disabled={!!editingLeaveType}
                        maxLength={100}
                        size="large"
                    />
                </Form.Item>

                {/* =========================
        {/* =========================
    NGÀY CHO PHÉP
========================= */}
                <Form.Item
                    name="daysAllowed"
                    label={
                        <span className="font-medium">
                            Số ngày cho phép
                        </span>
                    }
                    rules={[
                        {
                            required: true,
                            message: 'Vui lòng nhập số ngày cho phép!',
                        },
                    ]}
                >
                    <InputNumber
                        placeholder="VD: 12"
                        min={0}
                        max={365}
                        precision={1}
                        size="large"
                        className="w-full"
                    />
                </Form.Item>

                <Form.Item
                    name="isPaid"
                    label={
                        <span className="font-medium">
                            Hưởng lương
                        </span>
                    }
                >
                    <Select
                        size="large"
                        options={[
                            {
                                value: true,
                                label: '🟢 Có lương',
                            },
                            {
                                value: false,
                                label: '🔴 Không lương',
                            },
                        ]}
                    />
                </Form.Item>

                {/* =========================
        TRẠNG THÁI - CHỈ UPDATE
    ========================= */}
                {editingLeaveType && (
                    <Form.Item
                        name="isActive"
                        label={
                            <span className="font-medium">
                                Trạng thái
                            </span>
                        }
                    >
                        <Select
                            size="large"
                            options={[
                                {
                                    value: true,
                                    label: '🟢 Đang hoạt động',
                                },
                                {
                                    value: false,
                                    label: '🔴 Ngưng hoạt động',
                                },
                            ]}
                        />
                    </Form.Item>
                )}
            </Form>
        </Drawer>
    );
};

export default LeaveTypeDrawer;