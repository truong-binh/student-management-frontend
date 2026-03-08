import React from 'react';
import styles from './styles.module.scss';
import StudentSidebar from './Sidebar';
import { Input, Badge, Avatar } from 'antd';
import { SearchOutlined, BellOutlined, SettingOutlined } from '@ant-design/icons';
import userDefault from '@/assets/images/logos/user_default.png';
import { useAuth } from '@/hooks/useAuth';

function MainLayout(props) {
    const { children, menuItems } = props;
    const { user } = useAuth();

    return (
        <div className={styles.container}>
            <StudentSidebar menuItems={menuItems} />
            <div className={styles.mainContent}>
                <header className={styles.header}>
                    <div className={styles.welcome}>
                        <h2>Chào mừng quay trở lại !</h2>
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
                        <Avatar size={40} src={userDefault} />
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
