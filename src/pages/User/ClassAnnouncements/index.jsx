import React, { useMemo } from 'react';
import { Button, Spin } from 'antd';
import { ArrowLeftOutlined, BellOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import MainLayout from '@/layouts/User/MainLayout';
import { useCourseDetail } from '@/hooks/useCourse';
import { useCourseAnnouncements } from '@/hooks/useCourseAnnouncement';
import styles from './styles.module.scss';

const ClassAnnouncements = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const { data: courseData, isLoading: isLoadingCourse } = useCourseDetail(id);
    const { announcements, isLoadingAnnouncements } = useCourseAnnouncements(id);

    const sortedAnnouncements = useMemo(() => {
        return [...announcements].sort((firstAnnouncement, secondAnnouncement) => {
            const firstTime = dayjs(firstAnnouncement?.createdAt).valueOf();
            const secondTime = dayjs(secondAnnouncement?.createdAt).valueOf();
            return secondTime - firstTime;
        });
    }, [announcements]);

    return (
        <MainLayout>
            <div className={styles.pageWrap}>
                <div className={styles.pageHeader}>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        className={styles.backBtn}
                        onClick={() => navigate(`/classes/${id}?tab=overview`)}
                    >
                        Quay lại lớp học
                    </Button>

                    <div className={styles.pageHeading}>
                        <div className={styles.headingTitleRow}>
                            <BellOutlined className={styles.headingIcon} />
                            <h1>Thông báo từ Giảng viên</h1>
                        </div>
                        <p>
                            {isLoadingCourse
                                ? 'Đang tải thông tin học phần...'
                                : `${courseData?.courseCode || '---'} - ${courseData?.courseName || '---'}`}
                        </p>
                    </div>

                    <span className={styles.totalBadge}>{sortedAnnouncements.length} thông báo</span>
                </div>

                <div className={styles.announcementList}>
                    {isLoadingAnnouncements ? (
                        <div className={styles.emptyState}>
                            <Spin size="large" />
                            <span>Đang tải danh sách thông báo...</span>
                        </div>
                    ) : sortedAnnouncements.length === 0 ? (
                        <div className={styles.emptyState}>Chưa có thông báo nào cho học phần này.</div>
                    ) : (
                        sortedAnnouncements.map((announcement, index) => {
                            const announcementId =
                                announcement?._id || announcement?.id || `${announcement?.createdAt || 'announcement'}-${index}`;

                            return (
                                <div className={styles.announcementItem} key={announcementId}>
                                    <div className={styles.announcementHeader}>
                                        <div className={styles.announcementAuthor}>
                                            {announcement.createdBy?.fullName || announcement.createdBy?.name || 'Giảng viên'}
                                        </div>
                                        <div className={styles.announcementDate}>
                                            {announcement.createdAt && dayjs(announcement.createdAt).isValid()
                                                ? dayjs(announcement.createdAt).format('DD/MM/YYYY - HH:mm')
                                                : '--'}
                                        </div>
                                    </div>
                                    <div className={styles.announcementContent}>
                                        {announcement.content || 'Không có nội dung thông báo.'}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default ClassAnnouncements;
