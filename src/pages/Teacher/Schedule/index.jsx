import React, { useState } from 'react';
import { Calendar, Button, ConfigProvider, Tag } from 'antd';
import {
    CalendarOutlined,
    ClockCircleOutlined,
    BookOutlined,
    LeftOutlined,
    RightOutlined,
    AppstoreOutlined,
    ReadOutlined,
    UserOutlined,
    MessageOutlined,
    TeamOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import viVN from 'antd/lib/locale/vi_VN';
import MainLayout from '@/layouts/User/MainLayout';
import styles from './styles.module.scss';

dayjs.locale('vi');

const teacherMenuItems = [
    { key: 'dashboard', label: 'Tổng quan', icon: <AppstoreOutlined />, path: '/teacher/dashboard' },
    { key: 'classes', label: 'Lớp học', icon: <ReadOutlined />, path: '/teacher/classes' },
    { key: 'schedule', label: 'Thời khóa biểu', icon: <CalendarOutlined />, path: '/teacher/schedule' },
    { key: 'profile', label: 'Profile', icon: <UserOutlined />, path: '/teacher/profile' },
    { key: 'feedback', label: 'Phản hồi', icon: <MessageOutlined />, path: '/teacher/feedback' },
];

const deadlines = [
    {
        id: 1,
        date: '2026-03-10',
        title: 'Bài tập tuần 1 – Lập trình C++',
        classCode: 'INT1306',
        className: 'Lập trình C++',
        students: 42,
        submitted: 38,
        type: 'homework',
        typeLabel: 'Bài tập',
    },
    {
        id: 2,
        date: '2026-03-12',
        title: 'Bài tập lớn số 1 – CTDL & GT',
        classCode: 'INT1310',
        className: 'Cấu trúc dữ liệu',
        students: 35,
        submitted: 20,
        type: 'project',
        typeLabel: 'Đồ án',
    },
    {
        id: 3,
        date: '2026-03-14',
        title: 'Bài tập thực hành tuần 3 – CSDL',
        classCode: 'INT1302',
        className: 'Cơ sở dữ liệu',
        students: 38,
        submitted: 38,
        type: 'done',
        typeLabel: 'Hoàn tất',
    },
    {
        id: 4,
        date: '2026-03-18',
        title: 'Kiểm tra giữa kỳ – Lập trình C++',
        classCode: 'INT1306',
        className: 'Lập trình C++',
        students: 42,
        submitted: 0,
        type: 'exam',
        typeLabel: 'Kiểm tra',
    },
    {
        id: 5,
        date: '2026-03-20',
        title: 'Bài tập tuần 2 – CTDL & GT',
        classCode: 'INT1310',
        className: 'Cấu trúc dữ liệu',
        students: 35,
        submitted: 10,
        type: 'homework',
        typeLabel: 'Bài tập',
    },
    {
        id: 6,
        date: '2026-03-25',
        title: 'Bài tập lớn số 2 – CSDL',
        classCode: 'INT1302',
        className: 'Cơ sở dữ liệu',
        students: 38,
        submitted: 0,
        type: 'project',
        typeLabel: 'Đồ án',
    },
    {
        id: 7,
        date: '2026-03-28',
        title: 'Bài tập tuần 4 – Lập trình C++',
        classCode: 'INT1306',
        className: 'Lập trình C++',
        students: 42,
        submitted: 5,
        type: 'homework',
        typeLabel: 'Bài tập',
    },
];

const TeacherSchedule = () => {
    const [selectedDate, setSelectedDate] = useState(dayjs('2026-03-10'));

    const getDeadlinesForDate = (value) =>
        deadlines.filter(d => d.date === value.format('YYYY-MM-DD'));

    const dateCellRender = (value) => {
        const items = getDeadlinesForDate(value);
        return (
            <ul className={styles.eventsList}>
                {items.map((item) => (
                    <li key={item.id} className={`${styles.calendarEvent} ${styles[item.type]}`}>
                        {item.title}
                        <span className={styles.eventMeta}>{item.classCode}</span>
                    </li>
                ))}
            </ul>
        );
    };

    const headerRender = ({ value, onChange }) => (
        <div className={styles.customHeader}>
            <div className={styles.monthYear}>
                <h2>{value.format('MMMM, YYYY')}</h2>
                <span className={styles.monthSub}>Lịch hạn nộp bài tập</span>
            </div>
            <div className={styles.controls}>
                <Button icon={<LeftOutlined />} onClick={() => onChange(value.clone().subtract(1, 'month'))} />
                <Button onClick={() => onChange(dayjs())} className={styles.todayBtn}>
                    Hôm nay
                </Button>
                <Button icon={<RightOutlined />} onClick={() => onChange(value.clone().add(1, 'month'))} />
            </div>
        </div>
    );

    const selectedDeadlines = getDeadlinesForDate(selectedDate);

    const typeIcon = (type) => {
        if (type === 'done') return <CheckCircleOutlined />;
        if (type === 'exam') return <ExclamationCircleOutlined />;
        if (type === 'project') return <FileTextOutlined />;
        return <BookOutlined />;
    };

    return (
        <ConfigProvider locale={viVN}>
            <MainLayout menuItems={teacherMenuItems}>
                <div className={styles.container}>
                    <div className={styles.calendarCard}>
                        <Calendar
                            headerRender={headerRender}
                            dateCellRender={dateCellRender}
                            onSelect={(date) => setSelectedDate(date)}
                            value={selectedDate}
                            fullscreen={true}
                        />
                    </div>

                    <div className={styles.sidebar}>
                        <div className={styles.sidebarHeader}>
                            <CalendarOutlined className={styles.sidebarIcon} />
                            <div>
                                <div className={styles.sidebarTitle}>
                                    {selectedDate.format('DD/MM/YYYY')}
                                </div>
                                <div className={styles.sidebarSub}>
                                    {selectedDeadlines.length > 0
                                        ? `${selectedDeadlines.length} hạn nộp`
                                        : 'Không có hạn nộp'}
                                </div>
                            </div>
                        </div>

                        {selectedDeadlines.length > 0 ? (
                            selectedDeadlines.map(item => (
                                <div key={item.id} className={`${styles.detailCard} ${styles[item.type]}`}>
                                    <div className={styles.cardTop}>
                                        <Tag className={`${styles.typeTag} ${styles[`${item.type}Tag`]}`}>
                                            {typeIcon(item.type)} {item.typeLabel}
                                        </Tag>
                                        <span className={styles.classCodeBadge}>{item.classCode}</span>
                                    </div>
                                    <h3 className={styles.cardTitle}>{item.title}</h3>
                                    <div className={styles.cardMeta}>
                                        <div className={styles.metaRow}>
                                            <BookOutlined />
                                            <span>{item.className}</span>
                                        </div>
                                        <div className={styles.metaRow}>
                                            <ClockCircleOutlined />
                                            <span>Hạn nộp: {dayjs(item.date).format('DD/MM/YYYY')}</span>
                                        </div>
                                        <div className={styles.metaRow}>
                                            <TeamOutlined />
                                            <span>Đã nộp: <strong>{item.submitted}</strong>/{item.students} sinh viên</span>
                                        </div>
                                    </div>
                                    <div className={styles.progressBar}>
                                        <div
                                            className={`${styles.progressFill} ${item.type === 'done' ? styles.fillDone : ''}`}
                                            style={{ width: `${Math.round((item.submitted / item.students) * 100)}%` }}
                                        />
                                    </div>
                                    <div className={styles.progressLabel}>
                                        {Math.round((item.submitted / item.students) * 100)}% đã nộp
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className={styles.emptyState}>
                                <CalendarOutlined className={styles.emptyIcon} />
                                <p>Ngày này không có hạn nộp bài</p>
                            </div>
                        )}
                    </div>
                </div>
            </MainLayout>
        </ConfigProvider>
    );
};

export default TeacherSchedule;
