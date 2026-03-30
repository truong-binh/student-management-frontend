import React from 'react';
import { Button, Tag, Modal } from 'antd';
import {
    ArrowLeftOutlined,
    InfoCircleOutlined,
    CloudDownloadOutlined,
    RobotOutlined,
    FileZipOutlined,
    RollbackOutlined,
    CommentOutlined,
    FilePdfOutlined,
    EyeOutlined,
    CalendarOutlined,
    StarOutlined,
    DownloadOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import MainLayout from '@/layouts/User/MainLayout';
import styles from './styles.module.scss';
import { useAssignmentDetail } from '@/hooks/useCourseAssignment';
import { useMySubmissions } from '@/hooks/useSubmission';

const AssignmentResult = () => {
    const navigate = useNavigate();
    const { id, assignmentId } = useParams();

    const { assignment } = useAssignmentDetail(assignmentId);
    const { mySubmissions } = useMySubmissions();
    const [previewOpen, setPreviewOpen] = React.useState(false);

    const submission = mySubmissions.find(sub => {
        const subAssignmentId = sub.assignment?.id || sub.assignment?._id || sub.assignment;
        return String(subAssignmentId) === String(assignmentId);
    });

    const displayData = assignment || {};

    const handleBack = () => {
        navigate(`/classes/${id}?tab=assignments`);
    };

    const gradeLabel = (score) => {
        if (score == null) return 'Đã nộp';
        if (score >= 9) return 'Xuất sắc';
        if (score >= 8) return 'Giỏi';
        if (score >= 6.5) return 'Khá';
        if (score >= 5) return 'Trung bình';
        return 'Yếu';
    };

    return (
        <MainLayout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.backBtn} onClick={handleBack}>
                        <ArrowLeftOutlined />
                    </div>
                    <div className={styles.titleInfo}>
                        <div className={styles.titleRow}>
                            <h1>Kết quả: {displayData.title || 'Đang tải...'}</h1>
                            <span className={styles.classCode}>{id}</span>
                        </div>
                        <div className={styles.breadcrumbs}>
                            <span>Lớp học phần</span>
                            <span className={styles.separator}>&gt;</span>
                            <span>{id}</span>
                            <span className={styles.separator}>&gt;</span>
                            <span>{displayData.title || 'Bài tập'}</span>
                        </div>
                    </div>
                </div>

                <div className={styles.mainContent}>
                    <div className={styles.leftCol}>
                        <div className={styles.card} style={{ marginBottom: 16 }}>
                            <h3 style={{ marginBottom: 12 }}>Thông tin bài tập</h3>
                            <div style={{ whiteSpace: 'pre-wrap', color: '#4b5563', marginBottom: 16 }}>
                                {displayData.description || 'Không có mô tả.'}
                            </div>

                            {displayData.fileUrl && (
                                <div style={{ padding: '12px 16px', background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                                    <div style={{ width: 40, height: 40, background: '#ebf8ff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3182ce', fontSize: 22 }}>
                                        <FilePdfOutlined />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 600, color: '#2d3748', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {decodeURIComponent(displayData.fileUrl.split('/').pop().split('?')[0])}
                                        </div>
                                        <div style={{ fontSize: 12, color: '#718096' }}>Tài liệu / Yêu cầu đề bài</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                        <Button icon={<EyeOutlined />} size="small" onClick={() => setPreviewOpen(true)}>Xem trước</Button>
                                        <Button icon={<DownloadOutlined />} size="small" type="primary" onClick={() => window.open(displayData.fileUrl, '_blank')}>Tải xuống</Button>
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: 12 }}>
                                <div style={{ flex: 1, padding: '12px 16px', background: '#fff7ed', borderRadius: 10, border: '1px solid #fed7aa' }}>
                                    <div style={{ fontSize: 12, color: '#92400e' }}>Hạn nộp bài</div>
                                    <div style={{ fontWeight: 600, color: '#c2410c', marginTop: 4 }}>
                                        <CalendarOutlined style={{ marginRight: 6 }} />
                                        {displayData.dueDate ? dayjs(displayData.dueDate).format('HH:mm, DD/MM/YYYY') : 'Không có hạn'}
                                    </div>
                                </div>
                                <div style={{ flex: 1, padding: '12px 16px', background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0' }}>
                                    <div style={{ fontSize: 12, color: '#166534' }}>Điểm tối đa</div>
                                    <div style={{ fontWeight: 600, color: '#15803d', marginTop: 4 }}>
                                        <StarOutlined style={{ marginRight: 6 }} />
                                        {displayData.maxScore || 10} điểm
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.scoreCard}>
                            <div className={styles.scoreLabel}>Tổng điểm</div>
                            <div className={styles.scoreCircle}>
                                <span className={styles.value}>{submission?.score != null ? submission.score : '—'}</span>
                                <span className={styles.total}>/ {displayData.maxScore || 10}</span>
                            </div>
                            <Tag className={styles.gradeTag}>{gradeLabel(submission?.score)}</Tag>
                            {submission?.updatedAt && (
                                <div className={styles.gradingDate}>Cập nhật lúc: {dayjs(submission.updatedAt).format('HH:mm DD/MM/YYYY')}</div>
                            )}
                        </div>

                        {submission?.feedback && (
                            <div className={styles.feedbackCard}>
                                <div className={styles.cardTitle}>
                                    <CommentOutlined /> Nhận xét từ Giảng viên
                                </div>
                                <div className={styles.instructorMeta}>
                                    <div className={styles.avatar}>GV</div>
                                    <div className={styles.info}>
                                        <div className={styles.name}>Giảng viên</div>
                                    </div>
                                </div>
                                <div className={styles.commentText}>
                                    "{submission.feedback}"
                                </div>
                            </div>
                        )}

                        {submission?.fileUrl && (
                            <div className={styles.fileCard}>
                                <div className={styles.cardTitle}>BÀI LÀM ĐÃ NỘP</div>
                                <div className={styles.fileItem}>
                                    <FileZipOutlined className={styles.icon} />
                                    <div className={styles.info} style={{ flex: 1 }}>
                                        <div className={styles.name}>{decodeURIComponent(submission.fileUrl.split('/').pop().split('?')[0])}</div>
                                        <div className={styles.meta}>Nộp lúc: {dayjs(submission.createdAt).format('DD/MM/YYYY')}</div>
                                    </div>
                                    <CloudDownloadOutlined className={styles.download} onClick={() => window.open(submission.fileUrl, '_blank')} style={{ cursor: 'pointer' }} />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.rightCol}>
                        <div className={styles.aiFeedbackSection}>
                            <div className={styles.aiHeader}>
                                <div className={styles.aiTitle}>
                                    <RobotOutlined className={styles.icon} />
                                    <div>
                                        Phản hồi từ AI
                                        <span className={styles.subtitle}>Phân tích tự động dựa trên mã nguồn</span>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.aiBody}>
                                {submission?.aiFeedback ? (
                                    <div className={styles.commentText} style={{ whiteSpace: 'pre-wrap', padding: '20px', color: '#4b5563', lineHeight: '1.6' }}>
                                        {submission.aiFeedback}
                                    </div>
                                ) : (
                                    <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                                        <InfoCircleOutlined style={{ fontSize: '24px', marginBottom: '12px' }} /><br />
                                        Chưa có nhận xét chi tiết từ AI cho bài làm này.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.bottomActions}>
                            <Button
                                icon={<CommentOutlined />}
                                size="large"
                                onClick={() => navigate(`/classes/${id}/assignments/${assignmentId}/feedback`)}
                            >
                                Gửi thắc mắc / Phúc khảo
                            </Button>
                            <Button type="primary" danger icon={<RollbackOutlined />} size="large" onClick={handleBack}>
                                Quay lại danh sách
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                title="Xem trước tài liệu đề bài"
                open={previewOpen}
                onCancel={() => setPreviewOpen(false)}
                footer={null}
                width={860}
                centered
                destroyOnClose
            >
                {displayData?.fileUrl && (
                    <iframe
                        src={
                            displayData.fileUrl.match(/\.(png|jpe?g)$/i)
                                ? displayData.fileUrl
                                : `https://docs.google.com/viewer?url=${encodeURIComponent(displayData.fileUrl)}&embedded=true`
                        }
                        width="100%"
                        height="600px"
                        style={{ border: 'none', borderRadius: 8, background: '#f8f9fa' }}
                        title="Document Preview"
                    />
                )}
            </Modal>
        </MainLayout>
    );
};

export default AssignmentResult;
