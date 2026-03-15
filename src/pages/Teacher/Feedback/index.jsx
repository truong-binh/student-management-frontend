import React, { useState } from 'react';
import { Button, Input, Table, Pagination } from 'antd';
import {
    CheckCircleOutlined,
    ArrowRightOutlined,
    ArrowLeftOutlined,
    MessageOutlined,
    AppstoreOutlined,
    ReadOutlined,
    CalendarOutlined,
    UserOutlined,
    SendOutlined,
    FileTextOutlined,
    IdcardOutlined,
    CalendarFilled,
    TeamOutlined,
    ExclamationCircleOutlined,
    BoldOutlined,
    ItalicOutlined,
    LinkOutlined,
    PaperClipOutlined,
    CaretRightOutlined,
    BookOutlined,
} from '@ant-design/icons';
import MainLayout from '@/layouts/User/MainLayout';
import styles from './styles.module.scss';
import clsx from 'clsx';

const { TextArea } = Input;

const teacherMenuItems = [
    { key: 'dashboard', label: 'Tổng quan', icon: <AppstoreOutlined />, path: '/teacher/dashboard' },
    { key: 'classes', label: 'Lớp học', icon: <ReadOutlined />, path: '/teacher/classes' },
    { key: 'schedule', label: 'Thời khóa biểu', icon: <CalendarOutlined />, path: '/teacher/schedule' },
    { key: 'profile', label: 'Profile', icon: <UserOutlined />, path: '/teacher/profile' },
    { key: 'feedback', label: 'Phản hồi', icon: <MessageOutlined />, path: '/teacher/feedback' },
];

const feedbackData = [
    {
        key: '1',
        student: { name: 'Nguyễn Văn An', initials: 'NA', color: '#e53e3e', msv: 'B21DCCN001' },
        classCode: 'INT1306',
        content: 'Em thấy bài giảng rất hay và chi tiết, đặc biệt phần giải thích về đệ quy. Tuy nhiên em muốn hỏi thêm về phần cây AVL ạ.',
        date: '10/03/2026',
        status: 'unreplied',
        statusText: 'Chưa trả lời',
    },
    {
        key: '2',
        student: { name: 'Trần Thị Bình', initials: 'TB', color: '#3182ce', msv: 'B21DCCN002' },
        classCode: 'INT1306',
        content: 'Thầy có thể giải thích kỹ hơn hàm phân cấu trúc dữ liệu trong bài học tuần 3 không ạ? Em đọc tài liệu vẫn chưa hiểu rõ.',
        date: '09/03/2026',
        status: 'replied',
        statusText: 'Đã trả lời',
        reply: 'Cảm ơn em đã phản hồi. Thầy sẽ giải thích lại trong buổi học tuần tới và upload video hướng dẫn thêm lên hệ thống nhé.',
    },
    {
        key: '3',
        student: { name: 'Lê Văn Cường', initials: 'LC', color: '#805ad5', msv: 'B21DCCN003' },
        classCode: 'INT1310',
        content: 'Tài liệu học tập rất đầy đủ và dễ hiểu. Cảm ơn thầy đã chuẩn bị bài giảng rất kỹ lưỡng. Em học được rất nhiều từ môn này.',
        date: '08/03/2026',
        status: 'replied',
        statusText: 'Đã trả lời',
        reply: 'Cảm ơn em, thầy rất vui khi nghe điều này. Hãy tiếp tục cố gắng nhé!',
    },
    {
        key: '4',
        student: { name: 'Phạm Thị Diệu', initials: 'PD', color: '#38b2ac', msv: 'B21DCCN004' },
        classCode: 'INT1310',
        content: 'Em không tải được file bài tập tuần 5 trên hệ thống từ hôm qua đến giờ. Thầy có thể kiểm tra lại đường dẫn không ạ?',
        date: '07/03/2026',
        status: 'unreplied',
        statusText: 'Chưa trả lời',
    },
    {
        key: '5',
        student: { name: 'Hoàng Văn Hải', initials: 'HH', color: '#5a67d8', msv: 'B21DCCN045' },
        classCode: 'INT1306',
        content: 'Thời gian nộp bài tập lớn có thể gia hạn thêm một tuần không ạ? Nhiều bạn trong lớp đang gặp khó khăn với phần database.',
        date: '06/03/2026',
        status: 'unreplied',
        statusText: 'Chưa trả lời',
    },
];

