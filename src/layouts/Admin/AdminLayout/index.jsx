import React, {useEffect, useRef} from 'react';
import styles from './styles.module.scss';
import {Outlet, useNavigate} from "react-router-dom";
import useWindowSize from '@/utils/hooks/useWindowSize';
import SideBar from './SiderBar';
import Header from './Header';
import { useAppState } from '@/hooks/useAppState';
import {getNotification, isTokenExpired} from '@/utils/helper.js';
import {getAuthToken} from '@/utils/localStorage';

function MainLayout() {
    const { 
        isShowSideBar, 
        goToPage, 
        setGoToPageRedirected, 
        setIsShowSideBar 
    } = useAppState();
    const navigate = useNavigate();
    const scrollRef = useRef(null);
    const windowSize = useWindowSize()
    const token = getAuthToken()

    useEffect(() => {
        if (goToPage.path && !goToPage.redirected) {
            setGoToPageRedirected();
            navigate(goToPage.path);
        }
    }, [goToPage, navigate, setGoToPageRedirected]);

    useEffect(() => {
        if (windowSize.width <= 1200) {
            setTimeout(() => setIsShowSideBar(false))
        } else {
            setTimeout(() => setIsShowSideBar(true))
        }
    }, [windowSize.width, setIsShowSideBar])

    useEffect(() => {
        if (isTokenExpired(token)) {
            getNotification("error", "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
            navigate("/login");
        }
    }, [token, navigate]);

    return (
        <div className={`${styles.boxMainLayout}`}>
            <div className={styles.headerBox}></div>
            <div className={styles.mainLayoutWrap}>
                <SideBar isShowSideBar={isShowSideBar}/>
                <div
                    className={`${styles.sideBarMask} ${isShowSideBar ? styles.show : ''}`}
                    onClick={() => setIsShowSideBar(false)}
                />
                <div className={`${styles.mainWrap} ${!isShowSideBar ? styles.mainWrapWithConditionSideBarClose : ''}`}>
                    <Header isShowSideBar={isShowSideBar}/>
                    <main className={styles.mainContentWrap}>
                        <div id='contentOfMainLayout' ref={scrollRef} className={styles.content}>
                            <div>
                                <Outlet />
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

export default MainLayout;
