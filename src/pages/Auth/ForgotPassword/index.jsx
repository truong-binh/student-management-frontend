import React, { useState } from "react";
import AuthLayout from "@/layouts/Admin/AuthLayout";
import { Button, Input, Alert } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import styles from "./styles.module.scss";
import ErrorMessage from "@/components/ErrorMessage/index.jsx";
import { validate } from "@/utils/validates/validate.js";
import { ForgotPasswordSchema } from "./schema.js";
import _ from "lodash";

function ForgotPassword() {
    const navigate = useNavigate();
    const [dataForm, setDataForm] = useState({ email: "" });
    const [errorData, setErrorData] = useState({});
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChangeInput = (value, type) => {
        let data = _.cloneDeep(dataForm);
        data[type] = value;
        setDataForm(data);
    };

    const handleFocusInput = (key) => setErrorData({ ...errorData, [key]: "" });

    const handleSendEmail = () => {
        validate(ForgotPasswordSchema, dataForm, {
            onSuccess: (data) => {
                setIsLoading(true);
                // Giả lập API call
                setTimeout(() => {
                    setIsLoading(false);
                    setIsSuccess(true);
                }, 1500);
            },
            onError: setErrorData,
        });
    };

    return (
        <AuthLayout>
            <div className={styles.forgotPasswordForm}>
                <h1 className={styles.title}>Quên mật khẩu?</h1>
                <p className={styles.description}>
                    Nhập email và vui lòng check mã code được gửi qua email của bạn!
                </p>

                {isSuccess && (
                    <Alert
                        type="success"
                        message="Link khôi phục mật khẩu đã được gửi tới email của bạn."
                        className="mb-4"
                        showIcon
                    />
                )}

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
                    loading={isLoading}
                    type="primary"
                    onClick={handleSendEmail}
                    block
                >
                    Gửi mã qua email
                </Button>

                <div
                    className={styles.backToLogin}
                    onClick={() => navigate("/login")}
                >
                    <ArrowLeftOutlined /> Quay trở lại
                </div>
            </div>
        </AuthLayout>
    );
}

export default ForgotPassword;
