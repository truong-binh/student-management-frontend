import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Button, Space, message } from 'antd';
import { useCourse } from '@/hooks/useCourse';

const { TextArea } = Input;

const CourseModal = ({ isModalOpen, handleCancel, editingCourse }) => {
    const { createCourse, updateCourse, isCreating, isUpdating } = useCourse();
    const [form] = Form.useForm();

    useEffect(() => {
        if (isModalOpen) {
            if (editingCourse) {
                form.setFieldsValue({
                    courseCode: editingCourse.courseCode,
                    courseName: editingCourse.courseName,
                    semester: editingCourse.semester,
                    credits: editingCourse.credits,
                    description: editingCourse.description,
                    lecturerId: typeof editingCourse.lecturerId === 'object' && editingCourse.lecturerId ? editingCourse.lecturerId._id : editingCourse.lecturerId
                });
            } else {
                form.resetFields();
            }
        }
    }, [isModalOpen, editingCourse, form]);

    const onSubmit = async (values) => {
        try {
            if (editingCourse) {
                updateCourse(editingCourse._id, values, {
                    onSuccess: () => {
                        message.success('Cập nhật khóa học thành công');
                        handleCancel();
                    },
                    onError: (err) => {
                        message.error(err?.message || 'Có lỗi xảy ra khi cập nhật!');
                    }
                });
            } else {
                createCourse(values, {
                    onSuccess: () => {
                        message.success('Thêm mới khóa học thành công');
                        handleCancel();
                    },
                    onError: (err) => {
                        message.error(err?.message || 'Có lỗi xảy ra khi tạo mới!');
                    }
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Modal
            title={editingCourse ? "Chỉnh sửa môn học" : "Thêm mới môn học"}
            open={isModalOpen}
            onCancel={handleCancel}
            footer={null}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onSubmit}
            >
                <Form.Item
                    name="courseCode"
                    label="Mã môn học"
                    rules={[{ required: true, message: 'Vui lòng nhập mã môn!' }]}
                >
                    <Input placeholder="Nhập mã môn (VD: INT1234)" />
                </Form.Item>

                <Form.Item
                    name="courseName"
                    label="Tên môn học"
                    rules={[{ required: true, message: 'Vui lòng nhập tên môn!' }]}
                >
                    <Input placeholder="Nhập tên môn" />
                </Form.Item>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item
                        name="semester"
                        label="Học kỳ"
                        style={{ flex: 1 }}
                        rules={[{ required: true, message: 'Vui lòng nhập học kỳ!' }]}
                    >
                        <Input placeholder="VD: Học kỳ 1 - 2026" />
                    </Form.Item>

                    <Form.Item
                        name="credits"
                        label="Số tín chỉ"
                        style={{ flex: 1 }}
                        rules={[{ required: true, message: 'Vui lòng nhập số tín chỉ!' }]}
                    >
                        <InputNumber style={{ width: '100%' }} min={1} max={10} placeholder="VD: 3" />
                    </Form.Item>
                </div>

                <Form.Item
                    name="lecturerId"
                    label="Mã Giảng viên (ID)"
                    tooltip="Hiện tại dùng ID của giảng viên trong hệ thống"
                >
                    <Input placeholder="Nhập ID giảng viên (nếu có)" />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Mô tả lớp học"
                >
                    <TextArea rows={4} placeholder="Nhập mô tả lớp học..." />
                </Form.Item>

                <Form.Item style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', marginBottom: 0 }}>
                    <Space>
                        <Button onClick={handleCancel}>Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={isCreating || isUpdating}>
                            {editingCourse ? "Lưu thay đổi" : "Tạo mới"}
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CourseModal;
