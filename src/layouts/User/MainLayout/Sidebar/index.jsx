import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './styles.module.scss';
import {
    AppstoreOutlined,
    ReadOutlined,
    CalendarOutlined,
    FormOutlined,
    BarChartOutlined,
    UserOutlined,
    MessageOutlined,
    LogoutOutlined,
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

const StudentSidebar = ({ menuItems, collapsed, setCollapsed, setIsMobileMenuOpen }) => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        setIsMobileMenuOpen(false);
        navigate('/login');
    };

    const items = menuItems || defaultMenuItems;

    return (
        <div className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
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
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <span className={styles.icon}>{item.icon}</span>
                                {!collapsed && <span className={styles.label}>{item.label}</span>}
                            </NavLink>
                        </li>
                    ))}
                </ul>

                <div className={styles.bottomSection}>
                    <div className={styles.divider} />

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
