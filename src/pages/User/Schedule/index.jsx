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

const normalizeVietnamese = (value) => {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .trim();
};

const mapWeekdayFromToken = (token) => {
    if (!token) return null;

    const normalized = normalizeVietnamese(token);
    const map = {
        t2: 1,
        t3: 2,
        t4: 3,
        t5: 4,
        t6: 5,
        t7: 6,
        cn: 0,
    };

    if (Object.prototype.hasOwnProperty.call(map, normalized)) {
        return map[normalized];
    }

    if (normalized.includes('chu nhat')) {
        return 0;
    }

    const thuMatch = normalized.match(/thu\s*([2-7])/i);
    if (thuMatch) {
        return Number(thuMatch[1]) - 1;
    }

    const shortMatch = normalized.match(/\bt\s*([2-7])\b/i);
    if (shortMatch) {
        return Number(shortMatch[1]) - 1;
    }

    return null;
};

const parseTimeRange = (text) => {
    if (!text) return null;

    const match = String(text).match(/(\d{1,2}[:h]\d{2})\s*[-~–]\s*(\d{1,2}[:h]\d{2})/i);
    if (!match) return null;

    const normalize = (value) => {
        const [hour, minute] = value.replace('h', ':').split(':');
        return `${String(hour).padStart(2, '0')}:${minute}`;
    };

    return `${normalize(match[1])} - ${normalize(match[2])}`;
};

const extractRoom = (text) => {
    if (!text) return null;
    const match = String(text).match(/(phong|phòng|room)\s*:?\s*([\w\-\s]+)/i);
    if (!match) return null;
    return match[2]?.trim() || null;
};

const splitScheduleSegments = (schedule) => {
    if (!schedule) return [];
    if (Array.isArray(schedule)) return schedule.flatMap(splitScheduleSegments);
    if (typeof schedule === 'object') return [schedule];

    return String(schedule)
        .split(/[\n;|]+/)
        .map((segment) => segment.trim())
        .filter(Boolean);
};

const extractClassSlots = (course) => {
    const segments = splitScheduleSegments(course?.schedule);
    if (!segments.length) return [];

    return segments
        .map((segment, index) => {
            if (typeof segment === 'object' && segment !== null) {
                const weekday = mapWeekdayFromToken(
                    segment.dayOfWeek || segment.weekday || segment.day || segment.thu
                );

                if (weekday === null) return null;

                return {
                    id: `${getCourseId(course)}-slot-${index}`,
                    weekday,
                    time: segment.time || segment.timeRange || segment.slot || null,
                    room: segment.room || segment.location || course?.room || null,
                    rawSchedule: `${segment.dayOfWeek || segment.weekday || segment.day || ''} ${segment.time || segment.timeRange || ''}`.trim(),
                };
            }

            const weekday = mapWeekdayFromToken(segment);
            if (weekday === null) return null;

            return {
                id: `${getCourseId(course)}-slot-${index}`,
                weekday,
                time: parseTimeRange(segment),
                room: extractRoom(segment) || course?.room || null,
                rawSchedule: segment,
            };
        })
        .filter(Boolean);
};

const getEventSortValue = (event) => {
    const priority = {
        overdue: 0,
        deadline: 1,
        class: 2,
        done: 3,
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

    const classSlots = useMemo(() => {
        return (Array.isArray(courses) ? courses : []).flatMap((course) => {
            const slots = extractClassSlots(course);
            return slots.map((slot) => ({
                ...slot,
                courseId: getCourseId(course),
                courseCode: course.courseCode,
                courseName: course.courseName,
                fallbackRoom: course.room || null,
            }));
        });
    }, [courses]);

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
                schedule: course?.schedule || null,
            };

            const key = event.date;
            if (!acc[key]) acc[key] = [];
            acc[key].push(event);
            return acc;
        }, {});
    }, [assignments, coursesById, submissionByAssignmentId]);

    const getClassEventsForDate = useCallback((value) => {
        const dateKey = value.format('YYYY-MM-DD');

        return classSlots
            .filter((slot) => slot.weekday === value.day())
            .map((slot) => ({
                id: `${slot.id}-${dateKey}`,
                kind: 'class',
                type: 'class',
                typeLabel: 'Lịch học',
                title: `${slot.courseCode || ''} - ${slot.courseName || 'Môn học'}`,
                date: dateKey,
                time: slot.time || 'Theo lịch môn học',
                room: slot.room || slot.fallbackRoom || null,
                notes: slot.rawSchedule || null,
                courseCode: slot.courseCode || 'MON',
                courseName: slot.courseName || 'Môn học',
                schedule: slot.rawSchedule || null,
            }));
    }, [classSlots]);

    const getEventsForDate = useCallback((value) => {
        const key = value.format('YYYY-MM-DD');
        const classEvents = getClassEventsForDate(value);
        const deadlineEvents = assignmentEventsByDate[key] || [];

        return [...classEvents, ...deadlineEvents]
            .sort((a, b) => getEventSortValue(a) - getEventSortValue(b));
    }, [assignmentEventsByDate, getClassEventsForDate]);

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
                            {item.kind === 'class' ? item.time : `${item.time} - ${item.courseCode}`}
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
        if (type === 'class') return <BookOutlined />;
        return <FileTextOutlined />;
    };

    const headerRender = ({ value, onChange }) => {
        return (
            <div className={styles.customHeader}>
                <div className={styles.monthYear}>
                    <h2>{value.format('MMMM, YYYY')}</h2>
                    <span className={styles.monthSub}>Lịch học và hạn nộp bài tập</span>
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
                                <p style={{ fontWeight: 600 }}>Ngày này không có lịch học hoặc hạn nộp</p>
                            </div>
                        )}
                    </div>
                </div>
            </MainLayout>
        </ConfigProvider>
    );
};

export default Schedule;
