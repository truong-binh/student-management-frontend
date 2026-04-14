import Joi from "joi";

export const ForgotPasswordSchema = Joi.object({
    email: Joi.string()
        .trim()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            "string.email": "Định dạng email không hợp lệ",
            "string.empty": "Vui lòng nhập địa chỉ email của bạn",
        })
        .label("Email"),
});

export const ResetPasswordSchema = Joi.object({
    password: Joi.string()
        .min(6)
        .required()
        .label("Mật khẩu"),
    confirmPassword: Joi.any()
        .equal(Joi.ref('password'))
        .required()
        .label("Mật khẩu xác nhận")
        .messages({ 'any.only': '{{#label}} không khớp với mật khẩu' }),
});
