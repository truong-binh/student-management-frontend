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

import { useCourseAssignments } from '@/hooks/useCourseAssignment';
import { useMySubmissions } from '@/hooks/useSubmission';
import dayjs from 'dayjs';

const { Option } = Select;

const AssignmentsTab = () => {
    const navigate = useNavigate();
    const { id: classId } = useParams();
    const [filter, setFilter] = useState('all');

    const { assignments: rawAssignments, isLoading: isAssignmentsLoading } = useCourseAssignments(classId);
    const { mySubmissions, isLoading: isSubmissionsLoading } = useMySubmissions();

    const assignments = useMemo(() => {
        if (!rawAssignments) return [];
        return rawAssignments.map(assignment => {
            const submission = mySubmissions.find(sub =>
                (sub.assignment?.id || sub.assignment?._id || sub.assignment) === (assignment.id || assignment._id)
            );

            let status = 'opening';
            let score = null;
            let comment = null;

            if (submission) {
                if (submission.status === 'GRADED' || submission.score !== null) {
                    status = 'graded';
                    score = submission.score;
                    comment = submission.aiFeedback;
                } else {
                    status = 'submitted';
                }
            } else if (assignment.dueDate && dayjs().isAfter(dayjs(assignment.dueDate))) {
                status = 'overdue';
            }

            return {
                id: assignment.id || assignment._id,
                title: assignment.title,
                deadline: assignment.dueDate ? `Hạn nộp: ${dayjs(assignment.dueDate).format('DD/MM/YYYY - HH:mm')}` : 'Không có hạn',
                status: status,
                score: score,
                comment: comment,
                type: 'assignment'
            };
        });
    }, [rawAssignments, mySubmissions]);

    const filteredAssignments = useMemo(() => {
        if (filter === 'all') return assignments;
        return assignments.filter(item => item.status === filter);
    }, [filter, assignments]);

    const handleAction = (item) => {
        if (item.status === 'opening' || item.status === 'overdue') {
            navigate(`/classes/${classId}/assignments/${item.id}`);
        } else if (item.status === 'submitted') {
            navigate(`/classes/${classId}/assignments/${item.id}`);
        } else if (item.status === 'graded') {
            navigate(`/classes/${classId}/assignments/${item.id}/result`);
        }
    };

    const counts = {
        all: assignments.length,
        opening: assignments.filter(a => a.status === 'opening' || a.status === 'overdue').length,
        submitted: assignments.filter(a => a.status === 'submitted').length,
        graded: assignments.filter(a => a.status === 'graded').length,
    };

    if (isAssignmentsLoading || isSubmissionsLoading) {
        return <div style={{ padding: 40, textAlign: 'center' }}>Đang tải bài tập...</div>;
    }

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
                            {item.score !== null ? (
                                <>
                                    <div className={styles.scoreLabel}>Điểm số</div>
                                    <div className={styles.scoreValue}>{item.score}<span>/10</span></div>
                                </>
                            ) : (
                                <Tag color={item.status === 'submitted' ? 'gold' : item.status === 'overdue' ? 'error' : 'blue'}>
                                    {item.status === 'submitted' ? 'Đã nộp' : item.status === 'overdue' ? 'Quá hạn' : 'Đang mở'}
                                </Tag>
                            )}
                        </div>
                        <div className={styles.assignAction}>
                            {(item.status === 'opening' || item.status === 'overdue') && (
                                <Button type="primary" danger={item.status === 'opening'} onClick={() => handleAction(item)}>
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
