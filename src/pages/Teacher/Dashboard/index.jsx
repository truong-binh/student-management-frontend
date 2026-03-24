import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import MainLayout from '@/layouts/User/MainLayout';
import { Card, Calendar, Button, Timeline } from 'antd';
import { useQuery } from '@tanstack/react-query';
import {
    ClockCircleOutlined,
    CheckCircleOutlined,
    ArrowRightOutlined,
    EnvironmentOutlined,
    LeftOutlined,
    RightOutlined,
    TeamOutlined,
    BookOutlined,
    FileTextOutlined,

    FormOutlined,
    AppstoreOutlined,
    ReadOutlined,
    CalendarOutlined,
    UserOutlined,
    MessageOutlined,
} from '@ant-design/icons';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { courseApi } from '@/api/admin/course';
import { assignmentApi } from '@/api/admin/assignment';
import styles from './styles.module.scss';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const teacherMenuItems = [
    { key: 'dashboard', label: 'Tổng quan', icon: <AppstoreOutlined />, path: '/teacher/dashboard' },
    { key: 'classes', label: 'Lớp học', icon: <ReadOutlined />, path: '/teacher/classes' },
    { key: 'schedule', label: 'Thời khóa biểu', icon: <CalendarOutlined />, path: '/teacher/schedule' },
    { key: 'profile', label: 'Profile', icon: <UserOutlined />, path: '/teacher/profile' },
    { key: 'feedback', label: 'Phản hồi', icon: <MessageOutlined />, path: '/teacher/feedback' },
];

const normalizeResponseList = (res, fallbackKey) => {
    if (!res?.success) {
        throw res;
    }
    if (Array.isArray(res.data)) {
        return res.data;
    }
    return res.data?.[fallbackKey] || [];
};

const formatDueLabel = (assignment, now) => {
    const dueDate = dayjs(assignment.dueDate);
    if (!dueDate.isValid()) {
        return assignment.dueDateFormatted || '---';
    }

    const diffDays = dueDate.diff(now, 'day');
    if (diffDays >= 0 && diffDays <= 2) {
        return `Còn ${Math.max(1, diffDays)} ngày`;
    }

    return assignment.dueDateFormatted || dueDate.format('HH:mm - DD/MM/YYYY');
};

