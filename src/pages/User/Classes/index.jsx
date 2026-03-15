import React, { useState, useMemo } from 'react';
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
import { useCourse } from '@/hooks/useCourse';
import styles from './styles.module.scss';

const { Option } = Select;

const COLORS = ['#e53e3e', '#3182ce', '#805ad5', '#d69e2e', '#38b2ac', '#5a67d8', '#ed64a6', '#c53030'];
const ICONS = [<CodeOutlined />, <GlobalOutlined />, <DesktopOutlined />, <ApartmentOutlined />, <RadiusUprightOutlined />, <TranslationOutlined />, <SafetyCertificateOutlined />];

const MyClasses = () => {
    const navigate = useNavigate();
    const { courses, isLoading } = useCourse();

    const [searchText, setSearchText] = useState('');
    const [semesterFilter, setSemesterFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 8;

    const uniqueSemesters = useMemo(() => {
        return Array.from(new Set((Array.isArray(courses) ? courses : []).map(c => c.semester).filter(Boolean)));
    }, [courses]);

    const filtered = (Array.isArray(courses) ? courses : []).filter((c) => {
        const matchSearch =
            c.courseName?.toLowerCase().includes(searchText.toLowerCase()) ||
            c.courseCode?.toLowerCase().includes(searchText.toLowerCase());
        const matchSemester = semesterFilter === 'All' || c.semester === semesterFilter;
        return matchSearch && matchSemester;
    });

    const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
                            value={searchText}
                            onChange={(e) => {
                                setSearchText(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                        <Select
                            value={semesterFilter}
                            className={styles.statusSelect}
                            onChange={(value) => { setSemesterFilter(value); setCurrentPage(1); }}
                        >
                            <Option value="All">Tất cả học kỳ</Option>
                            {uniqueSemesters.map(sem => (
                                <Option key={sem} value={sem}>{sem}</Option>
                            ))}
                        </Select>
                    </div>
                </header>

                <div className={styles.classGrid}>
                    {isLoading ? (
                        <div className="w-full text-center py-10" style={{ gridColumn: '1 / -1' }}>Đang tải danh sách...</div>
                    ) : paginated.length === 0 ? (
                        <div className="w-full text-center py-10" style={{ gridColumn: '1 / -1' }}>Không có lớp học nào phù hợp.</div>
                    ) : (
                        paginated.map((item, index) => {
                            const color = COLORS[index % COLORS.length];
                            const icon = ICONS[index % ICONS.length];

                            return (
                                <div key={item._id} className={styles.classCard}>
                                    <div
                                        className={styles.cardHeader}
                                        style={{ backgroundColor: color }}
                                    >
                                        <div className={styles.subjectIcon}>
                                            {icon}
                                        </div>
                                        <div className={styles.subjectCode}>
                                            {item.courseCode}
                                        </div>
                                    </div>

                                    <div className={styles.cardBody}>
                                        <h3 className={styles.subjectTitle}>{item.courseName || '---'}</h3>

                                        <div className={styles.teacherInfo}>
                                            <div className={styles.avatar}>GV</div>
                                            <span className={styles.name}>{item.lecturerId?.fullName || '---'}</span>
                                        </div>

                                        <div className={styles.progressSection} style={{ marginBottom: '16px' }}>
                                            <div className={styles.progressHeader}>
                                                <span className={styles.progressLabel}>Mô tả</span>
                                            </div>
                                            <div style={{ color: '#718096', fontSize: '13px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginTop: '8px', minHeight: '39px', lineHeight: '1.5' }}>
                                                {item.description || 'Chưa có mô tả cho học phần này.'}
                                            </div>
                                        </div>

                                        <Button
                                            className={`${styles.actionBtn} ${styles.accessBtn}`}
                                            style={{
                                                backgroundColor: `${color}15`,
                                                color: color
                                            }}
                                            onClick={() => navigate(`/classes/${item._id}`)}
                                        >
                                            Truy cập lớp học
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <footer className={styles.footer}>
                    <div className={styles.paginationInfo}>
                        Hiển thị {Math.min((currentPage - 1) * pageSize + 1, filtered.length) || 0} đến {Math.min(currentPage * pageSize, filtered.length)} của {filtered.length} lớp học
                    </div>
                    <Pagination
                        current={currentPage}
                        total={filtered.length}
                        pageSize={pageSize}
                        showSizeChanger={false}
                        onChange={(page) => setCurrentPage(page)}
                    />
                </footer>
            </div>
        </MainLayout>
    );
};

export default MyClasses;
