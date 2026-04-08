import Joi from "joi";

const generalSchema = {
  messageId: Joi.string().hex().length(24).required(),
  content: Joi.string().min(1).max(999).required(),
  recieverId: Joi.string().hex().length(24).required(),
}
export const sendMessageSchema = {
  body: Joi.object({
    content: generalSchema.content,
    recieverId: generalSchema.recieverId,
    isAnonymous: Joi.boolean(),
    isSaved: Joi.boolean(),
  }),
}; 
export const toggleMessageSchema = {
  body: Joi.object({
    messageId:generalSchema.messageId,
  }),
};
