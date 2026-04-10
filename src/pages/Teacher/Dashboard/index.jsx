import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import MainLayout from '@/layouts/User/MainLayout';
import { Card, Calendar, Button, Spin, Timeline } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
    ClockCircleOutlined,
    CheckCircleOutlined,
    ArrowRightOutlined,
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
import { useQuery } from '@tanstack/react-query';
import { useCourse } from '@/hooks/useCourse';
import { assignmentApi } from '@/api/admin/assignment';
import { courseApi } from '@/api/admin/course';
import { submissionApi } from '@/api/admin/submission';
import styles from './styles.module.scss';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const teacherMenuItems = [
    { key: 'dashboard', label: 'Tổng quan', icon: <AppstoreOutlined />, path: '/teacher/dashboard' },
    { key: 'classes', label: 'Lớp học', icon: <ReadOutlined />, path: '/teacher/classes' },
    { key: 'schedule', label: 'Thời khóa biểu', icon: <CalendarOutlined />, path: '/teacher/schedule' },
    { key: 'profile', label: 'Profile', icon: <UserOutlined />, path: '/teacher/profile' },
    { key: 'feedback', label: 'Phản hồi', icon: <MessageOutlined />, path: '/teacher/feedback' },
];

const getCourseId = (course) => course?._id || course?.id;

const normalizeAssignmentList = (res) => {
    if (!res?.success) return [];
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.data?.assignments)) return res.data.assignments;
    return res.data?.items || [];
};

const normalizeSubmissionList = (res) => {
    if (!res?.success) return [];
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.data?.submissions)) return res.data.submissions;
    return res.data?.items || [];
};

const isSubmissionGraded = (submission) => {
    const status = String(submission?.status || '').toUpperCase();
    if (status === 'GRADED') return true;
    return submission?.score !== null && submission?.score !== undefined;
};

const hasSubmissionFeedback = (submission) => {
    const feedbackStatus = String(submission?.feedbackStatus || '').toUpperCase();
    return feedbackStatus === 'PENDING' || feedbackStatus === 'RESOLVED';
};

const getTotalStudents = (res) => {
    if (!res?.success) return 0;

    const total =
        res.pagination?.total ??
        res.pagination?.totalItems ??
        res.data?.pagination?.total ??
        res.data?.pagination?.totalItems;

    if (Number.isFinite(Number(total))) {
        return Number(total);
    }

    if (Array.isArray(res.data)) {
        return res.data.length;
    }

    if (Array.isArray(res.data?.items)) {
        return res.data.items.length;
    }

    if (Array.isArray(res.data?.students)) {
        return res.data.students.length;
    }

    return 0;
};

const getTimeMeta = (dueDate) => {
    const now = dayjs();
    const target = dayjs(dueDate);

    if (!target.isValid()) {
        return { label: '--', status: 'info' };
    }

    const diffHours = target.diff(now, 'hour', true);
    if (diffHours <= 24) {
        return { label: `Còn ${Math.max(1, Math.ceil(diffHours))} giờ`, status: 'warning' };
    }

    const diffDays = target.diff(now, 'day', true);
    if (diffDays <= 7) {
        return { label: `Còn ${Math.max(1, Math.ceil(diffDays))} ngày`, status: 'warning' };
    }

    return { label: target.format('HH:mm - DD/MM/YYYY'), status: 'info' };
};

const getIconMeta = (title) => {
    const normalized = String(title || '').toLowerCase();
    const isQuiz = normalized.includes('quiz') || normalized.includes('trắc nghiệm') || normalized.includes('kiểm tra');

    if (isQuiz) {
        return {
            icon: <FormOutlined />,
            iconBg: '#ebf8ff',
            iconColor: '#3182ce',
        };
    }

    return {
        icon: <FileTextOutlined />,
        iconBg: '#fff5f5',
        iconColor: '#e53e3e',
    };
};

const toMillis = (value) => {
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.valueOf() : 0;
};

