import React, { useMemo, useState } from 'react';
import { Button, Input, Spin, Tag, message } from 'antd';
import {
    LockOutlined,
    CheckCircleFilled,
    BarChartOutlined,
    BookOutlined,
    TrophyOutlined,
    BellOutlined,
    FileTextOutlined,
    IdcardOutlined,
    MailOutlined,
    UserOutlined,
    KeyOutlined,
    SyncOutlined
} from '@ant-design/icons';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import MainLayout from '@/layouts/User/MainLayout';
import styles from './styles.module.scss';
import avatarImg from '@/assets/images/user/default-avatar-point.png';
import { useAuth } from '@/hooks/useAuth';
import { useCourse } from '@/hooks/useCourse';
import { useMySubmissions } from '@/hooks/useSubmission';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/api/user/user';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const getCourseId = (course) => course?._id || course?.id;

const getSubmissionAssignmentId = (submission) => {
    return submission?.assignment?._id || submission?.assignment?.id || submission?.assignment;
};

const normalizeScoreTo4 = (score, maxScore) => {
    const scoreNumber = Number(score);
    const maxScoreNumber = Number(maxScore || 10);

    if (!Number.isFinite(scoreNumber) || !Number.isFinite(maxScoreNumber) || maxScoreNumber <= 0) {
        return 0;
    }

    const normalized = (scoreNumber / maxScoreNumber) * 4;
    return Math.max(0, Math.min(4, normalized));
};

const getSemesterSortValue = (semester) => {
    const values = String(semester || '').match(/\d+/g)?.map(Number) || [];
    if (values.length >= 2) {
        const term = values[0];
        const year = values[values.length - 1];
        return year * 10 + term;
    }
    if (values.length === 1) {
        return values[0];
    }
    return 0;
};

const getSemesterDisplayLabel = (semester, index) => {
    const values = String(semester || '').match(/\d+/g)?.map(Number) || [];
    if (values.length >= 2) {
        return `HK${values[0]}-${values[values.length - 1]}`;
    }
    return `Kỳ ${index + 1}`;
};

const getGpaRank = (gpa) => {
    if (!Number.isFinite(gpa)) return 'Chưa xếp loại';
    if (gpa >= 3.6 && gpa <= 4.0) return 'Xuất sắc';
    if (gpa >= 3.2) return 'Giỏi';
    if (gpa >= 2.5) return 'Khá';
    if (gpa >= 2.0) return 'Trung bình';
    if (gpa >= 1.0) return 'Yếu';
    return 'Kém';
};

