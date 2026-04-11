import React, { useState } from 'react';
import { Button, Upload, Tag, Modal, message } from 'antd';
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
import { getFilePresentation, getFileNameFromUrl } from '@/utils/filePresentation';
import { useNavigate, useParams } from 'react-router-dom';
import clsx from 'clsx';
import dayjs from 'dayjs';
import MainLayout from '@/layouts/User/MainLayout';
import styles from './styles.module.scss';
import { useAssignmentDetail } from '@/hooks/useCourseAssignment';
import { useCourseDetail } from '@/hooks/useCourse';
import { useMySubmissions, useStudentSubmissions } from '@/hooks/useSubmission';

const { Dragger } = Upload;

const AssignmentSubmit = () => {
    const navigate = useNavigate();
    const { id, assignmentId } = useParams();

    const { assignment: detailData, isLoading: isDetailLoading } = useAssignmentDetail(assignmentId);
    const { data: courseData } = useCourseDetail(id);
    const { mySubmissions, isLoading: isSubmissionsLoading } = useMySubmissions();
    const { submitAssignment, isSubmitting } = useStudentSubmissions(assignmentId);

    const [fileList, setFileList] = useState([]);
    const [previewOpen, setPreviewOpen] = useState(false);

    const submission = React.useMemo(() => {
        if (!mySubmissions) return null;
        return mySubmissions.find(sub => {
            const subAssignmentId = sub.assignment?.id || sub.assignment?._id || sub.assignment;
            return String(subAssignmentId) === String(assignmentId);
        });
    }, [mySubmissions, assignmentId]);

    const displayData = detailData || {};
    const courseName = courseData?.courseName || displayData.course?.courseName || displayData.courseId?.courseName || id;

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

    const historyData = React.useMemo(() => {
        if (!submission) return [];
        const fileUrls = submission.attachments || submission.fileUrls || (submission.fileUrl ? [submission.fileUrl] : []);
        return fileUrls.map((url, index) => {
            const fileName = url ? getFileNameFromUrl(url) : `File đính kèm ${index + 1}`;
            return {
                key: `${submission.id || submission._id || 'sub'}-${index}`,
                fileName: fileName,
                submitTime: dayjs(submission.createdAt).format('DD/MM/YYYY - HH:mm'),
                size: '-',
                status: 'success',
                fileUrl: url
            };
        });
    }, [submission]);

    const handleBack = () => {
        navigate(`/classes/${id}?tab=assignments`);
    };

    const uploadProps = {
        name: 'files',
        multiple: true,
        beforeUpload: (file) => {
            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M) {
                message.error(`${file.name} vượt quá 5MB!`);
                return Upload.LIST_IGNORE;
            }
            if (fileList.length >= 10) {
                message.error('Chỉ được nộp tối đa 10 file!');
                return Upload.LIST_IGNORE;
            }
            setFileList(prev => [...prev, file]);
            return false;
        },
        onRemove: (file) => {
            setFileList(prev => prev.filter(f => f.uid !== file.uid));
        },
        maxCount: 10,
        fileList: fileList,
    };

    const handleSubmit = async () => {
        if (fileList.length === 0) {
            message.warning('Vui lòng chọn ít nhất một file để nộp!');
            return;
        }
        try {
            const formData = new FormData();
            
            fileList.forEach(file => {
                const targetFile = file.originFileObj || file;
                formData.append('files', targetFile);
            });
            
            await submitAssignment(formData);
            setFileList([]);
            message.success('Nộp bài thành công! AI đang chấm điểm...');
        } catch (error) {
            message.error(error.response?.data?.message || error?.message || 'Lỗi khi nộp bài');
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
                            </div>
                            <div className={styles.breadcrumbs}>
                                <span>Lớp học phần</span>
                                <span className={styles.separator}>&gt;</span>
                                <span>{courseName}</span>
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
                                    <div className={styles.fileList} style={{ marginTop: 16 }}>
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
                                        <div className={clsx(styles.uploadArea, timeLeft === 'Overdue' && styles.disabled)}>
                                            <Dragger {...uploadProps} disabled={timeLeft === 'Overdue'}>
                                                <div className={styles.uploadIcons}>
                                                    <FileTextOutlined />
                                                    <FolderOpenOutlined />
                                                    <FileAddOutlined />
                                                </div>
                                                <p className={styles.uploadText}>
                                                    Kéo thả file vào đây hoặc <span>chọn file</span>
                                                </p>
                                                <p className={styles.uploadHint}>
                                                    Hỗ trợ: PDF, DOCX, CPP, ZIP, JS, PY... (Tối đa 10 file)
                                                </p>
                                                <div className={styles.limitTag}>
                                                    <WarningOutlined /> 5MB mỗi file • Tối đa 10 file
                                                </div>
                                            </Dragger>
                                        </div>
                                        <div className={styles.actionRow}>
                                            <Button
                                                type="primary"
                                                danger={timeLeft !== 'Overdue'}
                                                icon={<CloudUploadOutlined />}
                                                onClick={handleSubmit}
                                                loading={isSubmitting}
                                                disabled={isSubmitting || timeLeft === 'Overdue'}
                                                style={timeLeft === 'Overdue' ? { background: '#f5f5f5', color: '#8c8c8c', borderColor: '#d9d9d9' } : {}}
                                            >
                                                {timeLeft === 'Overdue' ? 'Đã quá hạn nộp' : 'Nộp bài'}
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
                        <div className={styles.fileList} style={{ marginTop: 16 }}>
                            {historyData.length === 0 ? (
                                <div style={{ color: '#999', textAlign: 'center', padding: '24px 0' }}>Chưa có bài nộp nào.</div>
                            ) : (
                                historyData.map((item, idx) => {
                                    const pres = getFilePresentation(item.fileName);
                                    return (
                                        <div className={styles.fileItem} key={item.key || idx}>
                                            <div className={styles.fileInfo}>
                                                <div className={styles.fileIcon} style={{ background: pres.iconBg, color: pres.iconColor }}>
                                                    {pres.icon}
                                                </div>
                                                <div className={styles.fileMeta}>
                                                    <div className={styles.fileName}>{item.fileName}</div>
                                                    <div className={styles.fileSize}>
                                                        {(item.fileName.split('.').pop() || 'file').toUpperCase()} • Đã tải lên {item.submitTime}
                                                    </div>
                                                </div>
                                            </div>
                                            <DownloadOutlined
                                                className={styles.downloadBtn}
                                                onClick={() => window.open(item.fileUrl, '_blank')}
                                            />
                                        </div>
                                    );
                                })
                            )}
                        </div>
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
