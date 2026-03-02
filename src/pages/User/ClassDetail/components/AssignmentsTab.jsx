import React, { useState, useMemo } from 'react';
import { Button, Select, Tag, Pagination } from 'antd';
import {
    ClockCircleOutlined,
    BookOutlined,
    FormOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import styles from '../styles.module.scss';
import clsx from 'clsx';

const { Option } = Select;

const AssignmentsTab = () => {
    const navigate = useNavigate();
    const { id: classId } = useParams();
    const [filter, setFilter] = useState('all');

    const assignments = [
        { id: 1, title: 'Bài tập tuần 5 - Cây nhị phân (Binary Tree)', deadline: 'Hạn nộp: 23:59, Hôm nay', instructor: 'Lê Thị Hoa', status: 'opening', type: 'assignment' },
        { id: 2, title: 'Trắc nghiệm chương 3: Ngăn xếp và Hàng đợi', deadline: 'Hạn nộp: 20/05/2026', time: 'Thời gian làm bài: 45 phút', status: 'opening', type: 'quiz' },
        { id: 3, title: 'Bài tập lớn: Quản lý thư viện', deadline: 'Đã nộp: 10/05/2026 - 14:30', status: 'submitted', type: 'project' },
        { id: 4, title: 'Bài tập tuần 3 - Danh sách liên kết', score: '9.5', total: '10', comment: 'Bài làm tốt, code sạch.', status: 'graded', type: 'assignment' },
        { id: 5, title: 'Bài thực hành số 1', score: '8.0', total: '10', status: 'graded', type: 'assignment' },
    ];

    const filteredAssignments = useMemo(() => {
        if (filter === 'all') return assignments;
        return assignments.filter(item => item.status === filter);
    }, [filter, assignments]);

    const handleAction = (item) => {
        if (item.status === 'opening') {
            navigate(`/classes/${classId}/assignments/${item.id}`);
        } else if (item.status === 'graded' || item.status === 'submitted') {
            navigate(`/classes/${classId}/assignments/${item.id}/result`);
        }
    };

    const counts = {
        all: assignments.length,
        opening: assignments.filter(a => a.status === 'opening').length,
        submitted: assignments.filter(a => a.status === 'submitted').length,
        graded: assignments.filter(a => a.status === 'graded').length,
    };

    return (
        <div>
            <div className={styles.assignmentFilters}>
                <div className={styles.tabButtons}>
                    <Button
                        type={filter === 'all' ? 'primary' : 'default'}
                        danger={filter === 'all'}
                        onClick={() => setFilter('all')}
                    >
                        Tất cả ({counts.all})
                    </Button>
                    <Button
                        type={filter === 'opening' ? 'primary' : 'default'}
                        danger={filter === 'opening'}
                        onClick={() => setFilter('opening')}
                    >
                        Đang mở ({counts.opening})
                    </Button>
                    <Button
                        type={filter === 'submitted' ? 'primary' : 'default'}
                        danger={filter === 'submitted'}
                        onClick={() => setFilter('submitted')}
                    >
                        Đã nộp ({counts.submitted})
                    </Button>
                    <Button
                        type={filter === 'graded' ? 'primary' : 'default'}
                        danger={filter === 'graded'}
                        onClick={() => setFilter('graded')}
                    >
                        Đã chấm ({counts.graded})
                    </Button>
                </div>
                <Select defaultValue="newest" style={{ width: 160 }} size="large">
                    <Option value="newest">Mới nhất trước</Option>
                    <Option value="deadline">Gần hạn nhất</Option>
                </Select>
            </div>

            <div className={styles.assignmentList}>
                {filteredAssignments.map(item => (
                    <div key={item.id} className={styles.assignItem}>
                        <div className={styles.assignIcon}>
                            {item.type === 'quiz' ? <FormOutlined /> : <BookOutlined />}
                        </div>
                        <div className={styles.assignMain}>
                            <div className={styles.assignTitle}>{item.title}</div>
                            <div className={styles.assignMeta}>
                                <span className={clsx(styles.deadline, item.deadline?.includes('Hôm nay') && styles.danger)}>
                                    <ClockCircleOutlined /> {item.deadline}
                                </span>
                                {item.instructor && <span>Đăng bởi: Giảng viên {item.instructor}</span>}
                                {item.time && <span>{item.time}</span>}
                                {item.comment && <span>Nhận xét: "{item.comment}"</span>}
                            </div>
                        </div>
                        <div className={styles.assignScore}>
                            {item.score ? (
                                <>
                                    <div className={styles.scoreLabel}>Điểm số</div>
                                    <div className={styles.scoreValue}>{item.score}<span>/10</span></div>
                                </>
                            ) : (
                                <Tag color={item.status === 'submitted' ? 'gold' : 'blue'}>
                                    {item.status === 'submitted' ? 'Đã nộp' : 'Đang mở'}
                                </Tag>
                            )}
                        </div>
                        <div className={styles.assignAction}>
                            {item.status === 'opening' && (
                                <Button type="primary" danger onClick={() => handleAction(item)}>
                                    Làm bài ngay
                                </Button>
                            )}
                            {item.status === 'submitted' && (
                                <Button onClick={() => handleAction(item)}>
                                    Xem bài nộp
                                </Button>
                            )}
                            {item.status === 'graded' && (
                                <Button onClick={() => handleAction(item)}>
                                    Xem kết quả
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <footer className={styles.footer}>
                <div className={styles.paginationInfo}>
                    Hiển thị {filteredAssignments.length > 0 ? 1 : 0} đến {filteredAssignments.length} của {filteredAssignments.length} bài tập
                </div>
                <Pagination defaultCurrent={1} total={filteredAssignments.length} pageSize={5} size="middle" />
            </footer>
        </div>
    );
};

export default AssignmentsTab;
