import React, { useState } from 'react';
import { Select, DatePicker, Button, Radio, Pagination, Table } from 'antd';
import {
    CheckCircleOutlined,
    FileExcelOutlined,
    FilterOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import styles from '../styles.module.scss';

const { Option } = Select;

const initialStudents = [
    { key: 1, name: 'Nguyễn Thành Long', initials: 'NL', color: '#e53e3e', msv: 'B20DCCN001', dob: '12/05/2002', status: 'present' },
    { key: 2, name: 'Trần Thu Anh', initials: 'TA', color: '#3182ce', msv: 'B20DCCN002', dob: '20/08/2002', status: 'excused' },
    { key: 3, name: 'Lê Văn Minh', initials: 'LM', color: '#38a169', msv: 'B20DCCN003', dob: '05/01/2002', status: 'absent' },
    { key: 4, name: 'Hoàng Lan Phương', initials: 'HP', color: '#d69e2e', msv: 'B20DCCN004', dob: '18/11/2002', status: 'present' },
    { key: 5, name: 'Phạm Quốc Hùng', initials: 'PH', color: '#805ad5', msv: 'B20DCCN005', dob: '03/03/2002', status: 'present' },
    { key: 6, name: 'Nguyễn Thị Lan', initials: 'NL', color: '#3182ce', msv: 'B20DCCN006', dob: '22/07/2002', status: 'present' },
    { key: 7, name: 'Trần Đức Anh', initials: 'TĐ', color: '#38a169', msv: 'B20DCCN007', dob: '14/09/2002', status: 'present' },
    { key: 8, name: 'Vũ Thị Hoa', initials: 'VH', color: '#d69e2e', msv: 'B20DCCN008', dob: '28/02/2002', status: 'present' },
    { key: 9, name: 'Đinh Văn Tùng', initials: 'ĐT', color: '#805ad5', msv: 'B20DCCN009', dob: '11/06/2002', status: 'present' },
    { key: 10, name: 'Bùi Thanh Hải', initials: 'BH', color: '#38b2ac', msv: 'B20DCCN010', dob: '30/04/2002', status: 'present' },
    { key: 11, name: 'Cao Minh Tuấn', initials: 'CT', color: '#5a67d8', msv: 'B20DCCN011', dob: '17/12/2002', status: 'present' },
    { key: 12, name: 'Đỗ Thị Ngọc', initials: 'ĐN', color: '#ed64a6', msv: 'B20DCCN012', dob: '09/10/2002', status: 'present' },
];

const PAGE_SIZE = 15;

const AttendanceTab = () => {
    const [selectedSession, setSelectedSession] = useState('12');
    const [selectedDate, setSelectedDate] = useState(dayjs('2024-05-15'));
    const [students, setStudents] = useState(initialStudents);
    const [currentPage, setCurrentPage] = useState(1);

    const total = students.length;
    const presentCount = students.filter(s => s.status === 'present').length;
    const excusedCount = students.filter(s => s.status === 'excused').length;
    const absentCount = students.filter(s => s.status === 'absent').length;

    const paginated = students.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const handleStatusChange = (key, value) => {
        setStudents(prev => prev.map(s => s.key === key ? { ...s, status: value } : s));
    };

    const columns = [
        {
            title: 'HỌ VÀ TÊN',
            dataIndex: 'name',
            key: 'name',
            render: (_, record) => (
                <div className={styles.studentName}>
                    <span
                        className={styles.studentAvatar}
                        style={{ background: record.color }}
                    >
                        {record.initials}
                    </span>
                    {record.name}
                </div>
            ),
            width: 260,
        },
        {
            title: 'MÃ SINH VIÊN',
            dataIndex: 'msv',
            key: 'msv',
            render: (text) => <span className={styles.msvCell}>{text}</span>,
            width: 170,
        },
        {
            title: 'NGÀY SINH',
            dataIndex: 'dob',
            key: 'dob',
            render: (text) => <span className={styles.dobCell}>{text}</span>,
            width: 140,
        },
        {
            title: 'TRẠNG THÁI ĐIỂM DANH',
            key: 'status',
            render: (_, record) => (
                <Radio.Group
                    value={record.status}
                    onChange={e => handleStatusChange(record.key, e.target.value)}
                    className={styles.radioGroup}
                >
                    <Radio value="present" className={styles.radioPresent}>Có mặt</Radio>
                    <Radio value="excused" className={styles.radioExcused}>Có phép</Radio>
                    <Radio value="absent" className={styles.radioAbsent}>Vắng</Radio>
                </Radio.Group>
            ),
            width: 320,
        },
    ];

    return (
        <div className={styles.attendanceWrap}>
            {/* Stat cards at top */}
            <div className={styles.attendanceStats}>
                <div className={styles.statItem}>
                    <div className={styles.statIcon} style={{ background: '#f0fff4', color: '#2f855a' }}><CheckCircleOutlined /></div>
                    <div className={styles.statMeta}>
                        <div className={styles.statLabel}>CÓ MẶT</div>
                        <div className={styles.statValue}>{String(presentCount).padStart(2, '0')}</div>
                    </div>
                </div>
                <div className={styles.statItem}>
                    <div className={styles.statIcon} style={{ background: '#fffbeb', color: '#c05621' }}><FileExcelOutlined /></div>
                    <div className={styles.statMeta}>
                        <div className={styles.statLabel}>CÓ PHÉP</div>
                        <div className={styles.statValue}>{String(excusedCount).padStart(2, '0')}</div>
                    </div>
                </div>
                <div className={styles.statItem}>
                    <div className={styles.statIcon} style={{ background: '#fff5f5', color: '#e53e3e' }}>✕</div>
                    <div className={styles.statMeta}>
                        <div className={styles.statLabel}>VẮNG MẶT</div>
                        <div className={styles.statValue}>{String(absentCount).padStart(2, '0')}</div>
                    </div>
                </div>
            </div>

            <div className={styles.attendanceMain}>
                {/* Left filter panel */}
                <div className={styles.filterPanel}>
                    <div className={styles.filterTitle}>
                        <FilterOutlined /> Bộ lọc điểm danh
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>BUỔI HỌC</label>
                        <Select
                            value={selectedSession}
                            onChange={setSelectedSession}
                            className={styles.filterSelect}
                        >
                            {Array.from({ length: 15 }, (_, i) => (
                                <Option key={i + 1} value={String(i + 1)}>
                                    Buổi {i + 1} - {i % 2 === 0 ? 'Lý thuyết' : 'Thực hành'}
                                </Option>
                            ))}
                        </Select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>NGÀY HỌC</label>
                        <DatePicker
                            value={selectedDate}
                            onChange={setSelectedDate}
                            format="DD/MM/YYYY"
                            className={styles.filterDate}
                        />
                    </div>
                </div>

                {/* Right content - Student list */}
                <div className={styles.attendanceContent}>
                    <div className={styles.studentListCard}>
                        <div className={styles.studentListHeader}>
                            <span className={styles.studentListTitle}>Danh sách sinh viên ({total})</span>
                            <Button
                                icon={<FileExcelOutlined />}
                                className={styles.exportBtn}
                                type="link"
                                danger
                            >
                                Xuất file Excel
                            </Button>
                        </div>
                        <div className={styles.attendanceDesktopTable}>
                            <Table
                                columns={columns}
                                dataSource={paginated}
                                pagination={false}
                                rowKey="key"
                                scroll={{ x: 1100 }}
                                className={styles.attendanceTable}
                            />
                        </div>

                        <div className={styles.attendanceMobileList}>
                            {paginated.map((student) => (
                                <div key={student.key} className={styles.attendanceMobileItem}>
                                    <div className={styles.attendanceMobileTop}>
                                        <div className={styles.studentName}>
                                            <span
                                                className={styles.studentAvatar}
                                                style={{ background: student.color }}
                                            >
                                                {student.initials}
                                            </span>
                                            {student.name}
                                        </div>
                                        <span className={styles.msvCell}>{student.msv}</span>
                                    </div>
                                    <div className={styles.attendanceMobileDob}>Ngày sinh: {student.dob}</div>
                                    <Radio.Group
                                        value={student.status}
                                        onChange={e => handleStatusChange(student.key, e.target.value)}
                                        className={styles.radioGroup}
                                    >
                                        <Radio value="present" className={styles.radioPresent}>Có mặt</Radio>
                                        <Radio value="excused" className={styles.radioExcused}>Có phép</Radio>
                                        <Radio value="absent" className={styles.radioAbsent}>Vắng</Radio>
                                    </Radio.Group>
                                </div>
                            ))}
                        </div>

                        <div className={styles.tableFooter}>
                            <span className={styles.tableInfo}>
                                Đang hiển thị {Math.min((currentPage - 1) * PAGE_SIZE + 1, total)}–{Math.min(currentPage * PAGE_SIZE, total)} trên {total} sinh viên
                            </span>
                            <Pagination
                                current={currentPage}
                                total={total}
                                pageSize={PAGE_SIZE}
                                showSizeChanger={false}
                                onChange={setCurrentPage}
                                size="small"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceTab;
