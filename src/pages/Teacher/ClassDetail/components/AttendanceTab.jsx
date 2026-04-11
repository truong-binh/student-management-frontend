import React, { useState } from 'react';
import { Select, Button, Pagination, Spin, message, Upload, Modal } from 'antd';
import {
    CheckCircleOutlined,
    FileExcelOutlined,
    FilterOutlined,
    UploadOutlined,
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import styles from '../styles.module.scss';
import { useClassAttendance, useAttendanceImport } from '@/hooks/useAttendance';

const { Option } = Select;

const PAGE_SIZE = 15;

const AttendanceTab = () => {
    const { id: courseId } = useParams();
    const [selectedWeek, setSelectedWeek] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);

    const { attendance: rawAttendance = [], isLoading, refetch } = useClassAttendance(courseId, selectedWeek);
    const attendance = rawAttendance.filter(item => !!item.student);
    const { importAttendance, isLoading: isImporting } = useAttendanceImport(courseId);

    const total = attendance.length;
    const presentCount = attendance.filter(s => s.status === 'PRESENT').length;
    const excusedCount = attendance.filter(s => s.status === 'EXCUSED').length;
    const absentCount = attendance.filter(s => s.status === 'ABSENT').length;
    const lateCount = attendance.filter(s => s.status === 'LATE').length;

    const paginated = attendance.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const handleImport = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await importAttendance(formData);
            if (res.success) {
                Modal.success({
                    title: 'Import điểm danh hoàn tất',
                    content: (
                        <div>
                            <p>{res.message}</p>
                            {res.data.errors?.length > 0 && (
                                <div style={{ maxHeight: 200, overflowY: 'auto', marginTop: 10 }}>
                                    <p style={{ color: '#e53e3e', fontWeight: 600 }}>Chi tiết lỗi:</p>
                                    <ul style={{ paddingLeft: 20 }}>
                                        {res.data.errors.map((err, i) => <li key={i} style={{ fontSize: 13, color: '#4a5568' }}>{err}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ),
                    width: 500,
                });
                refetch();
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi khi import file Excel');
        }
        return false;
    };

    const getStatusText = (status) => {
        const map = {
            'PRESENT': { text: 'Có mặt', color: '#2f855a' },
            'ABSENT': { text: 'Vắng', color: '#e53e3e' },
            'EXCUSED': { text: 'Có phép', color: '#c05621' },
            'LATE': { text: 'Đi muộn', color: '#c05621' },
        };
        return map[status] || { text: status, color: '#4a5568' };
    };

    if (isLoading) return <div style={{ padding: '100px', textAlign: 'center' }}><Spin tip="Đang tải dữ liệu..." /></div>;

    return (
        <div className={styles.attendanceWrap}>
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
                        <div className={styles.statLabel}>CÓ PHÉP / MUỘN</div>
                        <div className={styles.statValue}>{String(excusedCount + lateCount).padStart(2, '0')}</div>
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
                <div className={styles.filterPanel}>
                    <div className={styles.filterTitle}>
                        <FilterOutlined /> Bộ lọc điểm danh
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>TUẦN HỌC</label>
                        <Select
                            value={selectedWeek}
                            onChange={setSelectedWeek}
                            className={styles.filterSelect}
                        >
                            {Array.from({ length: 20 }, (_, i) => (
                                <Option key={i + 1} value={i + 1}>
                                    Tuần {i + 1}
                                </Option>
                            ))}
                        </Select>
                    </div>

                    <div className={styles.filterDivider} />

                    <Upload
                        beforeUpload={handleImport}
                        showUploadList={false}
                        accept=".xlsx,.xls"
                    >
                        <Button
                            type="primary"
                            danger
                            icon={<UploadOutlined />}
                            block
                            loading={isImporting}
                            style={{ height: 40, borderRadius: 10, fontWeight: 600 }}
                        >
                            Import từ Excel
                        </Button>
                    </Upload>
                </div>

                <div className={styles.attendanceContent}>
                    <div className={styles.studentListCard}>
                        <div className={styles.studentListHeader}>
                            <span className={styles.studentListTitle}>Danh sách điểm danh ({total})</span>
                        </div>
                        <div className={styles.attendanceTableScroll}>
                            <table className={styles.studentTable}>
                                <thead>
                                    <tr>
                                        <th>HỌ VÀ TÊN</th>
                                        <th>MÃ SINH VIÊN</th>
                                        <th>LỚP</th>
                                        <th>TRẠNG THÁI</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginated.map(record => (
                                        <tr key={record._id}>
                                            <td>
                                                <div className={styles.studentName}>
                                                    <span className={styles.studentAvatar} style={{ background: '#b71c1c' }}>
                                                        {record.student?.fullName?.charAt(0)}
                                                    </span>
                                                    {record.student?.fullName}
                                                </div>
                                            </td>
                                            <td className={styles.msvCell}>{record.student?.userCode}</td>
                                            <td className={styles.dobCell}>{record.student?.className || 'N/A'}</td>
                                            <td>
                                                <span style={{
                                                    fontWeight: 700,
                                                    color: getStatusText(record.status).color,
                                                    fontSize: 13
                                                }}>
                                                    {getStatusText(record.status).text}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {attendance.length === 0 && (
                                        <tr>
                                            <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
                                                Chưa có dữ liệu điểm danh tuần này
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {total > 0 && (
                            <div className={styles.tableFooter}>
                                <span className={styles.tableInfo}>
                                    Hiển thị {Math.min((currentPage - 1) * PAGE_SIZE + 1, total)}–{Math.min(currentPage * PAGE_SIZE, total)} / {total}
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
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceTab;
