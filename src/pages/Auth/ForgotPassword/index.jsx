import React, { useState, useEffect } from "react";
import AuthLayout from "@/layouts/Admin/AuthLayout";
import { Button, Input, Alert, notification } from "antd";
import { ArrowLeftOutlined, EyeTwoTone, EyeInvisibleOutlined } from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./styles.module.scss";
import ErrorMessage from "@/components/ErrorMessage/index.jsx";
import { validate } from "@/utils/validates/validate.js";
import { ForgotPasswordSchema, ResetPasswordSchema } from "./schema.js";
import { useAuth } from "@/hooks/useAuth";
import _ from "lodash";

function ForgotPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const { forgotPassword, resetPassword, isForgotPasswordLoading, isResetPasswordLoading } = useAuth();

    const [dataForm, setDataForm] = useState({ email: "", password: "", confirmPassword: "" });
    const [errorData, setErrorData] = useState({});
    const [isSuccess, setIsSuccess] = useState(false);

    const isResetMode = !!token;

    useEffect(() => {
        setIsSuccess(false);
    }, [token]);

    const handleChangeInput = (value, type) => {
        let data = _.cloneDeep(dataForm);
        data[type] = value;
        setDataForm(data);
    };

    const handleFocusInput = (key) => setErrorData({ ...errorData, [key]: "" });

    const handleSendEmail = () => {
        validate(ForgotPasswordSchema, { email: dataForm.email }, {
            onSuccess: (data) => {
                forgotPassword(data, {
                    onSuccess: (res) => {
                        setIsSuccess(true);
                        notification.success({
                            message: "Thành công",
                            description: res.message || "Link khôi phục mật khẩu đã được gửi tới email của bạn."
                        });
                    },
                    onError: (err) => {
                        notification.error({
                            message: "Thất bại",
                            description: err.message || "Gửi email thất bại, vui lòng thử lại sau."
                        });
                    }
                });
            },
            onError: setErrorData,
        });
    };

    const handleResetPassword = () => {
        validate(ResetPasswordSchema, { password: dataForm.password, confirmPassword: dataForm.confirmPassword }, {
            onSuccess: (data) => {
                resetPassword({ token, password: data.password }, {
                    onSuccess: (res) => {
                        notification.success({
                            message: "Thành công",
                            description: "Đặt lại mật khẩu thành công!"
                        });
                        navigate("/login");
                    },
                    onError: (err) => {
                        notification.error({
                            message: "Thất bại",
                            description: err.message || "Đặt lại mật khẩu thất bại."
                        });
                    }
                });
            },
            onError: setErrorData,
        });
    };

    return (
        <AuthLayout>
            <div className={styles.forgotPasswordForm}>
                <h1 className={styles.title}>{isResetMode ? "Đặt lại mật khẩu" : "Quên mật khẩu?"}</h1>
                <p className={styles.description}>
                    {isResetMode
                        ? "Vui lòng nhập mật khẩu mới của bạn để tiếp tục."
                        : "Nhập email và hệ thống sẽ gửi liên kết khôi phục tới bạn!"}
                </p>

                {isSuccess && !isResetMode && (
                    <Alert
                        type="success"
                        message="Link khôi phục mật khẩu đã được gửi tới email của bạn."
                        className="mb-4"
                        showIcon
                    />
                )}

                {!isResetMode ? (
                    <>
                        <div className="mb-6">
                            <span className={styles.labelTitle}>Địa chỉ email:</span>
                            <Input
                                className={errorData.email ? "error-input" : ""}
                                placeholder="abcd@stu.ptit.edu.vn"
                                value={dataForm.email}
                                onChange={(e) => handleChangeInput(e.target.value, "email")}
                                onFocus={() => handleFocusInput("email")}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendEmail()}
                            />
                            <ErrorMessage message={errorData?.email} />
                        </div>

                        <Button
                            loading={isForgotPasswordLoading}
                            type="primary"
                            onClick={handleSendEmail}
                            block
                        >
                            Gửi link qua email
                        </Button>
                    </>
                ) : (
                    <>
                        <div className="mb-4">
                            <span className={styles.labelTitle}>Mật khẩu mới:</span>
                            <Input.Password
                                className={errorData.password ? "error-input" : ""}
                                placeholder="Nhập mật khẩu mới"
                                value={dataForm.password}
                                onChange={(e) => handleChangeInput(e.target.value, "password")}
                                onFocus={() => handleFocusInput("password")}
                                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                            />
                            <ErrorMessage message={errorData?.password} />
                        </div>

                        <div className="mb-6">
                            <span className={styles.labelTitle}>Xác nhận mật khẩu:</span>
                            <Input.Password
                                className={errorData.confirmPassword ? "error-input" : ""}
                                placeholder="Nhập lại mật khẩu mới"
                                value={dataForm.confirmPassword}
                                onChange={(e) => handleChangeInput(e.target.value, "confirmPassword")}
                                onFocus={() => handleFocusInput("confirmPassword")}
                                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                            />
                            <ErrorMessage message={errorData?.confirmPassword} />
                        </div>

                        <Button
                            loading={isResetPasswordLoading}
                            type="primary"
                            onClick={handleResetPassword}
                            block
                        >
                            Đặt lại mật khẩu
                        </Button>
                    </>
                )}

                <div
                    className={styles.backToLogin}
                    onClick={() => navigate("/login")}
                >
                    <ArrowLeftOutlined /> Quay trở lại đăng nhập
                </div>
            </div>
        </AuthLayout>
    );
}

export default ForgotPassword;
