import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Popconfirm, message, Tag, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReadOutlined, AppstoreOutlined, CalendarOutlined, UserOutlined, MessageOutlined, BookOutlined } from '@ant-design/icons';
import MainLayout from '@/layouts/User/MainLayout';
import { useCourse } from '@/hooks/useCourse';
import { SEMESTER_OPTIONS } from '@/utils/constants';
import styles from './styles.module.scss';

const { TextArea } = Input;
const defaultGradeComponents = [
    { name: "Điểm danh (Bắt buộc)", type: "ATTENDANCE", weight: 10, isMandatory: true },
    { name: "Bài tập (Tùy chọn)", type: "ASSIGNMENT", weight: 15, isMandatory: false },
    { name: "Thuyết trình (Tùy chọn)", type: "OTHER", weight: 10, isMandatory: false },
    { name: "Bài tập nhóm (Tùy chọn)", type: "OTHER", weight: 10, isMandatory: false },
    { name: "Giữa kỳ (Tùy chọn)", type: "MIDTERM", weight: 15, isMandatory: false },
    { name: "Cuối kỳ (Bắt buộc)", type: "FINAL_EXAM", weight: 40, isMandatory: true }
];

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
        form.setFieldsValue({
            gradeComponents: defaultGradeComponents
        });
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
            lecturerId: typeof record.lecturerId === 'object' && record.lecturerId ? record.lecturerId._id : record.lecturerId,
            gradeComponents: record.gradeComponents || defaultGradeComponents
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
            const totalWeight = values.gradeComponents.reduce((acc, curr) => acc + (curr.weight || 0), 0);
            if (totalWeight !== 100) {
                message.error(`Tổng hệ số phải bằng 100%. Hiện tại là ${totalWeight}%`);
                return;
            }

            const payload = {
                courseInfo: {
                    courseCode: values.courseCode,
                    courseName: values.courseName,
                    semester: values.semester,
                    credits: values.credits,
                    description: values.description,
                    lecturerId: values.lecturerId
                },
                gradeComponents: values.gradeComponents
            };

            if (editingCourse) {
                updateCourse(editingCourse._id, payload, {
                    onSuccess: () => {
                        message.success('Cập nhật khóa học thành công');
                        handleCancel();
                    },
                    onError: (err) => {
                        message.error(err?.message || 'Có lỗi xảy ra khi cập nhật!');
                    }
                });
            } else {
                createCourse(payload, {
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
                    width={850}
                    centered
                    bodyStyle={{ maxHeight: '80vh', overflowY: 'auto', padding: '24px' }}
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
                                rules={[{ required: true, message: 'Vui lòng chọn học kỳ!' }]}
                            >
                                <Select placeholder="Chọn học kỳ" options={SEMESTER_OPTIONS} />
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

                        <div style={{ 
                            marginTop: 32, 
                            padding: 20, 
                            border: '1px solid #d9d9d9', 
                            borderRadius: '8px',
                            background: '#fafafa'
                        }}>
                            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Cấu trúc điểm học phần</h4>
                                <Tag color="orange">Tổng hệ số phải bằng 100%</Tag>
                            </div>
                            
                            <Form.List name="gradeComponents">
                                {(fields) => (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {fields.map(({ key, name, ...restField }) => (
                                            <Space key={key} style={{ width: '100%', justifyContent: 'space-between' }} align="baseline">
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'name']}
                                                    style={{ marginBottom: 0 }}
                                                    rules={[{ required: true, message: 'Tên đầu điểm' }]}
                                                >
                                                    <Input placeholder="Tên đầu điểm" style={{ width: 250 }} />
                                                </Form.Item>
                                                
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'weight']}
                                                    rules={[{ required: true, message: 'Nhập %' }]}
                                                    style={{ marginBottom: 0 }}
                                                >
                                                    <InputNumber min={0} max={100} style={{ width: 110 }} addonAfter="%" />
                                                </Form.Item>

                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'isMandatory']}
                                                    valuePropName="checked"
                                                    style={{ marginBottom: 0 }}
                                                >
                                                    <Select style={{ width: 120 }}>
                                                        <Select.Option value={true}>Bắt buộc</Select.Option>
                                                        <Select.Option value={false}>Tùy chọn</Select.Option>
                                                    </Select>
                                                </Form.Item>
                                                
                                                <div style={{ width: 80, textAlign: 'right' }}>
                                                    <Tag color="cyan">{form.getFieldValue(['gradeComponents', name, 'type']) || 'OTHER'}</Tag>
                                                </div>
                                            </Space>
                                        ))}
                                    </div>
                                )}
                            </Form.List>
                        </div>

                        <Form.Item className={styles.formActions} style={{ marginTop: 24, textAlign: 'right' }}>
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
