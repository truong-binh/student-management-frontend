import React, { useEffect, useMemo, useState } from 'react';
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
    BookOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { submissionApi } from '@/api/admin/submission';
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

const AVATAR_COLORS = ['#e53e3e', '#d69e2e', '#805ad5', '#3182ce', '#38b2ac', '#ed64a6', '#48bb78', '#f6ad55'];

const getInitials = (name = '') => {
    const words = name.trim().split(' ').filter(Boolean);
    if (!words.length) return 'SV';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
};

const colorById = (id = '') => {
    const value = String(id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return AVATAR_COLORS[value % AVATAR_COLORS.length];
};

const getFileNameFromUrl = (url = '') => {
    try {
        const cleanUrl = url.split('?')[0];
        return decodeURIComponent(cleanUrl.substring(cleanUrl.lastIndexOf('/') + 1));
    } catch (_err) {
        return 'Tệp bài nộp';
    }
};

const formatDateTime = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString('vi-VN');
};

const mapFeedbackItems = (feedback = '') => {
    if (!feedback || typeof feedback !== 'string') {
        return [{ type: 'info', text: 'Chưa có phản hồi AI cho bài nộp này.' }];
    }

    const lines = feedback
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => line.replace(/^[-*•]\s*/, ''));

    if (!lines.length) {
        return [{ type: 'info', text: feedback.trim() }];
    }

    return lines.map((line) => ({ type: 'info', text: line }));
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
    const { id, assignmentId, studentId } = useParams();

    const submissionId = studentId;
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [aiGrading, setAiGrading] = useState(false);
    const [newScore, setNewScore] = useState(null);
    const [comment, setComment] = useState('');

    const loadSubmissionDetail = async () => {
        if (!submissionId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const res = await submissionApi.getSubmissionDetail(submissionId);
        if (!res?.success) {
            message.error(res?.message || 'Không thể tải chi tiết bài nộp');
            setLoading(false);
            return;
        }

        const detail = res?.data || null;
        setSubmission(detail);
        setNewScore(typeof detail?.score === 'number' ? detail.score : null);
        setLoading(false);
    };

    useEffect(() => {
        loadSubmissionDetail();
    }, [submissionId]);

    const student = submission?.student || {};
    const assignment = submission?.assignment || {};
    const studentName = student.fullName || 'Sinh viên';
    const studentCode = student.userCode || '—';

    const classInfo = {
        title: assignment.title || 'Bài tập',
        code: assignmentId ? `BT-${assignmentId.slice(-6)}` : 'BT',
        groupCode: `Lớp ${id || '—'}`,
        semester: '',
    };

    const studentViewModel = useMemo(() => {
        const idValue = student._id || submissionId || 'student';
        return {
            name: studentName,
            initials: getInitials(studentName),
            color: colorById(idValue),
            msv: studentCode,
            score: typeof submission?.score === 'number' ? submission.score : null,
            fileName: submission?.fileName || getFileNameFromUrl(submission?.fileUrl || ''),
            fileUrl: submission?.fileUrl || '',
            submittedAt: submission?.submittedAt || submission?.createdAt,
            aiFeedback: submission?.aiFeedback || '',
        };
    }, [student, studentName, studentCode, submission, submissionId]);

    const gradeInfo = getGradeLabel(newScore);
    const aiFeedbackItems = mapFeedbackItems(studentViewModel.aiFeedback);

    const handleBack = () => {
        navigate(`/teacher/classes/${id}`);
    };

    const handleGradeByAI = async () => {
        if (!submissionId) return;

        setAiGrading(true);
        const res = await submissionApi.gradeSubmissionAI(submissionId);
        if (!res?.success) {
            message.warning(res?.message || 'Không thể lấy gợi ý chấm AI');
            setAiGrading(false);
            return;
        }

        const newSubmission = res.data;
        setSubmission(newSubmission);
        setNewScore(typeof newSubmission?.score === 'number' ? newSubmission.score : null);
        message.success('Đã cập nhật phản hồi và điểm gợi ý từ AI');
        setAiGrading(false);
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
        message.info('Backend hiện chưa có endpoint lưu điểm thủ công. Vui lòng xác nhận API để hoàn tất chức năng lưu điểm.');
    };

    if (loading) {
        return (
            <MainLayout menuItems={teacherMenuItems}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <div className={styles.headerLeft}>
                            <div className={styles.backBtn} onClick={handleBack}>
                                <ArrowLeftOutlined />
                            </div>
                            <div className={styles.titleInfo}>
                                <div className={styles.mainTitleRow}>
                                    <h1>Sửa điểm bài tập</h1>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{ padding: '24px', textAlign: 'center' }}>Đang tải dữ liệu bài nộp...</div>
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
                                {classInfo.groupCode}{classInfo.semester ? ` • ${classInfo.semester}` : ''}
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
                                    style={{ background: studentViewModel.color }}
                                >
                                    {studentViewModel.initials}
                                </span>
                                <div className={styles.studentMeta}>
                                    <div className={styles.studentName}>{studentViewModel.name}</div>
                                    <div className={styles.studentMsv}>MSV: {studentViewModel.msv}</div>
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
                                    {studentViewModel.score !== null ? studentViewModel.score : '—'}
                                </span>
                                <span className={styles.scoreTotal}>/ 10</span>
                            </div>
                            {studentViewModel.score !== null && (
                                <Tag
                                    className={styles.gradeTag}
                                    style={{ background: getGradeLabel(studentViewModel.score)?.color + '20', color: getGradeLabel(studentViewModel.score)?.color, borderColor: getGradeLabel(studentViewModel.score)?.color + '40' }}
                                >
                                    {getGradeLabel(studentViewModel.score)?.label}
                                </Tag>
                            )}
                        </div>

                        {/* Submitted file card */}
                        <div className={styles.fileCard}>
                            <div className={styles.cardTitle}>FILE BÀI NỘP</div>
                            <div className={styles.fileItem}>
                                <FileZipOutlined className={styles.fileIcon} />
                                <div className={styles.fileInfo}>
                                    <div className={styles.fileName}>{studentViewModel.fileName}</div>
                                    <div className={styles.fileMeta}>Không rõ dung lượng • {formatDateTime(studentViewModel.submittedAt)}</div>
                                </div>
                                <CloudDownloadOutlined
                                    className={styles.downloadIcon}
                                    onClick={() => studentViewModel.fileUrl && window.open(studentViewModel.fileUrl, '_blank')}
                                />
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
                                <Button
                                    size="small"
                                    danger
                                    loading={aiGrading}
                                    onClick={handleGradeByAI}
                                    style={{ marginLeft: 'auto' }}
                                >
                                    Lấy gợi ý AI
                                </Button>
                            </div>
                            <div className={styles.aiItems}>
                                {aiFeedbackItems.map((item, index) => (
                                    <div key={`${item.text}-${index}`} className={styles.aiItem}>
                                        {item.type === 'pros' ? (
                                            <CheckCircleOutlined className={styles.iconPros} />
                                        ) : item.type === 'cons' ? (
                                            <ExclamationCircleOutlined className={styles.iconCons} />
                                        ) : (
                                            <InfoCircleOutlined className={styles.iconInfo} />
                                        )}
                                        <span>{item.text}</span>
                                    </div>
                                ))}
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
