import React, { useState } from "react";
import AuthLayout from "@/layouts/Admin/AuthLayout";
import { Alert, Button, Checkbox, Input, Select } from "antd";
import styles from "./styles.module.scss";
// import clsx from "clsx";
import _ from "lodash";
import ErrorMessage from "@/components/ErrorMessage/index.jsx";
import { validate } from "@/utils/validates/validate.js";
import { LoginSchema } from "./schema.js";
import { setAuthTokenAdmin } from "@/utils/localStorage.js";
import { useAuth } from "@/hooks/useAuth";

const { Option } = Select;

function Login() {
    const [dataFormLogin, setDataFormLogin] = useState({ phone: "", password: "", role: "student" });
    const [errorDataLogin, setErrorDataLogin] = useState({});
    const [messageErrorLogin, setMessageErrorLogin] = useState("");

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
                        const accessToken = res.data.access_token;
                        setAuthTokenAdmin(accessToken);
                        window.location.href = "/admin";
                    },
                    onError: (error) => {
                        if (error.response?.data) {
                            const { message, detail } = error.response.data;
                            if (detail) {
                                setErrorDataLogin(detail);
                            } else {
                                setMessageErrorLogin(message);
                            }
                        }
                    }
                });
            },
            onError: setErrorDataLogin,
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
                        className={errorDataLogin.phone ? "error-input" : ""}
                        placeholder="abcd@stu.ptit.edu.vn"
                        value={dataFormLogin.phone}
                        onChange={(e) => handleChangeInput(e.target.value, "phone")}
                        onFocus={() => handleFocusInput("phone")}
                        onKeyDown={(e) => e.key === 'Enter' && handleConfirmLogin()}
                    />
                    <ErrorMessage message={errorDataLogin?.phone} />
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

                <div className="mb-4">
                    <Select
                        className="w-full"
                        value={dataFormLogin.role}
                        onChange={(value) => handleChangeInput(value, "role")}
                    >
                        <Option value="student">Sinh viên đăng nhập</Option>
                        <Option value="teacher">Giảng viên đăng nhập</Option>
                    </Select>
                </div>

                <div className={styles.formFooter}>
                    <Checkbox className={styles.rememberMe}>Nhớ mật khẩu</Checkbox>
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

