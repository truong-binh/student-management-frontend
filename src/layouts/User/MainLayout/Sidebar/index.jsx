import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './styles.module.scss';
import {
    AppstoreOutlined,
    ReadOutlined,
    CalendarOutlined,
    FormOutlined,
    BarChartOutlined,
    UserOutlined,
    MessageOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import logoPtit from '@/assets/images/svg/ptit.svg';

const StudentSidebar = () => {
    const menuItems = [
        { key: 'dashboard', label: 'Tổng quan', icon: <AppstoreOutlined />, path: '/dashboard' },
        { key: 'classes', label: 'Lớp học', icon: <ReadOutlined />, path: '/classes' },
        { key: 'schedule', label: 'Thời khóa biểu', icon: <CalendarOutlined />, path: '/schedule' },
        { key: 'profile', label: 'Profile', icon: <UserOutlined />, path: '/profile' },
        { key: 'feedback', label: 'Phản hồi', icon: <MessageOutlined />, path: '/feedback' },
    ];

    return (
        <div className={styles.sidebar}>
            <div className={styles.logo}>
                <div className={styles.logoIcon}>
                    <img src={logoPtit} alt="Logo" />
                </div>
                <h1 className={styles.logoText}>EDU PTIT</h1>
            </div>

            <nav className={styles.nav}>
                <ul className={styles.menuList}>
                    {menuItems.map((item) => (
                        <li key={item.key} className={styles.menuItem}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                            >
                                <span className={styles.icon}>{item.icon}</span>
                                <span className={styles.label}>{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>

                <div className={styles.logoutSection}>
                    <NavLink
                        to="/login"
                        className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                    >
                        <span className={styles.icon}><LogoutOutlined /></span>
                        <span className={styles.label}>Đăng xuất</span>
                    </NavLink>
                </div>
            </nav>
        </div>
    );
};

export default StudentSidebar;
