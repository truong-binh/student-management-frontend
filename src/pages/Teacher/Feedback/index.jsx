import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Table, Select, message, Spin } from 'antd';
import {
    CheckCircleOutlined,
    ArrowRightOutlined,
    MessageOutlined,
    AppstoreOutlined,
    ReadOutlined,
    CalendarOutlined,
    UserOutlined,
    FileTextOutlined,
    IdcardOutlined,
    CalendarFilled,
    TeamOutlined,
    ExclamationCircleOutlined,
    SendOutlined,
} from '@ant-design/icons';
import MainLayout from '@/layouts/User/MainLayout';
import styles from './styles.module.scss';
import clsx from 'clsx';

const { Option } = Select;

const teacherMenuItems = [
    { key: 'dashboard', label: 'Tổng quan', icon: <AppstoreOutlined />, path: '/teacher/dashboard' },
    { key: 'classes', label: 'Lớp học', icon: <ReadOutlined />, path: '/teacher/classes' },
    { key: 'schedule', label: 'Thời khóa biểu', icon: <CalendarOutlined />, path: '/teacher/schedule' },
    { key: 'profile', label: 'Profile', icon: <UserOutlined />, path: '/teacher/profile' },
    { key: 'feedback', label: 'Phản hồi', icon: <MessageOutlined />, path: '/teacher/feedback' },
];

import { useCourse } from '@/hooks/useCourse';
import { useCourseAssignments } from '@/hooks/useCourseAssignment';
import { useAssignmentFeedbacks, useAllTeacherFeedbacks } from '@/hooks/useSubmission';

