import React, { useState } from 'react';
import { Button, Upload, Table, Tag, Modal, message } from 'antd';
import {
    ArrowLeftOutlined,
    FilePdfOutlined,
    DownloadOutlined,
    CalendarOutlined,
    StarOutlined,
    InboxOutlined,
    FileTextOutlined,
    FolderOpenOutlined,
    FileAddOutlined,
    WarningOutlined,
    FileZipOutlined,
    CloudUploadOutlined,
    EyeOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import clsx from 'clsx';
import dayjs from 'dayjs';
import MainLayout from '@/layouts/User/MainLayout';
import styles from './styles.module.scss';
import { useAssignmentDetail } from '@/hooks/useCourseAssignment';
import { useMySubmissions, useStudentSubmissions } from '@/hooks/useSubmission';

const { Dragger } = Upload;

const AssignmentSubmit = () => {
    const navigate = useNavigate();
    const { id, assignmentId } = useParams();

    const { assignment: detailData, isLoading: isDetailLoading } = useAssignmentDetail(assignmentId);
    const { mySubmissions, isLoading: isSubmissionsLoading } = useMySubmissions();
    const { submitAssignment, isSubmitting } = useStudentSubmissions(assignmentId);

    const [fileToUpload, setFileToUpload] = useState(null);
    const [previewOpen, setPreviewOpen] = useState(false);

    const submission = React.useMemo(() => {
        if (!mySubmissions) return null;
        return mySubmissions.find(sub => (sub.assignment?.id || sub.assignment?._id || sub.assignment) === assignmentId);
    }, [mySubmissions, assignmentId]);

    const displayData = detailData || {};

    const [timeLeft, setTimeLeft] = useState(null);

    React.useEffect(() => {
        if (!displayData.dueDate) return;

        const interval = setInterval(() => {
            const now = dayjs();
            const due = dayjs(displayData.dueDate);
            const diff = due.diff(now);

            if (diff <= 0) {
                setTimeLeft('Overdue');
                clearInterval(interval);
            } else {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((diff / 1000 / 60) % 60);
                const seconds = Math.floor((diff / 1000) % 60);

                setTimeLeft({
                    days: days.toString().padStart(2, '0'),
                    hours: hours.toString().padStart(2, '0'),
                    minutes: minutes.toString().padStart(2, '0'),
                    seconds: seconds.toString().padStart(2, '0')
                });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [displayData.dueDate]);

    const historyData = submission ? [
        {
            key: submission.id || submission._id,
            fileName: submission.fileUrl ? decodeURIComponent(submission.fileUrl.split('/').pop().split('?')[0]) : 'Bài nộp',
            submitTime: dayjs(submission.createdAt).format('DD/MM/YYYY - HH:mm'),
            size: '-',
            status: 'success',
            fileUrl: submission.fileUrl
        }
    ] : [];

    const columns = [
        {
            title: 'Tên File',
            dataIndex: 'fileName',
            key: 'fileName',
            render: (text) => (
                <div className={styles.fileCell}>
                    {text.endsWith('.zip') ? (
                        <FileZipOutlined className={styles.icon} />
                    ) : (
                        <FileTextOutlined className={styles.icon} />
                    )}
                    {text}
                </div>
            ),
        },
        {
            title: 'Thời gian nộp',
            dataIndex: 'submitTime',
            key: 'submitTime',
        },
        {
            title: 'Kích thước',
            dataIndex: 'size',
            key: 'size',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: () => (
                <Tag color="success" style={{ borderRadius: '4px' }}>Đã tải lên</Tag>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <div className={styles.actionCell}>
                    <span className={styles.download} onClick={() => window.open(record.fileUrl, '_blank')} style={{ cursor: 'pointer', color: '#3182ce' }}>Tải xuống</span>
                </div>
            ),
        },
    ];

    const handleBack = () => {
        navigate(`/classes/${id}?tab=assignments`);
    };

    const uploadProps = {
        name: 'file',
        multiple: false,
        beforeUpload: (file) => {
            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M) {
                message.error('File nộp phải nhỏ hơn 5MB!');
                return Upload.LIST_IGNORE;
            }
            setFileToUpload(file);
            return false;
        },
        onRemove: () => {
            setFileToUpload(null);
        },
        maxCount: 1,
        fileList: fileToUpload ? [fileToUpload] : [],
    };

    const handleSubmit = async () => {
        if (!fileToUpload) {
            message.warning('Vui lòng chọn file để nộp!');
            return;
        }
        try {
            const formData = new FormData();
            formData.append('file', fileToUpload);
            await submitAssignment(formData);
            message.success('Nộp bài thành công!');
            setFileToUpload(null);
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi khi nộp bài');
        }
    };

    return (
        <>
            <MainLayout>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <div className={styles.backBtn} onClick={handleBack}>
                            <ArrowLeftOutlined />
                        </div>
                        <div className={styles.titleInfo}>
                            <div className={styles.titleRow}>
                                <h1>{displayData.title || 'Đang tải...'}</h1>
                                <span className={styles.classCode}>{id}</span>
                            </div>
                            <div className={styles.breadcrumbs}>
                                <span>Lớp học phần</span>
                                <span className={styles.separator}>&gt;</span>
                                <span>{id}</span>
                                <span className={styles.separator}>&gt;</span>
                                <span>Nộp bài</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.mainContent}>
                        <div className={styles.leftCol}>
                            <div className={styles.card}>
                                <h3>Thông tin bài tập</h3>
                                <div className={styles.assignmentDescription}>
                                    <div style={{ whiteSpace: 'pre-wrap' }}>{displayData.description || 'Không có mô tả cho bài tập này.'}</div>
                                </div>

                                {displayData.fileUrl && (
                                    <div style={{ padding: '12px 16px', background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 16, marginTop: 16 }}>
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

                                <div className={styles.infoGrid} style={{ marginTop: '24px' }}>
                                    <div className={clsx(styles.infoBox, styles.deadline)}>
                                        <span className={styles.label}>Hạn nộp bài</span>
                                        <span className={styles.value}>
                                            <CalendarOutlined /> {displayData.dueDate ? dayjs(displayData.dueDate).format('HH:mm, DD/MM/YYYY') : 'Không có hạn'}
                                        </span>
                                    </div>
                                    <div className={clsx(styles.infoBox, styles.score)}>
                                        <span className={styles.label}>Điểm tối đa</span>
                                        <span className={styles.value}>
                                            <StarOutlined /> {displayData.maxScore || 10} điểm
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.card}>
                                <h3>Khu vực nộp bài</h3>
                                {!submission ? (
                                    <>
                                        <div className={styles.uploadArea}>
                                            <Dragger {...uploadProps}>
                                                <div className={styles.uploadIcons}>
                                                    <FileTextOutlined />
                                                    <FolderOpenOutlined />
                                                    <FileAddOutlined />
                                                </div>
                                                <p className={styles.uploadText}>
                                                    Kéo thả file vào đây hoặc <span>chọn file</span>
                                                </p>
                                                <p className={styles.uploadHint}>
                                                    Hỗ trợ: .pdf, .docx, .cpp, .zip, .txt...
                                                </p>
                                                <div className={styles.limitTag}>
                                                    <WarningOutlined /> Dung lượng tối đa: 5MB
                                                </div>
                                            </Dragger>
                                        </div>
                                        <div className={styles.actionRow}>
                                            <Button type="primary" danger icon={<CloudUploadOutlined />} onClick={handleSubmit} loading={isSubmitting}>
                                                Nộp bài
                                            </Button>
                                            <Button onClick={handleBack} disabled={isSubmitting}>
                                                Hủy
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '32px 20px', background: '#f0fdf4', border: '1px dashed #4ade80', borderRadius: 12 }}>
                                        <div style={{ fontSize: 32, color: '#22c55e', marginBottom: 12 }}><FileTextOutlined /></div>
                                        <h3 style={{ color: '#166534', margin: 0 }}>Bạn đã nộp bài tập này!</h3>
                                        <p style={{ color: '#15803d', marginTop: 8, marginBottom: 20 }}>Mỗi sinh viên chỉ được phép nộp 1 lần.</p>
                                        {submission?.score != null ? (
                                            <Button
                                                type="primary"
                                                icon={<StarOutlined />}
                                                onClick={() => navigate(`/classes/${id}/assignments/${assignmentId}/result`)}
                                            >
                                                Xem kết quả chấm điểm
                                            </Button>
                                        ) : (
                                            <Tag color="gold" style={{ fontSize: 13 }}>Chưa có kết quả chấm điểm</Tag>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.rightCol}>
                            <div className={clsx(styles.card, styles.statusCard)}>
                                <div className={styles.statusHeader}>Trạng thái nộp bài</div>
                                <div className={styles.statusList}>
                                    <div className={styles.statusItem}>
                                        <span className={styles.label}>Trạng thái</span>
                                        <span className={styles.tag} style={{ background: submission ? '#d1fae5' : '#fee2e2', color: submission ? '#065f46' : '#991b1b' }}>
                                            {submission ? 'Đã nộp' : 'Chưa nộp'}
                                        </span>
                                    </div>
                                    <div className={styles.statusItem}>
                                        <span className={styles.label}>Tình trạng chấm</span>
                                        <span className={styles.value}>
                                            {submission?.score !== null && submission?.score !== undefined ? `Đã chấm (${submission.score})` : 'Chưa chấm'}
                                        </span>
                                    </div>
                                    <div className={styles.statusItem}>
                                        <span className={styles.label}>Lần nộp cuối</span>
                                        <span className={styles.value}>{submission ? dayjs(submission.createdAt).format('DD/MM/YYYY - HH:mm') : '-'}</span>
                                    </div>

                                    {!submission && (
                                        <>
                                            {timeLeft === 'Overdue' ? (
                                                <div className={styles.timerBox} style={{ background: '#fef2f2', border: '1px solid #fca5a5', marginTop: 16 }}>
                                                    <div className={styles.timerLabel} style={{ color: '#dc2626' }}>Trạng thái thời gian</div>
                                                    <div style={{ color: '#ef4444', fontWeight: 600, fontSize: 16 }}>Đã quá hạn nộp bài</div>
                                                </div>
                                            ) : timeLeft ? (
                                                <div className={styles.timerBox} style={{ marginTop: 16 }}>
                                                    <div className={styles.timerLabel}>Thời gian còn lại</div>
                                                    <div className={styles.timeDigits}>
                                                        {timeLeft.days !== '00' && (
                                                            <>
                                                                <span className={styles.digit}>{timeLeft.days}</span>
                                                                <span className={styles.dots}>:</span>
                                                            </>
                                                        )}
                                                        <span className={styles.digit}>{timeLeft.hours}</span>
                                                        <span className={styles.dots}>:</span>
                                                        <span className={styles.digit}>{timeLeft.minutes}</span>
                                                        <span className={styles.dots}>:</span>
                                                        <span className={styles.digit}>{timeLeft.seconds}</span>
                                                    </div>
                                                    <div className={styles.timeLabels}>
                                                        {timeLeft.days !== '00' && <span>Ngày</span>}
                                                        <span>Giờ</span>
                                                        <span>Phút</span>
                                                        <span>Giây</span>
                                                    </div>
                                                </div>
                                            ) : null}
                                        </>
                                    )}
                                </div>
                            </div>

                            {submission?.aiFeedback && (
                                <div className={styles.noteCard} style={{ background: '#f5f3ff', borderColor: '#ddd6fe' }}>
                                    <h4 style={{ color: '#5b21b6' }}>Phản hồi từ AI</h4>
                                    <p style={{ color: '#4c1d95', whiteSpace: 'pre-wrap' }}>
                                        {submission.aiFeedback}
                                    </p>
                                </div>
                            )}

                            <div className={styles.noteCard}>
                                <h4>Lưu ý quan trọng</h4>
                                <p>
                                    Sinh viên chỉ được phép nộp bài duy nhất <strong>1 lần</strong>. Hãy kiểm tra kĩ file trước khi nộp.
                                </p>
                                <p style={{ marginTop: '12px' }}>
                                    Hệ thống tự động khóa nộp nếu quá hạn dựa theo mốc thời gian của Giảng viên.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.historySection}>
                        <h3>Lịch sử nộp bài</h3>
                        <Table
                            columns={columns}
                            dataSource={historyData}
                            pagination={false}
                            className={styles.historyTable}
                        />
                    </div>
                </div>
            </MainLayout>

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
        </>
    );
};

export default AssignmentSubmit;
