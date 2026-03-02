import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Result, Button, Spin, notification } from "antd";
import { authApi } from "@/api/user/auth";
import AuthLayout from "@/layouts/Admin/AuthLayout";

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("verifying");

    useEffect(() => {
        const handleVerify = async () => {
            if (!token) {
                setStatus("error");
                setLoading(false);
                return;
            }

            const res = await authApi.verifyEmail(token);
            if (res.success) {
                setStatus("success");
                notification.success({
                    message: "Thành công",
                    description: res.message || "Xác thực email thành công!"
                });
            } else {
                setStatus("error");
                notification.error({
                    message: "Thất bại",
                    description: res.message || "Xác thực email thất bại hoặc token đã hết hạn."
                });
            }
            setLoading(false);
        };

        handleVerify();
    }, [token]);

    return (
        <AuthLayout>
            <div style={{ padding: "40px", textAlign: "center", background: "#fff", borderRadius: "8px" }}>
                {loading ? (
                    <div style={{ padding: "50px" }}>
                        <Spin size="large" tip="Đang xác thực email..." />
                        <p style={{ marginTop: "20px" }}>Vui lòng đợi trong giây lát...</p>
                    </div>
                ) : status === "success" ? (
                    <Result
                        status="success"
                        title="Xác thực Email thành công!"
                        subTitle="Bây giờ bạn có thể đăng nhập để sử dụng hệ thống."
                        extra={[
                            <Button type="primary" key="login" onClick={() => navigate("/login")}>
                                Đăng nhập ngay
                            </Button>
                        ]}
                    />
                ) : (
                    <Result
                        status="error"
                        title="Xác thực thất bại"
                        subTitle="Token không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại email của bạn."
                        extra={[
                            <Button type="primary" key="retry" onClick={() => navigate("/register")}>
                                Quay lại đăng ký
                            </Button>
                        ]}
                    />
                )}
            </div>
        </AuthLayout>
    );
};

export default VerifyEmail;
