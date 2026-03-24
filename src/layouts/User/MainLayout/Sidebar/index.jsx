import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './styles.module.scss';
import {
    AppstoreOutlined,
    ReadOutlined,
    CalendarOutlined,
    UserOutlined,
    MessageOutlined,
    LogoutOutlined,
    CloseOutlined, // Giữ lại từ teacher2 cho mobile
    MenuFoldOutlined, // Giữ lại từ develop cho desktop
    MenuUnfoldOutlined // Giữ lại từ develop cho desktop
} from '@ant-design/icons';
import logoPtit from '@/assets/images/svg/ptit.svg';
import { useAuth } from '@/hooks/useAuth';

const defaultMenuItems = [
    { key: 'dashboard', label: 'Tổng quan', icon: <AppstoreOutlined />, path: '/dashboard' },
    { key: 'classes', label: 'Lớp học', icon: <ReadOutlined />, path: '/classes' },
    { key: 'schedule', label: 'Thời khóa biểu', icon: <CalendarOutlined />, path: '/schedule' },
    { key: 'profile', label: 'Profile', icon: <UserOutlined />, path: '/profile' },
    { key: 'feedback', label: 'Phản hồi', icon: <MessageOutlined />, path: '/feedback' },
];

// Gộp tất cả các props từ cả 2 nhánh
const StudentSidebar = ({
    menuItems,
    isOpen,
    onClose,
    collapsed = false,
    setCollapsed = () => { },
    setIsMobileMenuOpen
}) => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    // Logic đóng menu trên điện thoại từ nhánh teacher2
    const closeMobileMenu = () => {
        if (onClose) {
            onClose();
            return;
        }
        if (setIsMobileMenuOpen) {
            setIsMobileMenuOpen(false);
        }
    };

    const handleLogout = () => {
        logout();
        closeMobileMenu(); // Sử dụng hàm đóng menu chung
        navigate('/login');
    };

    const items = menuItems || defaultMenuItems;

    return (
        // Kết hợp class cho cả trạng thái thu gọn (desktop) và mở (mobile)
        <div className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${isOpen ? styles.sidebarOpen : ''}`}>
            
            {/* Nút đóng menu trên mobile từ teacher2 */}
            <button className={styles.closeBtn} onClick={closeMobileMenu}>
                <CloseOutlined />
            </button>

            <div className={styles.logo}>
                <div className={styles.logoIcon}>
                    <img src={logoPtit} alt="Logo" />
                </div>
                {!collapsed && <h1 className={styles.logoText}>EDU PTIT</h1>}
            </div>

            <nav className={styles.nav}>
                <ul className={styles.menuList}>
                    {items.map((item) => (
                        <li key={item.key} className={styles.menuItem}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                                onClick={closeMobileMenu} // Đóng menu khi click vào link trên mobile
                            >
                                <span className={styles.icon}>{item.icon}</span>
                                {!collapsed && <span className={styles.label}>{item.label}</span>}
                            </NavLink>
                        </li>
                    ))}
                </ul>

                {/* Phần dưới cùng: chứa nút thu gọn và đăng xuất */}
                <div className={styles.bottomSection}>
                    <div className={styles.divider} />

                    {/* Nút thu gọn sidebar từ nhánh develop */}
                    <div className={styles.navLink} onClick={() => setCollapsed(!collapsed)} style={{ cursor: 'pointer', marginBottom: '8px' }}>
                        <span className={styles.icon}>
                            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        </span>
                        {!collapsed && <span className={styles.label}>Thu gọn</span>}
                    </div>

                    <div className={styles.navLink} onClick={handleLogout} style={{ cursor: 'pointer' }}>
                        <span className={styles.icon}><LogoutOutlined /></span>
                        {!collapsed && <span className={styles.label}>Đăng xuất</span>}
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default StudentSidebar;