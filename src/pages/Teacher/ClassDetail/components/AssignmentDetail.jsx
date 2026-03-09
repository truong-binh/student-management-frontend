import React, { useState } from 'react';
import { Button, Input, Pagination } from 'antd';
import {
    ArrowLeftOutlined,
    CalendarOutlined,
    TeamOutlined,
    DownloadOutlined,
    EditOutlined,
    DownCircleOutlined,
    MessageOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import styles from '../styles.module.scss';

const PAGE_SIZE = 4;

const allStudents = [
    { id: 1, name: 'Nguyhn Hoàng Anh', initials: 'HA', color: '#e53e3e', msv: 'B21DCCN001', status: 'graded', hasFeedback: true, score: 9.5 },
    { id: 2, name: 'Lê Trcn Minh', initials: 'TM', color: '#d69e2e', msv: 'B21DCCN042', status: 'submitted', hasFeedback: false, score: null },
    { id: 3, name: 'Phạm Văn Vinh', initials: 'PV', color: '#805ad5', msv: 'B21DCCN115', status: 'missing', hasFeedback: false, score: null },
    { id: 4, name: 'Trcn Thị Lan', initials: 'TL', color: '#3182ce', msv: 'B21DCCN210', status: 'graded', hasFeedback: true, score: 8.0 },
    { id: 5, name: 'Hoàng Minh Đức', initials: 'HĐ', color: '#38b2ac', msv: 'B21DCCN078', status: 'graded', hasFeedback: false, score: 7.5 },
    { id: 6, name: 'Nguyễn Thị Mai', initials: 'NM', color: '#ed64a6', msv: 'B21DCCN033', status: 'submitted', hasFeedback: false, score: null },
    { id: 7, name: 'Trần Quốc Hùng', initials: 'TH', color: '#48bb78', msv: 'B21DCCN156', status: 'missing', hasFeedback: false, score: null },
    { id: 8, name: 'Bùi Thị Hoa', initials: 'BH', color: '#f6ad55', msv: 'B21DCCN094', status: 'graded', hasFeedback: true, score: 8.5 },
    { id: 9, name: 'Đinh Văn Long', initials: 'ĐL', color: '#c53030', msv: 'B21DCCN201', status: 'submitted', hasFeedback: false, score: null },
    { id: 10, name: 'Vũ Hải Anh', initials: 'VA', color: '#5a67d8', msv: 'B21DCCN047', status: 'graded', hasFeedback: false, score: 9.0 },
    { id: 11, name: 'Đỗ Thị Ngọc', initials: 'ĐN', color: '#e53e3e', msv: 'B21DCCN088', status: 'missing', hasFeedback: false, score: null },
    { id: 12, name: 'Cao Văn Tùng', initials: 'CT', color: '#d69e2e', msv: 'B21DCCN125', status: 'graded', hasFeedback: true, score: 6.5 },
];

const STUDENT_FILTERS = [
    { key: 'all', label: 'Tất cả' },
    { key: 'submitted', label: 'Đã nộp' },
    { key: 'missing', label: 'Chưa nộp' },
    { key: 'graded', label: 'Đã chấm' },
    { key: 'feedback', label: 'Phản hồi', hasDot: true },
];

const AssignmentDetail = ({ assignment, classInfo = {}, onBack }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [studentFilter, setStudentFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const groupCode = classInfo.groupCode || classInfo.code || 'D21CQCN01-B';
    const classTitle = classInfo.title || 'Lập trình hướng đối tượng';
    const semester = classInfo.semester || 'Học kỳ 1 - 2023-2024';

    const feedbackCount = allStudents.filter(s => s.hasFeedback).length;

    const filtered = allStudents.filter(s => {
        const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.msv.toLowerCase().includes(search.toLowerCase());
        if (!matchSearch) return false;
        if (studentFilter === 'all') return true;
        if (studentFilter === 'feedback') return s.hasFeedback;
        return s.status === studentFilter;
    });

    const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const statusBadge = (s) => {
        if (s.status === 'graded') return <span className={`${styles.stBadge} ${styles.stGraded}`}>ĐÃ CHẤM</span>;
        if (s.status === 'submitted') return <span className={`${styles.stBadge} ${styles.stSubmitted}`}>ĐÃ NỘP</span>;
        return <span className={`${styles.stBadge} ${styles.stMissing}`}>CHƯA NỘP</span>;
    };

    return (
        <div className={styles.adWrap}>
            {/* ── Back btn ── */}
            <button className={styles.adBackBtn} onClick={onBack}>
                <ArrowLeftOutlined /> Quay lại danh sách
            </button>

            {/* ── Header card ── */}
            <div className={styles.adHeaderCard}>
                <div className={styles.adHeaderTop}>
                    <div className={styles.adMeta}>
                        <span className={styles.adGroupCode}>{groupCode}</span>
                        <span className={styles.adDot}>•</span>
                        <span className={styles.adMetaText}>{classTitle}</span>
                        <span className={styles.adDot}>•</span>
                        <span className={styles.adMetaText}>{semester}</span>
                    </div>
                    <div className={styles.adActions}>
                        <Button
                            type="primary"
                            danger
                            icon={<DownloadOutlined />}
                            className={styles.adDownloadBtn}
                        >
                            Tải file đề bài (.docx)
                        </Button>
                        <Button icon={<EditOutlined />} className={styles.adEditBtn}>
                            Chỉnh sửa đề bài
                        </Button>
                    </div>
                </div>

                <div className={styles.adTitleRow}>
                    <h2 className={styles.adTitle}>{assignment.title}</h2>
                    <span className={styles.adStatusBadge}>• Đang mở</span>
                </div>

                <div className={styles.adInfoRow}>
                    <span className={styles.adInfoItem}>
                        <CalendarOutlined /> Hạn nộp: {assignment.deadline}
                    </span>
                    <span className={styles.adInfoItem}>
                        <TeamOutlined /> Sĩ số: 45 Sinh viên
                    </span>
                </div>

                <div className={styles.adDesc}>
                    <p>
                        Yêu cầu sinh viên hoàn thiện ứng dụng quản lý thư viện sử dụng ngôn ngữ Java
                        (Swing/JavaFX) kết nối cơ sở dữ liệu JDBC (SQL Server/MySQL). Các tính năng bắt
                        buộc: Quản lý sách, quản lý độc giả, quản lý mượn trả và thống kê cơ bản.
                    </p>
                    <ul className={styles.adList}>
                        <li>Mã nguồn đóng gói định dạng .zip</li>
                        <li>Báo cáo chi tiết định dạng .pdf (mô tả class, database diagram)</li>
                        <li>Video demo ngắn (nếu có)</li>
                    </ul>
                </div>
            </div>

            {/* ── Student table card ── */}
            <div className={styles.adTableCard}>
                {/* Tab + search row */}
                <div className={styles.adTableHeader}>
                    <div className={styles.adStudentFilters}>
                        {STUDENT_FILTERS.map(f => (
                            <button
                                key={f.key}
                                className={`${styles.adFilterBtn} ${studentFilter === f.key ? styles.adFilterBtnActive : ''}`}
                                onClick={() => { setStudentFilter(f.key); setCurrentPage(1); }}
                            >
                                {f.label}
                                {f.key === 'all' && ` (${allStudents.length})`}
                                {f.hasDot && feedbackCount > 0 && (
                                    <span className={styles.adFeedbackDot} />
                                )}
                            </button>
                        ))}
                    </div>
                    <Input
                        prefix={<SearchOutlined />}
                        placeholder="Tìm kiếm sinh viên..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                        className={styles.adSearchInput}
                    />
                </div>

                {/* Table */}
                <table className={styles.adTable}>
                    <thead>
                        <tr>
                            <th>SINH VIÊN</th>
                            <th>MÃ SV</th>
                            <th>TRẠNG THÁI</th>
                            <th>ĐIỂM</th>
                            <th>BÀI LÀM</th>
                            <th>SỬA ĐIỂM</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.map(s => (
                            <tr key={s.id}>
                                <td>
                                    <div className={styles.adStudentName}>
                                        <span className={styles.adAvatar} style={{ background: s.color }}>
                                            {s.initials}
                                        </span>
                                        {s.name}
                                    </div>
                                </td>
                                <td className={styles.adMsvCell}>{s.msv}</td>
                                <td>
                                    <div className={styles.adStatusCell}>
                                        {statusBadge(s)}
                                        {s.hasFeedback && (
                                            <span className={styles.adFeedbackBadge}>
                                                <MessageOutlined style={{ fontSize: 10 }} /> CÓ PHẢN HỒI
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className={`${styles.adScoreCell} ${s.score ? styles.adScoreValue : ''}`}>
                                    {s.score !== null ? s.score : '—'}
                                </td>
                                <td className={styles.adDownloadCell}>
                                    {s.status !== 'missing' ? (
                                        <DownCircleOutlined className={styles.adDownIcon} />
                                    ) : (
                                        <span className={styles.adNoFile}>○</span>
                                    )}
                                </td>
                                <td>
                                    {s.status === 'graded' ? (
                                        <Button
                                            size="small"
                                            type="primary"
                                            danger
                                            icon={<EditOutlined />}
                                            className={styles.adGradeBtn}
                                            onClick={() => navigate(`/teacher/classes/${id}/assignments/${assignment?.id || 1}/grade-edit/${s.id}`)}
                                        >
                                            SỬA ĐIỂM
                                        </Button>
                                    ) : null}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Footer */}
                <div className={styles.adTableFooter}>
                    <span className={styles.adTableInfo}>
                        Hiện thị {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, filtered.length)} trong {filtered.length} sinh viên
                    </span>
                    <Pagination
                        current={currentPage}
                        total={filtered.length}
                        pageSize={PAGE_SIZE}
                        showSizeChanger={false}
                        onChange={p => setCurrentPage(p)}
                        size="small"
                    />
                </div>
            </div>
        </div>
    );
};

export default AssignmentDetail;
