import React, { useState } from 'react';
import dayjs from 'dayjs';
import MainLayout from '@/layouts/User/MainLayout';
import { Card, Calendar, Button, Timeline } from 'antd';
import {
    ClockCircleOutlined,
    CheckCircleOutlined,
    ArrowRightOutlined,
    EnvironmentOutlined,
    LeftOutlined,
    RightOutlined,
    TeamOutlined,
    BookOutlined,
    FileTextOutlined,

    FormOutlined,
    AppstoreOutlined,
    ReadOutlined,
    CalendarOutlined,
    UserOutlined,
    MessageOutlined,
} from '@ant-design/icons';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import styles from './styles.module.scss';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const teacherMenuItems = [
    { key: 'dashboard', label: 'Tổng quan', icon: <AppstoreOutlined />, path: '/teacher/dashboard' },
    { key: 'classes', label: 'Lớp học', icon: <ReadOutlined />, path: '/teacher/classes' },
    { key: 'schedule', label: 'Thời khóa biểu', icon: <CalendarOutlined />, path: '/teacher/schedule' },
    { key: 'profile', label: 'Profile', icon: <UserOutlined />, path: '/teacher/profile' },
    { key: 'feedback', label: 'Phản hồi', icon: <MessageOutlined />, path: '/teacher/feedback' },
];

