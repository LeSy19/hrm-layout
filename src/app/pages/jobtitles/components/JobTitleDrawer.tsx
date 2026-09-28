'use client'

import { CreateJobTitleDto, JobTitleResponseDto } from "@/interfaces/jobtitle.interface";
import { Drawer, Form, Input, Select } from "antd";
import { useEffect, useState } from "react";

interface JobtitleDrawerProps {
    isOpen: boolean,
    editingJobTitle: JobTitleResponseDto | null,
    onClose: () => void,
    onSubmitJobTitle: (values: CreateJobTitleDto) => void | Promise<void>;


}
const JobTitleDrawer = ({ isOpen, editingJobTitle, onClose, onSubmitJobTitle }: JobtitleDrawerProps) => {
    const [form] = Form.useForm();

    const [submitting, setSubmitting] = useState(false);

    //Lấy danh sách jobtitle
    useEffect(() => {
        if (!isOpen) return;

        if (editingJobTitle) {
            form.setFieldsValue({
                titleName: editingJobTitle.titleName,
                level: editingJobTitle.level,
                isActive: editingJobTitle.isActive,
            });
        }
        //CREATE
        else {
            form.resetFields();
        }
    }, [isOpen, editingJobTitle, form]);

    // xử lý submit
    const handleFormSubmitJobTitleDrawer = async (values: CreateJobTitleDto) => {
        try {
            setSubmitting(true);

            await onSubmitJobTitle(values);
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
                        {editingJobTitle
                            ? 'Cập nhật chức danh'
                            : 'Thêm mới chức danh'}
                    </div>

                    <div className="text-sm text-gray-500 font-normal mt-1">
                        {editingJobTitle
                            ? 'Chỉnh sửa thông tin chức danh'
                            : 'Nhập thông tin để tạo chức danh mới'}
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
                            : editingJobTitle
                                ? 'Cập nhật'
                                : 'Tạo mới'}
                    </button>
                </div>
            }
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFormSubmitJobTitleDrawer}
                requiredMark="optional"
            >
                {/* =========================
        TÊN CHỨC DANH
    ========================= */}
                <Form.Item
                    name="titleName"
                    label={
                        <span className="font-medium">
                            Tên chức danh
                        </span>
                    }
                    rules={[
                        {
                            required: true,
                            message: 'Vui lòng nhập tên chức danh!',
                        },
                        {
                            whitespace: true,
                            message: 'Tên chức danh không được để trống!',
                        },
                    ]}
                >
                    <Input
                        placeholder="VD: Nhân viên IT"
                        disabled={!!editingJobTitle}
                        maxLength={100}
                        size="large"
                    />
                </Form.Item>

                {/* =========================
        CẤP BẬC
    ========================= */}
                <Form.Item
                    name="level"
                    label={
                        <span className="font-medium">
                            Cấp bậc
                        </span>
                    }
                    rules={[
                        {
                            required: true,
                            message: 'Vui lòng nhập cấp bậc!',
                        },
                        {
                            whitespace: true,
                            message: 'Cấp bậc không được để trống!',
                        },
                    ]}
                >
                    <Input
                        placeholder="VD: Junior, Senior, Manager"
                        maxLength={100}
                        size="large"
                    />
                </Form.Item>

                {/* =========================
        TRẠNG THÁI - CHỈ UPDATE
    ========================= */}
                {editingJobTitle && (
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

}

export default JobTitleDrawer;