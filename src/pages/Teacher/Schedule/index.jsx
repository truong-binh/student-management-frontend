import React, { useMemo, useState } from 'react';
import { Calendar, Button, ConfigProvider, Spin, Tag } from 'antd';
import {
    CalendarOutlined,
    ClockCircleOutlined,
    BookOutlined,
    LeftOutlined,
    RightOutlined,
    AppstoreOutlined,
    ReadOutlined,
    UserOutlined,
    MessageOutlined,
    TeamOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import viVN from 'antd/lib/locale/vi_VN';
import MainLayout from '@/layouts/User/MainLayout';
import styles from './styles.module.scss';
import { useQuery } from '@tanstack/react-query';
import { useCourse } from '@/hooks/useCourse';
import { assignmentApi } from '@/api/admin/assignment';
import { courseApi } from '@/api/admin/course';
import { submissionApi } from '@/api/admin/submission';

dayjs.locale('vi');

const teacherMenuItems = [
    { key: 'dashboard', label: 'Tổng quan', icon: <AppstoreOutlined />, path: '/teacher/dashboard' },
    { key: 'classes', label: 'Lớp học', icon: <ReadOutlined />, path: '/teacher/classes' },
    { key: 'schedule', label: 'Thời khóa biểu', icon: <CalendarOutlined />, path: '/teacher/schedule' },
    { key: 'profile', label: 'Profile', icon: <UserOutlined />, path: '/teacher/profile' },
    { key: 'feedback', label: 'Phản hồi', icon: <MessageOutlined />, path: '/teacher/feedback' },
];

const getCourseId = (course) => course?._id || course?.id;

const normalizeVietnamese = (value) => {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase();
};

const getAssignmentType = ({ title, dueDate, students, submitted }) => {
    const submittedCount = Number(submitted || 0);
    const totalStudents = Number(students || 0);

    if (totalStudents > 0 && submittedCount >= totalStudents) {
        return { type: 'done', typeLabel: 'Hoàn tất' };
    }

    if (dueDate && dayjs().isAfter(dayjs(dueDate))) {
        return { type: 'exam', typeLabel: 'Quá hạn' };
    }

    const normalizedTitle = normalizeVietnamese(title);
    if (normalizedTitle.includes('do an') || normalizedTitle.includes('project') || normalizedTitle.includes('bai tap lon')) {
        return { type: 'project', typeLabel: 'Đồ án' };
    }

    return { type: 'homework', typeLabel: 'Bài tập' };
};

const TeacherSchedule = () => {
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const { courses, isLoading: loadingCourses } = useCourse();

    const courseIds = useMemo(
        () => (Array.isArray(courses) ? courses.map(getCourseId).filter(Boolean) : []),
        [courses]
    );

    const { data: deadlines = [], isLoading: loadingDeadlines } = useQuery({
        queryKey: ['teacher-schedule-deadlines', courseIds],
        enabled: courseIds.length > 0,
        queryFn: async () => {
            const coursesById = (Array.isArray(courses) ? courses : []).reduce((acc, course) => {
                const id = getCourseId(course);
                if (id) acc[String(id)] = course;
                return acc;
            }, {});

            const coursePayloads = await Promise.all(
                courseIds.map(async (courseId) => {
                    const [assignmentsRes, studentsRes] = await Promise.all([
                        assignmentApi.getAssignmentsByCourseId(courseId),
                        courseApi.getCourseStudents(courseId, { page: 1, limit: 1 }),
                    ]);

                    const assignments = assignmentsRes?.success
                        ? (Array.isArray(assignmentsRes.data) ? assignmentsRes.data : (assignmentsRes.data?.items || []))
                        : [];

                    const totalStudents = studentsRes?.success
                        ? Number(studentsRes.data?.pagination?.totalItems || 0)
                        : 0;

                    return {
                        courseId,
                        assignments,
                        totalStudents,
                        course: coursesById[String(courseId)] || null,
                    };
                })
            );

            const allAssignments = coursePayloads.flatMap((payload) => {
                return payload.assignments.map((assignment) => ({
                    ...assignment,
                    courseId: assignment.courseId?._id || assignment.courseId || payload.courseId,
                    students: payload.totalStudents,
                    course: payload.course,
                }));
            });

            const enrichedAssignments = await Promise.all(
                allAssignments.map(async (assignment) => {
                    const assignmentId = assignment._id || assignment.id;
                    let submitted = 0;

                    if (assignmentId) {
                        const submissionsRes = await submissionApi.getSubmissionsByAssignmentId(assignmentId);
                        if (submissionsRes?.success) {
                            submitted = Array.isArray(submissionsRes.data)
                                ? submissionsRes.data.length
                                : (submissionsRes.data?.items || []).length;
                        }
                    }

                    const { type, typeLabel } = getAssignmentType({
                        title: assignment.title,
                        dueDate: assignment.dueDate,
                        students: assignment.students,
                        submitted,
                    });

                    const dueDate = dayjs(assignment.dueDate);

                    return {
                        id: assignmentId || `${assignment.courseId}-${assignment.title}`,
                        date: dueDate.isValid() ? dueDate.format('YYYY-MM-DD') : null,
                        title: assignment.title || 'Bài tập',
                        classCode: assignment.course?.courseCode || 'MON',
                        className: assignment.course?.courseName || 'Môn học',
                        students: Number(assignment.students || 0),
                        submitted,
                        type,
                        typeLabel,
                    };
                })
            );

            return enrichedAssignments
                .filter((item) => !!item.date)
                .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
        },
    });

    const isLoading = loadingCourses || loadingDeadlines;

    const getDeadlinesForDate = (value) =>
        deadlines.filter(d => d.date === value.format('YYYY-MM-DD'));

    const dateCellRender = (value) => {
        const items = getDeadlinesForDate(value);
        return (
            <ul className={styles.eventsList}>
                {items.map((item) => (
                    <li key={item.id} className={`${styles.calendarEvent} ${styles[item.type]}`}>
                        {item.title}
                        <span className={styles.eventMeta}>{item.classCode}</span>
                    </li>
                ))}
            </ul>
        );
    };

    const headerRender = ({ value, onChange }) => (
        <div className={styles.customHeader}>
            <div className={styles.monthYear}>
                <h2>{value.format('MMMM, YYYY')}</h2>
                <span className={styles.monthSub}>Lịch hạn nộp bài tập</span>
            </div>
            <div className={styles.controls}>
                <Button
                    icon={<LeftOutlined />}
                    onClick={() => {
                        const nextValue = value.clone().subtract(1, 'month');
                        setSelectedDate(nextValue);
                        onChange(nextValue);
                    }}
                />
                <Button
                    onClick={() => {
                        const today = dayjs();
                        setSelectedDate(today);
                        onChange(today);
                    }}
                    className={styles.todayBtn}
                >
                    Hôm nay
                </Button>
                <Button
                    icon={<RightOutlined />}
                    onClick={() => {
                        const nextValue = value.clone().add(1, 'month');
                        setSelectedDate(nextValue);
                        onChange(nextValue);
                    }}
                />
            </div>
        </div>
    );

    const selectedDeadlines = getDeadlinesForDate(selectedDate);

    const typeIcon = (type) => {
        if (type === 'done') return <CheckCircleOutlined />;
        if (type === 'exam') return <ExclamationCircleOutlined />;
        if (type === 'project') return <FileTextOutlined />;
        return <BookOutlined />;
    };

    return (
        <ConfigProvider locale={viVN}>
            <MainLayout menuItems={teacherMenuItems}>
                <div className={styles.container}>
                    <div className={styles.calendarCard}>
                        <Spin spinning={isLoading}>
                            <Calendar
                                headerRender={headerRender}
                                dateCellRender={dateCellRender}
                                onSelect={(date) => setSelectedDate(date)}
                                value={selectedDate}
                                fullscreen={true}
                            />
                        </Spin>
                    </div>

                    <div className={styles.sidebar}>
                        <div className={styles.sidebarHeader}>
                            <CalendarOutlined className={styles.sidebarIcon} />
                            <div>
                                <div className={styles.sidebarTitle}>
                                    {selectedDate.format('DD/MM/YYYY')}
                                </div>
                                <div className={styles.sidebarSub}>
                                    {selectedDeadlines.length > 0
                                        ? `${selectedDeadlines.length} hạn nộp`
                                        : 'Không có hạn nộp'}
                                </div>
                            </div>
                        </div>

                        {selectedDeadlines.length > 0 ? (
                            selectedDeadlines.map(item => (
                                <div key={item.id} className={`${styles.detailCard} ${styles[item.type]}`}>
                                    <div className={styles.cardTop}>
                                        <Tag className={`${styles.typeTag} ${styles[`${item.type}Tag`]}`}>
                                            {typeIcon(item.type)} {item.typeLabel}
                                        </Tag>
                                        <span className={styles.classCodeBadge}>{item.classCode}</span>
                                    </div>
                                    <h3 className={styles.cardTitle}>{item.title}</h3>
                                    <div className={styles.cardMeta}>
                                        <div className={styles.metaRow}>
                                            <BookOutlined />
                                            <span>{item.className}</span>
                                        </div>
                                        <div className={styles.metaRow}>
                                            <ClockCircleOutlined />
                                            <span>Hạn nộp: {dayjs(item.date).format('DD/MM/YYYY')}</span>
                                        </div>
                                        <div className={styles.metaRow}>
                                            <TeamOutlined />
                                            <span>Đã nộp: <strong>{item.submitted}</strong>/{item.students} sinh viên</span>
                                        </div>
                                    </div>
                                    <div className={styles.progressBar}>
                                        <div
                                            className={`${styles.progressFill} ${item.type === 'done' ? styles.fillDone : ''}`}
                                            style={{ width: `${item.students > 0 ? Math.round((item.submitted / item.students) * 100) : 0}%` }}
                                        />
                                    </div>
                                    <div className={styles.progressLabel}>
                                        {item.students > 0 ? Math.round((item.submitted / item.students) * 100) : 0}% đã nộp
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className={styles.emptyState}>
                                <CalendarOutlined className={styles.emptyIcon} />
                                <p>Ngày này không có hạn nộp bài</p>
                            </div>
                        )}
                    </div>
                </div>
            </MainLayout>
        </ConfigProvider>
    );
};

export default TeacherSchedule;
