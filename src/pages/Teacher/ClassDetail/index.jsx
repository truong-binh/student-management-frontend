import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '@/layouts/User/MainLayout';
import { Tabs } from 'antd';
import {
    AppstoreOutlined,
    ReadOutlined,
    CalendarOutlined,
    UserOutlined,
    MessageOutlined,
    InfoCircleOutlined,
    FormOutlined,
    UnorderedListOutlined,
    EditOutlined,
    CodeOutlined,
} from '@ant-design/icons';
import styles from './styles.module.scss';
import OverviewTab from './components/OverviewTab';
import AttendanceTab from './components/AttendanceTab';
import AssignmentsTab from './components/AssignmentsTab';
import CreateAssignmentTab from './components/CreateAssignmentTab';

const teacherMenuItems = [
    { key: 'dashboard', label: 'Tổng quan', icon: <AppstoreOutlined />, path: '/teacher/dashboard' },
    { key: 'classes', label: 'Lớp học', icon: <ReadOutlined />, path: '/teacher/classes' },
    { key: 'schedule', label: 'Thời khóa biểu', icon: <CalendarOutlined />, path: '/teacher/schedule' },
    { key: 'profile', label: 'Profile', icon: <UserOutlined />, path: '/teacher/profile' },
    { key: 'feedback', label: 'Phản hồi', icon: <MessageOutlined />, path: '/teacher/feedback' },
];

const classesData = [
    { id: 1, title: 'Cấu trúc dữ liệu và Giải thuật', code: 'INT1302', groupCode: 'INT1302 - Nhóm 01', semester: 'Học kỳ 2 - 2025-2026', school: 'Học viện Công nghệ Bưu chính Viễn thông', teacher: 'Nguyễn Văn A', status: 'ĐANG DIỄN RA', statusType: 'active', color: '#e53e3e', icon: <CodeOutlined /> },
    { id: 2, title: 'Mạng máy tính', code: 'INT1434', groupCode: 'INT1434 - Nhóm 01', semester: 'Học kỳ 2 - 2025-2026', school: 'Học viện Công nghệ Bưu chính Viễn thông', teacher: 'Nguyễn Văn A', status: 'ĐANG DIỄN RA', statusType: 'active', color: '#3182ce', icon: <CodeOutlined /> },
    { id: 3, title: 'Hệ điều hành', code: 'INT1332', groupCode: 'INT1332 - Nhóm 01', semester: 'Học kỳ 2 - 2025-2026', school: 'Học viện Công nghệ Bưu chính Viễn thông', teacher: 'Nguyễn Văn A', status: 'ĐANG DIỄN RA', statusType: 'active', color: '#805ad5', icon: <CodeOutlined /> },
    { id: 4, title: 'Công nghệ phần mềm', code: 'INT1340', groupCode: 'INT1340 - Nhóm 01', semester: 'Học kỳ 2 - 2025-2026', school: 'Học viện Công nghệ Bưu chính Viễn thông', teacher: 'Nguyễn Văn A', status: 'SẮP DIỄN RA', statusType: 'upcoming', color: '#d69e2e', icon: <CodeOutlined /> },
    { id: 5, title: 'Triết học Mác - Lênin', code: 'BAS1203', groupCode: 'BAS1203 - Nhóm 01', semester: 'Học kỳ 2 - 2025-2026', school: 'Học viện Công nghệ Bưu chính Viễn thông', teacher: 'Nguyễn Văn A', status: 'HOÀN THÀNH', statusType: 'completed', color: '#38b2ac', icon: <CodeOutlined /> },
    { id: 6, title: 'Tiếng Anh chuyên ngành', code: 'FLS1103', groupCode: 'FLS1103 - Nhóm 01', semester: 'Học kỳ 2 - 2025-2026', school: 'Học viện Công nghệ Bưu chính Viễn thông', teacher: 'Nguyễn Văn A', status: 'ĐANG DIỄN RA', statusType: 'active', color: '#5a67d8', icon: <CodeOutlined /> },
    { id: 7, title: 'An toàn thông tin', code: 'INT1319', groupCode: 'INT1319 - Nhóm 01', semester: 'Học kỳ 2 - 2025-2026', school: 'Học viện Công nghệ Bưu chính Viễn thông', teacher: 'Nguyễn Văn A', status: 'ĐANG DIỄN RA', statusType: 'active', color: '#ed64a6', icon: <CodeOutlined /> },
    { id: 8, title: 'Lập trình hướng đối tượng', code: 'INT1325', groupCode: 'INT1506 - Nhóm 02', semester: 'Học kỳ 1 - 2023-2024', school: 'Học viện Công nghệ Bưu chính Viễn thông', teacher: 'Nguyễn Văn A', status: 'ĐANG DIỄN RA', statusType: 'active', color: '#c53030', icon: <CodeOutlined /> },
];

const TeacherClassDetail = () => {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('1');

    const classInfo = classesData.find(c => c.id === Number(id)) || classesData[0];

    const statusColorMap = {
        active: '#48bb78',
        upcoming: '#f6ad55',
        completed: '#a0aec0',
    };

    return (
        <MainLayout menuItems={teacherMenuItems}>
            <div className={styles.classDetailPage}>
                {/* Banner */}
                <div className={styles.headerBanner}>
                    <div className={styles.bannerLeft}>
                        <div className={styles.classIconBox} style={{ background: classInfo.color }}>
                            <CodeOutlined />
                        </div>
                    </div>
                    <div className={styles.bannerRight}>
                        <div className={styles.bannerTopRow}>
                            <h1 className={styles.title}>{classInfo.title}</h1>
                            <span
                                className={styles.statusBadge}
                                style={{ background: statusColorMap[classInfo.statusType] }}
                            >
                                {classInfo.status}
                            </span>
                        </div>
                        <p className={styles.school}>{classInfo.school}</p>
                        <div className={styles.details}>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>GIẢNG VIÊN</span>
                                <span className={styles.detailValue}>
                                    <UserOutlined /> {classInfo.teacher}
                                </span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>MÃ LỚP</span>
                                <span className={styles.detailValue}>
                                    <FormOutlined /> {classInfo.groupCode}
                                </span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>HỌC KỲ</span>
                                <span className={styles.detailValue}>
                                    <CalendarOutlined /> {classInfo.semester}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className={styles.tabSection}>
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        animated={{ inkBar: true, tabPane: false }}
                        items={[
                            {
                                key: '1',
                                label: <span><InfoCircleOutlined /> Tổng quan</span>,
                                children: <OverviewTab color={classInfo.color} />,
                            },
                            {
                                key: '2',
                                label: <span><UserOutlined /> Điểm danh</span>,
                                children: <AttendanceTab />,
                            },
                            {
                                key: '3',
                                label: <span><UnorderedListOutlined /> DS bài tập</span>,
                                children: <AssignmentsTab classInfo={classInfo} />,
                            },
                            {
                                key: '4',
                                label: <span><EditOutlined /> Tạo bài tập</span>,
                                children: <CreateAssignmentTab classInfo={classInfo} />,
                            },
                        ]}
                    />
                </div>
            </div>
        </MainLayout>
    );
};

export default TeacherClassDetail;
