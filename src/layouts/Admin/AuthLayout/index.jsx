import React, { useEffect } from 'react';
import './styles.scss'
import PropTypes from "prop-types";
import styles from './styles.module.scss';
import Logo from "@/assets/images/svg/ptit.svg";
import BgLogin from "@/assets/images/svg/bg-login.svg";
import DashboardMockup from "@/assets/images/svg/image 3.svg";
import CalendarMockup from "@/assets/images/svg/image 2.svg";
import { useNavigate } from "react-router-dom";
import { useAppState } from "@/hooks/useAppState";

AuthLayout.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string
};

AuthLayout.defaultProps = {
    title: '',
    description: ''
}

function AuthLayout(props) {
    const { children } = props;
    const { goToPage, setGoToPageRedirected } = useAppState();
    const navigate = useNavigate();

    useEffect(() => {
        if (goToPage.path && !goToPage.redirected) {
            setGoToPageRedirected();
            navigate(goToPage.path);
        }
    }, [goToPage, navigate, setGoToPageRedirected]);

    return (
        <div className={styles.authLayoutContainer}>
            <div className={styles.leftSide}>
                <div className={styles.formContainer}>
                    <div className={styles.logoWrapper}>
                        <img src={Logo} alt="PTIT Logo" className={styles.logo} />
                    </div>
                    {children}
                </div>
            </div>
            <div className={styles.rightSide}>
                <img src={BgLogin} alt="Background" className={styles.bgImage} />
                <div className={styles.decorativeContent}>
                    <img src={DashboardMockup} alt="Dashboard" className={styles.dashboardImage} />
                    <img src={CalendarMockup} alt="Calendar" className={styles.calendarImage} />
                </div>
            </div>
        </div>
    );
}

export default AuthLayout;

