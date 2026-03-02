import Joi from "joi";

export const RegisterSchema = Joi.object({
    fullName: Joi.string().trim().required().label("Họ và tên"),
    email: Joi.string()
        .trim()
        .email({ tlds: { allow: false } })
        .required()
        .label("Địa chỉ email"),
    studentCode: Joi.string().trim().required().label("Mã sinh viên"),
    password: Joi.string().min(6).required().label("Mật khẩu"),
    confirmPassword: Joi.string()
        .required()
        .valid(Joi.ref("password"))
        .messages({
            "any.only": "Mật khẩu xác nhận không khớp",
        })
        .label("Xác nhận lại mật khẩu"),
});
