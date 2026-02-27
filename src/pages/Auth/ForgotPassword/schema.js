export const ForgotPasswordSchema = {
    email: {
        required: true,
        email: true,
        message: {
            required: "Email không được để trống",
            email: "Email không đúng định dạng",
        },
    },
};
