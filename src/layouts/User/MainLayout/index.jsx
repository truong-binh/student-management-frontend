import React, { useState, useEffect, useMemo } from 'react';
import styles from './styles.module.scss';
import StudentSidebar from './Sidebar';
import { Input, Badge, Avatar, Popover, Button, Empty, Spin } from 'antd';
import {
    SearchOutlined,
    BellOutlined,
    SettingOutlined,
    MenuOutlined,
    BookOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    MessageOutlined,
    NotificationOutlined,
    PaperClipOutlined,
    FileTextOutlined,
    ReloadOutlined,
    CheckOutlined,
    DownOutlined,
} from '@ant-design/icons';
import userDefault from '@/assets/images/logos/user_default.png';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useNavigate, useLocation } from 'react-router-dom';
import useMediaQuery from '@/utils/hooks/useMediaQuery';

// Trùng với breakpoint ẩn sidebar trong styles.module.scss
const MOBILE_QUERY = '(max-width: 992px)';

const NOTIFICATION_LIMIT = 6;

const getMetaId = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value._id) return value._id;
    return '';
};

const formatNotificationTime = (dateValue) => {
    if (!dateValue) return '';

    const createdAt = new Date(dateValue);
    if (Number.isNaN(createdAt.getTime())) return '';

    const diffInSeconds = Math.max(0, Math.floor((Date.now() - createdAt.getTime()) / 1000));
    if (diffInSeconds < 60) return 'vừa xong';

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ngày trước`;

    const day = String(createdAt.getDate()).padStart(2, '0');
    const month = String(createdAt.getMonth() + 1).padStart(2, '0');
    const year = createdAt.getFullYear();
    return `${day}/${month}/${year}`;
};

const getNotificationTypeMeta = (type) => {
    switch (type) {
    case 'ASSIGNMENT_NEW':
        return { label: 'Bài tập mới', Icon: BookOutlined };
    case 'ASSIGNMENT_DEADLINE':
        return { label: 'Sắp đến hạn nộp', Icon: ClockCircleOutlined };
    case 'STUDENT_FEEDBACK':
        return { label: 'Phản hồi từ sinh viên', Icon: MessageOutlined };
    case 'SUBMISSION_GRADED':
        return { label: 'Bài nộp đã chấm', Icon: CheckCircleOutlined };
    case 'FEEDBACK_REPLIED':
        return { label: 'Giảng viên phản hồi', Icon: MessageOutlined };
    case 'ANNOUNCEMENT_NEW':
        return { label: 'Thông báo lớp', Icon: NotificationOutlined };
    case 'MATERIAL_NEW':
        return { label: 'Tài liệu mới', Icon: PaperClipOutlined };
    case 'SYLLABUS_NEW':
        return { label: 'Đề cương mới', Icon: FileTextOutlined };
    default:
        return { label: 'Thông báo', Icon: BellOutlined };
    }
};

const getNotificationTargetPath = (notification, role) => {
    const metadata = notification?.metadata || {};
    const courseId = getMetaId(metadata.courseId);
    const assignmentId = getMetaId(metadata.assignmentId);
    const isLecturer = role === 'LECTURER';

    switch (notification?.type) {
    case 'ASSIGNMENT_NEW':
    case 'ASSIGNMENT_DEADLINE':
        if (courseId && assignmentId) {
            if (isLecturer) {
                return `/teacher/classes/${courseId}?tab=assignments&assignmentId=${assignmentId}`;
            }
            return `/classes/${courseId}/assignments/${assignmentId}`;
        }
        return null;

    case 'SUBMISSION_GRADED':
        if (courseId && assignmentId && !isLecturer) {
            return `/classes/${courseId}/assignments/${assignmentId}/result`;
        }
        return null;

    case 'FEEDBACK_REPLIED':
        if (courseId && assignmentId && !isLecturer) {
            return `/classes/${courseId}/assignments/${assignmentId}/feedback`;
        }
        return null;

    case 'ANNOUNCEMENT_NEW':
        return courseId ? `/classes/${courseId}/announcements` : null;

    case 'MATERIAL_NEW':
    case 'SYLLABUS_NEW':
        return courseId ? `/classes/${courseId}` : null;

    case 'STUDENT_FEEDBACK':
        if (isLecturer && courseId && assignmentId) {
            return `/teacher/classes/${courseId}?tab=assignments&assignmentId=${assignmentId}`;
        }
        return isLecturer ? '/teacher/feedback' : null;

    default:
        return null;
    }
};

function MainLayout(props) {
    const { children, menuItems } = props;
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useMediaQuery(MOBILE_QUERY);

    // State cho menu mobile (từ teacher2)
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [notificationOpen, setNotificationOpen] = useState(false);
    const [markingNotificationId, setMarkingNotificationId] = useState('');
    
    // State cho menu desktop (từ develop)
    const [collapsed, setCollapsed] = useState(() => {
        return localStorage.getItem('sidebar_collapsed') === 'true';
    });

    useEffect(() => {
        localStorage.setItem('sidebar_collapsed', collapsed);
    }, [collapsed]);

    // Quay về desktop thì đóng drawer để tránh kẹt overlay
    useEffect(() => {
        if (!isMobile) setSidebarOpen(false);
    }, [isMobile]);

    // Đổi trang thì đóng drawer
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    // Khoá scroll nền khi drawer đang mở
    useEffect(() => {
        if (!sidebarOpen) return undefined;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [sidebarOpen]);

    const {
        notifications,
        unreadCount,
        pagination,
        isLoadingNotifications,
        isRefetchingNotifications,
        notificationsError,
        refetchNotifications,
        fetchNextNotifications,
        hasNextNotifications,
        isFetchingNextNotifications,
        markAsRead,
        isMarkingAsRead,
        markAllAsRead,
        isMarkingAllAsRead,
    } = useNotifications({
        enabled: !!user,
        limit: NOTIFICATION_LIMIT,
        pollInterval: 20000,
    });

    const totalNotifications = pagination?.total || notifications.length;

    const notificationItems = useMemo(() => {
        return notifications.map((item) => {
            const typeMeta = getNotificationTypeMeta(item?.type);
            return {
                ...item,
                typeLabel: typeMeta.label,
                TypeIcon: typeMeta.Icon,
                timeText: formatNotificationTime(item?.createdAt),
            };
        });
    }, [notifications]);

    const handleBellOpenChange = (open) => {
        setNotificationOpen(open);
        if (open) {
            refetchNotifications();
        }
    };

    const handleRefreshNotifications = async (event) => {
        event.stopPropagation();
        await refetchNotifications();
    };

    const handleMarkAllAsRead = async (event) => {
        event.stopPropagation();
        if (!unreadCount || isMarkingAllAsRead) return;

        try {
            await markAllAsRead();
        } catch (error) {
            console.error('Mark all notifications as read failed:', error);
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification?._id) return;

        if (!notification.isRead) {
            try {
                setMarkingNotificationId(notification._id);
                await markAsRead(notification._id);
            } catch (error) {
                console.error('Mark notification as read failed:', error);
            } finally {
                setMarkingNotificationId('');
            }
        }

        const targetPath = getNotificationTargetPath(notification, user?.role);
        if (targetPath) {
            setNotificationOpen(false);
            navigate(targetPath);
        }
    };

    const notificationContent = (
        <div className={styles.notificationPanel}>
            <div className={styles.notificationHeader}>
                <h4>Thông báo của tôi ({totalNotifications})</h4>
                <div className={styles.notificationHeaderActions}>
                    <Button
                        type="text"
                        icon={<ReloadOutlined />}
                        className={styles.notificationActionBtn}
                        loading={isRefetchingNotifications && !isLoadingNotifications}
                        onClick={handleRefreshNotifications}
                    />
                    <Button
                        type="text"
                        icon={<CheckOutlined />}
                        className={styles.notificationActionBtn}
                        disabled={!unreadCount}
                        loading={isMarkingAllAsRead}
                        onClick={handleMarkAllAsRead}
                    />
                </div>
            </div>

            <div className={styles.notificationBody}>
                {isLoadingNotifications ? (
                    <div className={styles.notificationState}>
                        <Spin size="small" />
                    </div>
                ) : notificationsError ? (
                    <div className={styles.notificationState}>Không thể tải thông báo</div>
                ) : notificationItems.length === 0 ? (
                    <div className={styles.notificationState}>
                        <Empty
                            description="Chưa có thông báo"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    </div>
                ) : (
                    <div className={styles.notificationList}>
                        {notificationItems.map((item, index) => {
                            const isUnread = !item?.isRead;
                            const isMarkingCurrent = isMarkingAsRead && markingNotificationId === item?._id;

                            return (
                                <button
                                    type="button"
                                    key={String(item?._id || `${item?.createdAt || ''}-${index}`)}
                                    className={`${styles.notificationItem} ${isUnread ? styles.unread : ''}`}
                                    onClick={() => handleNotificationClick(item)}
                                >
                                    <div className={styles.notificationTypeRow}>
                                        <div className={styles.notificationTypeTag}>
                                            <item.TypeIcon className={styles.notificationTypeIcon} />
                                            <span>{item.typeLabel}</span>
                                        </div>
                                        <span className={styles.notificationTime}>{item.timeText}</span>
                                    </div>

                                    <h5>{item.title}</h5>
                                    <p>{item.message}</p>

                                    <div className={styles.notificationFooterRow}>
                                        {isUnread && <span className={styles.unreadDot} />}
                                        {isMarkingCurrent && <Spin size="small" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {hasNextNotifications && (
                <div className={styles.loadMoreWrap}>
                    <Button
                        type="text"
                        icon={<DownOutlined />}
                        className={styles.loadMoreBtn}
                        loading={isFetchingNextNotifications}
                        onClick={() => fetchNextNotifications()}
                    >
                        Tải thêm
                    </Button>
                </div>
            )}
        </div>
    );

    return (
        <div className={`
            ${styles.container} 
            ${collapsed ? styles.sidebarCollapsed : ''} 
        `}>
            <StudentSidebar
                menuItems={menuItems}
                // Các props cho mobile
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                setIsMobileMenuOpen={setSidebarOpen}
                // Các props cho desktop (trên mobile luôn mở rộng để thấy nhãn menu)
                collapsed={!isMobile && collapsed}
                setCollapsed={setCollapsed}
            />
            
            {/* Lớp phủ đen khi mở menu trên điện thoại */}
            {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}
            
            <div className={styles.mainContent}>
                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        {/* Nút hamburger mở menu trên mobile */}
                        <button
                            type="button"
                            className={styles.menuBtn}
                            aria-label="Mở menu"
                            aria-expanded={sidebarOpen}
                            onClick={() => setSidebarOpen(true)}
                        >
                            <MenuOutlined />
                        </button>
                        <div className={styles.welcome}>
                            <h2>Chào mừng quay trở lại !</h2>
                        </div>
                    </div>

                    <div className={styles.userSection}>
                        <div className={styles.actions}>
                            <Popover
                                trigger="click"
                                placement="bottomRight"
                                open={notificationOpen}
                                onOpenChange={handleBellOpenChange}
                                overlayClassName={styles.notificationPopover}
                                content={notificationContent}
                            >
                                <Badge count={unreadCount} overflowCount={99}>
                                    <div className={styles.actionIcon}>
                                        <BellOutlined />
                                    </div>
                                </Badge>
                            </Popover>
                            <div className={styles.actionIcon}>
                                <SettingOutlined />
                            </div>
                        </div>
                        <div className={styles.userInfo}>
                            <p className={styles.userName}>{user?.fullName || user?.name || "N. V. A"}</p>
                        </div>
                        <Avatar size={40} src={userDefault} className={styles.userAvatar} />
                    </div>
                </header>

                <main className={styles.contentBody}>
                    {children}
                </main>
            </div>
        </div>
    );
}

export default MainLayout;