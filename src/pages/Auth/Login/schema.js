import Joi from "joi";
import { VALIDATE_EMAIL_REGEX } from "@/utils/helper";

export const LoginSchema = Joi.object({
  email: Joi.string().trim().required().label("Địa chỉ email"),
  password: Joi.string().required().label("Mật khẩu"),
});
