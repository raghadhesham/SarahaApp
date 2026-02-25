import { Router } from "express";
import { getFavoriteMessages, getMessages, getSavedMessages, sendMessages, toggleFavorite, toggleSaved } from "./messages.services.js";
import { authenticate } from "../../common/middleware/authentication.js";
import { validate } from "../../common/middleware/validation.js";
import { sendMessageSchema, toggleMessageSchema } from "./messages.validation.js";
export const messageRouter = Router();
messageRouter.post("/sendMessage", authenticate,validate(sendMessageSchema), sendMessages)
messageRouter.get("/getMessages", authenticate, getMessages)
messageRouter.post("/toggleSaved", authenticate,validate(toggleMessageSchema), toggleSaved)
messageRouter.get("/getSavedMessages",getSavedMessages)
messageRouter.post("/toggleFavorite",authenticate,validate(toggleMessageSchema), toggleFavorite)
messageRouter.get("/getFavoriteMessages",authenticate,getFavoriteMessages)
