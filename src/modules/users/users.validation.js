import Joi from "joi";
import { roleEnum } from "../../config/enums/user.enum.js";

const generalSchema = {
  id: Joi.string().hex().length(24).required().messages({
    "string.length": "Invalid user id",
    "string.hex": "Invalid user id format",
    "any.required": "User id is required",
  }),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(30).required(),
  fullName: Joi.string().min(3).max(20),
  bio: Joi.string().min(1).max(500),
  profilePic: Joi.object({
    mimetype: Joi.string().valid("image/jpeg", "image/png").required(),
    size: Joi.number()
      .max(5 * 1024 * 1024)
      .required(), // 5MB
    originalname: Joi.string().required(),
  }),
  gotOTP: Joi.string()
    .length(6)
    .regex(/^[0-9]{6}$/)
    .required(),
};
export const signUpSchema = {
  body: Joi.object({
    fullName: generalSchema.fullName.required(),
    email: Joi.string().email().required(),
    bio: generalSchema.bio,
    password: generalSchema.password,
    cpassword: generalSchema.password,
    gender: Joi.string().valid("male", "female").required(),
    DOB: Joi.date().required(),
    role: Joi.string().valid("admin", "user").required(),
    profilePic: generalSchema.profilePic,
  }).required(),
};
export const loginSchema = {
  body: Joi.object({
    email: generalSchema.email,
    password: generalSchema.password,
  }).required(),
};
export const logoutSchema = {
  query: Joi.object({
    flag: Joi.string().valid("all"),
  }),
};
export const getProfileSchema = {
  params: Joi.object({
    id: generalSchema.id,
  }),
};
export const editProfileSchema = {
  body: Joi.object({
    fullName: generalSchema.fullName,
    gender: Joi.string().valid("male", "female"),
    DOB: Joi.date(),
    bio: generalSchema.bio,
    profilePic: generalSchema.profilePic,
  }).required(),
};
export const followUserSchema = {
  params: Joi.object({
    id: generalSchema.id,
  }),
};
export const unFollowUserSchema = {
  params: Joi.object({
    id: generalSchema.id,
  }),
};
export const confirmEmailSchema = {
  body: Joi.object({
    gotOTP: generalSchema.gotOTP,
    email: generalSchema.email,
    subject: Joi.string().valid("Signup", "ResendOTP").required() // Validate the parameter
  }),
};
export const confirmemailSchema = {
  body: Joi.object({
    gotOTP: Joi.string()
      .length(6)
      .regex(/^[0-9]{6}$/)
      .required(), // \d = [0-9]
    email: generalSchema.email,
  }),
};
export const resendOTPEmailSchema = {
  body: Joi.object({
    email: generalSchema.email,
  }),
};
export const forgotPasswordSchema = {
  body: Joi.object({
    email: generalSchema.email,
  }),
};
export const resetPasswordSchema = {
  body: Joi.object({
    email: generalSchema.email,
    gotOTP: generalSchema.gotOTP,
    newPassword: generalSchema.password,
  }),
};
export const updatePasswordSchema = {
  body: Joi.object({
    oldPassword: generalSchema.password,
    newPassword: generalSchema.password,
  }),
};
