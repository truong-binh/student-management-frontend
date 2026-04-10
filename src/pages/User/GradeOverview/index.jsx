import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Empty, Input, Select, Spin, Table, Tag } from 'antd';
import {
    ArrowLeftOutlined,
    SearchOutlined,
    StarOutlined,
    TrophyOutlined,
    BarChartOutlined
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

const getLetterGrade = (score) => {
    if (score >= 8.5) return 'A';
    if (score >= 7.0) return 'B+';
    if (score >= 6.5) return 'B';
    if (score >= 5.5) return 'C+';
    if (score >= 5.0) return 'C';
    return 'D';
};

const GradeOverview = () => {
    const navigate = useNavigate();
    const [keyword, setKeyword] = useState('');
    const [courseFilter, setCourseFilter] = useState('all');

    const { courses, isLoading: loadingCourses } = useCourse();
    const { mySubmissions, isLoading: loadingSubmissions } = useMySubmissions();

    const courseIds = useMemo(
        () => (Array.isArray(courses) ? courses.map(getCourseId).filter(Boolean) : []),
        [courses]
    );

    const { data: assignments = [], isLoading: loadingAssignments } = useQuery({
        queryKey: ['grade-overview-assignments', courseIds],
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

    const assignmentById = useMemo(() => {
        return (Array.isArray(assignments) ? assignments : []).reduce((acc, assignment) => {
            const assignmentId = assignment._id || assignment.id;
            if (assignmentId) {
                acc[String(assignmentId)] = assignment;
            }
            return acc;
        }, {});
    }, [assignments]);

    const gradeRows = useMemo(() => {
        return (Array.isArray(mySubmissions) ? mySubmissions : [])
            .filter((submission) => submission.status === 'GRADED' || typeof submission.score === 'number')
            .map((submission, index) => {
                const assignmentId = getSubmissionAssignmentId(submission);
                const assignment = assignmentById[String(assignmentId)] || submission.assignment || {};

                const classId =
                    extractEntityId(assignment.courseId) ||
                    extractEntityId(assignment.course) ||
                    extractEntityId(submission.assignment?.courseId) ||
                    extractEntityId(submission.assignment?.course) ||
                    assignment.courseId ||
                    assignment.course ||
                    submission.assignment?.courseId ||
                    submission.assignment?.course;

                const course = coursesById[String(classId)] || null;
                const scoreNumber = Number(submission.score || 0);

                return {
                    key: submission._id || submission.id || `${assignmentId || 'grade'}-${index}`,
                    assignmentId,
                    classId,
                    courseName: course?.courseName || 'Môn học',
                    assignmentTitle: assignment.title || submission.assignment?.title || 'Bài tập',
                    scoreNumber,
                    scoreText: typeof submission.score === 'number' ? submission.score.toFixed(1) : '0.0',
                    letter: getLetterGrade(scoreNumber),
                    gradedAt: submission.gradedAt || submission.updatedAt || submission.createdAt,
                };
            })
            .sort((a, b) => dayjs(b.gradedAt).valueOf() - dayjs(a.gradedAt).valueOf());
    }, [assignmentById, coursesById, mySubmissions]);

    const courseOptions = useMemo(() => {
        const map = new Map();
        gradeRows.forEach((item) => {
            if (item.classId && !map.has(String(item.classId))) {
                map.set(String(item.classId), item.courseName);
            }
        });
        return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
    }, [gradeRows]);

    const filteredRows = useMemo(() => {
        return gradeRows.filter((row) => {
            const text = `${row.courseName} ${row.assignmentTitle}`.toLowerCase();
            const matchKeyword = text.includes(keyword.trim().toLowerCase());
            const matchCourse = courseFilter === 'all' || String(row.classId) === courseFilter;
            return matchKeyword && matchCourse;
        });
    }, [gradeRows, keyword, courseFilter]);

    const stats = useMemo(() => {
        if (!gradeRows.length) {
            return {
                avg: '0.00',
                highest: '0.0',
                total: 0,
            };
        }

        const total = gradeRows.length;
        const sum = gradeRows.reduce((acc, item) => acc + item.scoreNumber, 0);
        const highest = gradeRows.reduce((max, item) => Math.max(max, item.scoreNumber), 0);

        return {
            avg: (sum / total).toFixed(2),
            highest: highest.toFixed(1),
            total,
        };
    }, [gradeRows]);

    const columns = [
        {
            title: 'Môn học',
            dataIndex: 'courseName',
            key: 'courseName',
            width: 220,
            render: (value) => <span className={styles.courseName}>{value}</span>,
        },
        {
            title: 'Bài tập',
            dataIndex: 'assignmentTitle',
            key: 'assignmentTitle',
            render: (value) => <span className={styles.assignmentTitle}>{value}</span>,
        },
        {
            title: 'Điểm',
            dataIndex: 'scoreText',
            key: 'scoreText',
            width: 140,
            render: (value, record) => (
                <div className={styles.scoreCell}>
                    <strong>{value}</strong>
                    <Tag color="green">{record.letter}</Tag>
                </div>
            ),
        },
        {
            title: 'Ngày chấm',
            dataIndex: 'gradedAt',
            key: 'gradedAt',
            width: 180,
            render: (value) => (value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '--'),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Button
                    type="primary"
                    danger
                    size="small"
                    disabled={!record.assignmentId || !record.classId}
                    onClick={() => {
                        if (!record.assignmentId || !record.classId) return;
                        navigate(`/classes/${record.classId}/assignments/${record.assignmentId}/result`);
                    }}
                >
                    Xem chi tiết
                </Button>
            ),
        },
    ];

    const isLoading = loadingCourses || loadingSubmissions || loadingAssignments;

    return (
        <MainLayout>
            <div className={styles.page}>
                <Card className={styles.heroCard}>
                    <div className={styles.heroTop}>
                        <div>
                            <h1>Toàn bộ bảng điểm</h1>
                            <p>Danh sách các bài đã chấm điểm, cập nhật theo thời gian mới nhất.</p>
                        </div>
                        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/dashboard')}>
                            Quay lại dashboard
                        </Button>
                    </div>

                    <div className={styles.statsRow}>
                        <div className={styles.statItem}>
                            <StarOutlined />
                            <div>
                                <span>Điểm trung bình</span>
                                <strong>{stats.avg}</strong>
                            </div>
                        </div>
                        <div className={styles.statItem}>
                            <TrophyOutlined />
                            <div>
                                <span>Điểm cao nhất</span>
                                <strong>{stats.highest}</strong>
                            </div>
                        </div>
                        <div className={styles.statItem}>
                            <BarChartOutlined />
                            <div>
                                <span>Bài đã chấm</span>
                                <strong>{stats.total}</strong>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className={styles.filterCard}>
                    <Input
                        value={keyword}
                        onChange={(event) => setKeyword(event.target.value)}
                        prefix={<SearchOutlined />}
                        placeholder="Tìm theo môn học hoặc tên bài tập"
                        className={styles.searchInput}
                    />

                    <Select value={courseFilter} onChange={setCourseFilter} className={styles.courseFilter}>
                        <Option value="all">Tất cả môn học</Option>
                        {courseOptions.map((option) => (
                            <Option key={option.value} value={option.value}>
                                {option.label}
                            </Option>
                        ))}
                    </Select>
                </Card>

                <Card className={styles.tableCard}>
                    <Spin spinning={isLoading}>
                        {filteredRows.length === 0 ? (
                            <Empty description="Chưa có dữ liệu điểm" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        ) : (
                            <Table
                                columns={columns}
                                dataSource={filteredRows}
                                pagination={{ pageSize: 8, showSizeChanger: false }}
                                scroll={{ x: 860 }}
                            />
                        )}
                    </Spin>
                </Card>
            </div>
        </MainLayout>
    );
};

export default GradeOverview;
