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
import { useMyAttendance } from '@/hooks/useAttendance';
import { useCourseAssignments } from '@/hooks/useCourseAssignment';
import { useMySubmissions } from '@/hooks/useSubmission';

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

const safeDecodeURIComponent = (value = '') => {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
};

const isLikelyMojibake = (value = '') => /Ã.|Â.|á»|áº|Æ|Ä|Å|Ð|�/.test(value);

const decodePotentialMojibake = (value = '') => {
    if (typeof value !== 'string') return '';

    const normalizedValue = safeDecodeURIComponent(value.trim());
    if (!normalizedValue) return '';
    if (!isLikelyMojibake(normalizedValue)) return normalizedValue;

    try {
        const bytes = Uint8Array.from(normalizedValue, (char) => char.charCodeAt(0) & 0xff);
        const decodedValue = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
        return decodedValue || normalizedValue;
    } catch {
        return normalizedValue;
    }
};

const sanitizeFilenamePart = (value, fallback = '') => {
    const normalized = decodePotentialMojibake(value || '')
        .replace(/[<>:"/\\|?*\u0000-\u001F]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    return normalized || fallback;
};

const getFileNameFromUrl = (fileUrl = '') => {
    if (!fileUrl) return '';

    try {
        const pathName = new URL(fileUrl).pathname;
        const rawFileName = pathName.split('/').pop() || '';
        return decodePotentialMojibake(rawFileName);
    } catch {
        const rawFileName = fileUrl.split('/').pop()?.split('?')[0] || '';
        return decodePotentialMojibake(rawFileName);
    }
};

const getMaterialDisplayTitle = (material) => {
    const normalizedTitle = decodePotentialMojibake(material?.title || '');
    if (normalizedTitle) return normalizedTitle;

    const fileNameFromUrl = getFileNameFromUrl(material?.fileUrl || '');
    return fileNameFromUrl || 'Tài liệu không tên';
};

const buildDownloadFileName = (material, courseCode, courseName) => {
    const normalizedCourseCode = sanitizeFilenamePart(courseCode, 'Mon-hoc');
    const normalizedCourseName = sanitizeFilenamePart(courseName, 'Khong-ten-mon');
    const normalizedMaterialTitle = sanitizeFilenamePart(getMaterialDisplayTitle(material), 'Tai-lieu');

    return `${normalizedCourseCode} - ${normalizedCourseName} - ${normalizedMaterialTitle}`;
};

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
        return [...announcements].sort((firstAnnouncement, secondAnnouncement) => {
            const firstTime = dayjs(firstAnnouncement?.createdAt).valueOf();
            const secondTime = dayjs(secondAnnouncement?.createdAt).valueOf();
            return secondTime - firstTime;
        });
    }, [announcements]);

    const visibleAnnouncements = sortedAnnouncements.slice(0, MAX_VISIBLE_ANNOUNCEMENTS);
    const hasMoreAnnouncements = sortedAnnouncements.length > MAX_VISIBLE_ANNOUNCEMENTS;

    const sortedMaterials = [...materials].sort((firstMaterial, secondMaterial) => {
        const firstTime = dayjs(firstMaterial?.createdAt).valueOf();
        const secondTime = dayjs(secondMaterial?.createdAt).valueOf();
        return secondTime - firstTime;
    });

    const attendanceRate = attendanceSummary.total > 0
        ? Math.round((attendanceSummary.present / attendanceSummary.total) * 100)
        : 100;

    const assignmentStatusCounts = useMemo(() => {
        const submissionByAssignmentId = new Map();

        mySubmissions.forEach((submission) => {
            const assignmentRef = submission?.assignment;
            const assignmentId = normalizeEntityId(assignmentRef?.id ? assignmentRef : assignmentRef);
            if (!assignmentId || submissionByAssignmentId.has(assignmentId)) return;
            submissionByAssignmentId.set(assignmentId, submission);
        });

        return courseAssignments.reduce(
            (counts, assignment) => {
                const assignmentId = normalizeEntityId(assignment);
                const submission = submissionByAssignmentId.get(assignmentId);

                if (!submission) {
                    counts.opening += 1;
                    return counts;
                }

                if (submission.status === 'GRADED' || (submission.score !== null && submission.score !== undefined)) {
                    counts.graded += 1;
                } else {
                    counts.submitted += 1;
                }

                return counts;
            },
            { opening: 0, submitted: 0, graded: 0 }
        );
    }, [courseAssignments, mySubmissions]);

    const assignmentTotal = assignmentStatusCounts.opening + assignmentStatusCounts.submitted + assignmentStatusCounts.graded;
    const openingPercent = assignmentTotal > 0 ? (assignmentStatusCounts.opening / assignmentTotal) * 100 : 0;
    const submittedPercent = assignmentTotal > 0 ? (assignmentStatusCounts.submitted / assignmentTotal) * 100 : 0;
    const gradedPercent = assignmentTotal > 0 ? (assignmentStatusCounts.graded / assignmentTotal) * 100 : 0;
    const donutGradient = assignmentTotal > 0
        ? `conic-gradient(
            #3b82f6 0% ${openingPercent}%,
            #f59e0b ${openingPercent}% ${openingPercent + submittedPercent}%,
            #16a34a ${openingPercent + submittedPercent}% ${openingPercent + submittedPercent + gradedPercent}%
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
                            const presentation = getMaterialPresentation(material.type);
                            const materialTitle = getMaterialDisplayTitle(material);
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
                </div>

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
                                        <span className={styles.legendDot} style={{ background: '#f59e0b' }} />
                                        <span className={styles.legendLabel}>Đã nộp</span>
                                        <span className={styles.legendValue}>{assignmentStatusCounts.submitted}</span>
                                    </div>
                                    <div className={styles.assignmentLegendItem}>
                                        <span className={styles.legendDot} style={{ background: '#16a34a' }} />
                                        <span className={styles.legendLabel}>Đã chấm</span>
                                        <span className={styles.legendValue}>{assignmentStatusCounts.graded}</span>
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
