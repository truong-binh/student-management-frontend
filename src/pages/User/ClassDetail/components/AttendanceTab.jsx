import React from 'react';
import { Table, Tag, Pagination, Spin } from 'antd';
import {
    CalendarOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    ScheduleOutlined,
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import clsx from 'clsx';
import styles from '../styles.module.scss';
import { useMyAttendance } from '@/hooks/useAttendance';
import dayjs from 'dayjs';

const AttendanceTab = () => {
    const { id: courseId } = useParams();
    const { summary, records, isLoading } = useMyAttendance(courseId);

    const attendanceColumns = [
        {
            title: 'BUỔI HỌC',
            dataIndex: 'weekNumber',
            key: 'weekNumber',
            render: (week) => `Tuần ${week}`
        },
        {
            title: 'NGÀY GHI NHẬN',
            dataIndex: 'recordedAt',
            key: 'recordedAt',
            render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm')
        },
        {
            title: 'TRẠNG THÁI',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const statusMap = {
                    'PRESENT': { text: 'Có mặt', class: styles.present },
                    'ABSENT': { text: 'Vắng', class: styles.absent },
                    'EXCUSED': { text: 'Nghỉ có phép', class: styles.late },
                    'LATE': { text: 'Đi muộn', class: styles.late },
                };
                const config = statusMap[status] || { text: status, class: '' };
                return (
                    <Tag className={clsx(styles.statusTag, config.class)}>
                        {config.text}
                    </Tag>
                );
            }
        },
    ];

    if (isLoading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <Spin tip="Đang tải dữ liệu điểm danh..." />
            </div>
        );
    }

    const attendanceRate = summary.total > 0
        ? Math.round(((summary.total - summary.absent) / summary.total) * 100)
        : 100;

    return (
        <div>
            <div className={styles.attendanceStats}>
                <div className={styles.statItem}>
                    <div className={styles.statIcon} style={{ background: '#f0fdf4', color: '#16a34a' }}><CalendarOutlined /></div>
                    <div className={styles.statMeta}>
                        <div className={styles.statLabel}>Tổng số buổi</div>
                        <div className={styles.statValue}>{summary.total}</div>
                    </div>
                </div>
                <div className={styles.statItem}>
                    <div className={styles.statIcon} style={{ background: '#fef2f2', color: '#dc2626' }}><ClockCircleOutlined /></div>
                    <div className={styles.statMeta}>
                        <div className={styles.statLabel}>Số buổi vắng</div>
                        <div className={styles.statValue}>{summary.absent}</div>
                    </div>
                </div>
                <div className={styles.statItem}>
                    <div className={styles.statIcon} style={{ background: '#eff6ff', color: '#2563eb' }}><CheckCircleOutlined /></div>
                    <div className={styles.statMeta}>
                        <div className={styles.statLabel}>Tỷ lệ chuyên cần</div>
                        <div className={styles.statValue}>{attendanceRate}%</div>
                    </div>
                </div>
            </div>

            <div className={styles.card}>
                <div className={styles.cardHeader} style={{ justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <ScheduleOutlined className={styles.icon} />
                        Chi tiết điểm danh
                    </div>
                </div>
                <Table
                    columns={attendanceColumns}
                    dataSource={records.map(r => ({ ...r, key: r._id }))}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: false,
                        size: 'middle',
                    }}
                    className={styles.attendanceTable}
                />
            </div>
        </div>
    );
};

export default AttendanceTab;
