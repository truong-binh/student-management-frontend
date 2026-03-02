import React from 'react';
import { Button } from 'antd';
import {
    InfoCircleOutlined,
    BellOutlined,
    DatabaseOutlined,
    CloudDownloadOutlined,
    FilePdfOutlined,
    CodeOutlined,
    VideoCameraOutlined,
    ScheduleOutlined,
    UserOutlined,
    MessageOutlined,
    QuestionCircleOutlined
} from '@ant-design/icons';
import styles from '../styles.module.scss';

const OverviewTab = () => {
    return (
        <div className={styles.overviewGrid}>
            {/* ROW 1 - LEFT: Mô tả */}
            <div className={styles.card} style={{ margin: 0 }}>
                <div className={styles.cardHeader}>
                    <InfoCircleOutlined className={styles.icon} />
                    Mô tả học phần
                </div>
                <div className={styles.description}>
                    Học phần cung cấp kiến thức nền tảng về các cấu trúc dữ liệu cơ bản (mảng, danh sách liên kết, ngăn xếp, hàng đợi, cây, đồ thị) và các thuật toán cơ bản (tìm kiếm, sắp xếp). Sinh viên sẽ học cách phân tích độ phức tạp của thuật toán và lựa chọn cấu trúc dữ liệu phù hợp để giải quyết các bài toán thực tế.
                    {'\n\n'}Mục tiêu:
                    {'\n'}- Hiểu rõ các khái niệm về cấu trúc dữ liệu và giải thuật.
                    {'\n'}- Cài đặt được các cấu trúc cơ bản bằng C++.
                    {'\n'}- Áp dụng giải thuật để tối ưu hóa chương trình.
                </div>
                <Button type="primary" icon={<CloudDownloadOutlined />} danger style={{ borderRadius: '8px' }}>
                    Tải về đề cương chi tiết
                </Button>
            </div>

            {/* ROW 1 - RIGHT: Tài liệu */}
            <div className={styles.card} style={{ margin: 0 }}>
                <div className={styles.cardHeader}>
                    <DatabaseOutlined className={styles.icon} />
                    Tài liệu học tập
                </div>
                <div className={styles.fileList}>
                    <div className={styles.fileItem}>
                        <div className={styles.fileInfo}>
                            <div className={styles.fileIcon} style={{ background: '#fee2e2', color: '#ef4444' }}>
                                <FilePdfOutlined />
                            </div>
                            <div className={styles.fileMeta}>
                                <div className={styles.fileName}>Giáo trình Cấu trúc dữ l...</div>
                                <div className={styles.fileSize}>2.5 MB • 15/01/2026</div>
                            </div>
                        </div>
                        <CloudDownloadOutlined className={styles.downloadBtn} />
                    </div>
                    <div className={styles.fileItem}>
                        <div className={styles.fileInfo}>
                            <div className={styles.fileIcon} style={{ background: '#dbeafe', color: '#3b82f6' }}>
                                <VideoCameraOutlined />
                            </div>
                            <div className={styles.fileMeta}>
                                <div className={styles.fileName}>Slide Chương 1: Tổng ...</div>
                                <div className={styles.fileSize}>1.2 MB • 20/01/2026</div>
                            </div>
                        </div>
                        <CloudDownloadOutlined className={styles.downloadBtn} />
                    </div>
                    <div className={styles.fileItem}>
                        <div className={styles.fileInfo}>
                            <div className={styles.fileIcon} style={{ background: '#dcfce7', color: '#22c55e' }}>
                                <CodeOutlined />
                            </div>
                            <div className={styles.fileMeta}>
                                <div className={styles.fileName}>Mã nguồn mẫu - Linke...</div>
                                <div className={styles.fileSize}>500 KB • 05/02/2026</div>
                            </div>
                        </div>
                        <CloudDownloadOutlined className={styles.downloadBtn} />
                    </div>
                </div>
                <Button type="link" danger style={{ padding: 0, marginTop: 12 }}>
                    Xem tất cả tài liệu
                </Button>
            </div>

            {/* ROW 2 - LEFT: Thông báo */}
            <div className={styles.card} style={{ margin: 0 }}>
                <div className={styles.cardHeader}>
                    <BellOutlined className={styles.icon} />
                    Thông báo từ Giảng viên
                </div>
                <div className={styles.announcementList}>
                    <div className={styles.annItem}>
                        <div className={styles.annHeader}>
                            <span className={styles.annTitle}>Nghỉ học bù thứ 6 (12/03)</span>
                            <span className={styles.annDate}>10/03/2026</span>
                        </div>
                        <div className={styles.annContent}>
                            Lớp nghỉ học buổi thứ 6 tuần này do giảng viên đi công tác. Lịch học bù sẽ được thông báo sau.
                        </div>
                    </div>
                    <div className={styles.annItem} style={{ borderLeftColor: '#f59e0b', background: '#fffbeb' }}>
                        <div className={styles.annHeader}>
                            <span className={styles.annTitle}>Nộp bài tập lớn giai đoạn 1</span>
                            <span className={styles.annDate}>05/03/2026</span>
                        </div>
                        <div className={styles.annContent}>
                            Các nhóm trưởng nộp báo cáo giai đoạn 1 qua hệ thống E-learning trước 23:59 ngày 15/03.
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.card} style={{ margin: 0 }}>
                <div className={styles.cardHeader}>
                    <ScheduleOutlined className={styles.icon} />
                    Liên kết nhanh
                </div>
                <div className={styles.quickLinks}>
                    <div className={styles.linkItem}>
                        <div className={styles.linkIcon}><VideoCameraOutlined /></div>
                        <span>Phòng học Online</span>
                    </div>
                    <div className={styles.linkItem}>
                        <div className={styles.linkIcon} style={{ color: '#8b5cf6' }}><MessageOutlined /></div>
                        <span>Diễn đàn thảo luận</span>
                    </div>
                    <div className={styles.linkItem}>
                        <div className={styles.linkIcon} style={{ color: '#10b981' }}><QuestionCircleOutlined /></div>
                        <span>Ngân hàng câu hỏi</span>
                    </div>
                    <div className={styles.linkItem}>
                        <div className={styles.linkIcon} style={{ color: '#f59e0b' }}><UserOutlined /></div>
                        <span>Hỏi đáp GV</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;
