import React, { useState } from 'react';
import { Button, Input, Select, Tag, message, Popconfirm, Spin, Modal } from 'antd';
import {
    ArrowLeftOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    InfoCircleOutlined,
    SendOutlined,
    RobotOutlined,
    CommentOutlined,
    HistoryOutlined,
    FileZipOutlined,
    MessageOutlined,
    UndoOutlined,
    CheckCircleFilled,
    CloseCircleFilled,
    BulbOutlined,
    SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '@/layouts/User/MainLayout';
import ModalDefault from '@/components/Modal';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { useMySubmissions, useSubmissionFeedback } from '@/hooks/useSubmission';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

const getGradeLabel = (score) => {
    if (score >= 9) return { label: 'Xuất sắc', color: '#48bb78' };
    if (score >= 8) return { label: 'Giỏi', color: '#3182ce' };
    if (score >= 6.5) return { label: 'Khá', color: '#d69e2e' };
    if (score >= 5) return { label: 'Trung bình', color: '#e53e3e' };
    return { label: 'Yếu', color: '#c53030' };
};

const GradeFeedback = () => {
    const navigate = useNavigate();
    const { id, assignmentId } = useParams();
    const [content, setContent] = useState("");
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    const { mySubmissions, isLoading: isMySubsLoading } = useMySubmissions();

    const submission = React.useMemo(() => {
        return mySubmissions.find(sub => {
            const subAssignId = sub.assignment?._id || sub.assignment?.id || sub.assignment;
            return String(subAssignId) === String(assignmentId);
        });
    }, [mySubmissions, assignmentId]);

    const { sendFeedback, isSending, deleteFeedback, isDeleting } = useSubmissionFeedback(submission?.id || submission?._id);

    const handleBack = () => {
        navigate(`/classes/${id}/assignments/${assignmentId}/result`);
    };

    const handleDeleteFeedback = async () => {
        try {
            await deleteFeedback();
            message.success("Đã thu hồi yêu cầu phúc khảo");
        } catch (err) {
            message.error(err.message || 'Thu hồi thất bại');
        }
    };

    const handleSubmit = async () => {
        if (!content.trim()) {
            message.warning("Vui lòng điền nội dung thắc mắc!");
            return;
        }

        try {
            await sendFeedback({ content: content });
            setIsSuccessModalOpen(true);
        } catch (err) {
            message.error(err.message || 'Gửi yêu cầu thất bại');
        }
    };

    if (isMySubsLoading) {
        return <MainLayout><div style={{ padding: '100px 0', textAlign: 'center' }}><Spin size="large" /></div></MainLayout>;
    }

    if (!submission) {
        return (
            <MainLayout>
                <div style={{ padding: '100px 0', textAlign: 'center' }}>
                    <h2>Không tìm thấy bài nộp cho bài tập này.</h2>
                    <Button onClick={() => navigate('/classes')}>Quay lại lớp học</Button>
                </div>
            </MainLayout>
        );
    }

    const gradeInfo = getGradeLabel(submission?.score);
    const isFeedbackSent = submission?.feedbackStatus && submission?.feedbackStatus !== 'NONE';

    const assignment = submission.assignment;

    return (
        <MainLayout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <div className={styles.backBtn} onClick={handleBack}>
                            <ArrowLeftOutlined />
                        </div>
                        <div className={styles.titleInfo}>
                            <div className={styles.mainTitleRow}>
                                <h1>Gửi thắc mắc / Phúc khảo</h1>
                                <Tag className={styles.tag}>{assignment?.courseId?.courseCode || id}</Tag>
                            </div>
                            <div className={styles.subTitle}>{assignment?.title || 'BÀI TẬP'}</div>
                            <div className={styles.breadcrumbs}>
                                <span>Lớp học phần</span>
                                <span className={styles.separator}>&gt;</span>
                                <span>{assignment?.courseId?.courseName || id}</span>
                                <span className={styles.separator}>&gt;</span>
                                <span>Chi tiết điểm</span>
                                <span className={styles.separator}>&gt;</span>
                                <span className={styles.current}>Phúc khảo</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.mainLayout}>
                    {/* Left Column: Result Summary */}
                    <div className={styles.leftCol}>
                        <div className={styles.summaryCard}>
                            <h2>Tóm tắt kết quả</h2>

                            <div className={styles.scoreBox}>
                                <div className={styles.label}>ĐIỂM HIỆN TẠI</div>
                                <div className={styles.valueRow}>
                                    <div className={styles.scoreValue}>
                                        <span className={styles.main}>{submission?.score ?? '—'}</span>
                                        <span className={styles.total}>/ {assignment?.maxScore || 10}</span>
                                    </div>
                                    {gradeInfo && <Tag className={styles.statusTag} style={{ background: gradeInfo.color + '20', color: gradeInfo.color }}>{gradeInfo.label}</Tag>}
                                </div>
                                <Button 
                                    type="link" 
                                    icon={<BookOutlined />} 
                                    style={{ marginTop: 8, padding: 0 }}
                                    onClick={() => navigate(`/classes/${id}?tab=grades`)}
                                >
                                    Xem toàn bộ bảng điểm học phần
                                </Button>
                            </div>

                            <div className={styles.section}>
                                <div className={styles.sectionTitle}>
                                    <RobotOutlined /> Phản hồi từ AI
                                </div>
                                <div className={styles.aiFeedbackBox}>
                                    {submission?.aiFeedbackData ? (
                                        <div className={styles.aiStructuredBox}>
                                            {submission.aiFeedbackData.summary && (
                                                <div className={styles.aiSummary}>
                                                    {submission.aiFeedbackData.summary}
                                                </div>
                                            )}

                                            {submission.aiFeedbackData.strengths?.length > 0 && (
                                                <div className={styles.aiSection}>
                                                    <div className={clsx(styles.aiSectionTitle, styles.pros)}>
                                                        <SafetyCertificateOutlined /> Ưu điểm
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
                                                    <div className={clsx(styles.aiSectionTitle, styles.cons)}>
                                                        <CloseCircleFilled /> Cần cải thiện
                                                    </div>
                                                    <div className={styles.aiErrorList}>
                                                        {(() => {
                                                            const getSeverity = (err) => {
                                                                const text = (err.issue + ' ' + (err.type || '')).toLowerCase();
                                                                if (text.includes('warning') || text.includes('cảnh báo') || text.includes('nên')) return 'warning';
                                                                if (text.includes('suggestion') || text.includes('gợi ý') || text.includes('tối ưu')) return 'suggestion';
                                                                return 'error';
                                                            };

                                                            return submission.aiFeedbackData.errors.slice(0, 5).map((err, idx) => {
                                                                const severity = getSeverity(err);
                                                                return (
                                                                    <div key={idx} className={clsx(styles.aiErrorItem, styles[severity])}>
                                                                        <div className={styles.aiErrorHeader}>
                                                                            <Tag className={styles.aiSeverityTag} color={
                                                                                severity === 'error' ? 'red' : 
                                                                                severity === 'warning' ? 'orange' : 'green'
                                                                            }>
                                                                                {severity === 'error' ? 'LỖI' : 
                                                                                 severity === 'warning' ? 'CẢNH BÁO' : 'GỢI Ý'}
                                                                            </Tag>
                                                                            <span className={styles.aiLocation}>{err.location || `Dòng ${err.line}`}</span>
                                                                        </div>
                                                                        <div className={styles.aiIssueText}>
                                                                            {severity === 'error' ? <CloseCircleFilled style={{ color: '#ef4444' }} /> :
                                                                             severity === 'warning' ? <ExclamationCircleOutlined style={{ color: '#f59e0b' }} /> :
                                                                             <InfoCircleOutlined style={{ color: '#3b82f6' }} />}
                                                                            <span>{err.issue}</span>
                                                                        </div>
                                                                        {err.suggestion && (
                                                                            <div className={styles.aiSuggestion}>
                                                                                <div className={styles.aiSuggestHeader}>Gợi ý:</div>
                                                                                <div className={styles.aiSuggestVal}>{err.suggestion}</div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            });
                                                        })()}
                                                        {submission.aiFeedbackData.errors.length > 5 && (
                                                            <div 
                                                                style={{ 
                                                                    fontSize: '13px', 
                                                                    color: '#3182ce', 
                                                                    textAlign: 'center', 
                                                                    cursor: 'pointer',
                                                                    padding: '8px',
                                                                    background: '#ebf8ff',
                                                                    borderRadius: '8px',
                                                                    fontWeight: 600
                                                                }}
                                                                onClick={() => navigate(`/classes/${id}/assignments/${assignmentId}/result`)}
                                                            >
                                                                Xem chi tiết tất cả {submission.aiFeedbackData.errors.length} nhận xét &gt;
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : submission?.aiFeedback ? (
                                        <div className={styles.feedbackItem} style={{ whiteSpace: 'pre-wrap' }}>
                                            {submission.aiFeedback}
                                        </div>
                                    ) : (
                                        <div className={styles.feedbackItem} style={{ color: '#94a3b8' }}>Chưa có phản hồi từ AI</div>
                                    )}
                                </div>
                            </div>

                            <div className={styles.section}>
                                <div className={styles.sectionTitle}>
                                    <CommentOutlined /> Nhận xét GV
                                </div>
                                <div className={styles.teacherCommentBox}>
                                    {submission?.feedback || "Chưa có nhận xét từ giảng viên"}
                                </div>
                            </div>

                            <div className={styles.metaInfo}>
                                <div className={styles.metaItem}>
                                    <HistoryOutlined /> Đã nộp: {submission?.createdAt ? dayjs(submission.createdAt).format('DD/MM/YYYY HH:mm') : '—'}
                                </div>
                                <div className={styles.metaItem}>
                                    <FileZipOutlined /> {submission?.fileUrl ? 'Đã tải bài nộp' : 'Chưa nộp bài'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Feedback Form or Result */}
                    <div className={styles.rightCol}>
                        {isFeedbackSent ? (
                            <div className={styles.feedbackDisplay}>
                                <div className={styles.formHeader} style={{ background: '#f8fafc' }}>
                                    <div className={styles.iconBox} style={{ background: '#3182ce' }}>
                                        <HistoryOutlined style={{ color: '#fff' }} />
                                    </div>
                                    <div className={styles.headerInfo}>
                                        <h3>Lịch sử phúc khảo</h3>
                                        <p>Theo dõi tiến độ giải quyết thắc mắc của bạn</p>
                                    </div>
                                </div>

                                <div className={styles.displayBody} style={{ padding: '24px' }}>
                                    <div className={styles.inquirySection} style={{ marginBottom: '32px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                            <h4 style={{ color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <MessageOutlined /> Bạn đã gửi:
                                            </h4>
                                        </div>
                                        <div style={{ padding: '16px', background: '#f1f5f9', borderRadius: '12px', lineHeight: '1.6' }}>
                                            {submission.studentFeedback?.content}
                                            <div style={{ marginTop: '8px', fontSize: '12px', color: '#64748b' }}>
                                                Gửi lúc: {dayjs(submission.studentFeedback?.submittedAt).format('DD/MM/YYYY HH:mm')}
                                            </div>
                                        </div>

                                        {submission.feedbackStatus !== 'RESOLVED' && (
                                            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                                                <Popconfirm
                                                    title="Xác nhận thu hồi yêu cầu"
                                                    description="Sau khi thu hồi, giảng viên sẽ không còn thấy yêu cầu này trong danh sách chờ xử lý."
                                                    overlayClassName="customPopconfirm"
                                                    onConfirm={handleDeleteFeedback}
                                                    okText="Đồng ý"
                                                    cancelText="Hủy"
                                                    okButtonProps={{ danger: true, loading: isDeleting }}
                                                >
                                                    <Button
                                                        type="primary"
                                                        danger
                                                        icon={<UndoOutlined />}
                                                        loading={isDeleting}
                                                    >
                                                        Thu hồi yêu cầu
                                                    </Button>
                                                </Popconfirm>
                                            </div>
                                        )}
                                    </div>

                                    <div className={styles.replySection}>
                                        <h4 style={{
                                            color: submission.feedbackStatus === 'RESOLVED' ? '#059669' : '#d97706',
                                            marginBottom: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <CommentOutlined /> {submission.feedbackStatus === 'RESOLVED' ? 'Giảng viên trả lời:' : 'Đang chờ giảng viên...'}
                                        </h4>
                                        <div style={{
                                            padding: '16px',
                                            background: submission.feedbackStatus === 'RESOLVED' ? '#f0fdf4' : '#fffbeb',
                                            borderRadius: '12px',
                                            lineHeight: '1.6',
                                            border: `1px solid ${submission.feedbackStatus === 'RESOLVED' ? '#bbf7d0' : '#fef3c7'}`,
                                            minHeight: '80px',
                                            fontStyle: submission.feedbackStatus === 'RESOLVED' ? 'normal' : 'italic',
                                            fontSize: '14px'
                                        }}>
                                            {submission.lecturerReply?.content || (submission.feedbackStatus === 'RESOLVED' ? 'Giảng viên đã xem và giải quyết yêu cầu của bạn.' : 'Giảng viên đang xem xét thắc mắc của bạn. Vui lòng chờ đợi.')}
                                            {submission.feedbackStatus === 'RESOLVED' && (
                                                <div style={{ marginTop: '8px', fontSize: '12px', color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <CheckCircleOutlined /> Đã giải quyết xong
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className={styles.formHeader}>
                                    <div className={styles.iconBox}>
                                        <MessageOutlined />
                                    </div>
                                    <div className={styles.headerInfo}>
                                        <h3>Nội dung thắc mắc</h3>
                                        <p>Vui lòng điền đầy đủ thông tin để được hỗ trợ nhanh nhất</p>
                                    </div>
                                </div>

                                <div className={styles.formBody}>
                                    <div className={styles.field}>
                                        <label>Chi tiết thắc mắc <span className={styles.required}>*</span></label>
                                        <TextArea
                                            rows={12}
                                            placeholder="Trình bày rõ ràng vấn đề bạn đang gặp phải, ví dụ: Code em chạy đúng trên máy cá nhân nhưng AI báo lỗi..."
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            maxLength={1000}
                                            showCount={{
                                                formatter: ({ count, maxLength }) => (
                                                    <span style={{ color: '#94a3b8' }}>{`${count}/${maxLength} ký tự`}</span>
                                                ),
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className={styles.formFooter}>
                                    <Button className={styles.cancelBtn} onClick={handleBack}>Hủy</Button>
                                    <Button
                                        type="primary"
                                        className={styles.submitBtn}
                                        icon={<SendOutlined />}
                                        loading={isSending}
                                        onClick={handleSubmit}
                                    >
                                        Gửi yêu cầu
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <ModalDefault
                    isModalOpen={isSuccessModalOpen}
                    handleCancel={() => setIsSuccessModalOpen(false)}
                    width={560}
                >
                    <div className={styles.successModal}>
                        <div className={styles.iconCircle}>
                            <CheckCircleOutlined />
                        </div>
                        <h3>Gửi yêu cầu thành công!</h3>
                        <p className={styles.desc}>
                            Yêu cầu phúc khảo cho bài tập <strong>{assignment?.title}</strong> đã được gửi đến Giảng viên. Chúng tôi sẽ thông báo cho bạn ngay khi có kết quả.
                        </p>

                        <div className={styles.infoTable}>
                            <div className={styles.infoRow}>
                                <label>Mã yêu cầu (Ticket ID)</label>
                                <span className={styles.ticketId}>#PK-{assignmentId.slice(-4)}-{submission?.id?.slice(-4)}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <label>Thời gian gửi</label>
                                <span>{dayjs().format('DD/MM/YYYY HH:mm')}</span>
                            </div>
                        </div>

                        <div className={styles.modalActions}>
                            <Button
                                className={styles.dashboardBtn}
                                onClick={() => navigate('/dashboard')}
                            >
                                Quay lại dashboard
                            </Button>
                            <Button
                                className={styles.progressBtn}
                                onClick={() => setIsSuccessModalOpen(false)}
                            >
                                Xem tiến độ
                            </Button>
                        </div>
                    </div>
                </ModalDefault>
            </div>
        </MainLayout>
    );
};

export default GradeFeedback;