const getNearestCourses = (courses = []) => {
    return [...courses].sort((a, b) => {
        const timeA = Math.max(toMillis(a?.updatedAt), toMillis(a?.createdAt));
        const timeB = Math.max(toMillis(b?.updatedAt), toMillis(b?.createdAt));

        if (timeA !== timeB) {
            return timeB - timeA;
        }

        return String(a?.courseCode || '').localeCompare(String(b?.courseCode || ''));
    });
};

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const [calendarValue, setCalendarValue] = useState(dayjs());
    const [showAllAssignments, setShowAllAssignments] = useState(false);
    const { courses, isLoading: loadingCourses } = useCourse();

    const handleOpenClassOverview = (item) => {
        const courseId = item?.courseId;
        if (!courseId) return;

        navigate(`/teacher/classes/${courseId}?tab=overview`);
    };

    const courseIds = useMemo(
        () => (Array.isArray(courses) ? courses.map(getCourseId).filter(Boolean) : []),
        [courses]
    );

    const { data: totalStudents = 0, isLoading: loadingTotalStudents } = useQuery({
        queryKey: ['teacher-dashboard-total-students', courseIds],
        enabled: courseIds.length > 0,
        queryFn: async () => {
            const totals = await Promise.all(
                courseIds.map(async (courseId) => {
                    const studentsRes = await courseApi.getCourseStudents(courseId, { page: 1, limit: 1 });
                    return getTotalStudents(studentsRes);
                })
            );

            return totals.reduce((sum, count) => sum + Number(count || 0), 0);
        },
    });

    const { data: assignments = [], isLoading: loadingAssignments } = useQuery({
        queryKey: ['teacher-dashboard-upcoming-assignments', courseIds],
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

                    const totalStudents = getTotalStudents(studentsRes);

                    return {
                        courseId,
                        course: coursesById[String(courseId)] || null,
                        totalStudents,
                        assignments: normalizeAssignmentList(assignmentsRes),
                    };
                })
            );

            const now = dayjs();

            const allAssignments = coursePayloads.flatMap((payload) => {
                return payload.assignments.map((assignment) => ({
                    ...assignment,
                    course: payload.course,
                    students: payload.totalStudents,
                    courseId: assignment.courseId?._id || assignment.courseId || payload.courseId,
                }));
            });

            const upcomingAssignments = allAssignments
                .filter((assignment) => {
                    const dueDate = dayjs(assignment.dueDate);
                    return dueDate.isValid() && dueDate.isAfter(now);
                })
                .sort((a, b) => dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf());

            const withSubmissions = await Promise.all(
                upcomingAssignments.map(async (assignment) => {
                    const assignmentId = assignment._id || assignment.id;
                    let submitted = 0;

                    if (assignmentId) {
                        const submissionsRes = await submissionApi.getSubmissionsByAssignmentId(assignmentId);
                        const submissions = normalizeSubmissionList(submissionsRes);
                        submitted = submissions.length;
                    }

                    const timeMeta = getTimeMeta(assignment.dueDate);
                    const iconMeta = getIconMeta(assignment.title);

                    return {
                        id: assignmentId || `${assignment.courseId}-${assignment.title}`,
                        courseId: assignment.courseId,
                        title: assignment.title || 'Bài tập',
                        className: assignment.course?.courseName || assignment.course?.courseCode || 'Lớp học',
                        dueDateValue: dayjs(assignment.dueDate).valueOf(),
                        submitted,
                        total: Number(assignment.students || 0),
                        time: timeMeta.label,
                        timeStatus: timeMeta.status,
                        ...iconMeta,
                    };
                })
            );

            return withSubmissions.sort((a, b) => a.dueDateValue - b.dueDateValue);
        },
    });

    const upcomingCourseCandidates = useMemo(
        () => getNearestCourses(Array.isArray(courses) ? courses : []).slice(0, 3),
        [courses]
    );

    const upcomingCourseIds = useMemo(
        () => upcomingCourseCandidates.map((course) => getCourseId(course)).filter(Boolean),
        [upcomingCourseCandidates]
    );

    const { data: upcomingClasses = [], isLoading: loadingUpcomingClasses } = useQuery({
        queryKey: ['teacher-dashboard-upcoming-classes', upcomingCourseIds],
        enabled: upcomingCourseIds.length > 0,
        queryFn: async () => {
            const upcomingPayloads = await Promise.all(
                upcomingCourseCandidates.map(async (course, index) => {
                    const courseId = getCourseId(course);
                    let totalStudents = 0;

                    if (courseId) {
                        const studentsRes = await courseApi.getCourseStudents(courseId, { page: 1, limit: 1 });
                        totalStudents = getTotalStudents(studentsRes);
                    }

                    return {
                        id: courseId || `${course?.courseCode || 'course'}-${index}`,
                        courseId,
                        no: String(index + 1).padStart(2, '0'),
                        courseName: course?.courseName || 'Môn học chưa cập nhật',
                        courseCode: course?.courseCode || 'Chưa cập nhật mã học phần',
                        students: totalStudents,
                        semester: course?.semester || 'Chưa cập nhật học kì',
                    };
                })
            );

            return upcomingPayloads;
        },
    });

    const { data: gradingStatsByCourse = [], isLoading: loadingGradingStats } = useQuery({
        queryKey: ['teacher-dashboard-grading-stats', courseIds],
        enabled: courseIds.length > 0,
        queryFn: async () => {
            const coursePayloads = await Promise.all(
                (Array.isArray(courses) ? courses : []).map(async (course) => {
                    const courseId = getCourseId(course);
                    if (!courseId) return null;

                    const assignmentsRes = await assignmentApi.getAssignmentsByCourseId(courseId);
                    const assignments = normalizeAssignmentList(assignmentsRes);

                    if (assignments.length === 0) {
                        return {
                            courseId,
                            label: course?.courseCode || course?.courseName || 'Lớp học',
                            graded: 0,
                            notGraded: 0,
                            feedback: 0,
                        };
                    }

                    const submissionGroups = await Promise.all(
                        assignments.map(async (assignment) => {
                            const assignmentId = assignment?._id || assignment?.id;
                            if (!assignmentId) return [];

                            const submissionsRes = await submissionApi.getSubmissionsByAssignmentId(assignmentId);
                            return normalizeSubmissionList(submissionsRes);
                        })
                    );

                    const submissions = submissionGroups.flat();
                    const summary = submissions.reduce(
                        (acc, submission) => {
                            if (isSubmissionGraded(submission)) {
                                acc.graded += 1;
                            } else {
                                acc.notGraded += 1;
                            }

                            if (hasSubmissionFeedback(submission)) {
                                acc.feedback += 1;
                            }

                            return acc;
                        },
                        { graded: 0, notGraded: 0, feedback: 0 }
                    );

                    return {
                        courseId,
                        label: course?.courseCode || course?.courseName || 'Lớp học',
                        ...summary,
                    };
                })
            );

            return coursePayloads.filter(Boolean);
        },
    });

    const displayedAssignments = useMemo(() => {
        if (showAllAssignments) return assignments;
        return assignments.slice(0, 4);
    }, [assignments, showAllAssignments]);

    const canShowAllAssignments = assignments.length > 4;
    const isAssignmentsLoading = loadingCourses || loadingAssignments;

    const handleOpenAssignmentDetail = (assignment) => {
        const assignmentId = assignment?.id;
        const courseId = assignment?.courseId;

        if (!assignmentId || !courseId) return;

        navigate(`/teacher/classes/${courseId}?tab=assignments&assignmentId=${assignmentId}`);
    };

    const gradingTotals = useMemo(() => {
        return gradingStatsByCourse.reduce(
            (acc, item) => {
                acc.graded += Number(item?.graded || 0);
                acc.notGraded += Number(item?.notGraded || 0);
                return acc;
            },
            { graded: 0, notGraded: 0 }
        );
    }, [gradingStatsByCourse]);

    const totalStudentsValue = loadingCourses || loadingTotalStudents ? '--' : String(totalStudents);

    const stats = [
        { title: 'Tổng số sinh viên', value: totalStudentsValue, icon: <TeamOutlined />, color: '#3182ce' },
        { title: 'Lớp học của bạn', value: String(courseIds.length), icon: <BookOutlined />, color: '#38a169' },
        { title: 'Bài chưa chấm', value: String(gradingTotals.notGraded), icon: <ClockCircleOutlined />, color: '#d69e2e' },
        { title: 'Bài đã chấm', value: String(gradingTotals.graded), icon: <CheckCircleOutlined />, color: '#3182ce' },
    ];

    const chartData = useMemo(() => ({
        labels: gradingStatsByCourse.map((item) => item.label),
        datasets: [
            {
                label: 'Đã chấm',
                data: gradingStatsByCourse.map((item) => item.graded),
                backgroundColor: '#e53e3e',
                borderRadius: 6,
                barPercentage: 0.55,
                categoryPercentage: 0.7,
            },
            {
                label: 'Chưa chấm',
                data: gradingStatsByCourse.map((item) => item.notGraded),
                backgroundColor: '#4299e1',
                borderRadius: 6,
                barPercentage: 0.55,
                categoryPercentage: 0.7,
            },
            {
                label: 'Có phản hồi',
                data: gradingStatsByCourse.map((item) => item.feedback),
                backgroundColor: '#38b2ac',
                borderRadius: 6,
                barPercentage: 0.55,
                categoryPercentage: 0.7,
            },
        ],
    }), [gradingStatsByCourse]);

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

    const isUpcomingClassesLoading = loadingCourses || loadingUpcomingClasses;
    const isChartLoading = loadingCourses || loadingGradingStats;
    const hasChartData = gradingStatsByCourse.length > 0;

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
                                {isChartLoading && (
                                    <div className={styles.loadingAssignments}>
                                        <Spin size="small" />
                                    </div>
                                )}

                                {!isChartLoading && !hasChartData && (
                                    <div className={styles.emptyAssignments}>
                                        Chưa có dữ liệu chấm bài để thống kê.
                                    </div>
                                )}

                                {!isChartLoading && hasChartData && (
                                    <Bar data={chartData} options={chartOptions} />
                                )}
                            </div>
                        </div>

                        {/* Assignments near deadline */}
                        <div className={styles.assignmentsCard}>
                            <div className={styles.cardHeader}>
                                <div className={styles.headerTitle}>
                                    <ClockCircleOutlined style={{ color: '#3182ce' }} />
                                    <h3>Bài tập sắp hết hạn</h3>
                                </div>
                                {canShowAllAssignments && (
                                    <Button
                                        type="link"
                                        className={styles.viewAll}
                                        onClick={() => setShowAllAssignments((prev) => !prev)}
                                    >
                                        {showAllAssignments ? 'Thu gọn' : 'Xem tất cả'}
                                    </Button>
                                )}
                            </div>
                            <div className={styles.assignmentList}>
                                {isAssignmentsLoading && (
                                    <div className={styles.loadingAssignments}>
                                        <Spin size="small" />
                                    </div>
                                )}

                                {!isAssignmentsLoading && displayedAssignments.length === 0 && (
                                    <div className={styles.emptyAssignments}>
                                        Không có bài tập sắp hết hạn.
                                    </div>
                                )}

                                {!isAssignmentsLoading && displayedAssignments.map((item) => (
                                    <div
                                        key={item.id}
                                        className={styles.assignmentItem}
                                        onClick={() => handleOpenAssignmentDetail(item)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter' || event.key === ' ') {
                                                event.preventDefault();
                                                handleOpenAssignmentDetail(item);
                                            }
                                        }}
                                    >
                                        <div className={styles.assignmentIcon} style={{ background: item.iconBg, color: item.iconColor }}>
                                            {item.icon}
                                        </div>
                                        <div className={styles.assignmentInfo}>
                                            <h4>{item.title}</h4>
                                            <p className={styles.classLabel}>Lớp: {item.className}</p>
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
                                                    style={{ width: `${item.total > 0 ? Math.round((item.submitted / item.total) * 100) : 0}%` }}
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
                            <p className={styles.sectionHeader}>Các lớp học phần</p>
                            {isUpcomingClassesLoading && (
                                <div className={styles.loadingAssignments}>
                                    <Spin size="small" />
                                </div>
                            )}

                            {!isUpcomingClassesLoading && upcomingClasses.length === 0 && (
                                <div className={styles.emptyAssignments}>
                                    Chưa có lớp học phần nào để hiển thị.
                                </div>
                            )}

                            {!isUpcomingClassesLoading && upcomingClasses.map((cls) => (
                                <div
                                    key={cls.id}
                                    className={styles.classItem}
                                    onClick={() => handleOpenClassOverview(cls)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            event.preventDefault();
                                            handleOpenClassOverview(cls);
                                        }
                                    }}
                                >
                                    <div className={styles.classNo}>{cls.no}</div>
                                    <div className={styles.classContent}>
                                        <h4 className={styles.classCode}>{cls.courseName}</h4>
                                        <p className={styles.classTime}>Mã học phần: {cls.courseCode}</p>
                                        <p className={styles.classSubject}>Số sinh viên: {cls.students}</p>
                                        <p className={styles.classRoom}>Học kì: {cls.semester}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Recent Activity */}
                        <div className={styles.activitySection}>
                            <p className={styles.sectionHeader}>Hoạt động gần đây:</p>
                            <Timeline
                                items={[
                                    {
                                        dot: <div className={styles.activityDot} />,
                                        children: (
                                            <div className={styles.activityItem}>
                                                <p>Bạn đã đăng một thông báo trên diễn đàn</p>
                                                <span>T3, 1/3/2026 9:15</span>
                                            </div>
                                        ),
                                    },
                                    {
                                        dot: <div className={styles.activityDot} />,
                                        children: (
                                            <div className={styles.activityItem}>
                                                <p>Bạn đã đăng một thông báo trên diễn đàn</p>
                                                <span>T3, 1/3/2026 9:15</span>
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