const TeacherDashboard = () => {
    const [calendarValue, setCalendarValue] = useState(dayjs());

    const stats = [
        { title: 'Tổng số sinh viên', value: '184', icon: <TeamOutlined />, color: '#3182ce' },
        { title: 'Lớp học của bạn', value: '3', icon: <BookOutlined />, color: '#38a169' },
        { title: 'Bài chưa chấm', value: '24', icon: <ClockCircleOutlined />, color: '#d69e2e' },
        { title: 'Bài đã chấm', value: '160', icon: <CheckCircleOutlined />, color: '#3182ce' },
    ];

    const chartData = {
        labels: ['INT1306', 'INT1310', 'INT1402', 'INT1332', 'INT1416'],
        datasets: [
            {
                label: 'Đã chấm',
                data: [38, 22, 45, 30, 36],
                backgroundColor: '#e53e3e',
                borderRadius: 6,
                barPercentage: 0.55,
                categoryPercentage: 0.7,
            },
            {
                label: 'Chưa chấm',
                data: [10, 18, 5, 14, 8],
                backgroundColor: '#4299e1',
                borderRadius: 6,
                barPercentage: 0.55,
                categoryPercentage: 0.7,
            },
            {
                label: 'Có phản hồi',
                data: [20, 12, 30, 22, 28],
                backgroundColor: '#38b2ac',
                borderRadius: 6,
                barPercentage: 0.55,
                categoryPercentage: 0.7,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { mode: 'index', intersect: false },
        },
        scales: {
            x: {
                grid: { display: false },
                border: { display: false },
                ticks: { color: '#718096', font: { size: 12 } },
            },
            y: {
                grid: { color: 'rgba(0,0,0,0.05)' },
                border: { display: false },
                ticks: { color: '#718096', font: { size: 11 } },
            },
        },
    };

    const assignments = [
        {
            title: 'Báo cáo bài tập lớn',
            class: 'Nhập môn Công nghệ phần mềm',
            time: 'Còn 2 ngày',
            timeStatus: 'warning',
            submitted: 42,
            total: 45,
            icon: <FileTextOutlined />,
            iconBg: '#fff5f5',
            iconColor: '#e53e3e',
        },
        {
            title: 'Kiểm tra trắc nghiệm chương 3',
            class: 'INT1306',
            time: '09:00 - 15/03/2026',
            timeStatus: 'info',
            submitted: 30,
            total: 45,
            icon: <FormOutlined />,
            iconBg: '#ebf8ff',
            iconColor: '#3182ce',
        },
    ];

    const upcomingClasses = [
        {
            no: '01',
            status: 'SẮP DIỄN RA',
            statusType: 'upcoming',
            students: 45,
            code: 'INT1340 - 20252 - 01',
            time: '09:00 - 12:00',
            subject: 'Nhập môn Công nghệ phần mềm',
            room: 'HT2',
        },
        {
            no: '02',
            status: 'SẮP DIỄN RA',
            statusType: 'upcoming',
            students: 45,
            code: 'INT1340 - 20252 - 01',
            time: '09:00 - 12:00',
            subject: 'Nhập môn Công nghệ phần mềm',
            room: 'HT2',
        },
        {
            no: '03',
            status: 'ĐANG DIỄN RA',
            statusType: 'active',
            students: 45,
            code: 'INT1340 - 20252 - 01',
            time: '09:00 - 12:00',
            subject: 'Nhập môn Công nghệ phần mềm',
            room: 'HT2',
        },
    ];

    return (
        <MainLayout menuItems={teacherMenuItems}>
            <div className={styles.dashboard}>
                <div className={styles.mainGrid}>
                    {/* LEFT COLUMN */}
                    <div className={styles.contentLeft}>
                        {/* Stats */}
                        <div className={styles.statsRow}>
                            {stats.map((stat, i) => (
                                <Card key={i} className={styles.statCard}>
                                    <p className={styles.statTitle}>{stat.title}</p>
                                    <div className={styles.statBody}>
                                        <span className={styles.statValue}>{stat.value}</span>
                                        <span className={styles.statIcon} style={{ color: stat.color }}>{stat.icon}</span>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Bar Chart */}
                        <div className={styles.chartCard}>
                            <div className={styles.chartHeader}>
                                <h3>Thống kê chấm bài theo lớp</h3>
                                <div className={styles.chartLegend}>
                                    <span className={styles.legendItem}>
                                        <span className={styles.dot} style={{ background: '#e53e3e' }} /> Đã chấm
                                    </span>
                                    <span className={styles.legendItem}>
                                        <span className={styles.dot} style={{ background: '#4299e1' }} /> Chưa chấm
                                    </span>
                                    <span className={styles.legendItem}>
                                        <span className={styles.dot} style={{ background: '#38b2ac' }} /> Có phản hồi
                                    </span>
                                </div>
                            </div>
                            <div className={styles.chartWrap}>
                                <Bar data={chartData} options={chartOptions} />
                            </div>
                        </div>

                        {/* Assignments near deadline */}
                        <div className={styles.assignmentsCard}>
                            <div className={styles.cardHeader}>
                                <div className={styles.headerTitle}>
                                    <ClockCircleOutlined style={{ color: '#3182ce' }} />
                                    <h3>Bài tập sắp hết hạn</h3>
                                </div>
                                <Button type="link" className={styles.viewAll}>Xem tất cả</Button>
                            </div>
                            <div className={styles.assignmentList}>
                                {assignments.map((item, i) => (
                                    <div key={i} className={styles.assignmentItem}>
                                        <div
                                            className={styles.assignmentIcon}
                                            style={{ background: item.iconBg, color: item.iconColor }}
                                        >
                                            {item.icon}
                                        </div>
                                        <div className={styles.assignmentInfo}>
                                            <h4>{item.title}</h4>
                                            <p className={styles.classLabel}>Lớp: {item.class}</p>
                                            <span className={`${styles.timeTag} ${styles[item.timeStatus]}`}>
                                                {item.timeStatus === 'warning' && <ClockCircleOutlined style={{ marginRight: 4 }} />}
                                                {item.time}
                                            </span>
                                        </div>
                                        <div className={styles.progressSection}>
                                            <div className={styles.progressMeta}>
                                                <span className={styles.progressCount}>{item.submitted}/{item.total}</span>
                                                <span className={styles.progressTag}>ĐÃ NỘP</span>
                                            </div>
                                            <div className={styles.progressBar}>
                                                <div
                                                    className={styles.progressFill}
                                                    style={{ width: `${(item.submitted / item.total) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                        <ArrowRightOutlined className={styles.arrowIcon} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className={styles.contentRight}>
                        {/* Calendar */}
                        <Card className={styles.calendarCard}>
                            <Calendar
                                fullscreen={false}
                                className={styles.customCalendar}
                                value={calendarValue}
                                headerRender={({ value, onChange }) => {
                                    const month = value.month();
                                    const year = value.year();
                                    return (
                                        <div className={styles.calendarHeader}>
                                            <h3>{`Tháng ${month + 1}, ${year}`}</h3>
                                            <div className={styles.calendarNav}>
                                                <Button
                                                    size="small"
                                                    type="text"
                                                    icon={<LeftOutlined />}
                                                    onClick={() => {
                                                        const newValue = value.clone().subtract(1, 'month');
                                                        setCalendarValue(newValue);
                                                        onChange(newValue);
                                                    }}
                                                />
                                                <Button
                                                    size="small"
                                                    type="text"
                                                    icon={<RightOutlined />}
                                                    onClick={() => {
                                                        const newValue = value.clone().add(1, 'month');
                                                        setCalendarValue(newValue);
                                                        onChange(newValue);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                }}
                                fullCellRender={(date) => {
                                    const currentViewMonth = calendarValue.month();
                                    if (date.month() !== currentViewMonth) {
                                        return <div className={styles.emptyDay} />;
                                    }
                                    return (
                                        <div className="ant-picker-cell-inner ant-picker-calendar-date">
                                            <div className="ant-picker-calendar-date-value">
                                                {date.date()}
                                            </div>
                                        </div>
                                    );
                                }}
                            />
                        </Card>

                        {/* Upcoming Classes */}
                        <div className={styles.upcomingSection}>
                            <p className={styles.sectionHeader}>Lớp học phần sắp tới:</p>
                            {upcomingClasses.map((cls, i) => (
                                <div key={i} className={styles.classItem}>
                                    <div className={styles.classNo}>{cls.no}</div>
                                    <div className={styles.classContent}>
                                        <div className={styles.classTopRow}>
                                            <span className={`${styles.statusBadge} ${styles[cls.statusType]}`}>
                                                {cls.status}
                                            </span>
                                            <span className={styles.studentCount}>
                                                <TeamOutlined style={{ marginRight: 4 }} />{cls.students} sinh viên
                                            </span>
                                        </div>
                                        <h4 className={styles.classCode}>{cls.code}</h4>
                                        <p className={styles.classTime}>{cls.time}</p>
                                        <p className={styles.classSubject}>{cls.subject}</p>
                                        <p className={styles.classRoom}>
                                            <EnvironmentOutlined style={{ marginRight: 4 }} />{cls.room}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Recent Activity */}
                        <div className={styles.activitySection}>
                            <p className={styles.sectionHeader}>Hoạt động gần đây:</p>
                            <Timeline
                                items={[
                                    {
                                        dot: <div className={styles.activityDot} />,
                                        children: (
                                            <div className={styles.activityItem}>
                                                <p>Bạn đã đăng một thông báo trên diễn đàn</p>
                                                <span>T3, 1/3/2026 9:15</span>
                                            </div>
                                        ),
                                    },
                                    {
                                        dot: <div className={styles.activityDot} />,
                                        children: (
                                            <div className={styles.activityItem}>
                                                <p>Bạn đã đăng một thông báo trên diễn đàn</p>
                                                <span>T3, 1/3/2026 9:15</span>
                                            </div>
                                        ),
                                    },
                                ]}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default TeacherDashboard;
