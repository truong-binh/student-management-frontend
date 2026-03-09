import React, { useState } from "react";
import AuthLayout from "@/layouts/Admin/AuthLayout";
import { Button, Input, Select, notification } from "antd";
import styles from "./styles.module.scss";
import _ from "lodash";
import ErrorMessage from "@/components/ErrorMessage/index.jsx";
import { validate } from "@/utils/validates/validate.js";
import { RegisterSchema } from "./schema.js";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

function Register() {
    const [dataFormRegister, setDataFormRegister] = useState({
        fullName: "",
        email: "",
        studentCode: "",
        password: "",
        confirmPassword: ""
    });
    const [errorDataRegister, setErrorDataRegister] = useState({});
    const navigate = useNavigate();
    const { register, isRegisterLoading } = useAuth();

    const handleChangeInput = (value, type) => {
        let data = _.cloneDeep(dataFormRegister);
        data[type] = value;
        setDataFormRegister(data);
    };

    const handleFocusInput = (key) => setErrorDataRegister({ ...errorDataRegister, [key]: "" });

    const handleConfirmRegister = () => {
        validate(RegisterSchema, dataFormRegister, {
            onSuccess: (data) => {
                const yearMatch = data.studentCode.match(/\d{2}/);
                const userCodeYear = yearMatch ? `20${yearMatch[0]}` : "2024";

                const apiData = {
                    userCode: data.studentCode,
                    userCodeYear: userCodeYear,
                    email: data.email,
                    password: data.password,
                    fullName: data.fullName
                };

                register(apiData, {
                    onSuccess: (res) => {
                        notification.success({
                            message: "Đăng ký thành công",
                            description: res.message || "Vui lòng kiểm tra email để xác thực tài khoản"
                        });
                        navigate("/login");
                    },
                    onError: (error) => {
                        if (error.error?.details) {
                            setErrorDataRegister(error.error.details);
                        } else {
                            notification.error({
                                message: "Đăng ký thất bại",
                                description: error.message
                            });
                        }
                    }
                });
            },
            onError: setErrorDataRegister,
        });
    };

    return (
        <AuthLayout>
            <div className={styles.registerForm}>
                <h1 className={styles.title}>Tạo tài khoản của bạn</h1>
                <p className={styles.description}>Tham gia EDU PTIT và quản lý học tập theo cách của riêng bạn!</p>

                <div className="mb-4">
                    <span className={styles.labelTitle}>Họ và tên:</span>
                    <Input
                        placeholder="Nhập họ và tên của bạn"
                        value={dataFormRegister.fullName}
                        onChange={(e) => handleChangeInput(e.target.value, "fullName")}
                        onFocus={() => handleFocusInput("fullName")}
                    />
                    <ErrorMessage message={errorDataRegister?.fullName} />
                </div>

                <div className="mb-4">
                    <span className={styles.labelTitle}>Địa chỉ email:</span>
                    <Input
                        placeholder="abcd@stu.ptit.edu.vn"
                        value={dataFormRegister.email}
                        onChange={(e) => handleChangeInput(e.target.value, "email")}
                        onFocus={() => handleFocusInput("email")}
                    />
                    <ErrorMessage message={errorDataRegister?.email} />
                </div>

                <div className="mb-4">
                    <span className={styles.labelTitle}>Mã sinh viên:</span>
                    <Input
                        placeholder="Nhập mã sinh viên của bạn"
                        value={dataFormRegister.studentCode}
                        onChange={(e) => handleChangeInput(e.target.value, "studentCode")}
                        onFocus={() => handleFocusInput("studentCode")}
                    />
                    <ErrorMessage message={errorDataRegister?.studentCode} />
                </div>

                <div className="mb-4">
                    <span className={styles.labelTitle}>Mật khẩu:</span>
                    <Input.Password
                        placeholder="Nhập mật khẩu của bạn"
                        value={dataFormRegister.password}
                        onChange={(e) => handleChangeInput(e.target.value, "password")}
                        onFocus={() => handleFocusInput("password")}
                    />
                    <ErrorMessage message={errorDataRegister?.password} />
                </div>

                <div className="mb-4">
                    <span className={styles.labelTitle}>Xác nhận lại mật khẩu:</span>
                    <Input.Password
                        placeholder="Xác nhận mật khẩu của bạn"
                        value={dataFormRegister.confirmPassword}
                        onChange={(e) => handleChangeInput(e.target.value, "confirmPassword")}
                        onFocus={() => handleFocusInput("confirmPassword")}
                    />
                    <ErrorMessage message={errorDataRegister?.confirmPassword} />
                </div>

                <Button
                    loading={isRegisterLoading}
                    type="primary"
                    onClick={() => handleConfirmRegister()}
                    className={styles.createButton}
                    block>
                    Tạo tài khoản
                </Button>

                <div className={styles.loginLink}>
                    Bạn đã có tài khoản? <a href="/login">Đăng nhập</a>
                </div>
            </div>
        </AuthLayout>
    );
}

export default Register;
