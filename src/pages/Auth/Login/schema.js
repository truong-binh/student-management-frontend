import Joi from "joi";

export const LoginSchema = Joi.object({
  email: Joi.string().trim().required().label("Địa chỉ email"),
  password: Joi.string().required().label("Mật khẩu"),
});
