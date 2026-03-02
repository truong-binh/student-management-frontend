import React from 'react';
import { Table, Tag, Button, Pagination } from 'antd';
import {
    CalendarOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    ScheduleOutlined,
    FilterOutlined,
    ExportOutlined
} from '@ant-design/icons';
import clsx from 'clsx';
import styles from '../styles.module.scss';

const AttendanceTab = () => {
    const attendanceColumns = [
        { title: 'BUỔI HỌC', dataIndex: 'session', key: 'session' },
        { title: 'NGÀY', dataIndex: 'date', key: 'date' },
        { title: 'GIẢNG VIÊN', dataIndex: 'teacher', key: 'teacher' },
        {
            title: 'TRẠNG THÁI',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const statusMap = {
                    present: { text: 'Có mặt', class: styles.present },
                    absent: { text: 'Vắng', class: styles.absent },
                    late: { text: 'Muộn', class: styles.late },
                    pending: { text: 'Chưa diễn ra', class: styles.pending }
                };
                const config = statusMap[status] || statusMap.present;
                return (
                    <Tag className={clsx(styles.statusTag, config.class)}>
                        {config.text}
                    </Tag>
                );
            }
        },
        { title: 'GHI CHÚ', dataIndex: 'note', key: 'note' },
    ];

    const attendanceData = [
        { key: 1, session: 'Buổi 1', date: '12/01/2026', teacher: 'Lê Thị Hoa', status: 'present', note: '-' },
        { key: 2, session: 'Buổi 2', date: '19/01/2026', teacher: 'Lê Thị Hoa', status: 'late', note: 'Vào muộn 15p' },
        { key: 3, session: 'Buổi 3', date: '26/01/2026', teacher: 'Lê Thị Hoa', status: 'present', note: '-' },
        { key: 4, session: 'Buổi 4', date: '02/02/2026', teacher: 'Lê Thị Hoa', status: 'absent', note: 'Không phép' },
        { key: 5, session: 'Buổi 5', date: '09/02/2026', teacher: 'Lê Thị Hoa', status: 'present', note: '-' },
        { key: 6, session: 'Buổi 6', date: '16/02/2026', teacher: 'Lê Thị Hoa', status: 'present', note: '-' },
        { key: 7, session: 'Buổi 7', date: '23/02/2026', teacher: 'Lê Thị Hoa', status: 'present', note: '-' },
        { key: 8, session: 'Buổi 8', date: '02/03/2026', teacher: 'Lê Thị Hoa', status: 'pending', note: '-' },
    ];

    return (
        <div>
            <div className={styles.attendanceStats}>
                <div className={styles.statItem}>
                    <div className={styles.statIcon} style={{ background: '#fef2f2', color: '#b71c1c' }}><CalendarOutlined /></div>
                    <div className={styles.statMeta}>
                        <div className={styles.statLabel}>Tổng số buổi</div>
                        <div className={styles.statValue}>15</div>
                    </div>
                </div>
                <div className={styles.statItem}>
                    <div className={styles.statIcon} style={{ background: '#fef2f2', color: '#b71c1c' }}><ClockCircleOutlined /></div>
                    <div className={styles.statMeta}>
                        <div className={styles.statLabel}>Số buổi vắng</div>
                        <div className={styles.statValue}>1</div>
                    </div>
                </div>
                <div className={styles.statItem}>
                    <div className={styles.statIcon} style={{ background: '#fef2f2', color: '#b71c1c' }}><CheckCircleOutlined /></div>
                    <div className={styles.statMeta}>
                        <div className={styles.statLabel}>Tỷ lệ chuyên cần</div>
                        <div className={styles.statValue}>93%</div>
                    </div>
                </div>
            </div>

            <div className={styles.card}>
                <div className={styles.cardHeader} style={{ justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <ScheduleOutlined className={styles.icon} />
                        Chi tiết điểm danh
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <Button icon={<FilterOutlined />}>Lọc</Button>
                        <Button type="primary" danger icon={<ExportOutlined />}>Xuất báo cáo</Button>
                    </div>
                </div>
                <Table
                    columns={attendanceColumns}
                    dataSource={attendanceData}
                    pagination={false}
                    className={styles.attendanceTable}
                />
                <footer className={styles.footer}>
                    <div className={styles.paginationInfo}>
                        Hiển thị 1 đến 8 của 15 buổi học
                    </div>
                    <Pagination defaultCurrent={1} total={15} pageSize={8} size="middle" />
                </footer>
            </div>
        </div>
    );
};

export default AttendanceTab;
