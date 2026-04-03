import React, { useCallback, useMemo, useState } from 'react';
import { Calendar, Button, ConfigProvider, Spin } from 'antd';
import {
    CalendarOutlined,
    ClockCircleOutlined,
    EnvironmentOutlined,
    FileTextOutlined,
    LeftOutlined,
    RightOutlined,
    BellOutlined,
    BookOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import MainLayout from '@/layouts/User/MainLayout';
import styles from './styles.module.scss';
import viVN from 'antd/lib/locale/vi_VN';
import { useQuery } from '@tanstack/react-query';
import { useCourse } from '@/hooks/useCourse';
import { useMySubmissions } from '@/hooks/useSubmission';
import { assignmentApi } from '@/api/admin/assignment';

dayjs.locale('vi');

const getCourseId = (course) => course?._id || course?.id;

const getSubmissionAssignmentId = (submission) => (
    submission?.assignment?._id || submission?.assignment?.id || submission?.assignment
);

const getEventSortValue = (event) => {
    const priority = {
        overdue: 0,
        deadline: 1,
        done: 2,
    };

    const firstTimeToken = event?.time?.match(/\d{1,2}:\d{2}/)?.[0];
    if (!firstTimeToken) return priority[event.type] * 10000;

    const [hour, minute] = firstTimeToken.split(':').map(Number);
    return (priority[event.type] * 10000) + (hour * 60) + minute;
};

const Schedule = () => {
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const { courses, isLoading: loadingCourses } = useCourse();
    const { mySubmissions, isLoading: loadingSubmissions } = useMySubmissions();

    const courseIds = useMemo(
        () => (Array.isArray(courses) ? courses.map(getCourseId).filter(Boolean) : []),
        [courses]
    );

    const { data: assignments = [], isLoading: loadingAssignments } = useQuery({
        queryKey: ['student-schedule-assignments', courseIds],
        enabled: courseIds.length > 0,
        queryFn: async () => {
            const responses = await Promise.all(
                courseIds.map((courseId) => assignmentApi.getAssignmentsByCourseId(courseId))
            );

            return responses.flatMap((res, index) => {
                if (!res?.success) return [];

                const assignmentList = Array.isArray(res.data)
                    ? res.data
                    : res.data?.items || [];

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

    const assignmentEventsByDate = useMemo(() => {
        return (Array.isArray(assignments) ? assignments : []).reduce((acc, assignment) => {
            const assignmentId = assignment._id || assignment.id;
            const dueDate = dayjs(assignment.dueDate);
            if (!dueDate.isValid()) return acc;

            const assignmentCourseId = assignment.courseId?._id || assignment.courseId || assignment.course;
            const course = coursesById[String(assignmentCourseId)] || null;
            const submission = assignmentId
                ? submissionByAssignmentId[String(assignmentId)]
                : null;

            const isSubmitted = !!submission;
            const isOverdue = !isSubmitted && dayjs().isAfter(dueDate);
            const type = isSubmitted ? 'done' : (isOverdue ? 'overdue' : 'deadline');
            const typeLabel = isSubmitted ? 'Đã nộp' : (isOverdue ? 'Quá hạn' : 'Hạn nộp');

            const event = {
                id: assignmentId || `${assignmentCourseId}-${assignment.title}-${dueDate.valueOf()}`,
                kind: 'assignment',
                type,
                typeLabel,
                title: assignment.title || 'Bài tập',
                date: dueDate.format('YYYY-MM-DD'),
                time: dueDate.format('HH:mm'),
                room: course?.room || null,
                notes: assignment.description || null,
                courseCode: course?.courseCode || 'MON',
                courseName: course?.courseName || 'Môn học',
            };

            const key = event.date;
            if (!acc[key]) acc[key] = [];
            acc[key].push(event);
            return acc;
        }, {});
    }, [assignments, coursesById, submissionByAssignmentId]);

    const getEventsForDate = useCallback((value) => {
        const key = value.format('YYYY-MM-DD');
        const deadlineEvents = assignmentEventsByDate[key] || [];

        return [...deadlineEvents].sort((a, b) => getEventSortValue(a) - getEventSortValue(b));
    }, [assignmentEventsByDate]);

    const isLoading = loadingCourses || loadingSubmissions || loadingAssignments;

    const dateCellRender = (value) => {
        const listData = getEventsForDate(value);
        return (
            <ul className={styles.eventsList}>
                {listData.map((item) => (
                    <li key={item.id} className={`${styles.calendarEvent} ${styles[item.type]}`}>
                        {item.title}
                        <span className={styles.eventTime}>
                            <ClockCircleOutlined style={{ fontSize: '8px', marginRight: '4px' }} />
                            {`${item.time} - ${item.courseCode}`}
                        </span>
                    </li>
                ))}
            </ul>
        );
    };

    const selectedEvents = useMemo(
        () => getEventsForDate(selectedDate),
        [getEventsForDate, selectedDate]
    );

    const typeIcon = (type) => {
        if (type === 'done') return <CheckCircleOutlined />;
        if (type === 'overdue') return <ExclamationCircleOutlined />;
        return <FileTextOutlined />;
    };

    const headerRender = ({ value, onChange }) => {
        return (
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
                        style={{ background: '#f8fafc' }}
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
    };

    return (
        <ConfigProvider locale={viVN}>
            <MainLayout>
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
                        <div style={{ paddingBottom: '12px', borderBottom: '1px dashed #edf2f7', marginBottom: '20px' }}>
                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#2d3748', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <BellOutlined style={{ color: '#b71c1c' }} />
                                Chi tiết ngày ({selectedDate.format('DD/MM')})
                            </h4>
                            <p style={{ margin: '6px 0 0', color: '#718096', fontSize: '12px' }}>
                                {selectedEvents.length > 0 ? `${selectedEvents.length} sự kiện` : 'Không có sự kiện'}
                            </p>
                        </div>
                        {selectedEvents.length > 0 ? (
                            selectedEvents.map(event => (
                                <div key={event.id} className={`${styles.detailCard} ${styles[event.type]}`}>
                                    <div className={`${styles.tag} ${styles[`${event.type}Tag`]}`}>
                                        {typeIcon(event.type)} {event.typeLabel}
                                    </div>
                                    <h3>{event.title}</h3>
                                    <div className={styles.infoList}>
                                        <div className={styles.infoItem}>
                                            <CalendarOutlined className={styles.icon} />
                                            {dayjs(event.date).format('DD/MM/YYYY')}
                                        </div>
                                        <div className={styles.infoItem}>
                                            <ClockCircleOutlined className={styles.icon} />
                                            {event.time}
                                        </div>
                                        {event.room && (
                                            <div className={styles.infoItem}>
                                                <EnvironmentOutlined className={styles.icon} />
                                                {event.room}
                                            </div>
                                        )}
                                        <div className={styles.infoItem}>
                                            <BookOutlined className={styles.icon} />
                                            {event.courseCode} - {event.courseName}
                                        </div>
                                    </div>
                                    {event.notes && (
                                        <div className={styles.notesSection}>
                                            <div className={styles.notesTitle}>
                                                <FileTextOutlined />
                                                Ghi chú
                                            </div>
                                            <p>{event.notes}</p>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '60px 40px', color: '#a0aec0', background: 'white', borderRadius: '20px', border: '1px solid #edf2f7' }}>
                                <CalendarOutlined style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }} />
                                <p style={{ fontWeight: 600 }}>Ngày này không có hạn nộp bài tập</p>
                            </div>
                        )}
                    </div>
                </div>
            </MainLayout>
        </ConfigProvider>
    );
};

export default Schedule;
