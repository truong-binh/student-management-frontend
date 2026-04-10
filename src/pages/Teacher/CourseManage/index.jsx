import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Popconfirm, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReadOutlined, AppstoreOutlined, CalendarOutlined, UserOutlined, MessageOutlined, BookOutlined } from '@ant-design/icons';
import MainLayout from '@/layouts/User/MainLayout';
import { useCourse } from '@/hooks/useCourse';
import styles from './styles.module.scss';
import dayjs from 'dayjs';

const { TextArea } = Input;

const teacherMenuItems = [
    { key: 'dashboard', label: 'Tổng quan', icon: <AppstoreOutlined />, path: '/teacher/dashboard' },
    { key: 'classes', label: 'Lớp học', icon: <ReadOutlined />, path: '/teacher/classes' },
    { key: 'course-manage', label: 'Quản lý khóa học', icon: <BookOutlined />, path: '/teacher/course-manage' },
    { key: 'schedule', label: 'Thời khóa biểu', icon: <CalendarOutlined />, path: '/teacher/schedule' },
    { key: 'profile', label: 'Profile', icon: <UserOutlined />, path: '/teacher/profile' },
    { key: 'feedback', label: 'Phản hồi', icon: <MessageOutlined />, path: '/teacher/feedback' },
];

const TeacherCourseManage = () => {
    const { courses, isLoading, createCourse, updateCourse, deleteCourse, isCreating, isUpdating, isDeleting } = useCourse();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [form] = Form.useForm();

    const openCreateModal = () => {
        setEditingCourse(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const openEditModal = (record) => {
        setEditingCourse(record);
        form.setFieldsValue({
            courseCode: record.courseCode,
            courseName: record.courseName,
            semester: record.semester,
            credits: record.credits,
            description: record.description,
            // Since lecturerId is an object or string, try to extract its ID or string representation
            lecturerId: typeof record.lecturerId === 'object' && record.lecturerId ? record.lecturerId._id : record.lecturerId
        });
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
        setEditingCourse(null);
    };

    const handleSubmit = async (values) => {
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

    const handleDelete = (id) => {
        deleteCourse(id, {
            onSuccess: () => message.success('Xóa khóa học thành công'),
            onError: (err) => message.error(err?.message || 'Xóa thất bại!')
        });
    };

    const columns = [
        {
            title: 'Mã môn',
            dataIndex: 'courseCode',
            key: 'courseCode',
            render: (text) => <Tag color="blue">{text}</Tag>,
            width: 120,
        },
        {
            title: 'Tên môn học',
            dataIndex: 'courseName',
            key: 'courseName',
            render: (text) => <strong>{text}</strong>
        },
        {
            title: 'Học kỳ',
            dataIndex: 'semester',
            key: 'semester',
            width: 150,
        },
        {
            title: 'Số tín chỉ',
            dataIndex: 'credits',
            key: 'credits',
            width: 120,
            align: 'center',
        },
        {
            title: 'Giảng viên',
            dataIndex: 'lecturerId',
            key: 'lecturerId',
            render: (lecturer) => lecturer?.fullName ? lecturer.fullName : <i>{lecturer || 'Chưa gán'}</i>
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 150,
            align: 'center',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="text"
                        icon={<EditOutlined style={{ color: '#1890ff' }} />}
                        onClick={() => openEditModal(record)}
                    />
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa môn này?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true, loading: isDeleting }}
                    >
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const data = Array.isArray(courses) ? courses : [];

    return (
        <MainLayout menuItems={teacherMenuItems}>
            <div className={styles.adminCoursesPage}>
                <div className={styles.header}>
                    <div className={styles.titleWrap}>
                        <ReadOutlined className={styles.icon} />
                        <h2>Quản lý môn học</h2>
                    </div>
                    <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
                        Thêm môn học mới
                    </Button>
                </div>

                <div className={styles.tableWrap}>
                    <Table
                        columns={columns}
                        dataSource={data}
                        rowKey="_id"
                        loading={isLoading}
                        pagination={{ pageSize: 10, showSizeChanger: true }}
                    />
                </div>

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
                        onFinish={handleSubmit}
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

                        <Form.Item className={styles.formActions}>
                            <Space>
                                <Button onClick={handleCancel}>Hủy</Button>
                                <Button type="primary" htmlType="submit" loading={isCreating || isUpdating}>
                                    {editingCourse ? "Lưu thay đổi" : "Tạo mới"}
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </MainLayout>
    );
};

export default TeacherCourseManage;
