import React, { useState } from 'react';
import { Button, Input, Select, Tag, message } from 'antd';
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
    MessageOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '@/layouts/User/MainLayout';
import ModalDefault from '@/components/Modal';
import styles from './styles.module.scss';

const { TextArea } = Input;
const { Option } = Select;

const GradeFeedback = () => {
    const navigate = useNavigate();
    const { id, assignmentId } = useParams();
    const [loading, setLoading] = useState(false);
    const [reason, setReason] = useState(null);
    const [content, setContent] = useState("");
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    const handleBack = () => {
        navigate(`/classes/${id}/assignments/${assignmentId}/result`);
    };

    const handleSubmit = () => {
        if (!reason || !content.trim()) {
            message.warning("Vui lòng điền đầy đủ thông tin yêu cầu!");
            return;
        }

        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setIsSuccessModalOpen(true);
        }, 1200);
    };

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
                                <Tag className={styles.tag}>INT1302</Tag>
                            </div>
                            <div className={styles.subTitle}>Bài tập tuần 5 - Cấu trúc dữ liệu và giải thuật</div>
                            <div className={styles.breadcrumbs}>
                                <span>Lớp học phần</span>
                                <span className={styles.separator}>&gt;</span>
                                <span>INT1302</span>
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
                                        <span className={styles.main}>9.5</span>
                                        <span className={styles.total}>/ 10</span>
                                    </div>
                                    <Tag className={styles.statusTag}>Xuất sắc</Tag>
                                </div>
                            </div>

                            <div className={styles.section}>
                                <div className={styles.sectionTitle}>
                                    <RobotOutlined /> Phản hồi từ AI
                                </div>
                                <div className={styles.aiFeedbackBox}>
                                    <div className={styles.feedbackItem}>
                                        <CheckCircleOutlined className={styles.iconPros} />
                                        <span>Thuật toán Inorder Traversal chính xác.</span>
                                    </div>
                                    <div className={styles.feedbackItem}>
                                        <ExclamationCircleOutlined className={styles.iconCons} />
                                        <span>Lỗi Memory Leak trong hàm <strong>deleteNode</strong>.</span>
                                    </div>
                                    <div className={styles.feedbackItem}>
                                        <InfoCircleOutlined className={styles.iconWarn} />
                                        <span>Thiếu comment giải thích logic.</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.section}>
                                <div className={styles.sectionTitle}>
                                    <CommentOutlined /> Nhận xét GV
                                </div>
                                <div className={styles.teacherCommentBox}>
                                    "Bài làm rất tốt, cấu trúc code rõ ràng. Tuy nhiên em cần chú ý thêm phần giải phóng bộ nhớ..."
                                </div>
                            </div>

                            <div className={styles.metaInfo}>
                                <div className={styles.metaItem}>
                                    <HistoryOutlined /> Đã nộp: 12/10/2026 14:30
                                </div>
                                <div className={styles.metaItem}>
                                    <FileZipOutlined /> File: B21DCCN001_BaiTap5.zip
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Feedback Form */}
                    <div className={styles.rightCol}>
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
                                <label>Lý do phúc khảo <span className={styles.required}>*</span></label>
                                <Select
                                    placeholder="Chọn lý do..."
                                    size="large"
                                    onChange={setReason}
                                    value={reason}
                                >
                                    <Option value="ai-error">Phản hồi AI chưa chính xác</Option>
                                    <Option value="grading-error">Sai lệch điểm số</Option>
                                    <Option value="content-error">Thiếu bài nộp/lỗi file</Option>
                                    <Option value="other">Lý do khác</Option>
                                </Select>
                            </div>

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
                                loading={loading}
                                onClick={handleSubmit}
                            >
                                Gửi yêu cầu
                            </Button>
                        </div>
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
                            Yêu cầu phúc khảo cho bài tập <strong>Bài tập tuần 5 - INT1302</strong> đã được gửi đến Giảng viên. Chúng tôi sẽ thông báo cho bạn ngay khi có kết quả.
                        </p>

                        <div className={styles.infoTable}>
                            <div className={styles.infoRow}>
                                <label>Mã yêu cầu (Ticket ID)</label>
                                <span className={styles.ticketId}>#PK-2024-001</span>
                            </div>
                            <div className={styles.infoRow}>
                                <label>Thời gian gửi</label>
                                <span>12/10/2026 15:45</span>
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
                                onClick={() => navigate('/feedback')}
                            >
                                Theo dõi tiến độ
                            </Button>
                        </div>
                    </div>
                </ModalDefault>
            </div>
        </MainLayout>
    );
};

export default GradeFeedback;
