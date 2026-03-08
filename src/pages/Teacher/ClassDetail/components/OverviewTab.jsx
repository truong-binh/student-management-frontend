import React, { useRef, useState } from 'react';
import { Button, Input, Avatar, Tooltip } from 'antd';
import {
    InfoCircleOutlined,
    DatabaseOutlined,
    FilePdfOutlined,
    FileZipOutlined,
    EditOutlined,
    PlusOutlined,
    CloudDownloadOutlined,
    PaperClipOutlined,
    PictureOutlined,
    LikeOutlined,
    MessageOutlined,
    EllipsisOutlined,
    InboxOutlined,
} from '@ant-design/icons';
import styles from '../styles.module.scss';
import userDefault from '@/assets/images/logos/user_default.png';

const { TextArea } = Input;

const files = [
    { name: 'Bài giảng chương 1 - Tổng quan O...', size: '2.4 MB', date: 'Đã tải lên 2 ngày trước', icon: <FilePdfOutlined />, iconBg: '#fee2e2', iconColor: '#ef4444' },
    { name: 'Danh sách bài tập thực hành tuần...', size: '512 KB', date: 'Đã tải lên 1 ngày trước', icon: <FilePdfOutlined />, iconBg: '#dbeafe', iconColor: '#3b82f6' },
    { name: 'Source Code mẫu Java_Lab1.zip', size: '15.6 MB', date: 'Đã tải lên 5 giờ trước', icon: <FileZipOutlined />, iconBg: '#dcfce7', iconColor: '#22c55e' },
];

const posts = [
    {
        id: 1,
        avatar: userDefault,
        name: 'Nguyễn Văn A',
        time: 'Thứ Hai, 1/01/2026 - 10:30 AM',
        content: 'Chào cả lớp, thầy đã cập nhật danh sách bài tập thực hành tuần 1 trong mục "Tài liệu học tập". Các em lưu ý hạn nộp bài là 23:59 Chủ Nhật này nhé. Chúc các em học tốt!',
        replies: 12,
        likes: 45,
    },
    {
        id: 2,
        avatar: userDefault,
        name: 'Nguyễn Văn A',
        time: '10/01/2026 - 14:20 PM',
        content: 'Thông báo thay đổi lịch học: Buổi học sáng thứ Tư tuần này sẽ chuyển sang học online qua Zoom do thầy bận công tác đột xuất. Link Zoom thầy sẽ gửi qua email lớp.',
        replies: 8,
        likes: 32,
    },
];

