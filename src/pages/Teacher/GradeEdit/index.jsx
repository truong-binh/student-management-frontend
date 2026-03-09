import React, { useState } from 'react';
import { Button, Input, InputNumber, Tag, message } from 'antd';
import {
    ArrowLeftOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    InfoCircleOutlined,
    SaveOutlined,
    RobotOutlined,
    CommentOutlined,
    FileZipOutlined,
    CloudDownloadOutlined,
    CalendarOutlined,
    EditOutlined,
    UserOutlined,
    MessageOutlined,
    ReadOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '@/layouts/User/MainLayout';
import styles from './styles.module.scss';

const { TextArea } = Input;

const teacherMenuItems = [
    { key: 'dashboard', label: 'Tổng quan', icon: <UserOutlined />, path: '/teacher/dashboard' },
    { key: 'classes', label: 'Lớp học', icon: <ReadOutlined />, path: '/teacher/classes' },
    { key: 'schedule', label: 'Thời khóa biểu', icon: <CalendarOutlined />, path: '/teacher/schedule' },
    { key: 'profile', label: 'Profile', icon: <UserOutlined />, path: '/teacher/profile' },
    { key: 'feedback', label: 'Phản hồi', icon: <MessageOutlined />, path: '/teacher/feedback' },
];

/* ── Mock data (replace with API call) ── */
const classesData = [
    { id: 1, title: 'Cấu trúc dữ liệu và Giải thuật', code: 'INT1302', groupCode: 'INT1302 - Nhóm 01', semester: 'Học kỳ 2 - 2025-2026' },
    { id: 2, title: 'Mạng máy tính', code: 'INT1434', groupCode: 'INT1434 - Nhóm 01', semester: 'Học kỳ 2 - 2025-2026' },
];

const studentsData = {
    1: { id: 1, name: 'Nguyễn Hoàng Anh', initials: 'HA', color: '#e53e3e', msv: 'B21DCCN001', score: 9.5, hasFeedback: true },
    2: { id: 2, name: 'Lê Trần Minh', initials: 'TM', color: '#d69e2e', msv: 'B21DCCN042', score: null, hasFeedback: false },
    4: { id: 4, name: 'Trần Thị Lan', initials: 'TL', color: '#3182ce', msv: 'B21DCCN210', score: 8.0, hasFeedback: true },
    5: { id: 5, name: 'Hoàng Minh Đức', initials: 'HĐ', color: '#38b2ac', msv: 'B21DCCN078', score: 7.5, hasFeedback: false },
    8: { id: 8, name: 'Bùi Thị Hoa', initials: 'BH', color: '#f6ad55', msv: 'B21DCCN094', score: 8.5, hasFeedback: true },
    10: { id: 10, name: 'Vũ Hải Anh', initials: 'VA', color: '#5a67d8', msv: 'B21DCCN047', score: 9.0, hasFeedback: false },
    12: { id: 12, name: 'Cao Văn Tùng', initials: 'CT', color: '#d69e2e', msv: 'B21DCCN125', score: 6.5, hasFeedback: true },
};

const getGradeLabel = (score) => {
    if (score === null || score === undefined) return null;
    if (score >= 9) return { label: 'Xuất sắc', color: '#48bb78' };
    if (score >= 8) return { label: 'Giỏi', color: '#3182ce' };
    if (score >= 6.5) return { label: 'Khá', color: '#d69e2e' };
    if (score >= 5) return { label: 'Trung bình', color: '#e53e3e' };
    return { label: 'Yếu', color: '#c53030' };
};

const TeacherGradeEdit = () => {
    const navigate = useNavigate();
    const { id, studentId } = useParams();

    const classInfo = classesData.find(c => c.id === Number(id)) || classesData[0];
    const student = studentsData[Number(studentId)] || studentsData[1];

    const [newScore, setNewScore] = useState(student.score);
    const [comment, setComment] = useState('');
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [savedScore, setSavedScore] = useState(null);

    const gradeInfo = getGradeLabel(newScore);

    const handleBack = () => {
        navigate(`/teacher/classes/${id}`);
    };

    const handleSave = () => {
        if (newScore === null || newScore === undefined) {
            message.warning('Vui lòng nhập điểm cho sinh viên!');
            return;
        }
        if (newScore < 0 || newScore > 10) {
            message.warning('Điểm phải nằm trong khoảng từ 0 đến 10!');
            return;
        }
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            setSavedScore(newScore);
            setSuccess(true);
        }, 1000);
    };

    if (success) {
        return (
            <MainLayout menuItems={teacherMenuItems}>
                <div className={styles.successPage}>
                    <div className={styles.successCard}>
                        <div className={styles.successIconWrap}>
                            <CheckCircleOutlined className={styles.successIcon} />
                        </div>
                        <h2 className={styles.successTitle}>Sửa điểm thành công!</h2>
                        <div className={styles.successInfo}>
                            <UserOutlined className={styles.successUserIcon} />
                            <p>
                                Điểm của sinh viên <strong>{student.name}</strong> đã được cập nhật
                                chính xác thành{' '}
                                <span className={styles.successScore}>{savedScore}</span>
                            </p>
                            <p className={styles.successMeta}>
                                Mã SV: {student.msv} • Môn: {classInfo.title}
                            </p>
                        </div>
                        <Button
                            type="primary"
                            danger
                            size="large"
                            icon={<ArrowLeftOutlined />}
                            className={styles.successBackBtn}
                            onClick={handleBack}
                        >
                            Quay lại danh sách
                        </Button>
                        <div className={styles.successFooter}>
                            <span className={styles.successDots}>• • •</span>
                            Hoàn tất quy trình cập nhật
                        </div>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout menuItems={teacherMenuItems}>
            <div className={styles.container}>
                {/* ── Header ── */}
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <div className={styles.backBtn} onClick={handleBack}>
                            <ArrowLeftOutlined />
                        </div>
                        <div className={styles.titleInfo}>
                            <div className={styles.mainTitleRow}>
                                <h1>Sửa điểm bài tập</h1>
                                <Tag className={styles.classTag}>{classInfo.code}</Tag>
                            </div>
                            <div className={styles.subTitle}>
                                {classInfo.groupCode} • {classInfo.semester}
                            </div>
                            <div className={styles.breadcrumbs}>
                                <span>Lớp học</span>
                                <span className={styles.separator}>&gt;</span>
                                <span>{classInfo.code}</span>
                                <span className={styles.separator}>&gt;</span>
                                <span>DS bài tập</span>
                                <span className={styles.separator}>&gt;</span>
                                <span>Chi tiết</span>
                                <span className={styles.separator}>&gt;</span>
                                <span className={styles.current}>Sửa điểm</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Main layout ── */}
                <div className={styles.mainLayout}>
                    {/* ── Left column: student info ── */}
                    <div className={styles.leftCol}>
                        {/* Student card */}
                        <div className={styles.studentCard}>
                            <div className={styles.cardTitle}>
                                <UserOutlined /> Thông tin sinh viên
                            </div>
                            <div className={styles.avatarRow}>
                                <span
                                    className={styles.avatar}
                                    style={{ background: student.color }}
                                >
                                    {student.initials}
                                </span>
                                <div className={styles.studentMeta}>
                                    <div className={styles.studentName}>{student.name}</div>
                                    <div className={styles.studentMsv}>MSV: {student.msv}</div>
                                    <Tag className={styles.gradedTag}>ĐÃ CHẤM</Tag>
                                </div>
                            </div>
                        </div>

                        {/* Current score card */}
                        <div className={styles.scoreCard}>
                            <div className={styles.cardTitle}>
                                <InfoCircleOutlined /> Điểm hiện tại
                            </div>
                            <div className={styles.scoreCircle}>
                                <span className={styles.scoreValue}>
                                    {student.score !== null ? student.score : '—'}
                                </span>
                                <span className={styles.scoreTotal}>/ 10</span>
                            </div>
                            {student.score !== null && (
                                <Tag
                                    className={styles.gradeTag}
                                    style={{ background: getGradeLabel(student.score)?.color + '20', color: getGradeLabel(student.score)?.color, borderColor: getGradeLabel(student.score)?.color + '40' }}
                                >
                                    {getGradeLabel(student.score)?.label}
                                </Tag>
                            )}
                        </div>

                        {/* Submitted file card */}
                        <div className={styles.fileCard}>
                            <div className={styles.cardTitle}>FILE BÀI NỘP</div>
                            <div className={styles.fileItem}>
                                <FileZipOutlined className={styles.fileIcon} />
                                <div className={styles.fileInfo}>
                                    <div className={styles.fileName}>{student.msv}_BaiTap.zip</div>
                                    <div className={styles.fileMeta}>2.1 MB • 28/05/2024</div>
                                </div>
                                <CloudDownloadOutlined className={styles.downloadIcon} />
                            </div>
                        </div>
                    </div>

                    {/* ── Right column: grade edit form ── */}
                    <div className={styles.rightCol}>
                        {/* Grade input card */}
                        <div className={styles.editCard}>
                            <div className={styles.editCardTitle}>
                                <EditOutlined /> Chỉnh sửa điểm số
                            </div>

                            <div className={styles.scoreInputRow}>
                                <div className={styles.scoreInputGroup}>
                                    <label className={styles.inputLabel}>Điểm mới (0 – 10)</label>
                                    <InputNumber
                                        className={styles.scoreInput}
                                        min={0}
                                        max={10}
                                        step={0.5}
                                        value={newScore}
                                        onChange={val => setNewScore(val)}
                                        size="large"
                                        precision={1}
                                    />
                                </div>
                                {gradeInfo && newScore !== null && (
                                    <div className={styles.previewBadge}>
                                        <div className={styles.previewLabel}>Xếp loại</div>
                                        <Tag
                                            className={styles.previewTag}
                                            style={{
                                                background: gradeInfo.color + '20',
                                                color: gradeInfo.color,
                                                borderColor: gradeInfo.color + '40',
                                            }}
                                        >
                                            {gradeInfo.label}
                                        </Tag>
                                    </div>
                                )}
                            </div>

                            {/* Score scale legend */}
                            <div className={styles.scaleLegend}>
                                {[
                                    { range: '9 – 10', label: 'Xuất sắc', color: '#48bb78' },
                                    { range: '8 – 8.9', label: 'Giỏi', color: '#3182ce' },
                                    { range: '6.5 – 7.9', label: 'Khá', color: '#d69e2e' },
                                    { range: '5 – 6.4', label: 'TB', color: '#e53e3e' },
                                    { range: '< 5', label: 'Yếu', color: '#c53030' },
                                ].map(s => (
                                    <span key={s.range} className={styles.scaleItem} style={{ color: s.color }}>
                                        <span className={styles.scaleDot} style={{ background: s.color }} />
                                        {s.range}: {s.label}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Teacher comment card */}
                        <div className={styles.commentCard}>
                            <div className={styles.editCardTitle}>
                                <CommentOutlined /> Nhận xét của giáo viên
                            </div>
                            <TextArea
                                className={styles.commentInput}
                                placeholder="Nhập nhận xét cho sinh viên (lý do sửa điểm, phản hồi cụ thể...)"
                                rows={5}
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                maxLength={500}
                                showCount
                            />
                        </div>

                        {/* AI Feedback review card */}
                        <div className={styles.aiFeedbackCard}>
                            <div className={styles.editCardTitle}>
                                <RobotOutlined /> Phản hồi AI (tham khảo)
                            </div>
                            <div className={styles.aiItems}>
                                <div className={styles.aiItem}>
                                    <CheckCircleOutlined className={styles.iconPros} />
                                    <span>Thuật toán chính xác và đầy đủ các trường hợp biên.</span>
                                </div>
                                <div className={styles.aiItem}>
                                    <CheckCircleOutlined className={styles.iconPros} />
                                    <span>Cấu trúc code rõ ràng, dễ đọc. Đặt tên biến hợp lý.</span>
                                </div>
                                <div className={styles.aiItem}>
                                    <ExclamationCircleOutlined className={styles.iconCons} />
                                    <span>Cần bổ sung comment cho các hàm phức tạp.</span>
                                </div>
                                <div className={styles.aiItem}>
                                    <ExclamationCircleOutlined className={styles.iconCons} />
                                    <span>Chưa xử lý memory leak trong hàm xóa node.</span>
                                </div>
                                <div className={styles.aiItem}>
                                    <InfoCircleOutlined className={styles.iconInfo} />
                                    <span>File báo cáo đầy đủ, có sơ đồ class và database.</span>
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className={styles.actionRow}>
                            <Button
                                className={styles.cancelBtn}
                                size="large"
                                onClick={handleBack}
                            >
                                Huỷ
                            </Button>
                            <Button
                                type="primary"
                                size="large"
                                icon={<SaveOutlined />}
                                className={styles.saveBtn}
                                loading={saving}
                                onClick={handleSave}
                            >
                                Lưu điểm
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default TeacherGradeEdit;
