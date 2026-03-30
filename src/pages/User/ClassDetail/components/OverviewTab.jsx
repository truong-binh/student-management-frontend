import React from 'react';
import { Button } from 'antd';
import {
    InfoCircleOutlined,
    BellOutlined,
    DatabaseOutlined,
    CloudDownloadOutlined,
    VideoCameraOutlined,
    ScheduleOutlined,
    UserOutlined,
    MessageOutlined,
    QuestionCircleOutlined
} from '@ant-design/icons';
import styles from '../styles.module.scss';

const OverviewTab = ({ courseData }) => {
    return (
        <div className={styles.overviewGrid}>

            <div className={styles.card} style={{ margin: 0 }}>
                <div className={styles.cardHeader}>
                    <InfoCircleOutlined className={styles.icon} />
                    Mô tả học phần
                </div>
                <div className={styles.description}>
                    {courseData?.description || 'Chưa có mô tả cho học phần này.'}
                </div>
                <Button type="primary" icon={<CloudDownloadOutlined />} danger style={{ borderRadius: '8px' }}>
                    Tải về đề cương chi tiết
                </Button>
            </div>


            <div className={styles.card} style={{ margin: 0 }}>
                <div className={styles.cardHeader}>
                    <DatabaseOutlined className={styles.icon} />
                    Thông tin học phần
                </div>
                <div className={styles.fileList}>
                    <div className={styles.fileItem}>
                        <div className={styles.fileInfo}>
                            <div className={styles.fileIcon} style={{ background: '#dbeafe', color: '#3b82f6' }}>
                                <UserOutlined />
                            </div>
                            <div className={styles.fileMeta}>
                                <div className={styles.fileName}>Giảng viên</div>
                                <div className={styles.fileSize}>{courseData?.lecturerId?.fullName || '---'}</div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.fileItem}>
                        <div className={styles.fileInfo}>
                            <div className={styles.fileIcon} style={{ background: '#dcfce7', color: '#22c55e' }}>
                                <ScheduleOutlined />
                            </div>
                            <div className={styles.fileMeta}>
                                <div className={styles.fileName}>Học kỳ</div>
                                <div className={styles.fileSize}>{courseData?.semester || '---'}</div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.fileItem}>
                        <div className={styles.fileInfo}>
                            <div className={styles.fileIcon} style={{ background: '#fef9c3', color: '#ca8a04' }}>
                                <DatabaseOutlined />
                            </div>
                            <div className={styles.fileMeta}>
                                <div className={styles.fileName}>Số tín chỉ</div>
                                <div className={styles.fileSize}>{courseData?.credits != null ? `${courseData.credits} tín chỉ` : '---'}</div>
                            </div>
                        </div>
                    </div>
                    {courseData?.maxStudents != null && (
                        <div className={styles.fileItem}>
                            <div className={styles.fileInfo}>
                                <div className={styles.fileIcon} style={{ background: '#fee2e2', color: '#ef4444' }}>
                                    <UserOutlined />
                                </div>
                                <div className={styles.fileMeta}>
                                    <div className={styles.fileName}>Sĩ số tối đa</div>
                                    <div className={styles.fileSize}>{courseData.maxStudents} sinh viên</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>


            <div className={styles.card} style={{ margin: 0 }}>
                <div className={styles.cardHeader}>
                    <BellOutlined className={styles.icon} />
                    Thông báo từ Giảng viên
                </div>
                <div className={styles.announcementList}>
                    <div style={{ color: '#999', textAlign: 'center', padding: '24px 0' }}>
                        Chưa có thông báo nào từ giảng viên.
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
