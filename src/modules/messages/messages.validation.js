import Joi from "joi";

export const sendMessageSchema = {
  body: Joi.object({
    content: Joi.string().min(1).max(999).required(),
    recieverId: Joi.string().hex().length(24).required(),
    isAnonymous: Joi.boolean(),
    isSaved: Joi.boolean(),
  }),
};
export const toggleMessageSchema = {
  body: Joi.object({
    messageId: Joi.string().hex().length(24).required(),
  }),
};
