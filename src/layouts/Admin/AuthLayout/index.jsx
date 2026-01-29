import React, { useEffect } from 'react';
import './styles.scss'
import PropTypes from "prop-types";
import styles from './styles.module.scss';
import Logo from "@/assets/images/logos/logo-june-kids.png";
import { useNavigate } from "react-router-dom";
import { useAppState } from "@/hooks/useAppState";

AuthLayout.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired
};

AuthLayout.defaultProps = {
    title: '',
    description: ''
}

function AuthLayout(props) {
    const { children, title, description } = props;
    const { goToPage, setGoToPageRedirected } = useAppState();
    const navigate = useNavigate();

    useEffect(() => {
        if (goToPage.path && !goToPage.redirected) {
            setGoToPageRedirected();
            navigate(goToPage.path);
        }
    }, [goToPage, navigate, setGoToPageRedirected]);

    return (
        <div className={styles.authLoginWrap}>

            <div className={styles.viewWrap}>
                <div className={styles.contentWrap}>
                    <div className={styles.contentContainer}>
                        <div className={styles.companyMobile}>
                            <img src={Logo} alt="" />
                        </div>
                        <div className={styles.formWrap}>
                            <div className={styles.content}>
                                <div className={styles.header}>{title}</div>
                                <div>
                                    {children}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AuthLayout;
