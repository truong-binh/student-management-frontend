import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/User/MainLayout';
import { Input, Select, Progress, Button, Pagination, Spin } from 'antd';
import {
    SearchOutlined,
    BookOutlined,
    CodeOutlined,
    GlobalOutlined,
    DesktopOutlined,
    ApartmentOutlined,
    RadiusUprightOutlined,
    SafetyCertificateOutlined,
    TranslationOutlined
} from '@ant-design/icons';
import { useCourse } from '@/hooks/useCourse';
import { useMySubmissions } from '@/hooks/useSubmission';
import { assignmentApi } from '@/api/admin/assignment';
import { useQuery } from '@tanstack/react-query';
import styles from './styles.module.scss';

const { Option } = Select;

const COLORS = ['#e53e3e', '#3182ce', '#805ad5', '#d69e2e', '#38b2ac', '#5a67d8', '#ed64a6', '#c53030'];
const ICONS = [<CodeOutlined />, <GlobalOutlined />, <DesktopOutlined />, <ApartmentOutlined />, <RadiusUprightOutlined />, <TranslationOutlined />, <SafetyCertificateOutlined />];

const MyClasses = () => {
    const navigate = useNavigate();
    const { courses, isLoading: coursesLoading } = useCourse();
    const { mySubmissions, isLoading: submissionsLoading } = useMySubmissions();

    const [searchText, setSearchText] = useState('');
    const [semesterFilter, setSemesterFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 8;

    const allCourseIds = useMemo(() => (Array.isArray(courses) ? courses.map(c => c._id || c.id).filter(Boolean) : []), [courses]);

    const { data: assignmentsData = {}, isLoading: assignmentsLoading } = useQuery({
        queryKey: ['courses-assignments-summary', allCourseIds],
        enabled: allCourseIds.length > 0,
        queryFn: async () => {
            const results = await Promise.all(
                allCourseIds.map(id => assignmentApi.getAssignmentsByCourseId(id)
                    .then(res => ({
                        id,
                        data: res.success ? (res.data?.assignments || res.data?.items || res.data || []) : []
                    }))
                    .catch(() => ({ id, data: [] }))
                )
            );
            return results.reduce((acc, curr) => {
                acc[String(curr.id)] = curr.data;
                return acc;
            }, {});
        }
    });

    const isLoading = coursesLoading || assignmentsLoading;

    const uniqueSemesters = useMemo(() => {
        return Array.from(new Set((Array.isArray(courses) ? courses : []).map(c => c.semester).filter(Boolean)));
    }, [courses]);

    const filtered = (Array.isArray(courses) ? courses : []).filter((c) => {
        const matchSearch =
            c.courseName?.toLowerCase().includes(searchText.toLowerCase()) ||
            c.courseCode?.toLowerCase().includes(searchText.toLowerCase());
        const matchSemester = semesterFilter === 'All' || c.semester === semesterFilter;
        return matchSearch && matchSemester;
    });

    const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const getCourseProgress = (courseId) => {
        const assignments = assignmentsData[String(courseId)] || [];
        const total = assignments.length;
        if (total === 0) return { completed: 0, total: 0, percent: 0 };

        const completed = assignments.filter(a =>
            mySubmissions.some(s => {
                const subAssignmentId = s.assignment?._id || s.assignment?.id || s.assignment;
                const assignmentId = a._id || a.id;
                return String(subAssignmentId) === String(assignmentId);
            })
        ).length;

        return {
            completed,
            total,
            percent: Math.round((completed / total) * 100)
        };
    };

    return (
        <MainLayout>
            <div className={styles.classesPage}>
                <header className={styles.header}>
                    <div className={styles.title}>
                        <BookOutlined className={styles.icon} />
                        <h1>Lớp học của tôi</h1>
                    </div>

                    <div className={styles.filters}>
                        <Input
                            placeholder="Tìm tên môn học, mã môn..."
                            prefix={<SearchOutlined />}
                            className={styles.searchInput}
                            value={searchText}
                            onChange={(e) => {
                                setSearchText(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                        <Select
                            value={semesterFilter}
                            className={styles.statusSelect}
                            onChange={(value) => { setSemesterFilter(value); setCurrentPage(1); }}
                        >
                            <Option value="All">Tất cả học kỳ</Option>
                            {uniqueSemesters.map(sem => (
                                <Option key={sem} value={sem}>{sem}</Option>
                            ))}
                        </Select>
                    </div>
                </header>

                <div className={styles.classGrid}>
                    {isLoading ? (
                        <div className="w-full text-center py-20" style={{ gridColumn: '1 / -1' }}>
                            <Spin size="large" tip="Đang tải danh sách lớp học..." />
                        </div>
                    ) : paginated.length === 0 ? (
                        <div className="w-full text-center py-10" style={{ gridColumn: '1 / -1' }}>Không có lớp học nào phù hợp.</div>
                    ) : (
                        paginated.map((item, index) => {
                            const color = COLORS[index % COLORS.length];
                            const icon = ICONS[index % ICONS.length];
                            const progress = getCourseProgress(item._id || item.id);

                            return (
                                <div key={item._id || item.id} className={styles.classCard}>
                                    <div
                                        className={styles.cardHeader}
                                        style={{ backgroundColor: color }}
                                    >
                                        <div className={styles.subjectIcon}>
                                            {icon}
                                        </div>
                                        <div className={styles.subjectCode}>
                                            {item.courseCode}
                                        </div>
                                    </div>

                                    <div className={styles.cardBody}>
                                        <h3 className={styles.subjectTitle}>{item.courseName || '---'}</h3>

                                        <div className={styles.teacherInfo}>
                                            <div className={styles.avatar}>GV</div>
                                            <span className={styles.name}>{item.lecturerId?.fullName || '---'}</span>
                                        </div>

                                        <div className={styles.progressSection}>
                                            <div className={styles.progressHeader}>
                                                <span className={styles.progressLabel}>Tiến độ bài tập</span>
                                                <span className={styles.progressValue}>
                                                    {progress.completed}/{progress.total}
                                                </span>
                                            </div>
                                            <Progress
                                                percent={progress.percent}
                                                size="small"
                                                strokeColor={color}
                                                showInfo={false}
                                                trailColor={`${color}10`}
                                            />
                                        </div>

                                        <Button
                                            className={`${styles.actionBtn} ${styles.accessBtn}`}
                                            style={{
                                                backgroundColor: `${color}15`,
                                                color: color
                                            }}
                                            onClick={() => navigate(`/classes/${item._id || item.id}`)}
                                        >
                                            Truy cập lớp học
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <footer className={styles.footer}>
                    <div className={styles.paginationInfo}>
                        Hiển thị {Math.min((currentPage - 1) * pageSize + 1, filtered.length) || 0} đến {Math.min(currentPage * pageSize, filtered.length)} của {filtered.length} lớp học
                    </div>
                    <Pagination
                        current={currentPage}
                        total={filtered.length}
                        pageSize={pageSize}
                        showSizeChanger={false}
                        onChange={(page) => setCurrentPage(page)}
                    />
                </footer>
            </div>
        </MainLayout>
    );
};

export default MyClasses;
