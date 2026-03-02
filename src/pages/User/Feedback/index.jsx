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
import styles from './styles.module.scss';
import clsx from 'clsx';

const { Option } = Select;

const Feedback = () => {
    const navigate = useNavigate();
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'

    const feedbackData = [
        {
            key: '1',
            ticketId: '#PK-2024-001',
            subject: 'Cấu trúc dữ liệu & Giải thuật',
            exam: 'Thi cuối kỳ',
            date: '10/05/2024',
            status: 'pending',
            statusText: 'Đang xử lý'
        },
        {
            key: '2',
            ticketId: '#PK-2024-001',
            subject: 'Lập trình hướng đối tượng',
            exam: 'Bài tập lớn số 1',
            date: '08/05/2024',
            status: 'completed',
            statusText: 'Đã phúc khảo'
        },
        {
            key: '3',
            ticketId: '#PK-2024-003',
            subject: 'Mạng máy tính',
            exam: 'Thi giữa kỳ',
            date: '05/05/2024',
            status: 'rejected',
            statusText: 'Từ chối'
        },
        {
            key: '4',
            ticketId: '#PK-2024-004',
            subject: 'Cơ sở dữ liệu',
            exam: 'Bài tập thực hành 3',
            date: '02/05/2024',
            status: 'completed',
            statusText: 'Đã phúc khảo'
        },
        {
            key: '5',
            ticketId: '#PK-2024-005',
            subject: 'Toan rời rạc 1',
            exam: 'Thi cuối kỳ',
            date: '28/04/2024',
            status: 'completed',
            statusText: 'Đã phúc khảo'
        }
    ];

    const columns = [
        {
            title: 'MÃ TICKET',
            dataIndex: 'ticketId',
            key: 'ticketId',
            render: (text) => <span className={styles.ticketId}>{text}</span>
        },
        {
            title: 'TÊN MÔN HỌC',
            dataIndex: 'subject',
            key: 'subject',
            render: (text) => <div className={styles.subjectName}>{text}</div>
        },
        {
            title: 'TÊN BÀI TẬP/KỲ THI',
            dataIndex: 'exam',
            key: 'exam',
            render: (text) => <div className={styles.examName}>{text}</div>
        },
        {
            title: 'NGÀY GỬI',
            dataIndex: 'date',
            key: 'date'
        },
        {
            title: 'TRẠNG THÁI',
            dataIndex: 'status',
            key: 'status',
            render: (status, record) => (
                <div className={clsx(styles.statusGroup, styles[status])}>
                    <div className={styles.dot} />
                    {record.statusText}
                </div>
            )
        },
        {
            title: 'HÀNH ĐỘNG',
            key: 'action',
            render: (_, record) => (
                <div
                    className={styles.actionBtn}
                    onClick={() => {
                        setSelectedTicket(record);
                        setViewMode('detail');
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
                        <div className={styles.value}>12</div>
                    </div>
                    <div className={clsx(styles.iconCircle, styles.pending)}>
                        <SyncOutlined />
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.info}>
                        <div className={styles.label}>Đã hoàn thành</div>
                        <div className={styles.value}>45</div>
                    </div>
                    <div className={clsx(styles.iconCircle, styles.completed)}>
                        <CheckCircleOutlined />
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.info}>
                        <div className={styles.label}>Bị từ chối</div>
                        <div className={styles.value}>3</div>
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
                    />
                </div>
                <Select className={styles.selectFilter} defaultValue="all">
                    <Option value="all">Tất cả trạng thái</Option>
                    <Option value="pending">Đang xử lý</Option>
                    <Option value="completed">Đã phúc khảo</Option>
                    <Option value="rejected">Từ chối</Option>
                </Select>
                <DatePicker className={styles.datePicker} placeholder="mm/dd/yyyy" />
            </div>

            <div className={styles.tableCard}>
                <Table
                    columns={columns}
                    dataSource={feedbackData}
                    pagination={false}
                    className={styles.feedbackTable}
                />
                <div className={styles.tableFooter}>
                    <div className={styles.paginationInfo}>Hiển thị 1-5 trên 60 kết quả</div>
                    <Pagination total={60} pageSize={5} showSizeChanger={false} />
                </div>
            </div>
        </div>
    );

    const renderDetailView = () => (
        <div className={clsx(styles.container, styles.detailContainer)}>
            <div className={styles.detailHeader}>
                <div className={styles.breadcrumbNav}>
                    <span>Danh sách Chi tiết</span>
                    <span className={styles.separator}>&gt;</span>
                    <span>Chi tiết {selectedTicket?.ticketId || '#PK-2024-002'}</span>
                </div>
                <div className={styles.headerActions}>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        className={styles.backBtn}
                        onClick={() => setViewMode('list')}
                    >
                        Quay lại danh sách
                    </Button>
                    <Button
                        icon={<FilePdfOutlined />}
                        className={styles.downloadBtn}
                    >
                        Tải kết quả (PDF)
                    </Button>
                </div>
            </div>

            <div className={styles.alertSuccess}>
                <div className={styles.alertLeft}>
                    <div className={styles.alertIcon}>
                        <CheckCircleOutlined />
                    </div>
                    <div className={styles.alertText}>
                        <h4>Phúc khảo thành công</h4>
                        <p>Yêu cầu phúc khảo của bạn đã được chấp nhận và điểm đã được cập nhật.</p>
                    </div>
                </div>
                <div className={styles.alertRight}>
                    <div className={styles.dateLabel}>Hoàn tất ngày</div>
                    <div className={styles.dateValue}>15/05/2024</div>
                </div>
            </div>

            <div className={styles.detailBody}>
                <div className={styles.contentLeft}>
                    <div className={styles.detailCard}>
                        <div className={styles.cardTitle}>
                            <div className={styles.iconBox}><LineChartOutlined /></div>
                            So sánh điểm số
                        </div>

                        <div className={styles.scoreComparison}>
                            <div className={styles.scoreCircle}>
                                <div className={styles.label}>ĐIỂM CŨ</div>
                                <div className={styles.circle}>7.5</div>
                            </div>

                            <div className={styles.diffBox}>
                                <ArrowRightOutlined className={styles.arrow} />
                                <div className={styles.diffText}>+1.0 Điểm</div>
                            </div>

                            <div className={styles.scoreCircle}>
                                <div className={styles.label}>ĐIỂM MỚI</div>
                                <div className={clsx(styles.circle, styles.new)}>8.5</div>
                            </div>
                        </div>

                        <div className={styles.infoStrip}>
                            <div className={styles.infoBox}>
                                <label>MÔN HỌC</label>
                                <span>Lập trình hướng đối tượng</span>
                            </div>
                            <div className={styles.infoBox}>
                                <label>ĐẦU ĐIỂM</label>
                                <span>Bài tập lớn số 1</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.detailCard}>
                        <div className={styles.cardTitle}>
                            <div className={clsx(styles.iconBox, styles.msgIcon)} style={{ background: '#fff5f5' }}><MessageOutlined /></div>
                            Nội dung phản hồi
                        </div>

                        <div className={styles.feedbackContent}>
                            <label className={styles.feedbackLabel}>
                                Lý do thay đổi <span>(từ Giảng viên/Hội đồng)</span>
                            </label>
                            <div className={styles.feedbackBox}>
                                <p>
                                    "Sau khi xem xét lại bài làm của sinh viên, Hội đồng nhận thấy có sự nhầm lẫn trong việc tính tổng điểm thành phần ở câu 2 và câu 4. Cụ thể, câu 2 được chấm lại từ 1.5 lên 2.0 điểm, và câu 4 từ 2.0 lên 2.5 điểm. Tổng điểm đã được cập nhật chính xác trên hệ thống."
                                </p>
                                <div className={styles.authorBox}>
                                    <div className={styles.avatar}><UserOutlined /></div>
                                    <div className={styles.name}>Giảng viên: Nguyễn Văn A</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.sidebar}>
                    <div className={styles.sideCard}>
                        <div className={styles.sideTitle}>
                            <InfoCircleOutlined /> Thông tin yêu cầu
                        </div>

                        <div className={styles.ticketDetails}>
                            <div className={styles.detailRow}>
                                <div className={styles.label}>Mã Ticket</div>
                                <div className={clsx(styles.value, styles.ticketIdRow)}>
                                    {selectedTicket?.ticketId || '#PK-2024-002'}
                                    <Tooltip title="Copy"><CopyOutlined className={styles.copyIcon} /></Tooltip>
                                </div>
                            </div>

                            <div className={styles.detailRow}>
                                <div className={styles.label}>Ngày gửi yêu cầu</div>
                                <div className={styles.value}>08/05/2024 - 14:30</div>
                            </div>

                            <div className={styles.detailRow}>
                                <div className={styles.label}>Người xử lý</div>
                                <div className={styles.value}>Phòng Đào Tạo</div>
                            </div>

                            <div className={styles.reasonBlock}>
                                <div className={styles.label}>Lý do phúc khảo (của bạn)</div>
                                <div className={styles.reasonText}>
                                    "Em xin phép phúc khảo bài tập lớn số 1 vì em tính lại thấy tổng điểm các phần nhỏ cộng lại phải là 8.5 chứ không phải 7.5 như trên hệ thống ạ. Mong thầy cô xem xét lại giúp em."
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.sideCard}>
                        <div className={styles.sideTitle}>
                            <PaperClipOutlined /> Tài liệu đính kèm
                        </div>

                        <div className={styles.attachmentList}>
                            <div className={styles.fileItem}>
                                <div className={styles.fileIcon}><FilePdfOutlined /></div>
                                <div className={styles.fileInfo}>
                                    <div className={styles.fileName}>Minh_chung_ba...</div>
                                    <div className={styles.fileSize}>2.4 MB</div>
                                </div>
                                <DownloadOutlined className={styles.downloadIcon} />
                            </div>
                            <div className={styles.fileItem}>
                                <div className={styles.fileIcon}><FilePdfOutlined /></div>
                                <div className={styles.fileInfo}>
                                    <div className={styles.fileName}>Anh_chup_man...</div>
                                    <div className={styles.fileSize}>1.1 MB</div>
                                </div>
                                <DownloadOutlined className={styles.downloadIcon} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <MainLayout>
            {viewMode === 'list' ? renderListView() : renderDetailView()}
        </MainLayout>
    );
};

export default Feedback;
