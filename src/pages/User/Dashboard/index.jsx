import React, { useState } from 'react';
import dayjs from 'dayjs';
import MainLayout from '@/layouts/User/MainLayout';
import { Card, Calendar, Badge, Button, Timeline, Tag } from 'antd';
import {
    FileOutlined,
    BookOutlined,
    StarOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    ArrowRightOutlined,
    CalendarOutlined,
    EnvironmentOutlined,
    LeftOutlined,
    RightOutlined
} from '@ant-design/icons';
import styles from './styles.module.scss';
import clsx from 'clsx';

const Dashboard = () => {
    const [calendarValue, setCalendarValue] = useState(dayjs());

    const stats = [
        { title: 'Lớp học phần', value: '08', icon: <BookOutlined />, color: '#b71c1c' },
        { title: 'Điểm TB tích lũy', value: '3.45', icon: <StarOutlined />, color: '#b71c1c' },
        { title: 'Bài tập chưa nộp', value: '03', icon: <ClockCircleOutlined />, color: '#b71c1c' },
        { title: 'Tín chỉ hoàn thành', value: '85', icon: <CheckCircleOutlined />, color: '#b71c1c' },
    ];

    const deadlines = [
        {
            title: 'Báo cáo bài tập lớn',
            subject: 'Nhập môn Công nghệ phần mềm',
            time: 'Còn 2 ngày',
            status: 'warning'
        },
        {
            title: 'Kiểm tra trắc nghiệm chương 3',
            subject: 'Hệ điều hành',
            time: '09:00 - 15/03/2026',
            status: 'info'
        },
        {
            title: 'Nộp slide thuyết trình',
            subject: 'Quản lý dự án phần mềm',
            time: '18/03/2026',
            status: 'success'
        },
    ];

    const grades = [
        { subject: 'Kiến trúc máy tính', detail: 'Bài kiểm tra giữa kỳ', score: '8.5', type: 'Chưa có' },
        { subject: 'Mạng máy tính', detail: 'Bài thực hành số 2', score: '9.0', type: 'Chưa có' },
        { subject: 'Cấu trúc dữ liệu', detail: 'Bài tập lớn', score: '7.5', type: 'Chưa có' },
    ];

    return (
        <MainLayout>
            <div className={styles.dashboard}>
                <div className={styles.mainGrid}>
                    <div className={styles.contentLeft}>
                        <div className={styles.statsRow}>
                            {stats.map((stat, index) => (
                                <Card key={index} className={styles.statCard}>
                                    <div className={styles.statHeader}>
                                        <p>{stat.title}</p>
                                    </div>
                                    <div className={styles.statBody}>
                                        <span className={styles.statValue}>{stat.value}</span>
                                        <span className={styles.statIcon} style={{ color: stat.color }}>{stat.icon}</span>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        <div className={styles.middleSection}>
                            <div className={styles.deadlinesCard}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.headerTitle}>
                                        <ClockCircleOutlined />
                                        <h3>Hạn nộp sắp tới</h3>
                                    </div>
                                    <Button type="link" className={styles.viewAll}>Xem tất cả</Button>
                                </div>
                                <div className={styles.deadlineList}>
                                    {deadlines.map((item, index) => (
                                        <div key={index} className={styles.deadlineItem}>
                                            <div className={styles.deadlineInfo}>
                                                <h4>{item.title}</h4>
                                                <p>{item.subject}</p>
                                                <span className={clsx(styles.timeTag, styles[item.status])}>
                                                    {item.status === 'warning' && <ClockCircleOutlined />}
                                                    {item.time}
                                                </span>
                                            </div>
                                            <Button shape="circle" icon={<ArrowRightOutlined />} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.gradesCard}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.headerTitle}>
                                        <StarOutlined />
                                        <h3>Điểm số gần đây</h3>
                                    </div>
                                </div>
                                <div className={styles.gradeList}>
                                    {grades.map((grade, index) => (
                                        <div key={index} className={styles.gradeItem}>
                                            <div className={styles.gradeInfo}>
                                                <h4>{grade.subject}</h4>
                                                <p>{grade.detail}</p>
                                            </div>
                                            <div className={styles.gradeScore}>
                                                <span className={styles.scoreText}>{grade.score}</span>
                                                <Button size="small" type="primary" danger className={styles.detailBtn}>Chi tiết</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button block className={styles.viewFullScale}>Xem toàn bộ bảng điểm</Button>
                            </div>
                        </div>

                        <div className={styles.activityCard}>
                            <div className={styles.cardHeader}>
                                <h3>Hoạt động gần đây</h3>
                            </div>
                            <Timeline className={styles.activityTimeline}>
                                <Timeline.Item dot={<div className={styles.activityDotRed} />}>
                                    <div className={styles.activityContent}>
                                        <p><strong>Giảng viên Nguyễn Thị B</strong> đã đăng một thông báo mới trong lớp <span className={styles.linkText}>Phát triển ứng dụng Web</span>.</p>
                                        <span className={styles.timeAgo}>10 phút trước</span>
                                        <div className={styles.activityComment}>
                                            "Các em nhớ nộp bài tập lớn đúng hạn vào ngày mai nhé..."
                                        </div>
                                    </div>
                                </Timeline.Item>
                                <Timeline.Item dot={<div className={styles.activityDotBlue} />}>
                                    <div className={styles.activityContent}>
                                        <p>Bạn đã nộp bài tập <strong>Thực hành SQL</strong> thành công.</p>
                                        <span className={styles.timeAgo}>2 giờ trước</span>
                                    </div>
                                </Timeline.Item>
                                <Timeline.Item dot={<div className={styles.activityDotGreen} />}>
                                    <div className={styles.activityContent}>
                                        <p>Đã có điểm môn <strong>Triết học Mác - Lênin</strong>.</p>
                                        <span className={styles.timeAgo}>Hôm qua</span>
                                    </div>
                                </Timeline.Item>
                            </Timeline>
                        </div>
                    </div>

                    <div className={styles.contentRight}>
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

                        {/* Upcoming Events Section */}
                        <div className={styles.upcomingEvents}>
                            <p className={styles.upcomingHeader}>SẮP DIỄN RA</p>
                            <div className={styles.eventItem}>
                                <div className={styles.eventTimeBox}>
                                    <p>Tiết</p>
                                    <p className={styles.timeRange}>1-3</p>
                                </div>
                                <div className={styles.eventDetails}>
                                    <h4>INT1340 - CNPM</h4>
                                    <p><EnvironmentOutlined /> Phòng: 402 - A2</p>
                                    <p><ClockCircleOutlined /> 07:00 - 09:50</p>
                                </div>
                            </div>
                            <div className={styles.eventItem}>
                                <div className={styles.eventTimeBox}>
                                    <p>Tiết</p>
                                    <p className={styles.timeRange}>4-6</p>
                                </div>
                                <div className={styles.eventDetails}>
                                    <h4>INT1452 - Mạng máy tính</h4>
                                    <p><EnvironmentOutlined /> Phòng: HT2</p>
                                    <p><ClockCircleOutlined /> 10:00 - 12:50</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Dashboard;
