import React, { useState } from 'react';
import { Button, Input, Select, Table, Tag, Pagination, DatePicker, Avatar, Tooltip } from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    SyncOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined,
    ArrowRightOutlined,
    ArrowLeftOutlined,
    DownloadOutlined,
    CopyOutlined,
    FilePdfOutlined,
    InfoCircleOutlined,
    EditOutlined,
    UserOutlined,
    PaperClipOutlined,
    MessageOutlined,
    LineChartOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/User/MainLayout';
import { useMySubmissions } from '@/hooks/useSubmission';
import dayjs from 'dayjs';
import styles from './styles.module.scss';
import clsx from 'clsx';

const { Option } = Select;

const Feedback = () => {
    const navigate = useNavigate();
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'

    const { mySubmissions, isLoading } = useMySubmissions();
    const [searchText, setSearchText] = useState('');
    const [fStatus, setFStatus] = useState('all');
    const [fDate, setFDate] = useState(null);

    const allFeedbacks = React.useMemo(() =>
        mySubmissions.filter(sub => sub.feedbackStatus && sub.feedbackStatus !== 'NONE'),
        [mySubmissions]
    );

    const filteredFeedbacks = React.useMemo(() => {
        let res = [...allFeedbacks];

        if (fStatus !== 'all') {
            const targetMap = {
                'pending': 'PENDING',
                'completed': 'RESOLVED',
                'rejected': 'REJECTED'
            };
            res = res.filter(f => f.feedbackStatus === targetMap[fStatus]);
        }

        if (searchText) {
            const low = searchText.toLowerCase();
            res = res.filter(f =>
                f.assignment?.title?.toLowerCase().includes(low) ||
                f.assignment?.courseId?.courseName?.toLowerCase().includes(low)
            );
        }

        if (fDate) {
            const sel = fDate.format('YYYY-MM-DD');
            res = res.filter(f => {
                const date = f.studentFeedback?.submittedAt || f.feedbackDate;
                return date && dayjs(date).format('YYYY-MM-DD') === sel;
            });
        }
        return res;
    }, [allFeedbacks, fStatus, searchText, fDate]);

    const stats = {
        pending: allFeedbacks.filter(s => s.feedbackStatus === 'PENDING').length,
        completed: allFeedbacks.filter(s => s.feedbackStatus === 'RESOLVED').length,
        rejected: allFeedbacks.filter(s => s.feedbackStatus === 'REJECTED').length
    };

    const columns = [
        {
            title: 'Lớp học',
            key: 'subject',
            render: (_, record) => (
                <div className={styles.subjectName}>
                    {record.assignment?.courseId?.courseName || record.assignment?.course?.title || record.assignment?.classroom?._id || 'N/A'}
                </div>
            )
        },
        {
            title: 'TÊN BÀI TẬP/KỲ THI',
            key: 'exam',
            render: (_, record) => <div className={styles.examName}>{record.assignment?.title || 'BÀI TẬP'}</div>
        },
        {
            title: 'NGÀY GỬI',
            key: 'date',
            render: (_, record) => {
                const date = record.studentFeedback?.submittedAt || record.feedbackDate;
                return date ? dayjs(date).format('DD/MM/YYYY') : '—';
            }
        },
        {
            title: 'TRẠNG THÁI',
            dataIndex: 'feedbackStatus',
            key: 'status',
            render: (status) => {
                const label = status === 'PENDING' ? 'Đang xử lý' : 'Đã giải quyết';
                const cls = status === 'PENDING' ? 'pending' : 'completed';
                return (
                    <div className={clsx(styles.statusGroup, styles[cls])}>
                        <div className={styles.dot} />
                        {label}
                    </div>
                );
            }
        },
        {
            title: 'HÀNH ĐỘNG',
            key: 'action',
            render: (_, record) => (
                <div
                    className={styles.actionBtn}
                    onClick={() => {
                        const classId = record.assignment?.classroom?._id || record.assignment?.classroom;
                        const assignId = record.assignment?.id || record.assignment?._id;
                        navigate(`/classes/${classId}/assignments/${assignId}/feedback`);
                    }}
                >
                    Xem chi tiết <ArrowRightOutlined />
                </div>
            )
        }
    ];

    const renderListView = () => (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <h1>Quản lý yêu cầu phúc khảo</h1>
                    <p>Theo dõi và cập nhật trạng thái các đơn phúc khảo của bạn</p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    className={styles.createBtn}
                    onClick={() => navigate('/classes')}
                >
                    Tạo yêu cầu mới
                </Button>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.info}>
                        <div className={styles.label}>Đang xử lý</div>
                        <div className={styles.value}>{stats.pending}</div>
                    </div>
                    <div className={clsx(styles.iconCircle, styles.pending)}>
                        <SyncOutlined />
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.info}>
                        <div className={styles.label}>Đã hoàn thành</div>
                        <div className={styles.value}>{stats.completed}</div>
                    </div>
                    <div className={clsx(styles.iconCircle, styles.completed)}>
                        <CheckCircleOutlined />
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.info}>
                        <div className={styles.label}>Bị từ chối</div>
                        <div className={styles.value}>{stats.rejected}</div>
                    </div>
                    <div className={clsx(styles.iconCircle, styles.rejected)}>
                        <CloseCircleOutlined />
                    </div>
                </div>
            </div>

            <div className={styles.filterBar}>
                <div className={styles.searchInput}>
                    <Input
                        placeholder="Tìm kiếm theo mã ticket hoặc tên môn học..."
                        prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>
                <Select
                    className={styles.selectFilter}
                    value={fStatus}
                    onChange={setFStatus}
                >
                    <Option value="all">Tất cả trạng thái</Option>
                    <Option value="pending">Đang xử lý</Option>
                    <Option value="completed">Đã phúc khảo</Option>
                    <Option value="rejected">Từ chối</Option>
                </Select>
                <DatePicker
                    className={styles.datePicker}
                    placeholder="mm/dd/yyyy"
                    value={fDate}
                    onChange={setFDate}
                />
            </div>

            <div className={styles.tableCard}>
                <Table
                    columns={columns}
                    dataSource={filteredFeedbacks}
                    loading={isLoading}
                    pagination={false}
                    className={styles.feedbackTable}
                    rowKey="id"
                />
                <div className={styles.tableFooter}>
                    <div className={styles.paginationInfo}>Hiển thị 1-{filteredFeedbacks.length} trên {filteredFeedbacks.length} kết quả</div>
                    <Pagination total={filteredFeedbacks.length} pageSize={filteredFeedbacks.length} showSizeChanger={false} />
                </div>
            </div>
        </div>
    );

    const renderDetailView = () => (
        <div className={clsx(styles.container, styles.detailContainer)}>
            {/* ... detail view remains same as before ... */}
        </div>
    );

    return (
        <MainLayout>
            {viewMode === 'list' ? renderListView() : renderDetailView()}
        </MainLayout>
    );
};

export default Feedback;
