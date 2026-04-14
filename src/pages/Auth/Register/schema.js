import Joi from "joi";

export const RegisterSchema = Joi.object({
    fullName: Joi.string().trim().required().label("Họ và tên"),
    email: Joi.string()
        .trim()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            "string.email": "Định dạng email không hợp lệ. Vui lòng nhập đúng mail PTIT của bạn",
            "string.empty": "Địa chỉ email không được bỏ trống",
        })
        .label("Địa chỉ email"),
    studentCode: Joi.string().trim().required().messages({
        "string.empty": "Mã sinh viên không được bỏ trống",
    }).label("Mã sinh viên"),
    password: Joi.string().min(6).required().messages({
        "string.min": "Mật khẩu phải có ít nhất 6 ký tự",
        "string.empty": "Mật khẩu không được bỏ trống",
    }).label("Mật khẩu"),
    confirmPassword: Joi.string()
        .required()
        .valid(Joi.ref("password"))
        .messages({
            "any.only": "Mật khẩu xác nhận không khớp",
        })
        .label("Xác nhận lại mật khẩu"),
});
