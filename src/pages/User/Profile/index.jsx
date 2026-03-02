import React, { useState } from 'react';
import { Button, Input, Tag, message } from 'antd';
import {
    ArrowLeftOutlined,
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
import { useNavigate } from 'react-router-dom';
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

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const Profile = () => {
    const navigate = useNavigate();
    const { user, changePassword, isChangePasswordLoading } = useAuth();
    const [passwordForm, setPasswordForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const chartData = {
        labels: ['KQ1', 'KQ2', 'KQ3', 'KQ4', 'KQ5', 'KQ6'],
        datasets: [
            {
                label: 'GPA',
                data: [3.1, 3.4, 3.2, 3.5, 3.25, 3.3],
                backgroundColor: (context) => {
                    const index = context.dataIndex;
                    return index === 4 ? '#b71c1c' : '#cbd5e0';
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
                    label: (context) => `GPA: ${context.raw}`
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
                    color: (context) => context.tick.label === 'KQ5' ? '#b71c1c' : '#a0aec0',
                    font: {
                        size: 12,
                        weight: (context) => context.tick.label === 'KQ5' ? 'bold' : 'normal'
                    }
                }
            }
        },
        maintainAspectRatio: false
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
                                    value={user?.userCode || ""}
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
                                        <div className={styles.value}>3.25</div>
                                    </div>
                                </div>

                                <div className={styles.statItem}>
                                    <div className={`${styles.statIcon} ${styles.credit}`}>
                                        <BookOutlined />
                                    </div>
                                    <div className={styles.statInfo}>
                                        <span className={styles.label}>Tín chỉ tích lũy</span>
                                        <div className={styles.value}>85 <span>/ 150</span></div>
                                    </div>
                                </div>

                                <div className={styles.statItem}>
                                    <div className={`${styles.statIcon} ${styles.rank}`}>
                                        <BarChartOutlined />
                                    </div>
                                    <div className={styles.statInfo}>
                                        <span className={styles.label}>Xếp loại</span>
                                        <div className={styles.value}>Giỏi</div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.chartSection}>
                                <div className={styles.chartTitle}>Biểu đồ GPA theo kỳ học (Thang 4)</div>
                                <div className={styles.chartWrapper}>
                                    <Bar data={chartData} options={chartOptions} />
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
