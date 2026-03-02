import React from 'react';
import { Button, Tag, Avatar } from 'antd';
import {
    ArrowLeftOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    InfoCircleOutlined,
    CloudDownloadOutlined,
    RobotOutlined,
    FileZipOutlined,
    RollbackOutlined,
    CommentOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import clsx from 'clsx';
import MainLayout from '@/layouts/User/MainLayout';
import styles from './styles.module.scss';

const AssignmentResult = () => {
    const navigate = useNavigate();
    const { id, assignmentId } = useParams();

    const handleBack = () => {
        navigate(`/classes/${id}?tab=assignments`);
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
                            <h1>Chi tiết điểm số & Phản hồi AI</h1>
                            <span className={styles.classCode}>INT1302</span>
                        </div>
                        <div className={styles.breadcrumbs}>
                            <span>Lớp học phần</span>
                            <span className={styles.separator}>&gt;</span>
                            <span>INT1302</span>
                            <span className={styles.separator}>&gt;</span>
                            <span>Bài tập tuần 5</span>
                        </div>
                    </div>
                </div>

                <div className={styles.mainContent}>
                    <div className={styles.leftCol}>
                        <div className={styles.scoreCard}>
                            <div className={styles.scoreLabel}>Tổng điểm</div>
                            <div className={styles.scoreCircle}>
                                <span className={styles.value}>9.5</span>
                                <span className={styles.total}>/ 10</span>
                            </div>
                            <Tag className={styles.gradeTag}>Xuất sắc</Tag>
                            <div className={styles.gradingDate}>Chấm tự động lúc: 12/10/2026 14:35</div>
                        </div>

                        <div className={styles.feedbackCard}>
                            <div className={styles.cardTitle}>
                                <CommentOutlined /> Nhận xét từ Giảng viên
                            </div>
                            <div className={styles.instructorMeta}>
                                <div className={styles.avatar}>GV</div>
                                <div className={styles.info}>
                                    <div className={styles.name}>GV. Lê Thị Hoa</div>
                                    <div className={styles.time}>1 ngày trước</div>
                                </div>
                            </div>
                            <div className={styles.commentText}>
                                "Bài làm rất tốt, cấu trúc code rõ ràng. Tuy nhiên em cần chú ý thêm phần giải phóng bộ nhớ (memory leak) trong hàm xóa node để tối ưu hơn."
                            </div>
                        </div>

                        <div className={styles.fileCard}>
                            <div className={styles.cardTitle}>FILE ĐÃ CHẤM</div>
                            <div className={styles.fileItem}>
                                <FileZipOutlined className={styles.icon} />
                                <div className={styles.info}>
                                    <div className={styles.name}>B21DCCN001_BaiTap5.zip</div>
                                    <div className={styles.meta}>1.2 MB • 12/10/2026</div>
                                </div>
                                <CloudDownloadOutlined className={styles.download} />
                            </div>
                        </div>
                    </div>

                    <div className={styles.rightCol}>
                        <div className={styles.aiFeedbackSection}>
                            <div className={styles.aiHeader}>
                                <div className={styles.aiTitle}>
                                    <RobotOutlined className={styles.icon} />
                                    <div>
                                        Nhận xét chi tiết từ AI
                                        <span className={styles.subtitle}>Phân tích tự động dựa trên mã nguồn</span>
                                    </div>
                                </div>
                                <span className={styles.versionTag}>Version 2.0</span>
                            </div>

                            <div className={styles.aiBody}>
                                <div className={styles.feedbackPoint}>
                                    <div className={clsx(styles.pointHeader, styles.pros)}>
                                        <CheckCircleOutlined /> Điểm mạnh (Pros)
                                    </div>
                                    <div className={styles.pointList}>
                                        <div className={styles.pointItem}>
                                            <CheckCircleOutlined className={styles.checkIcon} />
                                            <span>Thuật toán duyệt cây <strong>Inorder Traversal</strong> được cài đặt chính xác, độ phức tạp O(n).</span>
                                        </div>
                                        <div className={styles.pointItem}>
                                            <CheckCircleOutlined className={styles.checkIcon} />
                                            <span>Xử lý tốt các trường hợp biên (cây rỗng, node lá) trong hàm searchNode().</span>
                                        </div>
                                        <div className={styles.pointItem}>
                                            <CheckCircleOutlined className={styles.checkIcon} />
                                            <span>Coding convention tốt, tên biến rõ ràng, dễ đọc (CamelCase).</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.feedbackPoint}>
                                    <div className={clsx(styles.pointHeader, styles.cons)}>
                                        <ExclamationCircleOutlined /> Điểm cần cải thiện (Cons/Errors)
                                    </div>
                                    <div className={styles.pointList}>
                                        <div className={clsx(styles.pointItem, styles.error)}>
                                            <div className={styles.errorHeader}>
                                                <ExclamationCircleOutlined /> Lỗi Memory Leak trong hàm deleteNode
                                            </div>
                                            <div className={styles.errorDesc}>
                                                Khi xóa một node có 2 con, bạn đang sao chép giá trị nhưng chưa delete vùng nhớ của node thừa kế sau khi thay thế.
                                            </div>

                                            <div className={styles.codeWindow}>
                                                <code>
                                                    <span className={styles.lineNum}>15</span> <span className={styles.comment}>// Code hiện tại:</span><br />
                                                    <span className={styles.lineNum}>16</span> root-&gt;key = temp-&gt;key;<br />
                                                    <span className={styles.lineNum}>17</span> <span className={styles.highlight}>root-&gt;right = deleteNode(root-&gt;right, temp-&gt;key); // Còn kiếm tra lỗi</span><br />
                                                    <br />
                                                    <span className={styles.suggestion}>// Gợi ý sửa: Thêm câu lệnh delete pointer sau khi đã quay lại</span>
                                                </code>
                                            </div>
                                        </div>

                                        <div className={clsx(styles.pointItem, styles.tip)}>
                                            <InfoCircleOutlined />
                                            <div>
                                                <strong>Thiếu comment giải thích logic phức tạp</strong><br />
                                                Đoạn cân bằng cây AVL chưa có comment giải thích các bước xoay trái/phải.
                                            </div>
                                        </div>
                                    </div>
                                </div>
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
        </MainLayout>
    );
};

export default AssignmentResult;
