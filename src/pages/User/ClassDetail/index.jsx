import React from 'react';
import MainLayout from '@/layouts/User/MainLayout';
import { Tabs, Progress } from 'antd';
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

const { TabPane } = Tabs;

const ClassDetail = () => {
    const [searchParams] = useSearchParams();
    const defaultTab = searchParams.get('tab') === 'assignments' ? '3' : '1';

    const classInfo = {
        code: 'INT1302',
        title: 'Cấu trúc dữ liệu và Giải thuật',
        status: 'Đang học',
        teacher: 'Lê Thị Hoa',
        schedule: 'Thứ 2, Tiết 1-3 | Thứ 4, Tiết 4-5',
        room: 'Phòng 302 - A2',
        progress: 66
    };

    return (
        <MainLayout>
            <div className={styles.classDetailPage}>
                <div className={styles.headerBanner}>
                    <div className={styles.metaInfo}>
                        <span className={styles.badge}>{classInfo.code}</span>
                        <span className={styles.status}>{classInfo.status}</span>
                    </div>
                    <h1 className={styles.title}>{classInfo.title}</h1>
                    <div className={styles.details}>
                        <div className={styles.detailItem}><UserOutlined className={styles.icon} /> GV: {classInfo.teacher}</div>
                        <div className={styles.detailItem}><ClockCircleOutlined className={styles.icon} /> {classInfo.schedule}</div>
                        <div className={styles.detailItem}><EnvironmentOutlined className={styles.icon} /> {classInfo.room}</div>
                    </div>
                    <div className={styles.progressBar}>
                        <Progress percent={classInfo.progress} showInfo={false} />
                        <div className={styles.progressInfo}>
                            <span>Tiến độ hoàn thành: {classInfo.progress}%</span>
                        </div>
                    </div>
                </div>

                <div className={styles.tabSection}>
                    <Tabs defaultActiveKey={defaultTab} animated={{ inkBar: true, tabPane: true }}>
                        <TabPane tab={<span><InfoCircleOutlined /> Tổng quan</span>} key="1">
                            <OverviewTab />
                        </TabPane>
                        <TabPane tab={<span><UserOutlined /> Điểm danh</span>} key="2">
                            <AttendanceTab />
                        </TabPane>
                        <TabPane tab={<span><FormOutlined /> Bài tập</span>} key="3">
                            <AssignmentsTab />
                        </TabPane>
                    </Tabs>
                </div>
            </div>
        </MainLayout>
    );
};

export default ClassDetail;
