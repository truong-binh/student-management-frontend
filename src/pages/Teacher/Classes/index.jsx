import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/User/MainLayout';
import { Input, Select, Progress, Button, Pagination, Modal, Form, InputNumber, Popconfirm, message, Tag, Space, Dropdown } from 'antd';
import {
    SearchOutlined,
    CodeOutlined,
    GlobalOutlined,
    DesktopOutlined,
    ApartmentOutlined,
    RadiusUprightOutlined,
    SafetyCertificateOutlined,
    TranslationOutlined,
    PlusOutlined,
    MoreOutlined,
    EditOutlined,
    DeleteOutlined,
    AppstoreOutlined,
    ReadOutlined,
    BookOutlined,
    CalendarOutlined,
    UserOutlined,
    MessageOutlined,
} from '@ant-design/icons';
import { useCourse } from '@/hooks/useCourse';
import styles from './styles.module.scss';

const { Option } = Select;
const { TextArea } = Input;

const teacherMenuItems = [
    { key: 'dashboard', label: 'Tổng quan', icon: <AppstoreOutlined />, path: '/teacher/dashboard' },
    { key: 'classes', label: 'Lớp học', icon: <ReadOutlined />, path: '/teacher/classes' },
    { key: 'schedule', label: 'Thời khóa biểu', icon: <CalendarOutlined />, path: '/teacher/schedule' },
    { key: 'profile', label: 'Profile', icon: <UserOutlined />, path: '/teacher/profile' },
    { key: 'feedback', label: 'Phản hồi', icon: <MessageOutlined />, path: '/teacher/feedback' },
];

const COLORS = ['#e53e3e', '#3182ce', '#805ad5', '#d69e2e', '#38b2ac', '#5a67d8', '#ed64a6', '#c53030'];
const ICONS = [<CodeOutlined />, <GlobalOutlined />, <DesktopOutlined />, <ApartmentOutlined />, <RadiusUprightOutlined />, <TranslationOutlined />, <SafetyCertificateOutlined />];

