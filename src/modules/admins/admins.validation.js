import Joi from "joi";

export const deleteUserSchema = {
    body: Joi.object({
        userId: Joi.string().hex().length(24).required(),
    }).required()
};