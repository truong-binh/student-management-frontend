import Joi from "joi";

export const LoginSchema = Joi.object({
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "Định dạng email không hợp lệ",
      "string.empty": "Vui lòng nhập địa chỉ email",
    })
    .label("Địa chỉ email"),
  password: Joi.string().required().messages({
    "string.empty": "Vui lòng nhập mật khẩu",
  }).label("Mật khẩu"),
});
