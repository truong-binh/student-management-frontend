import React, { useState, useEffect } from 'react';
import styles from './styles.module.scss';
import StudentSidebar from './Sidebar';
import { Input, Badge, Avatar } from 'antd';
import { SearchOutlined, BellOutlined, SettingOutlined, MenuOutlined } from '@ant-design/icons';
import userDefault from '@/assets/images/logos/user_default.png';
import { useAuth } from '@/hooks/useAuth';

function MainLayout(props) {
    const { children, menuItems } = props;
    const { user } = useAuth();
    
    // State cho menu mobile (từ teacher2)
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // State cho menu desktop (từ develop)
    const [collapsed, setCollapsed] = useState(() => {
        return localStorage.getItem('sidebar_collapsed') === 'true';
    });

    useEffect(() => {
        localStorage.setItem('sidebar_collapsed', collapsed);
    }, [collapsed]);

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
                // Các props cho desktop
                collapsed={collapsed}
                setCollapsed={setCollapsed}
            />
            
            {/* Lớp phủ đen khi mở menu trên điện thoại */}
            {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}
            
            <div className={styles.mainContent}>
                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        {/* Nút hamburger mở menu trên mobile */}
                        <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)}>
                            <MenuOutlined />
                        </button>
                        <div className={styles.welcome}>
                            <h2>Chào mừng quay trở lại !</h2>
                        </div>
                    </div>

                    <div className={styles.searchBar}>
                        <Input
                            placeholder="Tìm kiếm"
                            prefix={<SearchOutlined style={{ color: '#a0aec0' }} />}
                        />
                    </div>

                    <div className={styles.userSection}>
                        <div className={styles.actions}>
                            <Badge count={99} overflowCount={99}>
                                <div className={styles.actionIcon}>
                                    <BellOutlined />
                                </div>
                            </Badge>
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