import React, { useState } from 'react';
import { Button, Input, Tag, message } from 'antd';
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const teacherMenuItems = [
    { key: 'dashboard', label: 'Tổng quan', icon: <AppstoreOutlined />, path: '/teacher/dashboard' },
    { key: 'classes', label: 'Lớp học', icon: <ReadOutlined />, path: '/teacher/classes' },
    { key: 'schedule', label: 'Thời khóa biểu', icon: <CalendarOutlined />, path: '/teacher/schedule' },
    { key: 'profile', label: 'Profile', icon: <UserOutlined />, path: '/teacher/profile' },
    { key: 'feedback', label: 'Phản hồi', icon: <MessageOutlined />, path: '/teacher/feedback' },
];

const TeacherProfile = () => {
    const { user, changePassword, isChangePasswordLoading } = useAuth();
    const [passwordForm, setPasswordForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const chartData = {
        labels: ['INT1306', 'INT1310', 'INT1402', 'INT1332', 'INT1416'],
        datasets: [
            {
                label: 'Bài đã chấm',
                data: [42, 38, 45, 30, 35],
                backgroundColor: (context) => {
                    const index = context.dataIndex;
                    return index === 2 ? '#b71c1c' : '#cbd5e0';
                },
                borderRadius: 6,
                barThickness: 32,
            },
        ],
    };

    const chartOptions = {
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
                    color: (context) => context.tick.label === 'INT1402' ? '#b71c1c' : '#a0aec0',
                    font: {
                        size: 12,
                        weight: (context) => context.tick.label === 'INT1402' ? 'bold' : 'normal',
                    },
                },
            },
        },
        maintainAspectRatio: false,
    };

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
                                        <div className={styles.value}>184</div>
                                    </div>
                                </div>

                                <div className={styles.statItem}>
                                    <div className={`${styles.statIcon} ${styles.classes}`}>
                                        <BookOutlined />
                                    </div>
                                    <div className={styles.statInfo}>
                                        <span className={styles.label}>Lớp đang dạy</span>
                                        <div className={styles.value}>5</div>
                                    </div>
                                </div>

                                <div className={styles.statItem}>
                                    <div className={`${styles.statIcon} ${styles.graded}`}>
                                        <CheckCircleOutlined />
                                    </div>
                                    <div className={styles.statInfo}>
                                        <span className={styles.label}>Bài đã chấm</span>
                                        <div className={styles.value}>
                                            190 <span>/ 214</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.chartSection}>
                                <div className={styles.chartTitle}>Số bài đã chấm theo lớp học phần</div>
                                <div className={styles.chartWrapper}>
                                    <Bar data={chartData} options={chartOptions} />
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