const TeacherFeedback = () => {
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [viewMode, setViewMode] = useState('list');
    const [statusFilter, setStatusFilter] = useState('all');
    const [replyText, setReplyText] = useState('');

    const counts = {
        total: feedbackData.length,
        unreplied: feedbackData.filter(f => f.status === 'unreplied').length,
        replied: feedbackData.filter(f => f.status === 'replied').length,
    };

    const filtered = feedbackData.filter(f => {
        const matchStatus = statusFilter === 'all' || f.status === statusFilter;
        return matchStatus;
    });

    const columns = [
        {
            title: 'HỌ VÀ TÊN',
            key: 'student',
            render: (_, record) => (
                <div className={styles.studentCell}>
                    <span className={styles.feedbackIcon} style={{ background: record.student.color }}>
                        <FileTextOutlined />
                    </span>
                    <div className={styles.studentName}>{record.student.name}</div>
                </div>
            ),
        },
        {
            title: 'MÃ SV',
            key: 'msv',
            render: (_, record) => <span className={styles.msvText}>{record.student.msv}</span>,
        },
        {
            title: 'MÃ LỚP',
            dataIndex: 'classCode',
            key: 'classCode',
            render: (text) => <span className={styles.classCode}>{text}</span>,
        },
        {
            title: 'LỜI PHẢN HỒI',
            key: 'content',
            render: (_, record) => (
                <div className={styles.contentPreview}>
                    {record.content.length > 70
                        ? record.content.slice(0, 70) + '...'
                        : record.content}
                </div>
            ),
        },
        {
            title: 'TRẠNG THÁI',
            key: 'status',
            render: (_, record) => (
                <div className={clsx(styles.statusGroup, styles[record.status])}>
                    <div className={styles.dot} />
                    {record.statusText}
                </div>
            ),
        },
        {
            title: '',
            key: 'action',
            render: (_, record) => (
                <div
                    className={styles.actionBtn}
                    onClick={() => {
                        setSelectedFeedback(record);
                        setReplyText('');
                        setViewMode('detail');
                    }}
                >
                    Xem chi tiết <ArrowRightOutlined />
                </div>
            ),
        },
    ];

    const renderListView = () => (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <h1>Danh sách phản hồi</h1>
                </div>
                <div className={styles.filterTabs}>
                    {[
                        { key: 'all', label: 'Tất cả' },
                        { key: 'unreplied', label: 'Chưa trả lời' },
                        { key: 'replied', label: 'Đã trả lời' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            className={clsx(styles.filterTab, statusFilter === tab.key && styles.active)}
                            onClick={() => setStatusFilter(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.info}>
                        <div className={styles.label}>TỔNG PHẢN HỒI</div>
                        <div className={styles.value}>{counts.total}</div>
                    </div>
                    <div className={clsx(styles.iconCircle, styles.total)}>
                        <MessageOutlined />
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.info}>
                        <div className={styles.label}>CHƯA PHẢN HỒI</div>
                        <div className={styles.value}>{counts.unreplied}</div>
                    </div>
                    <div className={clsx(styles.iconCircle, styles.pending)}>
                        <FileTextOutlined />
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.info}>
                        <div className={styles.label}>ĐÃ GIẢI QUYẾT</div>
                        <div className={styles.value}>{counts.replied}</div>
                    </div>
                    <div className={clsx(styles.iconCircle, styles.completed)}>
                        <CheckCircleOutlined />
                    </div>
                </div>
            </div>

            <div className={styles.tableCard}>
                <Table
                    columns={columns}
                    dataSource={filtered}
                    pagination={false}
                    className={styles.feedbackTable}
                />
                <div className={styles.tableFooter}>
                    <div className={styles.paginationInfo}>
                        Showing 1 to {filtered.length} of {counts.total} entries
                    </div>
                    <Pagination total={counts.total} pageSize={10} showSizeChanger={false} />
                </div>
            </div>
        </div>
    );

    const renderDetailView = () => {
        const item = selectedFeedback;

        return (
            <div className={clsx(styles.container, styles.detailContainer)}>
                <div className={styles.detailHeader}>
                    <div className={styles.breadcrumbNav}>
                        <span
                            style={{ cursor: 'pointer' }}
                            onClick={() => setViewMode('list')}
                        >
                            Danh sách phản hồi
                        </span>
                        <span className={styles.separator}>&gt;</span>
                        <span>Chi tiết phản hồi</span>
                    </div>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        className={styles.backBtn}
                        onClick={() => setViewMode('list')}
                    >
                        Quay lại danh sách
                    </Button>
                </div>

                {/* Student info card */}
                <div className={styles.studentInfoCard}>
                    <div className={styles.studentAvatar}>
                        <UserOutlined />
                    </div>
                    <div className={styles.studentMeta}>
                        <h2 className={styles.studentFullName}>{item.student.name}</h2>
                        <div className={styles.studentMetaGrid}>
                            <div className={styles.metaItem}>
                                <IdcardOutlined />
                                <span>MSSV: {item.student.msv}</span>
                            </div>
                            <div className={styles.metaItem}>
                                <TeamOutlined />
                                <span>Lớp: {item.classCode}</span>
                            </div>
                            <div className={styles.metaItem}>
                                <CalendarFilled />
                                <span>Ngày gửi: {item.date} 14:30</span>
                            </div>
                            <div className={styles.metaItem}>
                                <ExclamationCircleOutlined />
                                <span>Chủ đề: Phản hồi môn học</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feedback content */}
                <div className={styles.sectionBlock}>
                    <div className={styles.sectionTitle}>
                        <div className={styles.sectionIconRed}><MessageOutlined /></div>
                        Lời phản hồi
                    </div>
                    <div className={styles.sectionBody}>
                        <p className={styles.feedbackText}>{item.content}</p>
                    </div>
                </div>

                {/* Teacher's existing reply */}
                {item.status === 'replied' && item.reply && (
                    <div className={styles.sectionBlock}>
                        <div className={styles.sectionTitle}>
                            <div className={clsx(styles.sectionIconRed, styles.sectionIconBlue)}><SendOutlined /></div>
                            Câu trả lời của bạn
                        </div>
                        <div className={styles.sectionBody}>
                            <p className={styles.feedbackText}>{item.reply}</p>
                        </div>
                    </div>
                )}

                {/* Reply form */}
                {item.status === 'unreplied' && (
                    <div className={styles.sectionBlock}>
                        <div className={styles.sectionTitle}>
                            <div className={clsx(styles.sectionIconRed, styles.sectionIconBlue)}><SendOutlined /></div>
                            Câu trả lời của bạn
                        </div>
                        <div className={styles.replyEditor}>
                            <TextArea
                                rows={5}
                                placeholder="Nhập nội dung phản hồi cho sinh viên tại đây..."
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                className={styles.replyTextarea}
                                bordered={false}
                            />
                            <div className={styles.editorFooter}>
                                <div className={styles.editorToolbar}>
                                    <button className={styles.toolBtn}><BoldOutlined /></button>
                                    <button className={styles.toolBtn}><ItalicOutlined /></button>
                                    <button className={styles.toolBtn}><LinkOutlined /></button>
                                    <button className={styles.toolBtn}><PaperClipOutlined /></button>
                                </div>
                                <span className={styles.draftLabel}>Đang soạn thảo...</span>
                            </div>
                        </div>
                        <div className={styles.replySubmitRow}>
                            <Button
                                type="primary"
                                danger
                                className={styles.sendBtn}
                                icon={<CaretRightOutlined />}
                            >
                                Gửi phản hồi
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <MainLayout menuItems={teacherMenuItems}>
            {viewMode === 'list' ? renderListView() : renderDetailView()}
        </MainLayout>
    );
};

export default TeacherFeedback;
