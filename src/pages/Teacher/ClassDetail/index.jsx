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
    BookOutlined,
} from '@ant-design/icons';
import styles from './styles.module.scss';
import OverviewTab from './components/OverviewTab';
import AttendanceTab from './components/AttendanceTab';
import AssignmentsTab from './components/AssignmentsTab';
import CreateAssignmentTab from './components/CreateAssignmentTab';

import { useCourse } from '@/hooks/useCourse';
import { Spin } from 'antd';

const teacherMenuItems = [
    { key: 'dashboard', label: 'Tổng quan', icon: <AppstoreOutlined />, path: '/teacher/dashboard' },
    { key: 'classes', label: 'Lớp học', icon: <ReadOutlined />, path: '/teacher/classes' },
    { key: 'schedule', label: 'Thời khóa biểu', icon: <CalendarOutlined />, path: '/teacher/schedule' },
    { key: 'profile', label: 'Profile', icon: <UserOutlined />, path: '/teacher/profile' },
    { key: 'feedback', label: 'Phản hồi', icon: <MessageOutlined />, path: '/teacher/feedback' },
];

const TeacherClassDetail = () => {
    const { id } = useParams();
    const { getCourseDetailQuery } = useCourse();
    const { data: course, isLoading } = getCourseDetailQuery(id);
    const [activeTab, setActiveTab] = useState('1');

    if (isLoading) {
        return (
            <MainLayout menuItems={teacherMenuItems}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <Spin size="large" tip="Đang tải chi tiết lớp học..." />
                </div>
            </MainLayout>
        );
    }

    if (!course) {
        return (
            <MainLayout menuItems={teacherMenuItems}>
                <div style={{ padding: '24px', textAlign: 'center' }}>
                    <h2>Không tìm thấy thông tin lớp học</h2>
                </div>
            </MainLayout>
        );
    }

    const classInfo = {
        title: course.courseName,
        code: course.courseCode,
        groupCode: course.courseCode,
        semester: course.semester,
        school: 'Học viện Công nghệ Bưu chính Viễn thông',
        teacher: course.lecturerId?.fullName || 'Chưa xác định',
        status: 'ĐANG DIỄN RA',
        statusType: 'active',
        color: '#3182ce',
        description: course.description
    };

    const statusColorMap = {
        active: '#48bb78',
        upcoming: '#f6ad55',
        completed: '#a0aec0',
    };

    return (
        <MainLayout menuItems={teacherMenuItems}>
            <div className={styles.classDetailPage}>
                <div className={styles.headerBanner}>
                    <div className={styles.metaInfo}>
                        <span className={styles.badge}>{classInfo.code}</span>
                        <span className={styles.status} style={{ background: statusColorMap[classInfo.statusType] }}>
                            {classInfo.status}
                        </span>
                    </div>
                    <h1 className={styles.title}>{classInfo.title}</h1>
                    <div className={styles.details}>
                        <div className={styles.detailItem}>
                            <UserOutlined className={styles.icon} /> GV: {classInfo.teacher}
                        </div>
                        <div className={styles.detailItem}>
                            <FormOutlined className={styles.icon} /> Mã lớp: {classInfo.groupCode}
                        </div>
                        <div className={styles.detailItem}>
                            <CalendarOutlined className={styles.icon} /> Học kỳ: {classInfo.semester}
                        </div>
                    </div>
                    <div className={styles.schoolInfo}>
                        {classInfo.school}
                    </div>
                </div>

                <div className={styles.tabSection}>
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        animated={{ inkBar: true, tabPane: false }}
                        items={[
                            {
                                key: '1',
                                label: <span><InfoCircleOutlined /> Tổng quan</span>,
                                children: <OverviewTab color={classInfo.color} description={classInfo.description} />,
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
