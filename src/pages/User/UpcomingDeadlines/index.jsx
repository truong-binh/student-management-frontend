import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Empty, Input, Select, Spin, Tag } from 'antd';
import {
    ArrowLeftOutlined,
    ArrowRightOutlined,
    ClockCircleOutlined,
    SearchOutlined
} from '@ant-design/icons';
import MainLayout from '@/layouts/User/MainLayout';
import { useCourse } from '@/hooks/useCourse';
import { useMySubmissions } from '@/hooks/useSubmission';
import { assignmentApi } from '@/api/admin/assignment';
import styles from './styles.module.scss';

const { Option } = Select;

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

const getTimeLeftText = (dueDate) => {
    if (!dueDate?.isValid()) return 'Không có hạn nộp';

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

const getDeadlineTone = (dueDate) => {
    if (!dueDate?.isValid()) return 'normal';

    const hourDiff = dueDate.diff(dayjs(), 'hour');
    if (hourDiff <= 24) return 'urgent';
    if (hourDiff <= 72) return 'warning';
    return 'normal';
};

const UpcomingDeadlines = () => {
    const navigate = useNavigate();

    const [keyword, setKeyword] = useState('');
    const [timeFilter, setTimeFilter] = useState('all');

    const { courses, isLoading: loadingCourses } = useCourse();
    const { mySubmissions, isLoading: loadingSubmissions } = useMySubmissions();

    const courseIds = useMemo(
        () => (Array.isArray(courses) ? courses.map(getCourseId).filter(Boolean) : []),
        [courses]
    );

    const { data: assignments = [], isLoading: loadingAssignments } = useQuery({
        queryKey: ['upcoming-deadline-assignments', courseIds],
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
            if (id) {
                acc[String(id)] = course;
            }
            return acc;
        }, {});
    }, [courses]);

    const submissionByAssignmentId = useMemo(() => {
        return (Array.isArray(mySubmissions) ? mySubmissions : []).reduce((acc, submission) => {
            const assignmentId = getSubmissionAssignmentId(submission);
            if (assignmentId) {
                acc[String(assignmentId)] = submission;
            }
            return acc;
        }, {});
    }, [mySubmissions]);

    const upcomingAssignments = useMemo(() => {
        return (Array.isArray(assignments) ? assignments : [])
            .map((assignment) => {
                const assignmentId = assignment._id || assignment.id;
                const submission = assignmentId ? submissionByAssignmentId[String(assignmentId)] : null;
                const dueDate = dayjs(assignment.dueDate);
                const assignmentCourseId =
                    extractEntityId(assignment.courseId) ||
                    extractEntityId(assignment.course) ||
                    assignment.courseId ||
                    assignment.course;
                const course = coursesById[String(assignmentCourseId)] || null;

                return {
                    ...assignment,
                    id: assignmentId,
                    submission,
                    dueDate,
                    course,
                    classId: assignmentCourseId,
                    isSubmitted: !!submission,
                    isOverdue: dueDate.isValid() ? dayjs().isAfter(dueDate) : false,
                };
            })
            .filter((assignment) => !assignment.isSubmitted && !assignment.isOverdue)
            .sort((a, b) => {
                const timeA = a.dueDate?.isValid() ? a.dueDate.valueOf() : Number.MAX_SAFE_INTEGER;
                const timeB = b.dueDate?.isValid() ? b.dueDate.valueOf() : Number.MAX_SAFE_INTEGER;
                return timeA - timeB;
            });
    }, [assignments, coursesById, submissionByAssignmentId]);

    const filteredAssignments = useMemo(() => {
        return upcomingAssignments.filter((assignment) => {
            const text = `${assignment.title || ''} ${assignment.course?.courseName || ''}`.toLowerCase();
            const matchKeyword = text.includes(keyword.trim().toLowerCase());

            const hourDiff = assignment.dueDate?.isValid()
                ? assignment.dueDate.diff(dayjs(), 'hour')
                : Number.MAX_SAFE_INTEGER;

            if (!matchKeyword) return false;
            if (timeFilter === '24h') return hourDiff <= 24;
            if (timeFilter === '3d') return hourDiff <= 72;
            if (timeFilter === '7d') return hourDiff <= 168;
            return true;
        });
    }, [upcomingAssignments, keyword, timeFilter]);

    const stats = useMemo(() => {
        const total = upcomingAssignments.length;
        const in24h = upcomingAssignments.filter(
            (assignment) => assignment.dueDate?.isValid() && assignment.dueDate.diff(dayjs(), 'hour') <= 24
        ).length;
        const in7d = upcomingAssignments.filter(
            (assignment) => assignment.dueDate?.isValid() && assignment.dueDate.diff(dayjs(), 'day') <= 7
        ).length;

        return { total, in24h, in7d };
    }, [upcomingAssignments]);

    const isLoading = loadingCourses || loadingSubmissions || loadingAssignments;

    return (
        <MainLayout>
            <div className={styles.page}>
                <div className={styles.header}>
                    <Button 
                        type="text" 
                        icon={<ArrowLeftOutlined />} 
                        onClick={() => navigate('/dashboard')}
                        className={styles.backBtn}
                    >
                        Quay lại Dashboard
                    </Button>
                    <div className={styles.titleSection}>
                        <h1>Hạn nộp sắp tới</h1>
                        <p>Danh sách bài tập chưa nộp sắp xếp theo thời gian</p>
                    </div>
                </div>

                <div className={styles.metricsContainer}>
                    <div className={styles.metricCard}>
                        <div className={styles.metricValue}>{stats.total}</div>
                        <div className={styles.metricLabel}>Tổng bài tập</div>
                    </div>
                    <div className={styles.metricCard}>
                        <div className={`${styles.metricValue} ${styles.urgent}`}>{stats.in24h}</div>
                        <div className={styles.metricLabel}>Trong 24h tới</div>
                    </div>
                    <div className={styles.metricCard}>
                        <div className={styles.metricValue}>{stats.in7d}</div>
                        <div className={styles.metricLabel}>Trong 7 ngày</div>
                    </div>
                </div>

                <Card className={styles.filterCard}>
                    <Input
                        value={keyword}
                        onChange={(event) => setKeyword(event.target.value)}
                        prefix={<SearchOutlined />}
                        placeholder="Tìm theo tên bài tập hoặc môn học"
                        className={styles.searchInput}
                    />

                    <Select
                        value={timeFilter}
                        onChange={setTimeFilter}
                        className={styles.timeFilter}
                    >
                        <Option value="all">Toàn bộ</Option>
                        <Option value="24h">Sắp hết hạn (24 giờ)</Option>
                        <Option value="3d">Trong 3 ngày</Option>
                        <Option value="7d">Trong 7 ngày</Option>
                    </Select>
                </Card>

                <Spin spinning={isLoading}>
                    <div className={styles.contentSection}>
                        {filteredAssignments.length === 0 ? (
                            <div className={styles.emptyState}>
                                <Empty
                                    description="Tuyệt vời! Không còn bài tập nào sắp hết hạn."
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                />
                            </div>
                        ) : (
                            <div className={styles.deadlineGrid}>
                                {filteredAssignments.map((assignment, index) => {
                                    const tone = getDeadlineTone(assignment.dueDate);
                                    return (
                                        <div key={`${assignment.id || assignment.title}-${index}`} className={styles.deadlineCard}>
                                            <div className={styles.cardHeader}>
                                                <Tag color={tone === 'urgent' ? 'red' : tone === 'warning' ? 'orange' : 'blue'} className={styles.statusTag}>
                                                    {tone === 'urgent' ? 'Khẩn cấp' : tone === 'warning' ? 'Sắp tới hạn' : 'Đang mở'}
                                                </Tag>
                                                <span className={styles.dateText}>
                                                    {assignment.dueDate?.isValid() ? assignment.dueDate.format('HH:mm - DD/MM') : '---'}
                                                </span>
                                            </div>
                                            
                                            <div className={styles.cardBody}>
                                                <h3 className={styles.assignmentTitle}>{assignment.title || 'Bài tập'}</h3>
                                                <p className={styles.courseName}>{assignment.course?.courseName || 'Môn học'}</p>
                                                
                                                <div className={`${styles.timeLeft} ${styles[tone]}`}>
                                                    <ClockCircleOutlined />
                                                    <span>{getTimeLeftText(assignment.dueDate)}</span>
                                                </div>
                                            </div>

                                            <div className={styles.cardFooter}>
                                                <Button
                                                    type="primary"
                                                    danger
                                                    block
                                                    onClick={() => {
                                                        if (!assignment.id || !assignment.classId) return;
                                                        navigate(`/classes/${assignment.classId}/assignments/${assignment.id}`);
                                                    }}
                                                    className={styles.submitBtn}
                                                >
                                                    Nộp bài ngay
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </Spin>
            </div>
        </MainLayout>
    );
};

export default UpcomingDeadlines;
