import React, { useState } from 'react';
import { Button } from 'antd';
import { CalendarOutlined, BarChartOutlined, DownOutlined } from '@ant-design/icons';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import styles from '../styles.module.scss';
import AssignmentDetail from './AssignmentDetail';
import { useCourseAssignments } from '@/hooks/useCourseAssignment';
import { Spin, Empty } from 'antd';

ChartJS.register(ArcElement, Tooltip, Legend);

const typeIcon = {
    lab: { bg: '#ebf8ff', color: '#3182ce', symbol: '>_' },
    object: { bg: '#f0fff4', color: '#38a169', symbol: '{}' },
    check: { bg: '#fffbeb', color: '#d69e2e', symbol: '✓' },
    alert: { bg: '#fff5f5', color: '#e53e3e', symbol: '!' },
};

const STATUS_CONFIG = {
    opening: { label: 'ĐANG MỞ', cls: styles.badgeOpening },
    completed: { label: 'QUÁ HẠN', cls: styles.badgeCompleted },
    graded: { label: 'ĐÃ CHẤM', cls: styles.badgeGraded },
};

const PAGE_SIZE = 4;

const AssignmentsTab = ({ classInfo, courseId }) => {
    const [filter, setFilter] = useState('all');
    const [showAll, setShowAll] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);

    const { assignments: rawAssignments, isLoading } = useCourseAssignments(courseId);

    const mappedAssignments = (rawAssignments || []).map((a, i) => {
        const isOverdue = new Date(a.dueDate) < new Date();
        const types = ['lab', 'object', 'check', 'alert'];
        return {
            id: a._id || a.id,
            title: a.title,
            deadline: new Date(a.dueDate).toLocaleString('vi-VN'),
            status: isOverdue ? 'completed' : 'opening',
            type: types[i % 4], // cycle through icons
            original: a,
        };
    });

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                <Spin tip="Đang tải danh sách bài tập..." />
            </div>
        );
    }

    if (selectedAssignment) {
        return (
            <AssignmentDetail
                assignment={selectedAssignment}
                classInfo={classInfo}
                onBack={() => setSelectedAssignment(null)}
            />
        );
    }

    const counts = {
        all: mappedAssignments.length,
        opening: mappedAssignments.filter(a => a.status === 'opening').length,
        completed: mappedAssignments.filter(a => a.status === 'completed').length,
        graded: mappedAssignments.filter(a => a.status === 'graded').length,
    };

    const filtered = filter === 'all' ? mappedAssignments : mappedAssignments.filter(a => a.status === filter);
    const displayed = showAll ? filtered : filtered.slice(0, PAGE_SIZE);
    const remaining = filtered.length - displayed.length;

    if (mappedAssignments.length === 0) {
        return (
            <div style={{ background: 'white', padding: '60px 0', borderRadius: 16 }}>
                <Empty description="Chưa có bài tập nào cho khóa học này" />
            </div>
        );
    }

    /* donut chart */
    const donutData = {
        datasets: [{
            data: [counts.opening, counts.completed, counts.graded],
            backgroundColor: ['#38a169', '#3182ce', '#e53e3e'],
            borderWidth: 0,
            hoverOffset: 6,
        }],
    };
    const donutOptions = {
        cutout: '72%',
        plugins: { legend: { display: false }, tooltip: { enabled: true } },
    };

    const FILTERS = [
        ['all', 'TẤT CẢ', counts.all],
        ['opening', 'ĐANG MỞ', counts.opening],
        ['completed', 'QUÁ HẠN', counts.completed],
    ];

    return (
        <div className={styles.assignWrap}>
            {/* ── Left: assignment list ── */}
            <div className={styles.assignLeft}>
                {/* Filter tabs */}
                <div className={styles.assignFilterRow}>
                    {FILTERS.map(([key, label, cnt]) => (
                        <button
                            key={key}
                            className={`${styles.filterBtn} ${filter === key ? styles.filterBtnActive : ''}`}
                            onClick={() => { setFilter(key); setShowAll(false); }}
                        >
                            {label} ({String(cnt).padStart(2, '0')})
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className={styles.assignList2}>
                    {displayed.map(item => {
                        const icon = typeIcon[item.type];
                        const badge = STATUS_CONFIG[item.status];
                        return (
                            <div key={item.id} className={styles.assignCard}>
                                <div
                                    className={styles.assignIconBox}
                                    style={{ background: icon.bg, color: icon.color }}
                                >
                                    {icon.symbol}
                                </div>
                                <div className={styles.assignCardMain}>
                                    <div className={styles.assignCardTitle}>{item.title}</div>
                                    <div className={styles.assignCardMeta}>
                                        <CalendarOutlined className={styles.calIcon} />
                                        <span>Hạn nộp: {item.deadline}</span>
                                        <span className={`${styles.assignBadge} ${badge.cls}`}>{badge.label}</span>
                                    </div>
                                </div>
                                <Button
                                    className={styles.viewDetailBtn}
                                    onClick={() => setSelectedAssignment(item)}
                                >
                                    Xem chi tiết
                                </Button>
                            </div>
                        );
                    })}
                </div>

                {/* See more */}
                {remaining > 0 && (
                    <button className={styles.seeMoreBtn} onClick={() => setShowAll(true)}>
                        <DownOutlined /> Xem thêm {remaining} bài tập khác
                    </button>
                )}
            </div>

            {/* ── Right: stats card ── */}
            <div className={styles.assignStatsCard}>
                <div className={styles.statsCardHeader}>
                    <span className={styles.statsCardTitle}>Thống kê bài tập</span>
                    <BarChartOutlined className={styles.statsCardIcon} />
                </div>

                <div className={styles.donutWrap}>
                    <Doughnut data={donutData} options={donutOptions} />
                    <div className={styles.donutCenter}>
                        <span className={styles.donutValue}>{counts.all}</span>
                        <span className={styles.donutLabel}>TỔNG CỘNG</span>
                    </div>
                </div>

                <div className={styles.statsLegend}>
                    <div className={styles.legendItem}>
                        <span className={styles.legendDot} style={{ background: '#38a169' }} />
                        <span className={styles.legendText}>Đang mở</span>
                        <span className={styles.legendCount}>{String(counts.opening).padStart(2, '0')} bài</span>
                    </div>
                    <div className={styles.legendItem}>
                        <span className={styles.legendDot} style={{ background: '#3182ce' }} />
                        <span className={styles.legendText}>Quá hạn</span>
                        <span className={styles.legendCount}>{String(counts.completed).padStart(2, '0')} bài</span>
                    </div>
                </div>

                <div className={styles.statsFooter}>
                    Dữ liệu được cập nhật thời gian thực
                </div>
            </div>
        </div>
    );
};

export default AssignmentsTab;
