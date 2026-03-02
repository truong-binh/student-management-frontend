import React from 'react';
import { Button, Upload, Table, Tag, Modal, message } from 'antd';
import {
    ArrowLeftOutlined,
    FilePdfOutlined,
    DownloadOutlined,
    CalendarOutlined,
    StarOutlined,
    InboxOutlined,
    FileTextOutlined,
    FolderOpenOutlined,
    FileAddOutlined,
    WarningOutlined,
    FileZipOutlined,
    CloudUploadOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import clsx from 'clsx';
import MainLayout from '@/layouts/User/MainLayout';
import styles from './styles.module.scss';

const { Dragger } = Upload;

const AssignmentSubmit = () => {
    const navigate = useNavigate();
    const { id, assignmentId } = useParams();

    const historyData = [
        {
            key: '1',
            fileName: 'B21DCCN001_BaiTapTuan5_Draft1.zip',
            submitTime: '12/10/2026 14:30',
            size: '1.2 MB',
            status: 'success',
        },
        {
            key: '2',
            fileName: 'Log_Report.txt',
            submitTime: '12/10/2026 14:30',
            size: '2 KB',
            status: 'success',
        },
    ];

    const columns = [
        {
            title: 'Tên File',
            dataIndex: 'fileName',
            key: 'fileName',
            render: (text) => (
                <div className={styles.fileCell}>
                    {text.endsWith('.zip') ? (
                        <FileZipOutlined className={styles.icon} />
                    ) : (
                        <FileTextOutlined className={styles.icon} />
                    )}
                    {text}
                </div>
            ),
        },
        {
            title: 'Thời gian nộp',
            dataIndex: 'submitTime',
            key: 'submitTime',
        },
        {
            title: 'Kích thước',
            dataIndex: 'size',
            key: 'size',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color="success" style={{ borderRadius: '4px' }}>Đã tải lên</Tag>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: () => (
                <div className={styles.actionCell}>
                    <span className={styles.download}>Tải xuống</span>
                </div>
            ),
        },
    ];

    const handleBack = () => {
        navigate(`/classes/${id}?tab=assignments`);
    };

    const uploadProps = {
        name: 'file',
        multiple: true,
        action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
        onChange(info) {
            const { status } = info.file;
            if (status !== 'uploading') {
                console.log(info.file, info.fileList);
            }
            if (status === 'done') {
                message.success(`${info.file.name} file uploaded successfully.`);
            } else if (status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
        onDrop(e) {
            console.log('Dropped files', e.dataTransfer.files);
        },
    };

    return (
        <MainLayout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.backBtn} onClick={handleBack}>
                        <ArrowLeftOutlined />
                    </div>
                    <div className={styles.titleInfo}>
                        <div className={styles.titleRow}>
                            <h1>Bài tập tuần 5 - Cây nhị phân</h1>
                            <span className={styles.classCode}>INT1302</span>
                        </div>
                        <div className={styles.breadcrumbs}>
                            <span>Lớp học phần</span>
                            <span className={styles.separator}>&gt;</span>
                            <span>INT1302</span>
                            <span className={styles.separator}>&gt;</span>
                            <span>Nộp bài</span>
                        </div>
                    </div>
                </div>

                <div className={styles.mainContent}>
                    <div className={styles.leftCol}>
                        <div className={styles.card}>
                            <h3>Thông tin bài tập</h3>
                            <div className={styles.assignmentDescription}>
                                <p>Sinh viên thực hiện cài đặt các thao tác cơ bản trên cây nhị phân tìm kiếm (Binary Search Tree):</p>
                                <ul>
                                    <li>Chèn một nút vào cây (Insert).</li>
                                    <li>Duyệt cây theo thứ tự trước, giữa, sau (Preorder, Inorder, Postorder).</li>
                                    <li>Tìm kiếm một giá trị trên cây.</li>
                                    <li>Xóa một nút khỏi cây.</li>
                                </ul>
                                <p>Yêu cầu nộp mã nguồn C++ và báo cáo kết quả chạy thử nghiệm.</p>
                            </div>

                            <div className={styles.resourceFile}>
                                <div className={styles.fileIcon}>
                                    <FilePdfOutlined />
                                </div>
                                <div className={styles.fileMeta}>
                                    <div className={styles.fileName}>Huong_dan_thuc_hanh_tuan_5.pdf</div>
                                    <div className={styles.fileSize}>2.4 MB • Đăng bởi GV Lê Thị Hoa</div>
                                </div>
                                <div className={styles.downloadBtn}>
                                    <DownloadOutlined />
                                </div>
                            </div>

                            <div className={styles.infoGrid} style={{ marginTop: '24px' }}>
                                <div className={clsx(styles.infoBox, styles.deadline)}>
                                    <span className={styles.label}>Hạn nộp bài</span>
                                    <span className={styles.value}>
                                        <CalendarOutlined /> 23:59, 15/10/2026
                                    </span>
                                </div>
                                <div className={clsx(styles.infoBox, styles.score)}>
                                    <span className={styles.label}>Điểm tối đa</span>
                                    <span className={styles.value}>
                                        <StarOutlined /> 10.0 điểm
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.card}>
                            <h3>Khu vực nộp bài</h3>
                            <div className={styles.uploadArea}>
                                <Dragger {...uploadProps}>
                                    <div className={styles.uploadIcons}>
                                        <FileTextOutlined />
                                        <FolderOpenOutlined />
                                        <FileAddOutlined />
                                    </div>
                                    <p className={styles.uploadText}>
                                        Kéo thả file vào đây hoặc <span>chọn file</span>
                                    </p>
                                    <p className={styles.uploadHint}>
                                        Hỗ trợ: .pdf, .docx, .cpp, .zip
                                    </p>
                                    <div className={styles.limitTag}>
                                        <WarningOutlined /> Dung lượng tối đa: 20MB
                                    </div>
                                </Dragger>
                            </div>
                            <div className={styles.actionRow}>
                                <Button type="primary" danger icon={<CloudUploadOutlined />}>
                                    Nộp bài
                                </Button>
                                <Button onClick={handleBack}>
                                    Hủy
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className={styles.rightCol}>
                        <div className={clsx(styles.card, styles.statusCard)}>
                            <div className={styles.statusHeader}>Trạng thái nộp bài</div>
                            <div className={styles.statusList}>
                                <div className={styles.statusItem}>
                                    <span className={styles.label}>Trạng thái</span>
                                    <span className={styles.tag}>Chưa nộp</span>
                                </div>
                                <div className={styles.statusItem}>
                                    <span className={styles.label}>Tình trạng chấm</span>
                                    <span className={styles.value}>Chưa chấm</span>
                                </div>
                                <div className={styles.statusItem}>
                                    <span className={styles.label}>Lần nộp cuối</span>
                                    <span className={styles.value}>-</span>
                                </div>

                                <div className={styles.timerBox}>
                                    <div className={styles.timerLabel}>Thời gian còn lại</div>
                                    <div className={styles.timeDigits}>
                                        <span className={styles.digit}>04</span>
                                        <span className={styles.dots}>:</span>
                                        <span className={styles.digit}>12</span>
                                        <span className={styles.dots}>:</span>
                                        <span className={styles.digit}>35</span>
                                    </div>
                                    <div className={styles.timeLabels}>
                                        <span>Ngày</span>
                                        <span>Phút</span>
                                        <span>Giây</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.noteCard}>
                            <h4>Lưu ý quan trọng</h4>
                            <p>
                                File nộp phải đặt tên theo đúng quy định:<br />
                                <strong>B21DCCNxxx_TenBaiTap.zip</strong>
                            </p>
                            <p style={{ marginTop: '12px' }}>
                                Hệ thống sẽ chỉ tính điểm cho lần nộp cuối cùng.<br />
                                Nộp bài quá hạn sẽ bị trừ điểm theo quy chế.
                            </p>
                        </div>
                    </div>
                </div>

                <div className={styles.historySection}>
                    <h3>Lịch sử nộp bài</h3>
                    <Table
                        columns={columns}
                        dataSource={historyData}
                        pagination={false}
                        className={styles.historyTable}
                    />
                </div>
            </div>
        </MainLayout>
    );
};

export default AssignmentSubmit;
