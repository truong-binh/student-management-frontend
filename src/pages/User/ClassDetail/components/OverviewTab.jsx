import React from 'react';
import { Button, message } from 'antd';
import {
    InfoCircleOutlined,
    BellOutlined,
    DatabaseOutlined,
    CloudDownloadOutlined,
    FilePdfOutlined,
    FileWordOutlined,
    FileExcelOutlined,
    FileZipOutlined,
    FileTextOutlined,
    FileOutlined,
    VideoCameraOutlined,
    ScheduleOutlined,
    UserOutlined,
    MessageOutlined,
    QuestionCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import styles from '../styles.module.scss';
import { useCourseAnnouncements } from '@/hooks/useCourseAnnouncement';
import { useCourseMaterials } from '@/hooks/useCourseMaterial';

const getMaterialPresentation = (type = '') => {
    const ext = type.toLowerCase();

    if (ext === 'pdf') {
        return { icon: <FilePdfOutlined />, iconBg: '#ebf8ff', iconColor: '#3b82f6' };
    }

    if (['doc', 'docx'].includes(ext)) {
        return { icon: <FileWordOutlined />, iconBg: '#e6f7ff', iconColor: '#1677ff' };
    }

    if (['xls', 'xlsx', 'csv'].includes(ext)) {
        return { icon: <FileExcelOutlined />, iconBg: '#f0fff4', iconColor: '#22c55e' };
    }

    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
        return { icon: <FileZipOutlined />, iconBg: '#fffbeb', iconColor: '#d69e2e' };
    }

    if (['ppt', 'pptx', 'txt'].includes(ext)) {
        return { icon: <FileTextOutlined />, iconBg: '#fff7e6', iconColor: '#fa8c16' };
    }

    return { icon: <FileOutlined />, iconBg: '#f7fafc', iconColor: '#64748b' };
};

const OverviewTab = ({ courseData, courseId }) => {
    const { announcements, isLoadingAnnouncements } = useCourseAnnouncements(courseId);
    const { materials, isLoadingMaterials } = useCourseMaterials(courseId);

    const sortedMaterials = [...materials].sort((firstMaterial, secondMaterial) => {
        const firstTime = dayjs(firstMaterial?.createdAt).valueOf();
        const secondTime = dayjs(secondMaterial?.createdAt).valueOf();
        return secondTime - firstTime;
    });

    const handleDownloadMaterial = (material) => {
        if (!material?.fileUrl) {
            message.error('Không tìm thấy đường dẫn tài liệu');
            return;
        }

        const link = document.createElement('a');
        link.href = material.fileUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';

        if (material.title) {
            link.setAttribute('download', material.title);
        }

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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
                    {isLoadingAnnouncements ? (
                        <div style={{ color: '#999', textAlign: 'center', padding: '24px 0' }}>
                            Đang tải thông báo...
                        </div>
                    ) : announcements.length === 0 ? (
                        <div style={{ color: '#999', textAlign: 'center', padding: '24px 0' }}>
                            Chưa có thông báo nào từ giảng viên.
                        </div>
                    ) : (
                        announcements.map((announcement) => (
                            <div className={styles.annItem} key={announcement._id || announcement.id || announcement.createdAt}>
                                <div className={styles.annHeader}>
                                    <div className={styles.annTitle}>
                                        {announcement.createdBy?.fullName || announcement.createdBy?.name || 'Giảng viên'}
                                    </div>
                                    <div className={styles.annDate}>
                                        {announcement.createdAt && dayjs(announcement.createdAt).isValid()
                                            ? dayjs(announcement.createdAt).format('DD/MM/YYYY - HH:mm')
                                            : '--'}
                                    </div>
                                </div>
                                <div className={styles.annContent}>{announcement.content}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>


            <div className={styles.card} style={{ margin: 0 }}>
                <div className={styles.cardHeader}>
                    <DatabaseOutlined className={styles.icon} />
                    Tài liệu học tập
                </div>
                <div className={styles.fileList}>
                    {isLoadingMaterials ? (
                        <div style={{ color: '#999', textAlign: 'center', padding: '24px 0' }}>
                            Đang tải tài liệu...
                        </div>
                    ) : sortedMaterials.length === 0 ? (
                        <div style={{ color: '#999', textAlign: 'center', padding: '24px 0' }}>
                            Chưa có tài liệu nào cho học phần này.
                        </div>
                    ) : (
                        sortedMaterials.map((material) => {
                            const materialId = material._id || material.id;
                            const presentation = getMaterialPresentation(material.type);
                            const materialTime = material.createdAt && dayjs(material.createdAt).isValid()
                                ? dayjs(material.createdAt).format('DD/MM/YYYY - HH:mm')
                                : '--';

                            return (
                                <div className={styles.fileItem} key={materialId || material.createdAt}>
                                    <div className={styles.fileInfo}>
                                        <div
                                            className={styles.fileIcon}
                                            style={{ background: presentation.iconBg, color: presentation.iconColor }}
                                        >
                                            {presentation.icon}
                                        </div>
                                        <div className={styles.fileMeta}>
                                            <div className={styles.fileName}>{material.title || 'Tài liệu không tên'}</div>
                                            <div className={styles.fileSize}>
                                                {(material.type || 'file').toUpperCase()} • Đã tải lên {materialTime}
                                            </div>
                                        </div>
                                    </div>
                                    <CloudDownloadOutlined
                                        className={styles.downloadBtn}
                                        onClick={() => handleDownloadMaterial(material)}
                                    />
                                </div>
                            );
                        })
                    )}
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
