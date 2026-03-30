import React from 'react';
import { Button, Input, InputNumber, Tag, message, Spin } from 'antd';
import {
    ArrowLeftOutlined,
    InfoCircleOutlined,
    RobotOutlined,
    CommentOutlined,
    FileZipOutlined,
    CloudDownloadOutlined,
    EditOutlined,
    UserOutlined,
    ReadOutlined,
    CalendarOutlined,
    MessageOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import MainLayout from '@/layouts/User/MainLayout';
import styles from './styles.module.scss';
import { useAssignmentDetail } from '@/hooks/useCourseAssignment';
import { useSubmissionDetail } from '@/hooks/useSubmission';

const { TextArea } = Input;

const teacherMenuItems = [
    { key: 'dashboard', label: 'Tổng quan', icon: <UserOutlined />, path: '/teacher/dashboard' },
    { key: 'classes', label: 'Lớp học', icon: <ReadOutlined />, path: '/teacher/classes' },
    { key: 'schedule', label: 'Thời khóa biểu', icon: <CalendarOutlined />, path: '/teacher/schedule' },
    { key: 'profile', label: 'Profile', icon: <UserOutlined />, path: '/teacher/profile' },
    { key: 'feedback', label: 'Phản hồi', icon: <MessageOutlined />, path: '/teacher/feedback' },
];

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

    const { submission, isLoading: isSubLoading, gradeSubmissionByAI, isGrading } = useSubmissionDetail(studentId);
    const { assignment, isLoading: isAssignLoading } = useAssignmentDetail(assignmentId);


    const gradeInfo = getGradeLabel(submission?.score);

    const handleBack = () => {
        navigate(`/teacher/classes/${id}?tab=assignments&assignmentId=${assignmentId}`);
    };

    const handleAIGrade = async () => {
        try {
            await gradeSubmissionByAI();
            message.success('Chấm điểm bằng AI thành công!');
        } catch (error) {
            message.error('Lỗi khi chấm điểm bằng AI');
        }
    };

    if (isSubLoading || isAssignLoading) {
        return (
            <MainLayout menuItems={teacherMenuItems}>
                <div style={{ padding: '100px 0', textAlign: 'center' }}>
                    <Spin size="large" tip="Đang tải dữ liệu bài nộp..." />
                </div>
            </MainLayout>
        );
    }

    if (!submission) {
        return (
            <MainLayout menuItems={teacherMenuItems}>
                <div style={{ padding: '100px 0', textAlign: 'center' }}>
                    <h2>Không tìm thấy bài nộp hoặc bài nộp không tồn tại.</h2>
                    <Button onClick={handleBack} type="primary" style={{ marginTop: 20 }}>Quay lại</Button>
                </div>
            </MainLayout>
        );
    }


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
                                <Tag className={styles.classTag}>{id}</Tag>
                            </div>
                            <div className={styles.subTitle}>
                                {assignment?.title}
                            </div>
                            <div className={styles.breadcrumbs}>
                                <span>Lớp học</span>
                                <span className={styles.separator}>&gt;</span>
                                <span>{id}</span>
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

                <div className={styles.mainLayout}>
                    <div className={styles.leftCol}>
                        <div className={styles.studentCard}>
                            <div className={styles.cardTitle}>
                                <UserOutlined /> Thông tin sinh viên
                            </div>
                            <div className={styles.avatarRow}>
                                <span
                                    className={styles.avatar}
                                    style={{ background: '#3182ce' }}
                                >
                                    {(submission?.student?.fullName || submission?.student?.username || 'S').charAt(0).toUpperCase()}
                                </span>
                                <div className={styles.studentMeta}>
                                    <div className={styles.studentName}>{submission?.student?.fullName || submission?.student?.username}</div>
                                    <div className={styles.studentMsv}>MSV: {submission?.student?.userCode || '-'}</div>
                                    <Tag className={styles.gradedTag}>{submission?.score != null ? 'ĐÃ CHẤM' : 'CHƯA CHẤM'}</Tag>
                                </div>
                            </div>
                        </div>

                        <div className={styles.scoreCard}>
                            <div className={styles.cardTitle}>
                                <InfoCircleOutlined /> Điểm hiện tại
                            </div>
                            <div className={styles.scoreCircle}>
                                <span className={styles.scoreValue}>
                                    {submission?.score != null ? submission?.score : '—'}
                                </span>
                                <span className={styles.scoreTotal}>/ {assignment?.maxScore || 10}</span>
                            </div>
                            {submission?.score != null && (
                                <Tag
                                    className={styles.gradeTag}
                                    style={{ background: getGradeLabel(submission?.score)?.color + '20', color: getGradeLabel(submission?.score)?.color, borderColor: getGradeLabel(submission?.score)?.color + '40' }}
                                >
                                    {getGradeLabel(submission?.score)?.label}
                                </Tag>
                            )}
                        </div>

                        <div className={styles.fileCard}>
                            <div className={styles.cardTitle}>FILE BÀI NỘP</div>
                            {submission?.fileUrl ? (
                                <div className={styles.fileItem}>
                                    <FileZipOutlined className={styles.fileIcon} />
                                    <div className={styles.fileInfo}>
                                        <div className={styles.fileName}>{decodeURIComponent(submission.fileUrl.split('/').pop().split('?')[0])}</div>
                                        <div className={styles.fileMeta}>Nộp lúc: {dayjs(submission.createdAt).format('DD/MM/YYYY')}</div>
                                    </div>
                                    <CloudDownloadOutlined className={styles.downloadIcon} onClick={() => window.open(submission.fileUrl, '_blank')} style={{ cursor: 'pointer' }} />
                                </div>
                            ) : (
                                <div style={{ padding: '10px', color: '#9ca3af' }}>Không có file bài nộp</div>
                            )}
                        </div>
                    </div>

                    <div className={styles.rightCol}>
                        <div className={styles.editCard}>
                            <div className={styles.editCardTitle}>
                                <EditOutlined /> Chỉnh sửa điểm số
                            </div>

                            <div className={styles.scoreInputRow}>
                                <div className={styles.scoreInputGroup}>
                                    <label className={styles.inputLabel}>Tiểu điểm AI (0 – 10)</label>
                                    <InputNumber
                                        className={styles.scoreInput}
                                        min={0}
                                        max={10}
                                        step={0.5}
                                        value={submission?.score ?? null}
                                        disabled
                                        size="large"
                                        precision={1}
                                    />
                                </div>
                                {gradeInfo && submission?.score != null && (
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

                        <div className={styles.commentCard}>
                            <div className={styles.editCardTitle}>
                                <CommentOutlined /> Nhận xét của giáo viên
                            </div>
                            <TextArea
                                className={styles.commentInput}
                                placeholder="Chưa có nhận xét từ giảng viên"
                                rows={5}
                                value={submission?.feedback || ''}
                                readOnly
                                maxLength={500}
                            />
                        </div>

                        <div className={styles.aiFeedbackCard}>
                            <div className={styles.editCardTitle} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span><RobotOutlined /> Phản hồi AI (tham khảo)</span>
                            </div>
                            <div className={styles.aiItems}>
                                {submission?.aiFeedback ? (
                                    <div style={{ whiteSpace: 'pre-wrap', color: '#4b5563', padding: '10px' }}>
                                        {submission.aiFeedback}
                                    </div>
                                ) : (
                                    <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>
                                        {submission?.fileUrl && submission.fileUrl.endsWith('.txt')
                                            ? 'Chưa có nhận xét từ AI. Nhấn nút trên để chấm.'
                                            : 'Chỉnh chấm AI chỉ hỗ trợ file .txt hiện tại.'}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.actionRow}>
                            <Button
                                className={styles.cancelBtn}
                                size="large"
                                icon={<ArrowLeftOutlined />}
                                onClick={handleBack}
                            >
                                Quay lại
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default TeacherGradeEdit;