const Profile = () => {
    const { user: authUser, changePassword, isChangePasswordLoading } = useAuth();

    // Fetch full user profile from the new API
    const { data: userDetail, isLoading: loadingUser } = useQuery({
        queryKey: ['user-detail', authUser?._id || authUser?.id],
        queryFn: async () => {
            const res = await userApi.getUserById(authUser?._id || authUser?.id);
            if (!res.success) throw res;
            return res.data;
        },
        enabled: !!(authUser?._id || authUser?.id),
    });

    // Use detailed data if available, fallback to auth store user
    const user = userDetail || authUser;

    const { courses, isLoading: loadingCourses } = useCourse();
    const { mySubmissions, isLoading: loadingSubmissions } = useMySubmissions();
    const [passwordForm, setPasswordForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
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

    const gradedSubmissions = useMemo(() => {
        return (Array.isArray(mySubmissions) ? mySubmissions : []).filter((submission) => {
            return submission?.status === 'GRADED' || Number.isFinite(Number(submission?.score));
        });
    }, [mySubmissions]);

    const gradedCourseStats = useMemo(() => {
        const map = new Map();

        gradedSubmissions.forEach((submission) => {
            const assignment = submission?.assignment || {};
            const assignmentId = getSubmissionAssignmentId(submission);
            if (!assignmentId) return;

            const rawCourse = assignment?.courseId;
            const courseId = rawCourse?._id || rawCourse?.id || rawCourse;
            if (!courseId) return;

            const courseFromAssignment = typeof rawCourse === 'object' ? rawCourse : null;
            const fallbackCourse = coursesById[String(courseId)] || null;
            const course = courseFromAssignment || fallbackCourse;

            const normalizedScore = normalizeScoreTo4(submission?.score, assignment?.maxScore);

            if (!map.has(String(courseId))) {
                map.set(String(courseId), {
                    courseId: String(courseId),
                    courseName: course?.courseName || assignment?.title || 'Môn học',
                    semester: course?.semester || 'Chưa phân học kỳ',
                    credits: Number(course?.credits || 0),
                    scoreTotal: 0,
                    scoreCount: 0,
                });
            }

            const entry = map.get(String(courseId));
            entry.scoreTotal += normalizedScore;
            entry.scoreCount += 1;

            if (!entry.credits && Number(course?.credits || 0) > 0) {
                entry.credits = Number(course.credits);
            }
        });

        return Array.from(map.values()).map((item) => ({
            ...item,
            gpa4: item.scoreCount > 0 ? item.scoreTotal / item.scoreCount : 0,
        }));
    }, [gradedSubmissions, coursesById]);

    const semesterGpaStats = useMemo(() => {
        const semesterMap = new Map();

        gradedCourseStats.forEach((course) => {
            const semester = course.semester || 'Chưa phân học kỳ';
            const weight = Number(course.credits || 0) > 0 ? Number(course.credits) : 1;

            if (!semesterMap.has(semester)) {
                semesterMap.set(semester, {
                    semester,
                    weightedTotal: 0,
                    weightTotal: 0,
                });
            }

            const current = semesterMap.get(semester);
            current.weightedTotal += course.gpa4 * weight;
            current.weightTotal += weight;
        });

        return Array.from(semesterMap.values())
            .map((item) => ({
                semester: item.semester,
                gpa4: item.weightTotal > 0 ? item.weightedTotal / item.weightTotal : 0,
            }))
            .sort((a, b) => {
                const diff = getSemesterSortValue(a.semester) - getSemesterSortValue(b.semester);
                if (diff !== 0) return diff;
                return String(a.semester).localeCompare(String(b.semester));
            })
            .map((item, index) => ({
                ...item,
                label: getSemesterDisplayLabel(item.semester, index),
            }));
    }, [gradedCourseStats]);

    const cumulativeGpa = useMemo(() => {
        if (!gradedCourseStats.length) return 0;

        const totals = gradedCourseStats.reduce(
            (acc, course) => {
                const weight = Number(course.credits || 0) > 0 ? Number(course.credits) : 1;
                acc.weightedTotal += course.gpa4 * weight;
                acc.weightTotal += weight;
                return acc;
            },
            { weightedTotal: 0, weightTotal: 0 }
        );

        return totals.weightTotal > 0 ? totals.weightedTotal / totals.weightTotal : 0;
    }, [gradedCourseStats]);

    const accumulatedCredits = useMemo(() => {
        return gradedCourseStats.reduce((sum, course) => sum + Number(course.credits || 0), 0);
    }, [gradedCourseStats]);

    const totalCredits = useMemo(() => {
        return (Array.isArray(courses) ? courses : []).reduce((sum, course) => sum + Number(course.credits || 0), 0);
    }, [courses]);

    const latestSemesterLabel = semesterGpaStats.length
        ? semesterGpaStats[semesterGpaStats.length - 1].label
        : '';

    const currentGpaText = cumulativeGpa.toFixed(2);
    const rankText = gradedCourseStats.length > 0 ? getGpaRank(cumulativeGpa) : 'Chưa xếp loại';
    const isReportLoading = loadingCourses || loadingSubmissions;

    const chartData = useMemo(() => ({
        labels: semesterGpaStats.map((item) => item.label),
        datasets: [
            {
                label: 'GPA',
                data: semesterGpaStats.map((item) => Number(item.gpa4.toFixed(2))),
                backgroundColor: (context) => {
                    const label = context?.chart?.data?.labels?.[context.dataIndex];
                    return label === latestSemesterLabel ? '#b71c1c' : '#cbd5e0';
                },
                borderRadius: 6,
                barThickness: 32,
            },
        ],
    }), [semesterGpaStats, latestSemesterLabel]);

    const chartOptions = useMemo(() => ({
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (context) => `GPA: ${Number(context.raw || 0).toFixed(2)}`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 4,
                grid: {
                    display: true,
                    drawBorder: false,
                    color: '#edf2f7',
                },
                ticks: {
                    stepSize: 1,
                    color: '#a0aec0',
                    font: { size: 12 }
                }
            },
            x: {
                grid: { display: false },
                ticks: {
                    color: (context) => context.tick.label === latestSemesterLabel ? '#b71c1c' : '#a0aec0',
                    font: {
                        size: 12,
                        weight: (context) => context.tick.label === latestSemesterLabel ? 'bold' : 'normal'
                    }
                }
            }
        },
        maintainAspectRatio: false
    }), [latestSemesterLabel]);

    const handleUpdatePassword = () => {
        if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            message.error('Vui lòng điền đầy đủ các trường mật khẩu.');
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            message.error('Mật khẩu mới và xác nhận mật khẩu không khớp.');
            return;
        }

        changePassword({
            oldPassword: passwordForm.oldPassword,
            newPassword: passwordForm.newPassword
        }, {
            onSuccess: (res) => {
                message.success(res.message || 'Cập nhật mật khẩu thành công!');
                setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
            },
            onError: (err) => {
                message.error(err.message || 'Cập nhật mật khẩu thất bại. Mật khẩu cũ không chính xác.');
            }
        });
    };

    return (
        <MainLayout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>Hồ sơ sinh viên</h1>
                </div>

                <div className={styles.profileGrid}>
                    <div className={styles.leftColumn}>
                        <div className={`${styles.card} ${styles.avatarCard}`}>
                            <div className={styles.avatarWrapper}>
                                <img src={avatarImg} alt="Student" className={styles.avatarImg} />
                                <div className={styles.verifiedBadge}>
                                    <CheckCircleFilled />
                                </div>
                            </div>
                            <h2>{user?.fullName || "Nguyễn Văn A"}</h2>
                            <Tag className={styles.statusTag}>Sinh viên chính quy</Tag>
                        </div>

                        <div className={`${styles.card} ${styles.infoCard}`}>
                            <div className={styles.sectionTitle}>
                                <h3>Thông tin cá nhân</h3>
                                <LockOutlined className={styles.lockIcon} />
                            </div>

                            <div className={styles.infoItem}>
                                <label>Họ và tên</label>
                                <Input
                                    prefix={<UserOutlined style={{ color: '#a0aec0' }} />}
                                    value={user?.fullName || ""}
                                    disabled
                                />
                            </div>

                            <div className={styles.infoItem}>
                                <label>Mã sinh viên</label>
                                <Input
                                    prefix={<IdcardOutlined style={{ color: '#a0aec0' }} />}
                                    value={user?.userCode || user?.student?.userCode || user?.username || ""}
                                    disabled
                                />
                            </div>

                            <div className={styles.infoItem}>
                                <label>Email trường</label>
                                <Input
                                    prefix={<MailOutlined style={{ color: '#a0aec0' }} />}
                                    value={user?.email || ""}
                                    disabled
                                />
                            </div>
                        </div>

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
                                        onChange={e => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                                    />
                                </div>
                                <div className={styles.infoItem}>
                                    <label>Mật khẩu mới</label>
                                    <Input.Password
                                        placeholder="Nhập mật khẩu mới"
                                        value={passwordForm.newPassword}
                                        onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    />
                                </div>
                                <div className={styles.infoItem}>
                                    <label>Xác nhận mật khẩu mới</label>
                                    <Input.Password
                                        placeholder="Nhập lại mật khẩu mới"
                                        value={passwordForm.confirmPassword}
                                        onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
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
                        {/* Summary Report Card */}
                        <div className={`${styles.card} ${styles.reportCard}`}>
                            <div className={styles.reportHeader}>
                                <div className={styles.iconBox}>
                                    <BarChartOutlined />
                                </div>
                                <div className={styles.titleWrap}>
                                    <h3>Báo cáo tổng hợp</h3>
                                    <p>Tiến độ học tập qua các kỳ</p>
                                </div>
                                <div className={styles.batchTag}>Niên khóa 2021-2026</div>
                            </div>

                            <div className={styles.statsRow}>
                                <div className={styles.statItem}>
                                    <div className={`${styles.statIcon} ${styles.gpa}`}>
                                        <TrophyOutlined />
                                    </div>
                                    <div className={styles.statInfo}>
                                        <span className={styles.label}>GPA Hiện tại</span>
                                        <div className={styles.value}>{isReportLoading ? '--' : currentGpaText}</div>
                                    </div>
                                </div>

                                <div className={styles.statItem}>
                                    <div className={`${styles.statIcon} ${styles.credit}`}>
                                        <BookOutlined />
                                    </div>
                                    <div className={styles.statInfo}>
                                        <span className={styles.label}>Tín chỉ tích lũy</span>
                                        <div className={styles.value}>
                                            {isReportLoading ? '--' : accumulatedCredits} <span>/ {isReportLoading ? '--' : totalCredits}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.statItem}>
                                    <div className={`${styles.statIcon} ${styles.rank}`}>
                                        <BarChartOutlined />
                                    </div>
                                    <div className={styles.statInfo}>
                                        <span className={styles.label}>Xếp loại</span>
                                        <div className={styles.value}>{isReportLoading ? '--' : rankText}</div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.chartSection}>
                                <div className={styles.chartTitle}>Biểu đồ GPA theo kỳ học (Thang 4)</div>
                                <div className={styles.chartWrapper}>
                                    {isReportLoading && (
                                        <div className={styles.chartPlaceholder}>
                                            <Spin size="small" />
                                            <span>Đang tải dữ liệu học tập...</span>
                                        </div>
                                    )}

                                    {!isReportLoading && semesterGpaStats.length === 0 && (
                                        <div className={styles.chartPlaceholder}>
                                            Chưa có dữ liệu GPA theo kỳ học.
                                        </div>
                                    )}

                                    {!isReportLoading && semesterGpaStats.length > 0 && (
                                        <Bar data={chartData} options={chartOptions} />
                                    )}
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
                                        <h4>Đăng ký tín chỉ học kỳ 1 năm học 2026-2027</h4>
                                        <p>Hệ thống sẽ mở đăng ký từ ngày 15/10/2026. Sinh viên chú ý theo dõi lịch chi tiết.</p>
                                        <span className={styles.time}>2 giờ trước</span>
                                    </div>
                                </div>

                                <div className={styles.noticeItem}>
                                    <div className={`${styles.noticeIcon} ${styles.info}`}>
                                        <FileTextOutlined />
                                    </div>
                                    <div className={styles.noticeContent}>
                                        <h4>Công bố điểm rèn luyện học kỳ 2 năm 2025-2026</h4>
                                        <p>Đã có kết quả điểm rèn luyện chính thức. Sinh viên vui lòng kiểm tra và phản hồi nếu có sai sót.</p>
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

export default Profile;