const OverviewTab = ({ color }) => {
    const [announcement, setAnnouncement] = useState('');
    const [postList, setPostList] = useState(posts);
    const [description, setDescription] = useState(
        'Học phần cung cấp kiến thức nền tảng về tư duy lập trình hướng đối tượng (OOP) sử dụng ngôn ngữ Java hoặc C++. Nội dung bao gồm các nguyên lý: Đóng gói (Encapsulation), Kế thừa (Inheritance), Đa hình (Polymorphism) và Trừu tượng (Abstraction).\n\nSinh viên sẽ được thực hành thiết kế hệ thống, quản lý bộ nhớ và xử lý ngoại lệ trong môi trường phát triển chuyên nghiệp.'
    );
    const [editingDesc, setEditingDesc] = useState(false);

    const handlePost = () => {
        if (!announcement.trim()) return;
        setPostList([
            {
                id: Date.now(),
                avatar: userDefault,
                name: 'Nguyễn Văn A',
                time: new Date().toLocaleString('vi-VN'),
                content: announcement.trim(),
                replies: 0,
                likes: 0,
            },
            ...postList,
        ]);
        setAnnouncement('');
    };

    return (
        <div className={styles.overviewWrap}>
            {/* Top two-column section */}
            <div className={styles.overviewGrid}>
                {/* LEFT: Mô tả + Đề cương */}
                <div className={styles.overviewLeft}>
                    {/* Mô tả học phần */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <span className={styles.cardHeaderLeft}>
                                <InfoCircleOutlined className={styles.icon} />
                                Mô tả học phần
                            </span>
                            <Button
                                type="link"
                                icon={<EditOutlined />}
                                className={styles.editBtn}
                                onClick={() => setEditingDesc(!editingDesc)}
                            >
                                {editingDesc ? 'Lưu' : 'Chỉnh sửa'}
                            </Button>
                        </div>
                        {editingDesc ? (
                            <TextArea
                                rows={6}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className={styles.descTextarea}
                            />
                        ) : (
                            <p className={styles.description}>{description}</p>
                        )}
                    </div>

                    {/* Đề cương */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <span className={styles.cardHeaderLeft}>
                                <DatabaseOutlined className={styles.icon} />
                                Đề cương
                            </span>
                        </div>
                        <div className={styles.uploadArea}>
                            <InboxOutlined className={styles.uploadIcon} />
                            <p className={styles.uploadText}>Kéo thả hoặc nhấn để tải lên đề cương</p>
                            <p className={styles.uploadHint}>Định dạng hỗ trợ: PDF, DOCX (Tối đa 10MB)</p>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Tài liệu học tập */}
                <div className={styles.overviewRight}>
                    <div className={styles.card} style={{ height: '100%' }}>
                        <div className={styles.cardHeader}>
                            <span className={styles.cardHeaderLeft}>
                                <DatabaseOutlined className={styles.icon} />
                                Tài liệu học tập
                            </span>
                            <Button
                                type="primary"
                                danger
                                size="small"
                                icon={<PlusOutlined />}
                                className={styles.addBtn}
                            >
                                Thêm tài liệu
                            </Button>
                        </div>
                        <div className={styles.fileList}>
                            {files.map((f, i) => (
                                <div key={i} className={styles.fileItem}>
                                    <div className={styles.fileInfo}>
                                        <div
                                            className={styles.fileIcon}
                                            style={{ background: f.iconBg, color: f.iconColor }}
                                        >
                                            {f.icon}
                                        </div>
                                        <div className={styles.fileMeta}>
                                            <div className={styles.fileName}>{f.name}</div>
                                            <div className={styles.fileSize}>{f.size} • {f.date}</div>
                                        </div>
                                    </div>
                                    <CloudDownloadOutlined className={styles.downloadBtn} />
                                </div>
                            ))}
                        </div>
                        <Button type="link" danger style={{ padding: 0, marginTop: 12, fontWeight: 600 }}>
                            Xem tất cả tài liệu
                        </Button>
                    </div>
                </div>
            </div>

            {/* Thông báo lớp học */}
            <div className={`${styles.card} ${styles.announcementSection}`}>
                <div className={styles.cardHeader}>
                    <span className={styles.cardHeaderLeft}>
                        <MessageOutlined className={styles.icon} />
                        Thông báo lớp học
                    </span>
                </div>

                {/* Input area */}
                <div className={styles.postInput}>
                    <TextArea
                        rows={3}
                        placeholder="Nhập thông báo mới cho sinh viên của bạn..."
                        value={announcement}
                        onChange={(e) => setAnnouncement(e.target.value)}
                        className={styles.postTextarea}
                    />
                    <div className={styles.postActions}>
                        <div className={styles.postTools}>
                            <Tooltip title="Đính kèm ảnh">
                                <Button type="text" icon={<PictureOutlined />} className={styles.toolBtn} />
                            </Tooltip>
                            <Tooltip title="Đính kèm file">
                                <Button type="text" icon={<PaperClipOutlined />} className={styles.toolBtn} />
                            </Tooltip>
                        </div>
                        <Button
                            type="primary"
                            danger
                            className={styles.postBtn}
                            onClick={handlePost}
                            disabled={!announcement.trim()}
                        >
                            Đăng thông báo
                        </Button>
                    </div>
                </div>

                {/* Post list */}
                <div className={styles.postList}>
                    {postList.map((post) => (
                        <div key={post.id} className={styles.postItem}>
                            <Avatar src={post.avatar} size={44} className={styles.postAvatar} />
                            <div className={styles.postBody}>
                                <div className={styles.postHeader}>
                                    <div>
                                        <span className={styles.postName}>{post.name}</span>
                                        <span className={styles.postTime}>{post.time}</span>
                                    </div>
                                    <Button type="text" icon={<EllipsisOutlined />} className={styles.moreBtn} />
                                </div>
                                <p className={styles.postContent}>{post.content}</p>
                                <div className={styles.postFooter}>
                                    <span className={styles.postReact}>
                                        <MessageOutlined /> {post.replies} Phản hồi
                                    </span>
                                    <span className={styles.postReact}>
                                        <LikeOutlined /> {post.likes} Lượt thích
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;
