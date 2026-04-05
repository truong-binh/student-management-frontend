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

                const assignmentList = Array.isArray(res.data) ? res.data : res.data?.items || [];
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
                const assignmentCourseId = assignment.courseId?._id || assignment.courseId || assignment.course;
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
                <Card className={styles.heroCard}>
                    <div className={styles.heroTop}>
                        <div>
                            <h1>Hạn nộp sắp tới</h1>
                            <p>Toàn bộ bài tập chưa nộp được sắp xếp theo hạn gần nhất.</p>
                        </div>
                        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/dashboard')}>
                            Quay lại dashboard
                        </Button>
                    </div>

                    <div className={styles.metrics}>
                        <div className={styles.metricItem}>
                            <span>Tổng cần xử lý</span>
                            <strong>{stats.total}</strong>
                        </div>
                        <div className={styles.metricItem}>
                            <span>Trong 24 giờ</span>
                            <strong>{stats.in24h}</strong>
                        </div>
                        <div className={styles.metricItem}>
                            <span>Trong 7 ngày</span>
                            <strong>{stats.in7d}</strong>
                        </div>
                    </div>
                </Card>

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
                    {filteredAssignments.length === 0 ? (
                        <Card className={styles.emptyCard}>
                            <Empty
                                description="Không có bài tập phù hợp với bộ lọc"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        </Card>
                    ) : (
                        <div className={styles.deadlineGrid}>
                            {filteredAssignments.map((assignment, index) => {
                                const tone = getDeadlineTone(assignment.dueDate);
                                return (
                                    <Card key={`${assignment.id || assignment.title}-${index}`} className={styles.deadlineCard}>
                                        <div className={`${styles.cardHead} ${styles[tone]}`}>
                                            <Tag color={tone === 'urgent' ? 'red' : tone === 'warning' ? 'orange' : 'blue'}>
                                                {tone === 'urgent' ? 'Khẩn' : tone === 'warning' ? 'Ưu tiên' : 'Bình thường'}
                                            </Tag>
                                            <span>{assignment.dueDate?.isValid() ? assignment.dueDate.format('DD/MM/YYYY HH:mm') : 'Chưa có hạn'}</span>
                                        </div>

                                        <h3>{assignment.title || 'Bài tập chưa đặt tên'}</h3>
                                        <p>{assignment.course?.courseName || 'Môn học chưa xác định'}</p>

                                        <div className={styles.timeLeft}>
                                            <ClockCircleOutlined />
                                            <span>{getTimeLeftText(assignment.dueDate)}</span>
                                        </div>

                                        <Button
                                            type="primary"
                                            danger
                                            icon={<ArrowRightOutlined />}
                                            disabled={!assignment.id || !assignment.classId}
                                            onClick={() => {
                                                if (!assignment.id || !assignment.classId) return;
                                                navigate(`/classes/${assignment.classId}/assignments/${assignment.id}`);
                                            }}
                                        >
                                            Đi nộp bài
                                        </Button>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </Spin>
            </div>
        </MainLayout>
    );
};

export default UpcomingDeadlines;
