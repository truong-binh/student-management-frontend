import React, { useState } from "react";
import AuthLayout from "@/layouts/Admin/AuthLayout";
import { Alert, Button, Input, notification } from "antd";
import styles from "./styles.module.scss";
import _ from "lodash";
import ErrorMessage from "@/components/ErrorMessage/index.jsx";
import { validate } from "@/utils/validates/validate.js";
import { LoginSchema } from "./schema.js";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

function Login() {
    const [dataFormLogin, setDataFormLogin] = useState({ email: "", password: "" });
    const [errorDataLogin, setErrorDataLogin] = useState({});
    const [messageErrorLogin, setMessageErrorLogin] = useState("");
    const navigate = useNavigate();

    const { login, isLoginLoading } = useAuth();

    const handleChangeInput = (value, type) => {
        let data = _.cloneDeep(dataFormLogin);
        data[type] = value;
        setDataFormLogin(data);
    };

    const handleFocusInput = (key) => setErrorDataLogin({ ...errorDataLogin, [key]: "" });

    const handleConfirmLogin = () => {
        validate(LoginSchema, dataFormLogin, {
            onSuccess: (data) => {
                setMessageErrorLogin("");
                login(data, {
                    onSuccess: (res) => {
                        notification.success({ message: "Đăng nhập thành công" });
                        const userRole = res.data?.user?.role;
                        if (userRole === "LECTURER") {
                            navigate("/teacher/dashboard");
                        } else {
                            navigate("/dashboard");
                        }
                    },
                    onError: (error) => {
                        if (error.error?.details) {
                            setErrorDataLogin(error.error.details);
                        } else {
                            setMessageErrorLogin(error.message || "Đăng nhập thất bại");
                        }
                    }
                });
            },
            onError: setErrorDataRegister => setErrorDataLogin(setErrorDataRegister),
        });
    };

    return (
        <AuthLayout>
            <div className={styles.loginForm}>
                <h1 className={styles.title}>Đăng nhập vào tài khoản của bạn</h1>

                {messageErrorLogin && (
                    <Alert type="error" closable message={messageErrorLogin} className="mb-4" showIcon />
                )}

                <div className="mb-5">
                    <span className={styles.labelTitle}>Địa chỉ email</span>
                    <Input
                        className={errorDataLogin.email ? "error-input" : ""}
                        placeholder="abcd@stu.ptit.edu.vn"
                        value={dataFormLogin.email}
                        onChange={(e) => handleChangeInput(e.target.value, "email")}
                        onFocus={() => handleFocusInput("email")}
                        onKeyDown={(e) => e.key === 'Enter' && handleConfirmLogin()}
                    />
                    <ErrorMessage message={errorDataLogin?.email} />
                </div>

                <div className="mb-5">
                    <span className={styles.labelTitle}>Mật khẩu</span>
                    <Input.Password
                        className={errorDataLogin.password ? "error-input" : ""}
                        placeholder="Nhập mật khẩu của bạn"
                        value={dataFormLogin.password}
                        onChange={(e) => handleChangeInput(e.target.value, "password")}
                        onFocus={() => handleFocusInput("password")}
                        onKeyDown={(e) => e.key === 'Enter' && handleConfirmLogin()}
                    />
                    <ErrorMessage message={errorDataLogin?.password} />
                </div>

                <div className={styles.formFooter}>
                    <div></div>
                    <a href="/forgot-password" className={styles.forgotPassword}>Quên mật khẩu?</a>
                </div>

                <Button
                    loading={isLoginLoading}
                    type="primary"
                    onClick={() => handleConfirmLogin()}
                    block
                >
                    Đăng nhập
                </Button>

                <div className={styles.createAccount}>
                    Bạn chưa có tài khoản? <a href="/register">Tạo tài khoản</a>
                </div>
            </div>
        </AuthLayout>
    );
}

export default Login;