const TeacherFeedback = () => {
    const navigate = useNavigate();
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
    const [pageMode, setPageMode] = useState('overview');
    const [statusFilter, setStatusFilter] = useState('all');

    const { courses, isLoading: isCoursesLoading } = useCourse();
    const { assignments, isLoading: isAssignmentsLoading } = useCourseAssignments(selectedCourseId);
    const { feedbacks = [], isLoading: isFeedbacksLoading } = useAssignmentFeedbacks(selectedAssignmentId);
    const { allFeedbacks, isLoading: isAllLoading, refetch: refetchAll } = useAllTeacherFeedbacks(courses);

    const activeFeedbacks = pageMode === 'overview' ? allFeedbacks : feedbacks;

    const counts = {
        total: activeFeedbacks.length,
        unreplied: activeFeedbacks.filter(f => f.feedbackStatus === 'PENDING').length,
        replied: activeFeedbacks.filter(f => f.feedbackStatus === 'RESOLVED').length,
    };

    const filtered = activeFeedbacks.filter(f => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'unreplied') return f.feedbackStatus === 'PENDING';
        if (statusFilter === 'replied') return f.feedbackStatus === 'RESOLVED';
        return true;
    });

    const truncateText = (text, maxLength) => {
        if (!text) return '';
        return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    };

    const columns = [
        {
            title: 'Sinh viên',
            key: 'student',
            render: (_, record) => (
                <div className={styles.studentCell}>
                    <span className={styles.feedbackIcon} style={{ background: '#3182ce' }}>
                        <FileTextOutlined />
                    </span>
                    <div className={styles.studentName}>{record.student?.fullName || record.student?.username}</div>
                </div>
            ),
        },
        {
            title: 'Mã SV',
            key: 'msv',
            render: (_, record) => <span className={styles.msvText}>{record.student?.userCode || '-'}</span>,
        },
        {
            title: 'Lớp học',
            key: 'classCode',
            render: () => <span className={styles.classCode}>{courses.find(c => c._id === selectedCourseId)?.title || '-'}</span>,
        },
        {
            title: 'LỜI PHẢN HỒI',
            key: 'content',
            render: (_, record) => (
                <div className={styles.contentPreview}>
                    {truncateText(record.studentFeedback?.content, 70)}
                </div>
            ),
        },
        {
            title: 'TRẠNG THÁI',
            key: 'status',
            render: (_, record) => {
                const isPending = record.feedbackStatus === 'PENDING';
                return (
                    <div className={clsx(styles.statusGroup, isPending ? styles.unreplied : styles.replied)}>
                        <div className={styles.dot} />
                        {isPending ? 'Chưa trả lời' : 'Đã trả lời'}
                    </div>
                );
            },
        },
        {
            title: '',
            key: 'action',
            render: (_, record) => {
                const courseId = record.courseInfo?._id || record.courseInfo?.id || selectedCourseId;
                const assignmentId = record.assignment?._id || record.assignment?.id
                    || record.assignment;
                const submissionId = record._id || record.id;
                const path = courseId && assignmentId && submissionId
                    ? `/teacher/classes/${courseId}/assignments/${assignmentId}/grade-edit/${submissionId}`
                    : null;
                return (
                    <Button
                        type="link"
                        icon={<ArrowRightOutlined />}
                        onClick={() => path && navigate(path)}
                        disabled={!path}
                        style={{ fontWeight: 600, color: '#3182ce' }}
                    >
                        Xem chi tiết
                    </Button>
                );
            },
        },
    ];


    const overviewColumns = [
        ...columns.slice(0, 2),
        {
            title: 'Lớp / Bài tập',
            key: 'assignment',
            render: (_, record) => (
                <div>
                    <div style={{ fontWeight: 600, color: '#2d3748', fontSize: 13 }}>
                        {record.courseInfo?.courseName || record.courseInfo?.title || '-'}
                    </div>
                    <div style={{ color: '#718096', fontSize: 12 }}>{record.assignmentTitle || '-'}</div>
                </div>
            ),
        },
        ...columns.slice(2),
    ];

    const renderListView = () => (
        <div className={styles.container}>
            <div className={styles.header} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 16 }}>
                <div className={styles.titleSection}>
                    <h1>Danh sách phản hồi</h1>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div
                            className={clsx(styles.filterTab, pageMode === 'overview' && styles.activeTab)}
                            onClick={() => { setPageMode('overview'); setSelectedCourseId(null); setSelectedAssignmentId(null); }}
                        >
                            <AppstoreOutlined style={{ marginRight: 6 }} /> Tổng quan
                        </div>
                        <div
                            className={clsx(styles.filterTab, pageMode === 'filter' && styles.activeTab)}
                            onClick={() => setPageMode('filter')}
                        >
                            <CheckCircleOutlined style={{ marginRight: 6 }} /> Lọc theo lớp / bài tập
                        </div>
                        {pageMode === 'overview' && (
                            <div
                                className={styles.filterTab}
                                onClick={refetchAll}
                                style={{ opacity: isAllLoading ? 0.6 : 1, pointerEvents: isAllLoading ? 'none' : 'auto' }}
                            >
                                Làm mới
                            </div>
                        )}
                    </div>

                    <div className={styles.filterTabs}>
                        {[
                            { key: 'all', label: `Tất cả (${counts.total})` },
                            { key: 'unreplied', label: `Chưa trả lời (${counts.unreplied})` },
                            { key: 'replied', label: `Đã trả lời (${counts.replied})` },
                        ].map(tab => (
                            <div
                                key={tab.key}
                                className={clsx(styles.filterTab, statusFilter === tab.key && styles.activeTab)}
                                onClick={() => setStatusFilter(tab.key)}
                            >
                                {tab.label}
                            </div>
                        ))}
                    </div>
                </div>

                {pageMode === 'filter' && (
                    <div className={styles.selectors}>
                        <Select
                            placeholder="Chọn lớp học"
                            style={{ width: 220, marginRight: 12 }}
                            onChange={(val) => {
                                setSelectedCourseId(val);
                                setSelectedAssignmentId(null);
                            }}
                            loading={isCoursesLoading}
                            value={selectedCourseId}
                            allowClear
                        >
                            {courses.map(c => (
                                <Option key={c._id} value={c._id}>{c.courseName || c.title}</Option>
                            ))}
                        </Select>
                        <Select
                            placeholder="Chọn bài tập"
                            style={{ width: 220 }}
                            onChange={setSelectedAssignmentId}
                            loading={isAssignmentsLoading}
                            disabled={!selectedCourseId}
                            value={selectedAssignmentId}
                            allowClear
                        >
                            {assignments.map(a => (
                                <Option key={a._id} value={a._id}>{a.title}</Option>
                            ))}
                        </Select>
                    </div>
                )}
            </div>

            <div className={styles.tableCard}>
                <div className={styles.desktopFeedbackTable}>
                    {pageMode === 'overview' && isAllLoading ? (
                        <div style={{ padding: '60px 0', textAlign: 'center' }}>
                            <Spin size="large" tip="Đang tải toàn bộ phản hồi..." />
                        </div>
                    ) : (
                        <Table
                            columns={pageMode === 'overview' ? overviewColumns : columns}
                            dataSource={filtered}
                            loading={pageMode === 'filter' && isFeedbacksLoading}
                            pagination={{ pageSize: 10, showSizeChanger: false }}
                            className={styles.feedbackTable}
                            rowKey={r => r._id || r.id}
                            locale={{ emptyText: pageMode === 'overview' ? 'Không có phản hồi nào' : 'Chọn lớp học và bài tập để xem phản hồi' }}
                        />
                    )}
                </div>

                <div className={styles.mobileFeedbackList}>
                    {filtered.map((record) => {
                        const isPending = record.feedbackStatus === 'PENDING';
                        const courseId = record.courseInfo?._id || record.courseInfo?.id || selectedCourseId;
                        const assignmentId = record.assignment?._id || record.assignment?.id || record.assignment;
                        const submissionId = record._id || record.id;
                        const path = courseId && assignmentId && submissionId
                            ? `/teacher/classes/${courseId}/assignments/${assignmentId}/grade-edit/${submissionId}`
                            : null;
                        return (
                            <div
                                key={record._id || record.id}
                                className={styles.mobileFeedbackCard}
                                onClick={() => path && navigate(path)}
                            >
                                <div className={styles.mobileCardHeader}>
                                    <div className={styles.studentCell}>
                                        <span className={styles.feedbackIcon} style={{ background: '#3182ce' }}>
                                            <FileTextOutlined />
                                        </span>
                                        <div>
                                            <div className={styles.studentName}>{record.student?.fullName || record.student?.username}</div>
                                            <div className={styles.mobileMeta}>{record.student?.userCode || '-'}</div>
                                        </div>
                                    </div>
                                    <div className={clsx(styles.statusGroup, isPending ? styles.unreplied : styles.replied)}>
                                        <div className={styles.dot} />
                                        {isPending ? 'Chưa trả lời' : 'Đã trả lời'}
                                    </div>
                                </div>
                                <div className={styles.mobileContent}>{truncateText(record.studentFeedback?.content, 120)}</div>
                                <div className={styles.mobileCardFooter}>
                                    <span className={styles.mobileAction}>
                                        Xem chi tiết <ArrowRightOutlined />
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className={styles.tableFooter}>
                    <div className={styles.paginationInfo}>Hiển thị {filtered.length} trên {counts.total} kết quả</div>
                </div>
            </div>
        </div>
    );

    return (
        <MainLayout menuItems={teacherMenuItems}>
            {renderListView()}
        </MainLayout>
    );
};

export default TeacherFeedback;

