import React from 'react';
import MainLayout from '@/layouts/User/MainLayout';
import { Tabs, Progress, Spin } from 'antd';
import {
    InfoCircleOutlined,
    UserOutlined,
    FormOutlined,
    ClockCircleOutlined,
    EnvironmentOutlined
} from '@ant-design/icons';
import styles from './styles.module.scss';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import OverviewTab from './components/OverviewTab';
import AttendanceTab from './components/AttendanceTab';
import AssignmentsTab from './components/AssignmentsTab';
import { useCourseDetail } from '@/hooks/useCourse';

const { TabPane } = Tabs;

const ClassDetail = () => {
    const { id } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const { data: courseData, isLoading, isError } = useCourseDetail(id);

    const activeTab = searchParams.get('tab') || 'overview';

    const handleTabChange = (key) => {
        setSearchParams({ tab: key });
    };

    if (isLoading) {
        return (
            <MainLayout>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <Spin size="large" tip="Đang tải thông tin lớp học..." />
                </div>
            </MainLayout>
        );
    }

    if (isError || !courseData) {
        return (
            <MainLayout>
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
                    Không tìm thấy thông tin lớp học.
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className={styles.classDetailPage}>
                <div className={styles.headerBanner}>
                    <div className={styles.metaInfo}>
                        <span className={styles.badge}>{courseData.courseCode || '---'}</span>
                        <span className={styles.status}>{courseData.status || 'Đang học'}</span>
                    </div>
                    <h1 className={styles.title}>{courseData.courseName || '---'}</h1>
                    <div className={styles.details}>
                        <div className={styles.detailItem}>
                            <UserOutlined className={styles.icon} />
                            GV: {courseData.lecturerId?.fullName || '---'}
                        </div>
                        {courseData.schedule && (
                            <div className={styles.detailItem}>
                                <ClockCircleOutlined className={styles.icon} />
                                {courseData.schedule}
                            </div>
                        )}
                        {courseData.room && (
                            <div className={styles.detailItem}>
                                <EnvironmentOutlined className={styles.icon} />
                                {courseData.room}
                            </div>
                        )}
                    </div>
                    {courseData.progress != null && (
                        <div className={styles.progressBar}>
                            <Progress percent={courseData.progress} showInfo={false} />
                            <div className={styles.progressInfo}>
                                <span>Tiến độ hoàn thành: {courseData.progress}%</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.tabSection}>
                    <Tabs
                        activeKey={activeTab}
                        onChange={handleTabChange}
                        animated={{ inkBar: true, tabPane: true }}
                    >
                        <Tabs.TabPane tab={<span><InfoCircleOutlined /> Tổng quan</span>} key="overview">
                            <OverviewTab courseData={courseData} />
                        </Tabs.TabPane>
                        <Tabs.TabPane tab={<span><UserOutlined /> Điểm danh</span>} key="attendance">
                            <AttendanceTab />
                        </Tabs.TabPane>
                        <Tabs.TabPane tab={<span><FormOutlined /> Bài tập</span>} key="assignments">
                            <AssignmentsTab />
                        </Tabs.TabPane>
                    </Tabs>
                </div>
            </div>
        </MainLayout>
    );
};

export default ClassDetail;
