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
    CloseOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined
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
        logout()
            .catch(() => null)
            .finally(() => {
                closeMobileMenu();
                navigate('/login', { replace: true });
            });
    };

    const items = menuItems || defaultMenuItems;

    return (
        <div className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${isOpen ? styles.sidebarOpen : ''}`}>
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
                            >
                                <span className={styles.icon}>{item.icon}</span>
                                {!collapsed && <span className={styles.label}>{item.label}</span>}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <button
                className={styles.collapseBtn}
                onClick={() => setCollapsed(!collapsed)}
                title={collapsed ? 'Mở rộng' : 'Thu gọn'}
            >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                {!collapsed && <span>{collapsed ? 'Mở rộng' : 'Thu gọn'}</span>}
            </button>

            <div className={styles.logoutSection}>
                <button className={styles.logoutBtn} onClick={handleLogout}>
                    <LogoutOutlined />
                    {!collapsed && <span>Đăng xuất</span>}
                </button>
            </div>
        </div>
    );
};

export default StudentSidebar;
