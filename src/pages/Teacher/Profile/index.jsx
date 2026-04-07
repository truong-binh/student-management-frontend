import React, { useMemo, useState } from 'react';
import { Button, Input, Spin, Tag, message } from 'antd';
import {
    LockOutlined,
    CheckCircleFilled,
    AppstoreOutlined,
    ReadOutlined,
    CalendarOutlined,
    UserOutlined,
    MessageOutlined,
    TeamOutlined,
    BookOutlined,
    CheckCircleOutlined,
    BarChartOutlined,
    BellOutlined,
    FileTextOutlined,
    IdcardOutlined,
    MailOutlined,
    PhoneOutlined,
    BankOutlined,
    KeyOutlined,
    SyncOutlined,
    StarOutlined,
} from '@ant-design/icons';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import MainLayout from '@/layouts/User/MainLayout';
import styles from './styles.module.scss';
import avatarImg from '@/assets/images/user/avatar__teacher.png';
import { useAuth } from '@/hooks/useAuth';
import { useCourse } from '@/hooks/useCourse';
import { useQuery } from '@tanstack/react-query';
import { courseApi } from '@/api/admin/course';
import { assignmentApi } from '@/api/admin/assignment';
import { submissionApi } from '@/api/admin/submission';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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
    return res.data?.items || [];
};

const normalizeSubmissionList = (res) => {
    if (!res?.success) return [];
    if (Array.isArray(res.data)) return res.data;
    return res.data?.items || [];
};

const isSubmissionGraded = (submission) => {
    const status = String(submission?.status || '').toUpperCase();
    if (status === 'GRADED') return true;
    return submission?.score !== null && submission?.score !== undefined;
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

    return 0;
};

