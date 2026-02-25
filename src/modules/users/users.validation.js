import Joi from "joi";

export const signUpSchema = Joi.object({
  fullName: Joi.string().required().trim(),
  email: Joi.string().required(),
  password: Joi.string().required().min(8),
  cpassword: Joi.string().required().min(8),
  gender: Joi.string().valid("male", "female").required(),
  DOB: Joi.date().required(),
}).required();
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
export const getProfileSchema = {
  params:Joi.object(
   {
    id: Joi.string().hex().length(24).required(),
  },
)
}
export const editProfileSchema = {
  body: Joi.object({
    fullName: Joi.string().trim(),
    gender: Joi.string().valid("male", "female"),
    DOB: Joi.date(),
    bio: Joi.string().min(1).max(500),
  }).required(),
};
export const followUserSchema = {
  params:Joi.object(
   {
    id: Joi.string().length(24).hex().required().messages({
      "string.length": "Invalid user id",
      "string.hex": "Invalid user id format",
      "any.required": "User id is required",
    }),
  },
)}
export const unFollowUserSchema = {
  params:Joi.object(
   {
    id: Joi.string().length(24).hex().required().messages({
      "string.length": "Invalid user id",
      "string.hex": "Invalid user id format",
      "any.required": "User id is required",
    }),
  },
)}