const TeacherClasses = () => {
    const navigate = useNavigate();
    const { courses, isLoading } = useCourse();
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 8;

    // Manage Course States
    const { createCourse, updateCourse, deleteCourse, isCreating, isUpdating, isDeleting } = useCourse();
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

    const filtered = (Array.isArray(courses) ? courses : []).filter((c) => {
        const matchSearch =
            c.courseName?.toLowerCase().includes(searchText.toLowerCase()) ||
            c.courseCode?.toLowerCase().includes(searchText.toLowerCase());
        const matchStatus = statusFilter === 'all';
        return matchSearch && matchStatus;
    });

    const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <MainLayout menuItems={teacherMenuItems}>
            <div className={styles.classesPage}>
                <header className={styles.header}>
                    <div className={styles.title}>
                        <ReadOutlined className={styles.icon} />
                        <h1>Các lớp học phần</h1>
                    </div>
                    <div className={styles.filters}>
                        <Input
                            placeholder="Tìm tên môn học, mã môn..."
                            prefix={<SearchOutlined />}
                            className={styles.searchInput}
                            value={searchText}
                            onChange={(e) => {
                                setSearchText(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                        <Select
                            value={statusFilter}
                            className={styles.statusSelect}
                            onChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}
                        >
                            <Option value="all">Tất cả</Option>
                            <Option value="ongoing">Đang học</Option>
                            <Option value="completed">Hoàn thành</Option>
                        </Select>
                        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal} style={{ height: '40px', borderRadius: '10px' }}>
                            Tạo lớp mới
                        </Button>
                    </div>
                </header>

                <div className={styles.classGrid}>
                    {isLoading ? (
                        <div className="w-full text-center py-10">Đang tải danh sách...</div>
                    ) : (
                        paginated.map((item, index) => {
                            const color = COLORS[index % COLORS.length];
                            const icon = ICONS[index % ICONS.length];
                            const percent = 60;

                            return (
                                <div key={item._id} className={styles.classCard}>
                                    <div className={styles.cardHeader} style={{ backgroundColor: color }}>
                                        <div className={styles.subjectIcon}>{icon}</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                            <Dropdown
                                                menu={{
                                                    items: [
                                                        {
                                                            key: 'edit',
                                                            label: 'Chỉnh sửa',
                                                            icon: <EditOutlined />,
                                                            onClick: () => openEditModal(item),
                                                        },
                                                        {
                                                            key: 'delete',
                                                            label: (
                                                                <Popconfirm
                                                                    title="Bạn có chắc chắn muốn xóa môn này?"
                                                                    onConfirm={() => handleDelete(item._id)}
                                                                    okText="Xóa"
                                                                    cancelText="Hủy"
                                                                    okButtonProps={{ danger: true, loading: isDeleting }}
                                                                >
                                                                    <div style={{ width: '100%', color: '#ff4d4f' }}>Xóa lớp</div>
                                                                </Popconfirm>
                                                            ),
                                                            icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
                                                        },
                                                    ],
                                                }}
                                                trigger={['click']}
                                                placement="bottomRight"
                                            >
                                                <Button size="small" type="text" style={{ color: 'white', padding: 0 }} icon={<MoreOutlined style={{ fontSize: '18px', transform: 'rotate(90deg)' }} />} />
                                            </Dropdown>
                                            <div className={styles.subjectCode}>{item.courseCode}</div>
                                        </div>
                                    </div>

                                    <div className={styles.cardBody}>
                                        <h3 className={styles.subjectTitle}>{item.courseName || '---'}</h3>
                                        <p className={styles.semester}>Học kỳ: {item.semester || '---'}</p>
                                        <p className={styles.totalStudents}>
                                            Số tín chỉ: <strong>{item.credits ?? '---'}</strong>
                                        </p>
                                        <p className={styles.gender}>
                                            GV: {item.lecturerId?.fullName || '---'}
                                        </p>

                                        <div className={styles.progressSection}>
                                            <div className={styles.progressHeader}>
                                                <span className={styles.progressLabel}>TIẾN ĐỘ</span>
                                                <span className={styles.progressValue} style={{ color: color }}>
                                                    {percent}%
                                                </span>
                                            </div>
                                            <Progress
                                                percent={percent}
                                                showInfo={false}
                                                strokeColor={color}
                                                trailColor="#edf2f7"
                                                size={['100%', 6]}
                                            />
                                        </div>

                                        <Button
                                            className={styles.accessBtn}
                                            style={{
                                                backgroundColor: `${color}18`,
                                                color: color,
                                                borderColor: `${color}30`,
                                            }}
                                            onClick={() => navigate(`/teacher/classes/${item._id}`)}
                                            block
                                        >
                                            Truy cập lớp học
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <footer className={styles.footer}>
                    <span className={styles.paginationInfo}>
                        Hiển thị {Math.min((currentPage - 1) * pageSize + 1, filtered.length)}–{Math.min(currentPage * pageSize, filtered.length)} của {filtered.length} lớp học
                    </span>
                    <Pagination
                        current={currentPage}
                        total={filtered.length}
                        pageSize={pageSize}
                        showSizeChanger={false}
                        onChange={(page) => setCurrentPage(page)}
                        itemRender={(page, type, originalElement) => {
                            if (type === 'prev') return <span className={styles.pageBtn}>Trước</span>;
                            if (type === 'next') return <span className={styles.pageBtn}>Tiếp</span>;
                            return originalElement;
                        }}
                    />
                </footer>

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
                            label="Mô tả học phần"
                        >
                            <TextArea rows={4} placeholder="Nhập mô tả học phần..." />
                        </Form.Item>

                        <Form.Item className={styles.formActions} style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', marginBottom: 0 }}>
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

export default TeacherClasses;
