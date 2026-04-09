import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import MainLayout from '@/layouts/User/MainLayout';
import { Card, Calendar, Button, Timeline, Spin, Empty } from 'antd';
import {
    BookOutlined,
    StarOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    ArrowRightOutlined,
    EnvironmentOutlined,
    LeftOutlined,
    RightOutlined
} from '@ant-design/icons';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { useQuery } from '@tanstack/react-query';
import { useCourse } from '@/hooks/useCourse';
import { useMySubmissions } from '@/hooks/useSubmission';
import { assignmentApi } from '@/api/admin/assignment';
import { useNavigate } from 'react-router-dom';

const formatCount = (value) => String(value).padStart(2, '0');

const formatDeadlineText = (dueDate) => {
    if (!dueDate?.isValid()) return 'Không có hạn';

    const now = dayjs();
    const hourDiff = dueDate.diff(now, 'hour');
    if (hourDiff <= 24) {
        return `Còn ${Math.max(1, hourDiff)} giờ`;
    }

    const dayDiff = dueDate.diff(now, 'day');
    if (dayDiff <= 7) {
        return `Còn ${Math.max(1, dayDiff)} ngày`;
    }

    return dueDate.format('HH:mm - DD/MM/YYYY');
};

const mapDeadlineStatus = (dueDate) => {
    if (!dueDate?.isValid()) return 'info';
    const dayDiff = dueDate.diff(dayjs(), 'day');
    if (dayDiff <= 2) return 'warning';
    if (dayDiff <= 7) return 'info';
    return 'success';
};

const getCourseId = (course) => course?._id || course?.id;

const extractAssignmentList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.assignments)) return payload.assignments;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
};

const extractEntityId = (value) => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (typeof value === 'object') return value._id || value.id || null;
    return null;
};

const getSubmissionAssignmentId = (submission) => {
    return submission?.assignment?._id || submission?.assignment?.id || submission?.assignment;
};

