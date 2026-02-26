import { authenticate } from "../../common/middleware/authentication.js";
import { upload } from "../../common/middleware/multer.js";
import { editProfile, followUser, getProfile, login, signUp, signUpWithGmail, unfollowUser } from "./users.services.js";
import { Router } from "express";
import { editProfileSchema, getProfileSchema, signUpSchema } from "./users.validation.js";
import { validate } from "../../common/middleware/validation.js";
export const userRouter = Router();
userRouter.post("/signup",upload.single("profilePic"), validate(signUpSchema), signUp);
userRouter.post("/signup/gmail",signUpWithGmail)
userRouter.post("/login", login);
userRouter.get("/getProfile/:id", authenticate,validate(getProfileSchema), getProfile);
userRouter.patch("/editProfile", authenticate,validate(editProfileSchema), editProfile);
userRouter.post("/follow/:id",authenticate,followUser)
userRouter.post("/unfollow/:id",authenticate,unfollowUser)