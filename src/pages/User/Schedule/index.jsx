import React, { useState } from 'react';
import { Calendar, Button, Select, ConfigProvider } from 'antd';
import {
    CalendarOutlined,
    ClockCircleOutlined,
    EnvironmentOutlined,
    FileTextOutlined,
    LeftOutlined,
    RightOutlined,
    BellOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import MainLayout from '@/layouts/User/MainLayout';
import styles from './styles.module.scss';
import viVN from 'antd/lib/locale/vi_VN';

dayjs.locale('vi');

const mockEvents = [
    {
        id: 1,
        date: '2035-03-01',
        title: 'Science Project Submission Deadline',
        time: '10:00 AM',
        type: 'academic',
        category: 'Academic',
        room: 'Online Portal',
        notes: 'Submit your final report and presentation slides.'
    },
    {
        id: 2,
        date: '2035-03-01',
        title: 'Monthly Expense Review',
        time: '03:00 PM - 04:00 PM',
        type: 'important',
        category: 'Finance',
        room: 'Meeting Room A',
        notes: 'Bring all original receipts for the scholarship fund.'
    },
    {
        id: 3,
        date: '2035-03-06',
        title: 'Sports Competition (Preliminary Round)',
        time: '08:30 AM - 12:00 PM',
        type: 'event',
        category: 'Events',
        room: 'School Sports Complex',
        notes: 'Bring appropriate sportswear and water bottle.'
    },
    {
        id: 4,
        date: '2035-03-07',
        title: 'Midterm Exam - Mathematics',
        time: '09:00 AM - 11:00 AM',
        type: 'academic',
        category: 'Academic',
        room: 'Classroom 302',
        notes: 'Calculators are allowed; pens and pencils only.'
    },
    {
        id: 5,
        date: '2035-03-07',
        title: 'Staff Meeting',
        time: '02:00 PM - 03:30 PM',
        type: 'deadline',
        category: 'Internal',
        room: 'Faculty Lounge'
    },
    {
        id: 6,
        date: '2035-03-12',
        title: 'English Literature Exam',
        time: '09:00 AM - 11:00 AM',
        type: 'academic',
        category: 'Academic',
        room: 'Room 204',
        notes: 'Bring your own stationery; no electronic devices allowed.'
    },
    {
        id: 7,
        date: '2035-03-12',
        title: 'Parent-Teacher Meeting (Grade 7 & 8)',
        time: '02:00 PM - 04:00 PM',
        type: 'event',
        category: 'Events',
        room: 'School Auditorium',
        notes: 'Parents are requested to arrive 15 minutes early for registration.'
    },
    {
        id: 8,
        date: '2035-03-14',
        title: 'History Exam',
        time: '09:00 AM - 11:00 AM',
        type: 'academic',
        category: 'Academic',
        room: 'Examination Hall'
    },
    {
        id: 9,
        date: '2035-03-15',
        title: 'School Choir Rehearsal',
        time: '10:00 AM - 12:00 PM',
        type: 'event',
        category: 'Club',
        room: 'Music Room'
    },
    {
        id: 10,
        date: '2035-03-23',
        title: 'Grade 9 Fee Payment Deadline',
        time: 'All Day',
        type: 'important',
        category: 'Finance',
        room: 'Bursar Office'
    }
];

const Schedule = () => {
    const [selectedDate, setSelectedDate] = useState(dayjs('2035-03-12'));

    const getListData = (value) => {
        const dateString = value.format('YYYY-MM-DD');
        return mockEvents.filter(event => event.date === dateString);
    };

    const dateCellRender = (value) => {
        const listData = getListData(value);
        return (
            <ul className={styles.eventsList}>
                {listData.map((item) => (
                    <li key={item.id} className={`${styles.calendarEvent} ${styles[item.type]}`}>
                        {item.title}
                        <span className={styles.eventTime}>
                            <ClockCircleOutlined style={{ fontSize: '8px', marginRight: '4px' }} />
                            {item.time}
                        </span>
                    </li>
                ))}
            </ul>
        );
    };

    const selectedEvents = mockEvents.filter(e => e.date === selectedDate.format('YYYY-MM-DD'));

    const headerRender = ({ value, type, onChange, onTypeChange }) => {
        return (
            <div className={styles.customHeader}>
                <div className={styles.monthYear}>
                    <h2>{value.format('MMMM, YYYY')}</h2>
                </div>
                <div className={styles.controls}>
                    <Button
                        icon={<LeftOutlined />}
                        onClick={() => onChange(value.clone().subtract(1, 'month'))}
                    />
                    <Button
                        onClick={() => onChange(dayjs())}
                        style={{ background: '#f8fafc' }}
                    >
                        Hôm nay
                    </Button>
                    <Button
                        icon={<RightOutlined />}
                        onClick={() => onChange(value.clone().add(1, 'month'))}
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
                        <Calendar
                            headerRender={headerRender}
                            dateCellRender={dateCellRender}
                            onSelect={(date) => setSelectedDate(date)}
                            value={selectedDate}
                            fullscreen={true}
                        />
                    </div>

                    <div className={styles.sidebar}>
                        <div style={{ paddingBottom: '12px', borderBottom: '1px dashed #edf2f7', marginBottom: '20px' }}>
                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#2d3748', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <BellOutlined style={{ color: '#b71c1c' }} />
                                Chi tiết hôm nay ({selectedDate.format('DD/MM')})
                            </h4>
                        </div>
                        {selectedEvents.length > 0 ? (
                            selectedEvents.map(event => (
                                <div key={event.id} className={`${styles.detailCard} ${styles[event.type]}`}>
                                    <div className={`${styles.tag} ${styles[`${event.type}Tag`]}`}>
                                        {event.category}
                                    </div>
                                    <h3>{event.title}</h3>
                                    <div className={styles.infoList}>
                                        <div className={styles.infoItem}>
                                            <CalendarOutlined className={styles.icon} />
                                            {dayjs(event.date).format('MMMM DD, YYYY')}
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
                                <p style={{ fontWeight: 600 }}>Của ngày này hiện đang trống</p>
                            </div>
                        )}
                    </div>
                </div>
            </MainLayout>
        </ConfigProvider>
    );
};

export default Schedule;