const TeacherProfile = () => {
    const { user, changePassword, isChangePasswordLoading } = useAuth();
    const { courses, isLoading: loadingCourses } = useCourse();
    const [passwordForm, setPasswordForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const courseIds = useMemo(
        () => (Array.isArray(courses) ? courses.map(getCourseId).filter(Boolean) : []),
        [courses]
    );

    const { data: totalStudents = 0, isLoading: loadingTotalStudents } = useQuery({
        queryKey: ['teacher-profile-total-students', courseIds],
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

    const { data: gradingStatsByCourse = [], isLoading: loadingGradingStats } = useQuery({
        queryKey: ['teacher-profile-grading-stats', courseIds],
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
                            totalSubmitted: 0,
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
                    const graded = submissions.filter(isSubmissionGraded).length;

                    return {
                        courseId,
                        label: course?.courseCode || course?.courseName || 'Lớp học',
                        graded,
                        totalSubmitted: submissions.length,
                    };
                })
            );

            return coursePayloads.filter(Boolean);
        },
    });

    const gradingTotals = useMemo(() => {
        return gradingStatsByCourse.reduce(
            (acc, item) => {
                acc.graded += Number(item?.graded || 0);
                acc.totalSubmitted += Number(item?.totalSubmitted || 0);
                return acc;
            },
            { graded: 0, totalSubmitted: 0 }
        );
    }, [gradingStatsByCourse]);

    const highlightedCourseLabel = useMemo(() => {
        if (!gradingStatsByCourse.length) return '';

        return [...gradingStatsByCourse].sort((a, b) => {
            const gradedDiff = Number(b?.graded || 0) - Number(a?.graded || 0);
            if (gradedDiff !== 0) return gradedDiff;
            return String(a?.label || '').localeCompare(String(b?.label || ''));
        })[0]?.label;
    }, [gradingStatsByCourse]);

    const isReportLoading = loadingCourses || loadingTotalStudents || loadingGradingStats;

    const totalStudentsValue = loadingCourses || loadingTotalStudents ? '--' : String(totalStudents);
    const totalClassesValue = loadingCourses ? '--' : String(courseIds.length);
    const gradedValue = isReportLoading ? '--' : String(gradingTotals.graded);
    const totalSubmittedValue = isReportLoading ? '--' : String(gradingTotals.totalSubmitted);

    const chartData = useMemo(() => ({
        labels: gradingStatsByCourse.map((item) => item.label),
        datasets: [
            {
                label: 'Bài đã chấm',
                data: gradingStatsByCourse.map((item) => item.graded),
                backgroundColor: (context) => {
                    const label = context?.chart?.data?.labels?.[context.dataIndex];
                    return label === highlightedCourseLabel ? '#b71c1c' : '#cbd5e0';
                },
                borderRadius: 6,
                barThickness: 32,
            },
        ],
    }), [gradingStatsByCourse, highlightedCourseLabel]);

    const chartOptions = useMemo(() => ({
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (context) => `Bài đã chấm: ${context.raw}`,
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { display: true, drawBorder: false, color: '#edf2f7' },
                ticks: { stepSize: 10, color: '#a0aec0', font: { size: 12 } },
            },
            x: {
                grid: { display: false },
                ticks: {
                    color: (context) => context.tick.label === highlightedCourseLabel ? '#b71c1c' : '#a0aec0',
                    font: {
                        size: 12,
                        weight: (context) => context.tick.label === highlightedCourseLabel ? 'bold' : 'normal',
                    },
                },
            },
        },
        maintainAspectRatio: false,
    }), [highlightedCourseLabel]);

    const handleUpdatePassword = () => {
        if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            message.error('Vui lòng điền đầy đủ các trường mật khẩu.');
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            message.error('Mật khẩu mới và xác nhận mật khẩu không khớp.');
            return;
        }
        changePassword(
            { oldPassword: passwordForm.oldPassword, newPassword: passwordForm.newPassword },
            {
                onSuccess: (res) => {
                    message.success(res.message || 'Cập nhật mật khẩu thành công!');
                    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
                },
                onError: (err) => {
                    message.error(err.message || 'Cập nhật mật khẩu thất bại. Mật khẩu cũ không chính xác.');
                },
            },
        );
    };

    return (
        <MainLayout menuItems={teacherMenuItems}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>Hồ sơ giảng viên</h1>
                </div>

                <div className={styles.profileGrid}>
                    {/* Left Column */}
                    <div className={styles.leftColumn}>
                        {/* Avatar Card */}
                        <div className={`${styles.card} ${styles.avatarCard}`}>
                            <div className={styles.avatarWrapper}>
                                <img src={avatarImg} alt="Teacher" className={styles.avatarImg} />
                                <div className={styles.verifiedBadge}>
                                    <CheckCircleFilled />
                                </div>
                            </div>
                            <h2>{user?.fullName || 'GV. Lê Thị Hoa'}</h2>
                            <Tag className={styles.statusTag}>Giảng viên chính thức</Tag>
                        </div>

                        {/* Personal Info Card */}
                        <div className={`${styles.card} ${styles.infoCard}`}>
                            <div className={styles.sectionTitle}>
                                <h3>Thông tin cá nhân</h3>
                                <LockOutlined className={styles.lockIcon} />
                            </div>

                            <div className={styles.infoItem}>
                                <label>Họ và tên</label>
                                <Input
                                    prefix={<UserOutlined style={{ color: '#a0aec0' }} />}
                                    value={user?.fullName || 'GV. Lê Thị Hoa'}
                                    disabled
                                />
                            </div>

                            <div className={styles.infoItem}>
                                <label>Mã giảng viên</label>
                                <Input
                                    prefix={<IdcardOutlined style={{ color: '#a0aec0' }} />}
                                    value={user?.userCode || 'GV20001'}
                                    disabled
                                />
                            </div>

                            <div className={styles.infoItem}>
                                <label>Email trường</label>
                                <Input
                                    prefix={<MailOutlined style={{ color: '#a0aec0' }} />}
                                    value={user?.email || 'lehoa@ptit.edu.vn'}
                                    disabled
                                />
                            </div>

                            <div className={styles.infoItem}>
                                <label>Số điện thoại</label>
                                <Input
                                    prefix={<PhoneOutlined style={{ color: '#a0aec0' }} />}
                                    value={user?.phone || '0912 345 678'}
                                    disabled
                                />
                            </div>

                            <div className={styles.infoItem}>
                                <label>Khoa / Bộ môn</label>
                                <Input
                                    prefix={<BankOutlined style={{ color: '#a0aec0' }} />}
                                    value={user?.department || 'Khoa Công nghệ thông tin'}
                                    disabled
                                />
                            </div>
                        </div>

                        {/* Change Password Card */}
                        <div className={`${styles.card} ${styles.passwordCard}`}>
                            <div className={styles.cardHeader}>
                                <KeyOutlined className={styles.icon} />
                                <h3>Đổi mật khẩu</h3>
                            </div>

                            <div className={styles.formContent}>
                                <div className={styles.infoItem}>
                                    <label>Mật khẩu hiện tại</label>
                                    <Input.Password
                                        placeholder="********"
                                        value={passwordForm.oldPassword}
                                        onChange={(e) =>
                                            setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
                                        }
                                    />
                                </div>
                                <div className={styles.infoItem}>
                                    <label>Mật khẩu mới</label>
                                    <Input.Password
                                        placeholder="Nhập mật khẩu mới"
                                        value={passwordForm.newPassword}
                                        onChange={(e) =>
                                            setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                                        }
                                    />
                                </div>
                                <div className={styles.infoItem}>
                                    <label>Xác nhận mật khẩu mới</label>
                                    <Input.Password
                                        placeholder="Nhập lại mật khẩu mới"
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) =>
                                            setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            <div className={styles.footer}>
                                <Button
                                    type="primary"
                                    className={styles.updateBtn}
                                    loading={isChangePasswordLoading}
                                    onClick={handleUpdatePassword}
                                    icon={<SyncOutlined />}
                                >
                                    Cập nhật
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className={styles.rightColumn}>
                        {/* Teaching Report Card */}
                        <div className={`${styles.card} ${styles.reportCard}`}>
                            <div className={styles.reportHeader}>
                                <div className={styles.iconBox}>
                                    <BarChartOutlined />
                                </div>
                                <div className={styles.titleWrap}>
                                    <h3>Báo cáo giảng dạy</h3>
                                    <p>Thống kê hoạt động trong năm học</p>
                                </div>
                                <div className={styles.batchTag}>Năm học 2025-2026</div>
                            </div>

                            <div className={styles.statsRow}>
                                <div className={styles.statItem}>
                                    <div className={`${styles.statIcon} ${styles.students}`}>
                                        <TeamOutlined />
                                    </div>
                                    <div className={styles.statInfo}>
                                        <span className={styles.label}>Tổng sinh viên</span>
                                        <div className={styles.value}>{totalStudentsValue}</div>
                                    </div>
                                </div>

                                <div className={styles.statItem}>
                                    <div className={`${styles.statIcon} ${styles.classes}`}>
                                        <BookOutlined />
                                    </div>
                                    <div className={styles.statInfo}>
                                        <span className={styles.label}>Lớp đang dạy</span>
                                        <div className={styles.value}>{totalClassesValue}</div>
                                    </div>
                                </div>

                                <div className={styles.statItem}>
                                    <div className={`${styles.statIcon} ${styles.graded}`}>
                                        <CheckCircleOutlined />
                                    </div>
                                    <div className={styles.statInfo}>
                                        <span className={styles.label}>Bài đã chấm</span>
                                        <div className={styles.value}>
                                            {gradedValue} <span>/ {totalSubmittedValue}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.chartSection}>
                                <div className={styles.chartTitle}>Số bài đã chấm theo lớp học phần</div>
                                <div className={styles.chartWrapper}>
                                    {isReportLoading && (
                                        <div className={styles.chartPlaceholder}>
                                            <Spin size="small" />
                                            <span>Đang tải dữ liệu thống kê...</span>
                                        </div>
                                    )}

                                    {!isReportLoading && gradingStatsByCourse.length === 0 && (
                                        <div className={styles.chartPlaceholder}>
                                            Chưa có dữ liệu chấm bài để thống kê.
                                        </div>
                                    )}

                                    {!isReportLoading && gradingStatsByCourse.length > 0 && (
                                        <Bar data={chartData} options={chartOptions} />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Teaching Achievement Card */}
                        <div className={`${styles.card} ${styles.achievementCard}`}>
                            <div className={styles.achievementHeader}>
                                <StarOutlined className={styles.starIcon} />
                                <h3>Thành tích & Hoạt động</h3>
                            </div>
                            <div className={styles.achievementList}>
                                <div className={styles.achievementItem}>
                                    <div className={`${styles.achieveBadge} ${styles.gold}`}>
                                        <StarOutlined />
                                    </div>
                                    <div className={styles.achieveContent}>
                                        <h4>Giảng viên tiêu biểu học kỳ 2</h4>
                                        <p>Được bình chọn bởi sinh viên và hội đồng khoa — Năm học 2025-2026</p>
                                        <span className={styles.time}>Tháng 5, 2026</span>
                                    </div>
                                </div>

                                <div className={styles.achievementItem}>
                                    <div className={`${styles.achieveBadge} ${styles.blue}`}>
                                        <FileTextOutlined />
                                    </div>
                                    <div className={styles.achieveContent}>
                                        <h4>Công bố bài báo khoa học Q1</h4>
                                        <p>Đăng tải trên tạp chí quốc tế chuyên ngành CNTT — IEEE Access</p>
                                        <span className={styles.time}>Tháng 3, 2026</span>
                                    </div>
                                </div>

                                <div className={styles.achievementItem}>
                                    <div className={`${styles.achieveBadge} ${styles.green}`}>
                                        <CheckCircleOutlined />
                                    </div>
                                    <div className={styles.achieveContent}>
                                        <h4>Hoàn thành chương trình bồi dưỡng nghiệp vụ</h4>
                                        <p>Chứng chỉ nghiệp vụ sư phạm nâng cao — Trường PTIT</p>
                                        <span className={styles.time}>Tháng 1, 2026</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notifications Card */}
                        <div className={`${styles.card} ${styles.noticeCard}`}>
                            <h3>Thông báo học vụ</h3>
                            <div className={styles.noticeList}>
                                <div className={styles.noticeItem}>
                                    <div className={`${styles.noticeIcon} ${styles.warning}`}>
                                        <BellOutlined />
                                    </div>
                                    <div className={styles.noticeContent}>
                                        <h4>Nộp điểm học kỳ 2 năm học 2025-2026</h4>
                                        <p>Hạn cuối nộp điểm cho tất cả các môn: ngày 20/05/2026. Vui lòng hoàn thành đúng hạn.</p>
                                        <span className={styles.time}>2 giờ trước</span>
                                    </div>
                                </div>

                                <div className={styles.noticeItem}>
                                    <div className={`${styles.noticeIcon} ${styles.info}`}>
                                        <FileTextOutlined />
                                    </div>
                                    <div className={styles.noticeContent}>
                                        <h4>Cập nhật đề cương môn học INT1306</h4>
                                        <p>Phòng Đào tạo yêu cầu cập nhật đề cương học phần theo mẫu mới trước ngày 30/04/2026.</p>
                                        <span className={styles.time}>1 ngày trước</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default TeacherProfile;
