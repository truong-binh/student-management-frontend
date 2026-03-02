import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/User/MainLayout';
import { Input, Select, Progress, Button, Pagination } from 'antd';
import {
    SearchOutlined,
    BookOutlined,
    CodeOutlined,
    GlobalOutlined,
    DesktopOutlined,
    ApartmentOutlined,
    RadiusUprightOutlined,
    SafetyCertificateOutlined,
    TranslationOutlined
} from '@ant-design/icons';
import styles from './styles.module.scss';

const { Option } = Select;

const MyClasses = () => {
    const navigate = useNavigate();
    const [semester, setSemester] = useState('Học kỳ 2 - 2025-2026');

    const classesData = [
        {
            id: 1,
            title: 'Cấu trúc dữ liệu và Giải thuật',
            code: 'INT1302',
            semester: 'Học kỳ 2 - 2025-2026',
            teacher: 'Lê Thị Hoa',
            progress: 8,
            total: 12,
            type: 'assignment',
            color: '#e53e3e',
            icon: <CodeOutlined />
        },
        {
            id: 2,
            title: 'Mạng máy tính',
            code: 'INT1434',
            semester: 'Học kỳ 2 - 2025-2026',
            teacher: 'Nguyễn Văn B',
            progress: 4,
            total: 10,
            type: 'assignment',
            color: '#3182ce',
            icon: <GlobalOutlined />
        },
        {
            id: 3,
            title: 'Hệ điều hành',
            code: 'INT1332',
            semester: 'Học kỳ 2 - 2025-2026',
            teacher: 'Trần Văn C',
            progress: 6,
            total: 8,
            type: 'assignment',
            color: '#805ad5',
            icon: <DesktopOutlined />
        },
        {
            id: 4,
            title: 'Công nghệ phần mềm',
            code: 'INT1340',
            semester: 'Học kỳ 2 - 2025-2026',
            teacher: 'Phạm Văn D',
            progress: 2,
            total: 5,
            type: 'project',
            color: '#d69e2e',
            icon: <ApartmentOutlined />
        },
        {
            id: 5,
            title: 'Triết học Mác - Lênin',
            code: 'BAS1203',
            semester: 'Học kỳ 2 - 2025-2026',
            teacher: 'Nguyễn Thị E',
            progress: 100,
            total: 100,
            type: 'assignment',
            color: '#38b2ac',
            icon: <RadiusUprightOutlined />
        },
        {
            id: 6,
            title: 'Tiếng Anh chuyên ngành',
            code: 'FLS1103',
            semester: 'Học kỳ 2 - 2025-2026',
            teacher: 'Cristiano Ronaldo',
            progress: 3,
            total: 15,
            type: 'assignment',
            color: '#5a67d8',
            icon: <TranslationOutlined />
        },
        {
            id: 7,
            title: 'An toàn thông tin',
            code: 'INT1319',
            semester: 'Học kỳ 2 - 2025-2026',
            teacher: 'Hoàng Văn F',
            progress: 0,
            total: 5,
            type: 'assignment',
            color: '#f56565',
            icon: <SafetyCertificateOutlined />
        },
        {
            id: 8,
            title: 'Lập trình hướng đối tượng',
            code: 'INT1325',
            semester: 'Học kỳ 2 - 2025-2026',
            teacher: 'Vũ Thị G',
            progress: 12,
            total: 12,
            type: 'assignment',
            color: '#c53030',
            icon: <CodeOutlined />
        }
    ];

    return (
        <MainLayout>
            <div className={styles.classesPage}>
                <header className={styles.header}>
                    <div className={styles.title}>
                        <BookOutlined className={styles.icon} />
                        <h1>Lớp học của tôi</h1>
                    </div>

                    <div className={styles.filters}>
                        <Input
                            placeholder="Tìm tên môn học, mã môn..."
                            prefix={<SearchOutlined />}
                            className={styles.searchInput}
                        />
                        <Select
                            defaultValue="Học kỳ 2 - 2025-2026"
                            className={styles.statusSelect}
                            onChange={(value) => setSemester(value)}
                        >
                            <Option value="Học kỳ 2 - 2025-2026">Học kỳ 2 - 2025-2026</Option>
                            <Option value="Học kỳ 1 - 2025-2026">Học kỳ 1 - 2025-2026</Option>
                            <Option value="Học kỳ 2 - 2024-2025">Học kỳ 2 - 2024-2025</Option>
                            <Option value="Học kỳ 1 - 2024-2025">Học kỳ 1 - 2024-2025</Option>
                            <Option value="Học kỳ 2 - 2023-2024">Học kỳ 2 - 2023-2024</Option>
                            <Option value="Học kỳ 1 - 2023-2024">Học kỳ 1 - 2023-2024</Option>
                        </Select>
                    </div>
                </header>

                <div className={styles.classGrid}>
                    {classesData.map((item) => (
                        <div key={item.id} className={styles.classCard}>
                            <div
                                className={styles.cardHeader}
                                style={{ backgroundColor: item.color }}
                            >
                                <div className={styles.subjectIcon}>
                                    {item.icon}
                                </div>
                                <div className={styles.subjectCode}>
                                    {item.code}
                                </div>
                            </div>

                            <div className={styles.cardBody}>
                                <h3 className={styles.subjectTitle}>{item.title}</h3>

                                <div className={styles.teacherInfo}>
                                    <div className={styles.avatar}>GV</div>
                                    <span className={styles.name}>{item.teacher}</span>
                                </div>

                                <div className={styles.progressSection}>
                                    <div className={styles.progressHeader}>
                                        {item.status === 'completed' ? (
                                            <span className={styles.statusText}>Hoàn thành</span>
                                        ) : (
                                            <>
                                                <span className={styles.progressLabel}>Tiến độ</span>
                                                <span className={styles.progressValue}>
                                                    {item.progress}/{item.total} {item.type === 'project' ? 'bài tập lớn' : 'bài tập'}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <Progress
                                        percent={item.status === 'completed' ? 100 : (item.progress / item.total) * 100}
                                        showInfo={false}
                                        strokeColor={item.status === 'completed' ? '#38a169' : item.color}
                                        trailColor="#edf2f7"
                                    />
                                </div>


                                <Button
                                    className={`${styles.actionBtn} ${styles.accessBtn}`}
                                    style={{
                                        backgroundColor: `${item.color}15`,
                                        color: item.color
                                    }}
                                    onClick={() => navigate(`/classes/${item.id}`)}
                                >
                                    Truy cập lớp học
                                </Button>

                            </div>
                        </div>
                    ))}
                </div>

                <footer className={styles.footer}>
                    <div className={styles.paginationInfo}>
                        Hiển thị 1 đến 8 của 12 lớp học
                    </div>
                    <Pagination
                        defaultCurrent={1}
                        total={12}
                        pageSize={8}
                        showSizeChanger={false}
                    />
                </footer>
            </div>
        </MainLayout>
    );
};

export default MyClasses;
