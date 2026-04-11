import React, { useMemo, useState } from 'react';
import { Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
    BellOutlined,
    DatabaseOutlined,
    CloudDownloadOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    ScheduleOutlined,
    VideoCameraOutlined,
    MessageOutlined,
    QuestionCircleOutlined,
    UserOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import styles from '../styles.module.scss';
import { useCourseAnnouncements } from '@/hooks/useCourseAnnouncement';
import { useCourseMaterials } from '@/hooks/useCourseMaterial';
import { useMyAttendance } from '@/hooks/useAttendance';
import { useCourseAssignments } from '@/hooks/useCourseAssignment';
import { useMySubmissions } from '@/hooks/useSubmission';
import { 
    getFilePresentation, 
    getFileNameFromUrl, 
    sanitizeFilenamePart,
    getMaterialDisplayTitle,
    buildDownloadFileName
} from '@/utils/filePresentation';

const ANNOUNCEMENT_PREVIEW_LENGTH = 220;
const MAX_VISIBLE_ANNOUNCEMENTS = 4;

const getAnnouncementId = (announcement, index) => {
    return announcement?._id || announcement?.id || `${announcement?.createdAt || 'announcement'}-${index}`;
};

const getAnnouncementPreview = (content = '') => {
    const normalizedContent = String(content).trim();
    if (normalizedContent.length <= ANNOUNCEMENT_PREVIEW_LENGTH) {
        return normalizedContent;
    }

    return `${normalizedContent.slice(0, ANNOUNCEMENT_PREVIEW_LENGTH).trimEnd()}...`;
};

const normalizeEntityId = (entity) => {
    if (!entity) return '';

    if (typeof entity === 'string' || typeof entity === 'number') {
        return String(entity);
    }

    return String(entity._id || entity.id || '');
};

const OverviewTab = ({ courseData, courseId }) => {
    const navigate = useNavigate();
    const { announcements, isLoadingAnnouncements } = useCourseAnnouncements(courseId);
    const { materials, isLoadingMaterials } = useCourseMaterials(courseId);
    const { summary: attendanceSummary, isLoading: isLoadingAttendance } = useMyAttendance(courseId);
    const { assignments: courseAssignments, isLoading: isLoadingAssignments } = useCourseAssignments(courseId);
    const { mySubmissions, isLoading: isLoadingMySubmissions } = useMySubmissions();
    const [expandedAnnouncements, setExpandedAnnouncements] = useState({});

    const sortedAnnouncements = useMemo(() => {
        return [...announcements].sort((a, b) => {
            const timeA = dayjs(a?.createdAt).valueOf();
            const timeB = dayjs(b?.createdAt).valueOf();
            return timeB - timeA;
        });
    }, [announcements]);

    const visibleAnnouncements = sortedAnnouncements.slice(0, MAX_VISIBLE_ANNOUNCEMENTS);
    const hasMoreAnnouncements = sortedAnnouncements.length > MAX_VISIBLE_ANNOUNCEMENTS;

    const sortedMaterials = useMemo(() => {
        return [...materials].sort((a, b) => {
            const timeA = dayjs(a?.createdAt).valueOf();
            const timeB = dayjs(b?.createdAt).valueOf();
            return timeB - timeA;
        });
    }, [materials]);

    const attendanceRate = attendanceSummary.total > 0
        ? Math.round(((attendanceSummary.total - attendanceSummary.absent) / attendanceSummary.total) * 100)
        : 100;

    const assignmentStatusCounts = useMemo(() => {
        const submissionByAssignmentId = new Map();

        mySubmissions.forEach((submission) => {
            const assignmentRef = submission?.assignment;
            const aid = normalizeEntityId(assignmentRef?.id ? assignmentRef : assignmentRef);
            if (!aid || submissionByAssignmentId.has(aid)) return;
            submissionByAssignmentId.set(aid, submission);
        });

        return courseAssignments.reduce(
            (counts, assignment) => {
                const aid = normalizeEntityId(assignment);
                const submission = submissionByAssignmentId.get(aid);

                if (!submission) {
                    const isOverdue = assignment.dueDate && dayjs().isAfter(dayjs(assignment.dueDate));
                    if (isOverdue) {
                        counts.overdue += 1;
                    } else {
                        counts.opening += 1;
                    }
                    return counts;
                }

                counts.submitted += 1;

                return counts;
            },
            { opening: 0, submitted: 0, overdue: 0 }
        );
    }, [courseAssignments, mySubmissions]);

    const assignmentTotal = assignmentStatusCounts.opening + assignmentStatusCounts.submitted + assignmentStatusCounts.overdue;
    const openingPercent = assignmentTotal > 0 ? (assignmentStatusCounts.opening / assignmentTotal) * 100 : 0;
    const submittedPercent = assignmentTotal > 0 ? (assignmentStatusCounts.submitted / assignmentTotal) * 100 : 0;
    const overduePercent = assignmentTotal > 0 ? (assignmentStatusCounts.overdue / assignmentTotal) * 100 : 0;

    const donutGradient = assignmentTotal > 0
        ? `conic-gradient(
            #3b82f6 0% ${openingPercent}%,
            #16a34a ${openingPercent}% ${openingPercent + submittedPercent}%,
            #ef4444 ${openingPercent + submittedPercent}% 100%
        )`
        : '#e2e8f0';

    const handleDownloadMaterial = async (material) => {
        if (!material?.fileUrl) {
            message.error('Không tìm thấy đường dẫn tài liệu');
            return;
        }

        const downloadFileName = buildDownloadFileName(
            material,
            courseData?.courseCode,
            courseData?.courseName
        );

        try {
            const response = await fetch(material.fileUrl);
            if (!response.ok) throw new Error('Không thể tải file từ máy chủ');

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', downloadFileName);

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch {
            const link = document.createElement('a');
            link.href = material.fileUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.setAttribute('download', downloadFileName);

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className={styles.overviewGrid}>
            <div className={styles.card} style={{ margin: 0 }}>
                <div className={styles.announcementHeaderRow}>
                    <div className={styles.cardHeader}>
                        <BellOutlined className={styles.icon} />
                        Thông báo từ Giảng viên
                    </div>
                    {hasMoreAnnouncements && (
                        <Button
                            type="link"
                            className={styles.announcementSeeAllBtn}
                            onClick={() => navigate(`/classes/${courseId}/announcements`)}
                        >
                            Xem tất cả
                        </Button>
                    )}
                </div>
                <div className={styles.announcementList}>
                    {isLoadingAnnouncements ? (
                        <div style={{ color: '#999', textAlign: 'center', padding: '24px 0' }}>
                            Đang tải thông báo...
                        </div>
                    ) : sortedAnnouncements.length === 0 ? (
                        <div style={{ color: '#999', textAlign: 'center', padding: '24px 0' }}>
                            Chưa có thông báo nào từ giảng viên.
                        </div>
                    ) : (
                        visibleAnnouncements.map((announcement, index) => {
                            const announcementId = getAnnouncementId(announcement, index);
                            const announcementContent = announcement?.content || '';
                            const isExpanded = !!expandedAnnouncements[announcementId];
                            const isLongContent = announcementContent.trim().length > ANNOUNCEMENT_PREVIEW_LENGTH;
                            const displayedContent = isExpanded
                                ? announcementContent
                                : getAnnouncementPreview(announcementContent);

                            return (
                                <div className={styles.annItem} key={announcementId}>
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
                                    <div className={styles.annContent}>{displayedContent || 'Không có nội dung thông báo.'}</div>
                                    {isLongContent && !isExpanded && (
                                        <Button
                                            type="link"
                                            className={styles.annExpandBtn}
                                            onClick={() => {
                                                setExpandedAnnouncements((previous) => ({
                                                    ...previous,
                                                    [announcementId]: true,
                                                }));
                                            }}
                                        >
                                            Xem thêm
                                        </Button>
                                    )}
                                </div>
                            );
                        })
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
                            const materialTitle = getMaterialDisplayTitle(material);
                            const presentation = getFilePresentation(material.type || materialTitle);
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
                                            <div className={styles.fileName}>{materialTitle}</div>
                                            <div className={styles.fileSize}>
                                                {(material.type || materialTitle.split('.').pop() || 'file').toUpperCase()} • Đã tải lên {materialTime}
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
                    <DatabaseOutlined className={styles.icon} />
                    Tổng quan
                </div>
                <div style={{ marginBottom: '20px' }}></div>

                <div className={styles.courseStatsGrid}>
                    <div className={styles.courseStatItem}>
                        <div className={styles.courseStatIcon} style={{ background: '#f0fdf4', color: '#16a34a' }}>
                            <CalendarOutlined />
                        </div>
                        <div className={styles.courseStatMeta}>
                            <div className={styles.courseStatLabel}>Tổng số buổi</div>
                            <div className={styles.courseStatValue}>{isLoadingAttendance ? '--' : attendanceSummary.total}</div>
                        </div>
                    </div>

                    <div className={styles.courseStatItem}>
                        <div className={styles.courseStatIcon} style={{ background: '#fef2f2', color: '#dc2626' }}>
                            <ClockCircleOutlined />
                        </div>
                        <div className={styles.courseStatMeta}>
                            <div className={styles.courseStatLabel}>Số buổi vắng</div>
                            <div className={styles.courseStatValue}>{isLoadingAttendance ? '--' : attendanceSummary.absent}</div>
                        </div>
                    </div>

                    <div className={styles.courseStatItem}>
                        <div className={styles.courseStatIcon} style={{ background: '#eff6ff', color: '#2563eb' }}>
                            <CheckCircleOutlined />
                        </div>
                        <div className={styles.courseStatMeta}>
                            <div className={styles.courseStatLabel}>Tỷ lệ chuyên cần</div>
                            <div className={styles.courseStatValue}>{isLoadingAttendance ? '--' : `${attendanceRate}%`}</div>
                        </div>
                    </div>
                </div>

                <div className={styles.assignmentChartWrap}>
                    <div className={styles.assignmentChartTitle}>Trạng thái bài tập</div>
                    {isLoadingAssignments || isLoadingMySubmissions ? (
                        <div className={styles.assignmentChartLoading}>Đang tải dữ liệu bài tập...</div>
                    ) : (
                        <>
                            <div className={styles.assignmentDonutSection}>
                                <div className={styles.assignmentDonut} style={{ background: donutGradient }}>
                                    <div className={styles.assignmentDonutCenter}>
                                        <span>{assignmentTotal}</span>
                                        <small>Bài tập</small>
                                    </div>
                                </div>
                                <div className={styles.assignmentLegend}>
                                    <div className={styles.assignmentLegendItem}>
                                        <span className={styles.legendDot} style={{ background: '#3b82f6' }} />
                                        <span className={styles.legendLabel}>Đang mở</span>
                                        <span className={styles.legendValue}>{assignmentStatusCounts.opening}</span>
                                    </div>
                                    <div className={styles.assignmentLegendItem}>
                                        <span className={styles.legendDot} style={{ background: '#16a34a' }} />
                                        <span className={styles.legendLabel}>Đã nộp</span>
                                        <span className={styles.legendValue}>{assignmentStatusCounts.submitted}</span>
                                    </div>
                                    <div className={styles.assignmentLegendItem}>
                                        <span className={styles.legendDot} style={{ background: '#ef4444' }} />
                                        <span className={styles.legendLabel}>Quá hạn</span>
                                        <span className={styles.legendValue}>{assignmentStatusCounts.overdue}</span>
                                    </div>
                                </div>
                            </div>
                        </>
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
