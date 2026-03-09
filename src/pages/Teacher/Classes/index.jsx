import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/User/MainLayout';
import { Input, Select, Progress, Button, Pagination } from 'antd';
import {
    SearchOutlined,
    CodeOutlined,
    GlobalOutlined,
    DesktopOutlined,
    ApartmentOutlined,
    RadiusUprightOutlined,
    SafetyCertificateOutlined,
    TranslationOutlined,
    AppstoreOutlined,
    ReadOutlined,
    CalendarOutlined,
    UserOutlined,
    MessageOutlined,
} from '@ant-design/icons';
import styles from './styles.module.scss';

const { Option } = Select;

const teacherMenuItems = [
    { key: 'dashboard', label: 'Tổng quan', icon: <AppstoreOutlined />, path: '/teacher/dashboard' },
    { key: 'classes', label: 'Lớp học', icon: <ReadOutlined />, path: '/teacher/classes' },
    { key: 'schedule', label: 'Thời khóa biểu', icon: <CalendarOutlined />, path: '/teacher/schedule' },
    { key: 'profile', label: 'Profile', icon: <UserOutlined />, path: '/teacher/profile' },
    { key: 'feedback', label: 'Phản hồi', icon: <MessageOutlined />, path: '/teacher/feedback' },
];

const classesData = [
    {
        id: 1,
        title: 'Cấu trúc dữ liệu và Giải thuật',
        code: 'INT1302',
        semester: 'Học kỳ 2 - 2025-2026',
        totalStudents: 65,
        male: 50,
        female: 15,
        progress: 8,
        total: 12,
        color: '#e53e3e',
        icon: <CodeOutlined />,
    },
    {
        id: 2,
        title: 'Mạng máy tính',
        code: 'INT1434',
        semester: 'Học kỳ 2 - 2025-2026',
        totalStudents: 45,
        male: 38,
        female: 7,
        progress: 4,
        total: 10,
        color: '#3182ce',
        icon: <GlobalOutlined />,
    },
    {
        id: 3,
        title: 'Hệ điều hành',
        code: 'INT1332',
        semester: 'Học kỳ 2 - 2025-2026',
        totalStudents: 55,
        male: 42,
        female: 13,
        progress: 6,
        total: 8,
        color: '#805ad5',
        icon: <DesktopOutlined />,
    },
    {
        id: 4,
        title: 'Công nghệ phần mềm',
        code: 'INT1340',
        semester: 'Học kỳ 2 - 2025-2026',
        totalStudents: 60,
        male: 45,
        female: 15,
        progress: 2,
        total: 5,
        color: '#d69e2e',
        icon: <ApartmentOutlined />,
    },
    {
        id: 5,
        title: 'Triết học Mác - Lênin',
        code: 'BAS1203',
        semester: 'Học kỳ 2 - 2025-2026',
        totalStudents: 80,
        male: 40,
        female: 40,
        completed: true,
        progress: 100,
        total: 100,
        color: '#38b2ac',
        icon: <RadiusUprightOutlined />,
    },
    {
        id: 6,
        title: 'Tiếng Anh chuyên ngành',
        code: 'FLS1103',
        semester: 'Học kỳ 2 - 2025-2026',
        totalStudents: 35,
        male: 20,
        female: 15,
        progress: 3,
        total: 15,
        color: '#5a67d8',
        icon: <TranslationOutlined />,
    },
    {
        id: 7,
        title: 'An toàn thông tin',
        code: 'INT1319',
        semester: 'Học kỳ 2 - 2025-2026',
        totalStudents: 48,
        male: 40,
        female: 8,
        progress: 0,
        total: 5,
        color: '#ed64a6',
        icon: <SafetyCertificateOutlined />,
    },
    {
        id: 8,
        title: 'Lập trình hướng đối tượng',
        code: 'INT1325',
        semester: 'Học kỳ 2 - 2025-2026',
        totalStudents: 52,
        male: 44,
        female: 8,
        progress: 12,
        total: 12,
        color: '#c53030',
        icon: <CodeOutlined />,
    },
];

const TeacherClasses = () => {
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 8;

    const filtered = classesData.filter((c) => {
        const matchSearch =
            c.title.toLowerCase().includes(searchText.toLowerCase()) ||
            c.code.toLowerCase().includes(searchText.toLowerCase());
        const matchStatus =
            statusFilter === 'all' ||
            (statusFilter === 'completed' && c.completed) ||
            (statusFilter === 'ongoing' && !c.completed);
        return matchSearch && matchStatus;
    });

    const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <MainLayout menuItems={teacherMenuItems}>
            <div className={styles.classesPage}>
                {/* Header */}
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
                    </div>
                </header>

                {/* Grid */}
                <div className={styles.classGrid}>
                    {paginated.map((item) => {
                        const percent = item.completed ? 100 : Math.round((item.progress / item.total) * 100);
                        return (
                            <div key={item.id} className={styles.classCard}>
                                <div className={styles.cardHeader} style={{ backgroundColor: item.color }}>
                                    <div className={styles.subjectIcon}>{item.icon}</div>
                                    <div className={styles.subjectCode}>{item.code}</div>
                                </div>

                                <div className={styles.cardBody}>
                                    <h3 className={styles.subjectTitle}>{item.title}</h3>
                                    <p className={styles.semester}>{item.semester}</p>
                                    <p className={styles.totalStudents}>
                                        Tổng số: <strong>{item.totalStudents} sinh viên</strong>
                                    </p>
                                    <p className={styles.gender}>
                                        Nam: {item.male} | Nữ: {item.female}
                                    </p>

                                    <div className={styles.progressSection}>
                                        <div className={styles.progressHeader}>
                                            <span className={styles.progressLabel}>TIẾN ĐỘ</span>
                                            {item.completed ? (
                                                <span className={styles.completedText}>HOÀN THÀNH</span>
                                            ) : (
                                                <span className={styles.progressValue} style={{ color: item.color }}>
                                                    {item.progress}/{item.total} bài tập
                                                </span>
                                            )}
                                        </div>
                                        <Progress
                                            percent={percent}
                                            showInfo={false}
                                            strokeColor={item.completed ? '#b71c1c' : item.color}
                                            trailColor="#edf2f7"
                                            size={['100%', 6]}
                                        />
                                    </div>

                                    <Button
                                        className={styles.accessBtn}
                                        style={{
                                            backgroundColor: `${item.color}18`,
                                            color: item.color,
                                            borderColor: `${item.color}30`,
                                        }}
                                        onClick={() => navigate(`/teacher/classes/${item.id}`)}
                                        block
                                    >
                                        Truy cập lớp học
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
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
            </div>
        </MainLayout>
    );
};

export default TeacherClasses;