const TeacherDashboard = () => {
    const [calendarValue, setCalendarValue] = useState(dayjs());

    const dashboardQuery = useQuery({
        queryKey: ['teacher-dashboard'],
        queryFn: async () => {
            const coursesRes = await courseApi.getAllCourses({ page: 1, limit: 200 });
            const courses = normalizeResponseList(coursesRes, 'items');

            const studentCountEntries = await Promise.all(
                courses.map(async (course) => {
                    const studentsRes = await courseApi.getCourseStudents(course._id);
                    const students = normalizeResponseList(studentsRes, 'students');
                    return [course._id, students.length];
                })
            );
            const studentCountByCourse = Object.fromEntries(studentCountEntries);

            const assignmentGroups = await Promise.all(
                courses.map(async (course) => {
                    const assignmentsRes = await assignmentApi.getAssignmentsByCourse(course._id);
                    const items = normalizeResponseList(assignmentsRes, 'assignments');
                    return items.map((assignment) => ({
                        ...assignment,
                        courseId: course._id,
                        courseCode: course.courseCode,
                        courseName: course.courseName,
                    }));
                })
            );
            const assignments = assignmentGroups.flat();

            const submissionEntries = await Promise.all(
                assignments.map(async (assignment) => {
                    const submissionsRes = await assignmentApi.getSubmissionsByAssignment(assignment._id);
                    const submissions = normalizeResponseList(submissionsRes, 'submissions');
                    return [assignment._id, submissions];
                })
            );
            const submissionsByAssignment = Object.fromEntries(submissionEntries);

            return {
                courses,
                assignments,
                studentCountByCourse,
                submissionsByAssignment,
            };
        },
        refetchOnWindowFocus: false,
    });

    const {
        stats,
        chartData,
        assignments,
        upcomingClasses,
        recentActivities,
    } = useMemo(() => {
        const courses = dashboardQuery.data?.courses || [];
        const assignmentsRaw = dashboardQuery.data?.assignments || [];
        const studentCountByCourse = dashboardQuery.data?.studentCountByCourse || {};
        const submissionsByAssignment = dashboardQuery.data?.submissionsByAssignment || {};

        const allSubmissions = Object.values(submissionsByAssignment).flat();
        const gradedSubmissions = allSubmissions.filter(
            (submission) => submission.status === 'GRADED' || typeof submission.score === 'number'
        );

        const totalStudents = Object.values(studentCountByCourse).reduce((sum, count) => sum + Number(count || 0), 0);
        const statsView = [
            { title: 'Tổng số sinh viên', value: String(totalStudents), icon: <TeamOutlined />, color: '#3182ce' },
            { title: 'Lớp học của bạn', value: String(courses.length), icon: <BookOutlined />, color: '#38a169' },
            { title: 'Bài chưa chấm', value: String(Math.max(allSubmissions.length - gradedSubmissions.length, 0)), icon: <ClockCircleOutlined />, color: '#d69e2e' },
            { title: 'Bài đã chấm', value: String(gradedSubmissions.length), icon: <CheckCircleOutlined />, color: '#3182ce' },
        ];

        const chartRows = courses.map((course) => {
            const assignmentsByCourse = assignmentsRaw.filter((assignment) => assignment.courseId === course._id);
            const courseSubmissions = assignmentsByCourse.flatMap(
                (assignment) => submissionsByAssignment[assignment._id] || []
            );

            const graded = courseSubmissions.filter(
                (submission) => submission.status === 'GRADED' || typeof submission.score === 'number'
            ).length;
            const feedback = courseSubmissions.filter((submission) => !!submission.aiFeedback).length;

            return {
                label: course.courseCode || course.courseName || '---',
                graded,
                pending: Math.max(courseSubmissions.length - graded, 0),
                feedback,
            };
        });

        const chartView = {
            labels: chartRows.map((row) => row.label),
            datasets: [
                {
                    label: 'Đã chấm',
                    data: chartRows.map((row) => row.graded),
                    backgroundColor: '#e53e3e',
                    borderRadius: 6,
                    barPercentage: 0.55,
                    categoryPercentage: 0.7,
                },
                {
                    label: 'Chưa chấm',
                    data: chartRows.map((row) => row.pending),
                    backgroundColor: '#4299e1',
                    borderRadius: 6,
                    barPercentage: 0.55,
                    categoryPercentage: 0.7,
                },
                {
                    label: 'Có phản hồi',
                    data: chartRows.map((row) => row.feedback),
                    backgroundColor: '#38b2ac',
                    borderRadius: 6,
                    barPercentage: 0.55,
                    categoryPercentage: 0.7,
                },
            ],
        };

        const now = dayjs();
        const upcomingAssignmentsSource = assignmentsRaw
            .filter((assignment) => dayjs(assignment.dueDate).isValid())
            .sort((a, b) => dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf());

        const pickedAssignments = upcomingAssignmentsSource.filter((assignment) => dayjs(assignment.dueDate).isAfter(now));
        const assignmentView = (pickedAssignments.length ? pickedAssignments : upcomingAssignmentsSource)
            .slice(0, 5)
            .map((assignment, index) => {
                const submitted = (submissionsByAssignment[assignment._id] || []).length;
                const total = Number(studentCountByCourse[assignment.courseId] || 0);
                const progressPercent = total > 0 ? Math.min((submitted / total) * 100, 100) : 0;

                return {
                    title: assignment.title,
                    class: assignment.courseName || assignment.courseCode || '---',
                    time: formatDueLabel(assignment, now),
                    timeStatus: dayjs(assignment.dueDate).diff(now, 'day') <= 2 ? 'warning' : 'info',
                    submitted,
                    total,
                    progressPercent,
                    icon: index % 2 === 0 ? <FileTextOutlined /> : <FormOutlined />,
                    iconBg: index % 2 === 0 ? '#fff5f5' : '#ebf8ff',
                    iconColor: index % 2 === 0 ? '#e53e3e' : '#3182ce',
                };
            });

        const upcomingClassesView = courses.slice(0, 3).map((course, index) => ({
            no: String(index + 1).padStart(2, '0'),
            status: index === 0 ? 'ĐANG GIẢNG DẠY' : 'SẮP DIỄN RA',
            statusType: index === 0 ? 'active' : 'upcoming',
            students: Number(studentCountByCourse[course._id] || 0),
            code: course.courseCode || '---',
            time: course.semester || '---',
            subject: course.courseName || '---',
            room: '--',
        }));

        const activityView = assignmentsRaw
            .slice()
            .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf())
            .slice(0, 2)
            .map((assignment) => ({
                dot: <div className={styles.activityDot} />,
                children: (
                    <div className={styles.activityItem}>
                        <p>Bài tập mới: {assignment.title}</p>
                        <span>{dayjs(assignment.createdAt).format('DD/MM/YYYY HH:mm')}</span>
                    </div>
                ),
            }));

        return {
            stats: statsView,
            chartData: chartView,
            assignments: assignmentView,
            upcomingClasses: upcomingClassesView,
            recentActivities: activityView,
        };
    }, [dashboardQuery.data]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { mode: 'index', intersect: false },
        },
        scales: {
            x: {
                grid: { display: false },
                border: { display: false },
                ticks: { color: '#718096', font: { size: 12 } },
            },
            y: {
                grid: { color: 'rgba(0,0,0,0.05)' },
                border: { display: false },
                ticks: { color: '#718096', font: { size: 11 } },
            },
        },
    };

    return (
        <MainLayout menuItems={teacherMenuItems}>
            <div className={styles.dashboard}>
                <div className={styles.mainGrid}>
                    {/* LEFT COLUMN */}
                    <div className={styles.contentLeft}>
                        {/* Stats */}
                        <div className={styles.statsRow}>
                            {stats.map((stat, i) => (
                                <Card key={i} className={styles.statCard}>
                                    <p className={styles.statTitle}>{stat.title}</p>
                                    <div className={styles.statBody}>
                                        <span className={styles.statValue}>{stat.value}</span>
                                        <span className={styles.statIcon} style={{ color: stat.color }}>{stat.icon}</span>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Bar Chart */}
                        <div className={styles.chartCard}>
                            <div className={styles.chartHeader}>
                                <h3>Thống kê chấm bài theo lớp</h3>
                                <div className={styles.chartLegend}>
                                    <span className={styles.legendItem}>
                                        <span className={styles.dot} style={{ background: '#e53e3e' }} /> Đã chấm
                                    </span>
                                    <span className={styles.legendItem}>
                                        <span className={styles.dot} style={{ background: '#4299e1' }} /> Chưa chấm
                                    </span>
                                    <span className={styles.legendItem}>
                                        <span className={styles.dot} style={{ background: '#38b2ac' }} /> Có phản hồi
                                    </span>
                                </div>
                            </div>
                            <div className={styles.chartWrap}>
                                <Bar data={chartData} options={chartOptions} />
                            </div>
                        </div>

                        {/* Assignments near deadline */}
                        <div className={styles.assignmentsCard}>
                            <div className={styles.cardHeader}>
                                <div className={styles.headerTitle}>
                                    <ClockCircleOutlined style={{ color: '#3182ce' }} />
                                    <h3>Bài tập sắp hết hạn</h3>
                                </div>
                                <Button type="link" className={styles.viewAll}>Xem tất cả</Button>
                            </div>
                            <div className={styles.assignmentList}>
                                {dashboardQuery.isLoading && <p>Đang tải dữ liệu bài tập...</p>}
                                {!dashboardQuery.isLoading && assignments.length === 0 && <p>Chưa có bài tập.</p>}
                                {assignments.map((item, i) => (
                                    <div key={`${item.title}-${i}`} className={styles.assignmentItem}>
                                        <div
                                            className={styles.assignmentIcon}
                                            style={{ background: item.iconBg, color: item.iconColor }}
                                        >
                                            {item.icon}
                                        </div>
                                        <div className={styles.assignmentInfo}>
                                            <h4>{item.title}</h4>
                                            <p className={styles.classLabel}>Lớp: {item.class}</p>
                                            <span className={`${styles.timeTag} ${styles[item.timeStatus]}`}>
                                                {item.timeStatus === 'warning' && <ClockCircleOutlined style={{ marginRight: 4 }} />}
                                                {item.time}
                                            </span>
                                        </div>
                                        <div className={styles.progressSection}>
                                            <div className={styles.progressMeta}>
                                                <span className={styles.progressCount}>{item.submitted}/{item.total}</span>
                                                <span className={styles.progressTag}>ĐÃ NỘP</span>
                                            </div>
                                            <div className={styles.progressBar}>
                                                <div
                                                    className={styles.progressFill}
                                                    style={{ width: `${item.progressPercent}%` }}
                                                />
                                            </div>
                                        </div>
                                        <ArrowRightOutlined className={styles.arrowIcon} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className={styles.contentRight}>
                        {/* Calendar */}
                        <Card className={styles.calendarCard}>
                            <Calendar
                                fullscreen={false}
                                className={styles.customCalendar}
                                value={calendarValue}
                                headerRender={({ value, onChange }) => {
                                    const month = value.month();
                                    const year = value.year();
                                    return (
                                        <div className={styles.calendarHeader}>
                                            <h3>{`Tháng ${month + 1}, ${year}`}</h3>
                                            <div className={styles.calendarNav}>
                                                <Button
                                                    size="small"
                                                    type="text"
                                                    icon={<LeftOutlined />}
                                                    onClick={() => {
                                                        const newValue = value.clone().subtract(1, 'month');
                                                        setCalendarValue(newValue);
                                                        onChange(newValue);
                                                    }}
                                                />
                                                <Button
                                                    size="small"
                                                    type="text"
                                                    icon={<RightOutlined />}
                                                    onClick={() => {
                                                        const newValue = value.clone().add(1, 'month');
                                                        setCalendarValue(newValue);
                                                        onChange(newValue);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                }}
                                fullCellRender={(date) => {
                                    const currentViewMonth = calendarValue.month();
                                    if (date.month() !== currentViewMonth) {
                                        return <div className={styles.emptyDay} />;
                                    }
                                    return (
                                        <div className="ant-picker-cell-inner ant-picker-calendar-date">
                                            <div className="ant-picker-calendar-date-value">
                                                {date.date()}
                                            </div>
                                        </div>
                                    );
                                }}
                            />
                        </Card>

                        {/* Upcoming Classes */}
                        <div className={styles.upcomingSection}>
                            <p className={styles.sectionHeader}>Lớp học phần sắp tới:</p>
                            {dashboardQuery.isLoading && <p>Đang tải lớp học...</p>}
                            {!dashboardQuery.isLoading && upcomingClasses.length === 0 && <p>Chưa có lớp học.</p>}
                            {upcomingClasses.map((cls, i) => (
                                <div key={`${cls.code}-${i}`} className={styles.classItem}>
                                    <div className={styles.classNo}>{cls.no}</div>
                                    <div className={styles.classContent}>
                                        <div className={styles.classTopRow}>
                                            <span className={`${styles.statusBadge} ${styles[cls.statusType]}`}>
                                                {cls.status}
                                            </span>
                                            <span className={styles.studentCount}>
                                                <TeamOutlined style={{ marginRight: 4 }} />{cls.students} sinh viên
                                            </span>
                                        </div>
                                        <h4 className={styles.classCode}>{cls.code}</h4>
                                        <p className={styles.classTime}>{cls.time}</p>
                                        <p className={styles.classSubject}>{cls.subject}</p>
                                        <p className={styles.classRoom}>
                                            <EnvironmentOutlined style={{ marginRight: 4 }} />{cls.room}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Recent Activity */}
                        <div className={styles.activitySection}>
                            <p className={styles.sectionHeader}>Hoạt động gần đây:</p>
                            {dashboardQuery.isLoading && <p>Đang tải hoạt động...</p>}
                            {dashboardQuery.isError && <p>Không thể tải dữ liệu dashboard.</p>}
                            <Timeline
                                items={recentActivities.length ? recentActivities : [
                                    {
                                        dot: <div className={styles.activityDot} />,
                                        children: (
                                            <div className={styles.activityItem}>
                                                <p>Chưa có hoạt động gần đây</p>
                                                <span>-</span>
                                            </div>
                                        ),
                                    },
                                ]}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default TeacherDashboard;