const Dashboard = () => {
    const [calendarValue, setCalendarValue] = useState(dayjs());
    const navigate = useNavigate();

    const { courses, isLoading: loadingCourses } = useCourse();
    const { mySubmissions, isLoading: loadingSubmissions } = useMySubmissions();

    const courseIds = useMemo(
        () => (Array.isArray(courses) ? courses.map(getCourseId).filter(Boolean) : []),
        [courses]
    );

    const { data: assignments = [], isLoading: loadingAssignments } = useQuery({
        queryKey: ['dashboard-assignments', courseIds],
        enabled: courseIds.length > 0,
        queryFn: async () => {
            const responses = await Promise.all(
                courseIds.map((courseId) => assignmentApi.getAssignmentsByCourseId(courseId))
            );

            return responses.flatMap((res, index) => {
                if (!res?.success) return [];

                const assignmentList = extractAssignmentList(res.data);
                return assignmentList.map((assignment) => ({
                    ...assignment,
                    courseId: assignment.courseId || courseIds[index],
                }));
            });
        },
    });

    const coursesById = useMemo(() => {
        return (Array.isArray(courses) ? courses : []).reduce((acc, course) => {
            const id = getCourseId(course);
            if (id) acc[String(id)] = course;
            return acc;
        }, {});
    }, [courses]);

    const submissionByAssignmentId = useMemo(() => {
        return (Array.isArray(mySubmissions) ? mySubmissions : []).reduce((acc, submission) => {
            const assignmentId = getSubmissionAssignmentId(submission);
            if (assignmentId) acc[String(assignmentId)] = submission;
            return acc;
        }, {});
    }, [mySubmissions]);

    const dashboardAssignments = useMemo(() => {
        return (Array.isArray(assignments) ? assignments : []).map((assignment) => {
            const assignmentId = assignment._id || assignment.id;
            const submission = assignmentId ? submissionByAssignmentId[String(assignmentId)] : null;
            const dueDate = dayjs(assignment.dueDate);
            const assignmentCourseId = assignment.courseId?._id || assignment.courseId || assignment.course;
            const course = coursesById[String(assignmentCourseId)] || null;

            return {
                ...assignment,
                id: assignmentId,
                courseId: assignmentCourseId,
                submission,
                dueDate,
                course,
                isSubmitted: !!submission,
                isOverdue: dueDate.isValid() ? dayjs().isAfter(dueDate) : false,
            };
        });
    }, [assignments, submissionByAssignmentId, coursesById]);

    const dashboardAssignmentById = useMemo(() => {
        return dashboardAssignments.reduce((acc, assignment) => {
            if (assignment.id) {
                acc[String(assignment.id)] = assignment;
            }
            return acc;
        }, {});
    }, [dashboardAssignments]);

    const pendingAssignments = useMemo(() => {
        return dashboardAssignments.filter((assignment) => !assignment.isSubmitted);
    }, [dashboardAssignments]);

    const upcomingDeadlineAssignments = useMemo(() => {
        return pendingAssignments
            .filter((assignment) => !assignment.isOverdue)
            .sort((a, b) => {
                const timeA = a.dueDate?.isValid() ? a.dueDate.valueOf() : Number.MAX_SAFE_INTEGER;
                const timeB = b.dueDate?.isValid() ? b.dueDate.valueOf() : Number.MAX_SAFE_INTEGER;
                return timeA - timeB;
            });
    }, [pendingAssignments]);

    const deadlineItems = useMemo(() => {
        return upcomingDeadlineAssignments.slice(0, 3).map((assignment) => ({
            assignmentId: assignment.id,
            classId: assignment.courseId,
            title: assignment.title,
            subject: assignment.course?.courseName || 'Môn học chưa xác định',
            time: formatDeadlineText(assignment.dueDate),
            status: mapDeadlineStatus(assignment.dueDate),
        }));
    }, [upcomingDeadlineAssignments]);

    const gradedSubmissions = useMemo(() => {
        return (Array.isArray(mySubmissions) ? mySubmissions : [])
            .filter((submission) => submission.status === 'GRADED' || typeof submission.score === 'number')
            .sort((a, b) => {
                const timeA = dayjs(a.gradedAt || a.updatedAt || a.createdAt).valueOf();
                const timeB = dayjs(b.gradedAt || b.updatedAt || b.createdAt).valueOf();
                return timeB - timeA;
            });
    }, [mySubmissions]);

    const recentGrades = useMemo(() => {
        return gradedSubmissions.slice(0, 3).map((submission) => {
            const assignmentId = getSubmissionAssignmentId(submission);
            const dashboardAssignment = assignmentId ? dashboardAssignmentById[String(assignmentId)] : null;
            const assignmentCourseId =
                extractEntityId(submission.assignment?.courseId) ||
                extractEntityId(submission.assignment?.course) ||
                extractEntityId(dashboardAssignment?.courseId) ||
                dashboardAssignment?.courseId;
            const course = coursesById[String(assignmentCourseId)] || null;

            return {
                assignmentId,
                classId: assignmentCourseId,
                subject: course?.courseName || 'Môn học',
                detail: submission.assignment?.title || 'Bài tập',
                score: typeof submission.score === 'number' ? submission.score.toFixed(1) : '-',
            };
        });
    }, [gradedSubmissions, coursesById, dashboardAssignmentById]);

    const averageScore = useMemo(() => {
        if (!gradedSubmissions.length) return '0.00';
        const total = gradedSubmissions.reduce((sum, submission) => sum + Number(submission.score || 0), 0);
        return (total / gradedSubmissions.length).toFixed(2);
    }, [gradedSubmissions]);

    const completedCredits = useMemo(() => {
        return (Array.isArray(courses) ? courses : []).reduce((sum, course) => {
            return sum + Number(course.credits || 0);
        }, 0);
    }, [courses]);

    const upcomingCourses = useMemo(() => {
        return (Array.isArray(courses) ? courses : []).slice(0, 2);
    }, [courses]);

    const stats = [
        { title: 'Lớp học phần', value: formatCount(courseIds.length), icon: <BookOutlined />, color: '#b71c1c' },
        { title: 'Điểm TB tích lũy', value: averageScore, icon: <StarOutlined />, color: '#b71c1c' },
        { title: 'Bài tập chưa nộp', value: formatCount(pendingAssignments.length), icon: <ClockCircleOutlined />, color: '#b71c1c' },
        { title: 'Tín chỉ hoàn thành', value: completedCredits, icon: <CheckCircleOutlined />, color: '#b71c1c' },
    ];

    const isDashboardLoading = loadingCourses || loadingSubmissions || loadingAssignments;

    return (
        <MainLayout>
            <div className={styles.dashboard}>
                <div className={styles.mainGrid}>
                    <div className={styles.contentLeft}>
                        <Spin spinning={isDashboardLoading}>
                            <div className={styles.statsRow}>
                                {stats.map((stat, index) => (
                                    <Card key={index} className={styles.statCard}>
                                        <div className={styles.statHeader}>
                                            <p>{stat.title}</p>
                                        </div>
                                        <div className={styles.statBody}>
                                            <span className={styles.statValue}>{stat.value}</span>
                                            <span className={styles.statIcon} style={{ color: stat.color }}>{stat.icon}</span>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </Spin>

                        <div className={styles.middleSection}>
                            <div className={styles.deadlinesCard}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.headerTitle}>
                                        <ClockCircleOutlined />
                                        <h3>Hạn nộp sắp tới</h3>
                                    </div>
                                    <Button
                                        type="link"
                                        className={styles.viewAll}
                                        onClick={() => navigate('/dashboard/upcoming-deadlines')}
                                    >
                                        Xem tất cả
                                    </Button>
                                </div>
                                <div className={styles.deadlineList}>
                                    {deadlineItems.length === 0 ? (
                                        <Empty description="Không có bài tập đến hạn" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                    ) : (
                                        deadlineItems.map((item, index) => (
                                            <div key={`${item.assignmentId || item.title}-${index}`} className={styles.deadlineItem}>
                                                <div className={styles.deadlineInfo}>
                                                    <h4>{item.title}</h4>
                                                    <p>{item.subject}</p>
                                                    <span className={clsx(styles.timeTag, styles[item.status])}>
                                                        {item.status === 'warning' && <ClockCircleOutlined />}
                                                        {item.time}
                                                    </span>
                                                </div>
                                                <Button
                                                    shape="circle"
                                                    icon={<ArrowRightOutlined />}
                                                    disabled={!item.assignmentId || !item.classId}
                                                    onClick={() => {
                                                        if (!item.assignmentId || !item.classId) return;
                                                        navigate(`/classes/${item.classId}/assignments/${item.assignmentId}`);
                                                    }}
                                                />
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className={styles.gradesCard}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.headerTitle}>
                                        <StarOutlined />
                                        <h3>Điểm số gần đây</h3>
                                    </div>
                                </div>
                                <div className={styles.gradeList}>
                                    {recentGrades.length === 0 ? (
                                        <Empty description="Chưa có bài đã chấm" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                    ) : (
                                        recentGrades.map((grade, index) => (
                                            <div key={`${grade.assignmentId || grade.detail}-${index}`} className={styles.gradeItem}>
                                                <div className={styles.gradeInfo}>
                                                    <h4>{grade.subject}</h4>
                                                    <p>{grade.detail}</p>
                                                </div>
                                                <div className={styles.gradeScore}>
                                                    <span className={styles.scoreText}>{grade.score}</span>
                                                    <Button
                                                        size="small"
                                                        type="primary"
                                                        danger
                                                        className={styles.detailBtn}
                                                        disabled={!grade.assignmentId || !grade.classId}
                                                        onClick={() => {
                                                            if (!grade.assignmentId || !grade.classId) return;
                                                            navigate(`/classes/${grade.classId}/assignments/${grade.assignmentId}/result`);
                                                        }}
                                                    >
                                                        Chi tiết
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <Button
                                    block
                                    className={styles.viewFullScale}
                                    onClick={() => navigate('/dashboard/grade-overview')}
                                >
                                    Xem toàn bộ bảng điểm
                                </Button>
                            </div>
                        </div>

                        <div className={styles.activityCard}>
                            <div className={styles.cardHeader}>
                                <h3>Hoạt động gần đây</h3>
                            </div>
                            <Timeline className={styles.activityTimeline}>
                                <Timeline.Item dot={<div className={styles.activityDotRed} />}>
                                    <div className={styles.activityContent}>
                                        <p><strong>Giảng viên Nguyễn Thị B</strong> đã đăng một thông báo mới trong lớp <span className={styles.linkText}>Phát triển ứng dụng Web</span>.</p>
                                        <span className={styles.timeAgo}>10 phút trước</span>
                                        <div className={styles.activityComment}>
                                            &quot;Các em nhớ nộp bài tập lớn đúng hạn vào ngày mai nhé...&quot;
                                        </div>
                                    </div>
                                </Timeline.Item>
                                <Timeline.Item dot={<div className={styles.activityDotBlue} />}>
                                    <div className={styles.activityContent}>
                                        <p>Bạn đã nộp bài tập <strong>Thực hành SQL</strong> thành công.</p>
                                        <span className={styles.timeAgo}>2 giờ trước</span>
                                    </div>
                                </Timeline.Item>
                                <Timeline.Item dot={<div className={styles.activityDotGreen} />}>
                                    <div className={styles.activityContent}>
                                        <p>Đã có điểm môn <strong>Triết học Mác - Lênin</strong>.</p>
                                        <span className={styles.timeAgo}>Hôm qua</span>
                                    </div>
                                </Timeline.Item>
                            </Timeline>
                        </div>
                    </div>

                    <div className={styles.contentRight}>
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

                        <div className={styles.upcomingEvents}>
                            <p className={styles.upcomingHeader}>SẮP DIỄN RA</p>
                            {loadingCourses ? (
                                <Spin />
                            ) : upcomingCourses.length === 0 ? (
                                <Empty description="Chưa có lịch học" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            ) : (
                                upcomingCourses.map((course, index) => (
                                    <div key={getCourseId(course)} className={styles.eventItem}>
                                        <div className={styles.eventTimeBox}>
                                            <p>Tiết</p>
                                            <p className={styles.timeRange}>{index === 0 ? '1-3' : '4-6'}</p>
                                        </div>
                                        <div className={styles.eventDetails}>
                                            <h4>{course.courseCode} - {course.courseName}</h4>
                                            <p><EnvironmentOutlined /> Phòng: {course.room || (index === 0 ? '402 - A2' : 'HT2')}</p>
                                            <p><ClockCircleOutlined /> {course.schedule || (index === 0 ? '07:00 - 09:50' : '10:00 - 12:50')}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Dashboard;
