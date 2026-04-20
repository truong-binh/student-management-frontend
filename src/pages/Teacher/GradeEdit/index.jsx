import React from 'react';
import { Button, Input, InputNumber, Tag, message, Spin, Popconfirm, Modal } from 'antd';
import {
    ArrowLeftOutlined,
    InfoCircleOutlined,
    ExclamationCircleOutlined,
    RobotOutlined,
    CommentOutlined,
    FileZipOutlined,
    CloudDownloadOutlined,
    EditOutlined,
    UserOutlined,
    ReadOutlined,
    MessageOutlined,
    CalendarOutlined,
    CheckCircleFilled,
    CloseCircleFilled,
    BulbOutlined,
    SafetyCertificateOutlined,
    FullscreenOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import MainLayout from '@/layouts/User/MainLayout';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { useAssignmentDetail } from '@/hooks/useCourseAssignment';
import { useCourseDetail } from '@/hooks/useCourse';
import { useSubmissionDetail, useSubmissionFeedback } from '@/hooks/useSubmission';
import AICodeReview from '@/components/AICodeReview';

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
    const { data: courseData } = useCourseDetail(id);


    const gradeInfo = getGradeLabel(submission?.score);

    const [newScore, setNewScore] = React.useState(null);
    const [replyText, setReplyText] = React.useState('');
    const [fileContent, setFileContent] = React.useState('');
    const [isFetchingFile, setIsFetchingFile] = React.useState(false);
    const [isCodeModalOpen, setIsCodeModalOpen] = React.useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState(false);
    const { replyFeedback, isReplying, updateScore, isUpdatingScore } = useSubmissionFeedback(studentId);

    React.useEffect(() => {
        const fetchFileContent = async () => {
            if (submission?.fileUrl) {
                setIsFetchingFile(true);
                try {
                    const response = await fetch(submission.fileUrl);
                    const text = await response.text();
                    setFileContent(text);
                } catch (error) {
                    console.error('Error fetching file content:', error);
                    setFileContent('Không thể tải nội dung file.');
                } finally {
                    setIsFetchingFile(false);
                }
            }
        };

        fetchFileContent();

        if (submission?.lecturerReply?.content) {
            setReplyText(submission.lecturerReply.content);
        } else if (submission?.instructorReply) {
            
            setReplyText(submission.instructorReply);
        }

        if (submission?.score !== undefined && submission?.score !== null) {
            setNewScore(submission.score);
        }
    }, [submission]);

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

    const handleUpdateScore = async () => {
        try {
            await updateScore({ score: newScore });
            message.success('Cập nhật điểm số thành công!');
            setIsConfirmModalOpen(false);
        } catch (error) {
            message.error(error?.message || 'Lỗi khi cập nhật điểm số');
        }
    };

    const handleReply = async () => {
        if (!replyText.trim()) {
            message.warning('Vui lòng nhập nội dung phản hồi!');
            return;
        }
        try {
            if (newScore !== null && newScore !== submission?.score) {
                await updateScore({ score: newScore });
            }
            await replyFeedback({ content: replyText });
            message.success('Cập nhật điểm và gửi phản hồi thành công!');
        } catch (error) {
            message.error(error?.message || 'Có lỗi khi gửi phản hồi');
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

    const isPending = submission.feedbackStatus === 'PENDING';
    const isResolved = submission.feedbackStatus === 'RESOLVED';
    const courseName = courseData?.courseName || assignment?.course?.courseName || assignment?.courseId?.courseName || id;

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
                                <h1>{isPending || isResolved ? 'Phản hồi khiếu nại' : 'Sửa điểm bài tập'}</h1>
                            </div>
                            <div className={styles.subTitle}>
                                {assignment?.title}
                            </div>
                            <div className={styles.breadcrumbs}>
                                <span>Lớp học</span>
                                <span className={styles.separator}>&gt;</span>
                                <span>{courseName}</span>
                                <span className={styles.separator}>&gt;</span>
                                <span>DS bài tập</span>
                                <span className={styles.separator}>&gt;</span>
                                <span>Chi tiết</span>
                                <span className={styles.separator}>&gt;</span>
                                <span className={styles.current}>{isPending || isResolved ? 'Phản hồi' : 'Sửa điểm'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.mainLayout}>
                    <div className={styles.leftCol}>
                        <div className={styles.studentCard}>
                            <div className={styles.cardTitle}>
                                <UserOutlined style={{ color: '#b71c1c' }} /> Thông tin sinh viên
                            </div>
                            <div className={styles.avatarRow}>
                                <span
                                    className={styles.avatar}
                                    style={{ background: '#b71c1c' }}
                                >
                                    {(submission?.student?.fullName || submission?.student?.username || 'S').charAt(0).toUpperCase()}
                                </span>
                                <div className={styles.studentMeta}>
                                    <div className={styles.studentName}>{submission?.student?.fullName || submission?.student?.username}</div>
                                    <div className={styles.studentMsv}>MSV: {submission?.student?.userCode || '-'}</div>
                                    <Tag className={styles.gradedTag}>
                                        {isPending ? 'ĐANG KHIẾU NẠI' : isResolved ? 'ĐÃ GIẢI QUYẾT' : 'ĐÃ CHẤM'}
                                    </Tag>
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
                                <>
                                    <div className={styles.fileItem} style={{ marginBottom: fileContent ? 16 : 0 }}>
                                        <FileZipOutlined className={styles.fileIcon} />
                                        <div className={styles.fileInfo}>
                                            <div className={styles.fileName}>{decodeURIComponent(submission.fileUrl.split('/').pop().split('?')[0])}</div>
                                            <div className={styles.fileMeta}>Nộp lúc: {dayjs(submission.createdAt).format('DD/MM/YYYY')}</div>
                                        </div>
                                        <CloudDownloadOutlined className={styles.downloadIcon} onClick={() => window.open(submission.fileUrl, '_blank')} style={{ cursor: 'pointer' }} />
                                    </div>
                                    {isFetchingFile ? (
                                        <div style={{ padding: '20px', textAlign: 'center' }}><Spin size="small" tip="Đang đọc nội dung file..." /></div>
                                    ) : fileContent ? (
                                        <div className={styles.codePreview}>
                                            <div className={styles.codeHeader} onClick={() => setIsCodeModalOpen(true)} style={{ cursor: 'pointer' }}>
                                                <span>Nội dung mã nguồn</span>
                                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                    <Tag color="blue">Preview</Tag>
                                                    <FullscreenOutlined style={{ fontSize: 14 }} />
                                                </div>
                                            </div>
                                            <div className={styles.codeBackground}>
                                                <pre className={styles.preCode}>
                                                    <code>
                                                        {fileContent.split('\n').map((line, idx) => (
                                                            <div key={idx} className={styles.codeLine}>
                                                                <span className={styles.lineNumber}>{idx + 1}</span>
                                                                <span className={styles.lineText}>{line}</span>
                                                            </div>
                                                        ))}
                                                    </code>
                                                </pre>
                                            </div>
                                        </div>
                                    ) : null}
                                </>
                            ) : (
                                <div style={{ padding: '10px', color: '#9ca3af' }}>Không có file bài nộp</div>
                            )}
                        </div>
                    </div>

                    <div className={styles.rightCol}>
                        {(isPending || isResolved) && (
                            <div className={styles.commentCard} style={{ border: '1px solid #fecaca', background: '#fff5f5', marginBottom: 24 }}>
                                <div className={styles.editCardTitle} style={{ color: '#dc2626' }}>
                                    <MessageOutlined style={{ marginRight: 8 }} /> Sinh viên gửi thắc mắc
                                </div>
                                <div style={{
                                    padding: '16px',
                                    background: '#fff',
                                    borderRadius: '8px',
                                    border: '1px solid #fee2e2',
                                    color: '#4b5563',
                                    fontSize: '14px',
                                    lineHeight: '1.6'
                                }}>
                                    {submission.studentFeedback?.content || 'Không có nội dung chi tiết.'}
                                </div>
                            </div>
                        )}

                        <div className={styles.commentCard}>
                            <div className={styles.editCardTitle}>
                                <CommentOutlined /> {isPending || isResolved ? 'Câu trả lời của Giảng viên' : 'Nhận xét của giáo viên'}
                            </div>
                            <TextArea
                                className={styles.commentInput}
                                placeholder={isPending ? "Nhập câu trả lời cho sinh viên..." : "Chưa có nhận xét từ giảng viên"}
                                rows={5}
                                value={isPending || isResolved ? replyText : (submission?.feedback || '')}
                                onChange={e => setReplyText(e.target.value)}
                                readOnly={isResolved || (!isPending && !isResolved)}
                                maxLength={500}
                            />
                            {isPending && (
                                <div style={{ marginTop: 16, textAlign: 'right' }}>
                                    <Popconfirm
                                        title="Xác nhận gửi phản hồi"
                                        description={newScore !== null && newScore !== submission?.score
                                            ? `Bạn sẽ gửi phản hồi và cập nhật điểm thành ${newScore}. Tiếp tục?`
                                            : "Xác nhận gửi nội dung phản hồi này?"}
                                        overlayClassName="customPopconfirm"
                                        onConfirm={handleReply}
                                        okText="Xác nhận"
                                        cancelText="Hủy"
                                    >
                                        <Button
                                            type="primary"
                                            danger
                                            icon={<MessageOutlined />}
                                            loading={isReplying || isUpdatingScore}
                                        >
                                            Gửi phản hồi cho sinh viên
                                        </Button>
                                    </Popconfirm>
                                </div>
                            )}
                        </div>

                        <div className={styles.editCard}>
                            <div className={styles.editCardTitle}>
                                <EditOutlined /> {isPending || isResolved ? 'Cập nhật điểm phúc khảo' : 'Sửa điểm bài làm'}
                            </div>

                            <div className={styles.scoreInputRow}>
                                <div className={styles.scoreInputGroup}>
                                    <label className={styles.inputLabel}>Điểm bài nộp (0 – 10)</label>
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

                            {!isPending && !isResolved && (
                                <div style={{ marginTop: 24, textAlign: 'right' }}>
                                    <Button
                                        type="primary"
                                        danger
                                        size="large"
                                        icon={<EditOutlined />}
                                        loading={isUpdatingScore}
                                        disabled={newScore === submission?.score}
                                        onClick={() => setIsConfirmModalOpen(true)}
                                    >
                                        Cập nhật điểm mới
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className={styles.aiFeedbackCard}>
                            <div className={styles.editCardTitle}>
                                <RobotOutlined /> Phản hồi từ AI (Review chi tiết)
                            </div>
                            <div className={styles.aiBody} style={{ padding: '0 12px 12px' }}>
                                {submission?.aiFeedbackData ? (
                                    <div className={styles.aiStructuredBody}>
                                        {submission.aiFeedbackData.summary && (
                                            <div className={styles.aiSummary} style={{ marginBottom: 16 }}>
                                                {submission.aiFeedbackData.summary}
                                            </div>
                                        )}

                                        {submission.aiFeedbackData.strengths?.length > 0 && (
                                            <div className={styles.aiSection} style={{ marginBottom: 16 }}>
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
                                                <div className={clsx(styles.aiSectionTitle, styles.cons)} style={{ marginBottom: 12 }}>
                                                    <CloseCircleFilled /> Phân tích chi tiết mã nguồn
                                                </div>
                                                
                                                <AICodeReview 
                                                    fileUrl={submission?.fileUrl}
                                                    errors={submission.aiFeedbackData.errors}
                                                    summary={submission.aiFeedbackData.feedback}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ) : submission?.aiFeedback ? (
                                    <div style={{ whiteSpace: 'pre-wrap', color: '#4b5563', padding: '10px', fontSize: 13, lineHeight: '1.6' }}>
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
                    </div>
                </div>
            </div>

            <Modal
                title="Xác nhận chỉnh sửa điểm"
                open={isConfirmModalOpen}
                onOk={handleUpdateScore}
                onCancel={() => setIsConfirmModalOpen(false)}
                okText="Xác nhận cập nhật"
                cancelText="Hủy"
                confirmLoading={isUpdatingScore}
                centered
                wrapClassName={styles.scoreConfirmModal}
            >
                <div className={styles.confirmModalBody}>
                    <div className={styles.confirmModalIntro}>
                        <ExclamationCircleOutlined className={styles.confirmModalIcon} />
                        <p>Bạn có chắc chắn muốn cập nhật điểm số cho sinh viên này không?</p>
                    </div>

                    <div className={styles.confirmScoreDiff}>
                        <div className={styles.confirmScoreItem}>
                            <span className={styles.confirmScoreLabel}>Điểm cũ</span>
                            <span className={styles.confirmScoreOldValue}>{submission?.score ?? 0}</span>
                        </div>
                        <span className={styles.confirmArrow}>→</span>
                        <div className={styles.confirmScoreItem}>
                            <span className={styles.confirmScoreLabel}>Điểm mới</span>
                            <span className={styles.confirmScoreNewValue}>{newScore ?? 0}</span>
                        </div>
                    </div>
                </div>
            </Modal>

            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <RobotOutlined style={{ color: '#3182ce' }} />
                        <span>Xem chi tiết mã nguồn bài nộp - {submission?.student?.fullName}</span>
                    </div>
                }
                open={isCodeModalOpen}
                onCancel={() => setIsCodeModalOpen(false)}
                footer={[
                    <Button key="close" type="primary" onClick={() => setIsCodeModalOpen(false)}>Đóng</Button>
                ]}
                width="90%"
                style={{ top: 20 }}
                bodyStyle={{ padding: 0, background: '#1e293b', borderRadius: '0 0 12px 12px' }}
                destroyOnClose
            >
                <div style={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}>
                    <pre className={styles.preCode} style={{ padding: '24px 0', fontSize: '15px' }}>
                        <code>
                            {fileContent.split('\n').map((line, idx) => (
                                <div key={idx} className={styles.codeLine} style={{ padding: '0 24px' }}>
                                    <span className={styles.lineNumber} style={{ width: 48, paddingRight: 20, marginRight: 20 }}>{idx + 1}</span>
                                    <span className={styles.lineText}>{line}</span>
                                </div>
                            ))}
                        </code>
                    </pre>
                </div>
            </Modal>
        </MainLayout>
    );
};

export default TeacherGradeEdit;
