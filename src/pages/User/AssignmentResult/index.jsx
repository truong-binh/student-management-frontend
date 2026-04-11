import React from 'react';
import { Button, Tag, Modal, Spin } from 'antd';
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
    FullscreenOutlined,
    FileTextOutlined,
} from '@ant-design/icons';
import { getFilePresentation, getFileNameFromUrl, decodePotentialMojibake } from '@/utils/filePresentation';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import MainLayout from '@/layouts/User/MainLayout';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { useAssignmentDetail } from '@/hooks/useCourseAssignment';
import { useCourseDetail } from '@/hooks/useCourse';
import { useMySubmissions } from '@/hooks/useSubmission';
import {
    CheckCircleFilled,
    CloseCircleFilled,
    BulbOutlined,
    SafetyCertificateOutlined,
} from '@ant-design/icons';
import AICodeReview from '@/components/AICodeReview';

const AssignmentResult = () => {
    const navigate = useNavigate();
    const { id, assignmentId } = useParams();

    const { assignment } = useAssignmentDetail(assignmentId);
    const { data: courseData } = useCourseDetail(id);
    const { mySubmissions } = useMySubmissions();
    const [previewOpen, setPreviewOpen] = React.useState(false);

    const submission = mySubmissions.find(sub => {
        const subAssignmentId = sub.assignment?.id || sub.assignment?._id || sub.assignment;
        return String(subAssignmentId) === String(assignmentId);
    });

    const displayData = assignment || {};
    const courseName = courseData?.courseName || displayData.course?.courseName || displayData.courseId?.courseName || id;

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
                        </div>
                        <div className={styles.breadcrumbs}>
                            <span>Lớp học phần</span>
                            <span className={styles.separator}>&gt;</span>
                            <span>{courseName}</span>
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
                                <div className={styles.fileList} style={{ marginBottom: 16 }}>
                                    {(() => {
                                        const fileName = getFileNameFromUrl(displayData.fileUrl);
                                        const pres = getFilePresentation(fileName);
                                        return (
                                            <div className={styles.fileItem} style={{ border: '1px solid #e2e8f0' }}>
                                                <div className={styles.fileInfo}>
                                                    <div className={styles.fileIcon} style={{ background: pres.iconBg, color: pres.iconColor }}>
                                                        {pres.icon}
                                                    </div>
                                                    <div className={styles.fileMeta}>
                                                        <div className={styles.fileName}>{fileName}</div>
                                                        <div className={styles.fileSize}>
                                                            {(fileName.split('.').pop() || 'file').toUpperCase()} • Tài liệu / Yêu cầu đề bài
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    <Button
                                                        icon={<EyeOutlined />}
                                                        size="small"
                                                        onClick={() => setPreviewOpen(true)}
                                                        style={{ border: 'none', background: 'transparent', color: '#64748b' }}
                                                    />
                                                    <DownloadOutlined
                                                        className={styles.downloadBtn}
                                                        onClick={() => window.open(displayData.fileUrl, '_blank')}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })()}
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

                        <div className={styles.feedbackCard}>
                            <div className={styles.cardTitle}>
                                <CommentOutlined /> Nhận xét từ Giảng viên
                            </div>
                            <div className={styles.instructorMeta}>
                                <div className={styles.avatar}>GV</div>
                                <div className={styles.info}>
                                    <div className={styles.name}>Giảng viên phụ trách</div>
                                </div>
                            </div>
                            <div className={styles.commentText}>
                                {submission?.feedback ? `"${submission.feedback}"` : "Giảng viên chưa có nhận xét thêm cho bài làm này."}
                            </div>
                        </div>

                        <div className={styles.fileCard}>
                            <div className={styles.cardTitle}>DANH SÁCH BÀI LÀM ĐÃ NỘP</div>
                            <div className={styles.fileList}>
                                {(() => {
                                    const files = submission?.files || [];
                                    const fallbackUrls = submission?.attachments || submission?.fileUrls || (submission?.fileUrl ? [submission.fileUrl] : []);
                                    
                                    if (files.length === 0 && fallbackUrls.length === 0) {
                                        return <div style={{ color: '#9ca3af', padding: '12px' }}>Không tìm thấy file bài nộp.</div>;
                                    }

                                    const allFiles = files.length > 0 
                                        ? files.map(f => ({ url: f.fileUrl, name: f.fileName }))
                                        : fallbackUrls.map(url => ({ url, name: getFileNameFromUrl(url) }));

                                    return allFiles.map((file, index) => {
                                        const pres = getFilePresentation(file.name);
                                        return (
                                            <div className={styles.fileItem} key={index}>
                                                <div className={styles.fileInfo}>
                                                    <div className={styles.fileIcon} style={{ background: pres.iconBg, color: pres.iconColor }}>
                                                        {pres.icon}
                                                    </div>
                                                    <div className={styles.fileMeta}>
                                                        <div className={styles.fileName}>{decodePotentialMojibake(file.name)}</div>
                                                        <div className={styles.fileSize}>
                                                            {(file.name.split('.').pop() || 'file').toUpperCase()} • Nộp ngày {dayjs(submission.createdAt).format('DD/MM/YYYY')}
                                                        </div>
                                                    </div>
                                                </div>
                                                <DownloadOutlined
                                                    className={styles.downloadBtn}
                                                    onClick={() => window.open(file.url, '_blank')}
                                                />
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>
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
                                {submission?.aiFeedbackData ? (
                                    <div className={styles.aiStructuredBody}>
                                        {submission.aiFeedbackData.summary && (
                                            <div className={styles.aiSummary}>
                                                {submission.aiFeedbackData.summary}
                                            </div>
                                        )}

                                        {submission.aiFeedbackData.strengths?.length > 0 && (
                                            <div className={styles.aiSection}>
                                                <div className={clsx(styles.aiSectionTitle, styles.pros)}>
                                                    <SafetyCertificateOutlined /> Ưu điểm của bài làm
                                                </div>
                                                {submission.aiFeedbackData.strengths.map((str, idx) => (
                                                    <div key={idx} className={styles.aiStrengthItem}>
                                                        <CheckCircleFilled className={styles.aiIconSuccess} />
                                                        <span>{str}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {submission.aiFeedbackData.errors?.length > 0 && (
                                            <div className={styles.aiSection}>
                                                <div className={clsx(styles.aiSectionTitle, styles.cons)} style={{ marginBottom: 0 }}>
                                                    <CloseCircleFilled /> Phân tích chi tiết mã nguồn
                                                </div>
                                                
                                                <AICodeReview 
                                                    fileUrl={
                                                        submission?.files?.[0]?.fileUrl ||
                                                        submission?.attachments?.[0] || 
                                                        submission?.fileUrls?.[0] || 
                                                        submission?.fileUrl
                                                    }
                                                    errors={submission.aiFeedbackData.errors}
                                                    summary={submission.aiFeedbackData.feedback}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ) : submission?.aiFeedback ? (
                                    <div className={styles.commentText} style={{ whiteSpace: 'pre-wrap', padding: '10px', color: '#4b5563', lineHeight: '1.6' }}>
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
