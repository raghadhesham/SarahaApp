import { authenticate } from "../../common/middleware/authentication.js";
import { extensions, upload } from "../../common/middleware/multer.js";
import {
  confirmEmail,
  editProfile,
  followUser,
  forgetPassword,
  getProfile,
  login,
  logOut,
  resendOTP,
  resetPassword,
  signUp,
  signUpWithGmail,
  toggletwoStepVerification,
  unfollowUser,
  updatePassword,
} from "./users.services.js";
import { Router } from "express";
import {
  editProfileSchema,
  getProfileSchema,
  signUpSchema,
} from "./users.validation.js";
import { validate } from "../../common/middleware/validation.js";
import { successResponse } from "../../common/utils/index.js";
import cloudinary from "../../config/cloudinary.js";
import { messageRouter } from "../messages/messages.controllers.js";
export const userRouter = Router({ caseSensitive: true, strict: true });
userRouter.post(
  "/signup",
  upload("pics", extensions.image).fields([
    { name: "profilePic", maxCount: 1 },
    { name: "album", maxCount: 3 },
  ]),
  validate(signUpSchema),
  signUp,
);
userRouter.post("/signup/gmail", signUpWithGmail);
userRouter.post("/login", login);
userRouter.get(
  "/getProfile/:id",
  authenticate,
  validate(getProfileSchema),
  getProfile,
);
userRouter.patch(
  "/editProfile",
  authenticate,
  validate(editProfileSchema),
  editProfile,
);
userRouter.post("/follow/:id", authenticate, followUser);
userRouter.post("/unfollow/:id", authenticate, unfollowUser);
userRouter.post(
  "/cloudinary",
  authenticate,
  upload("image",extensions.image).single("image"),
  async (req, res) => {
    try {
      console.log(req.file);
      let data = await cloudinary.uploader.upload(req.file.path, {
        // public_id: "profilePic", //3shan te3ml replace my7otsh 2 profile pics
        folder: `users/${req.userId}/profile`,
        resource_type: "image",
        allowed_formats: ["jpg", "png", "jpeg"],
        use_filename: true, //Tells Cloudinary to use the original file's name as the public ID, instead of generating a random string.
        unique_filename: true, //Tells Cloudinary not to append a unique suffix to the public ID, allowing you to overwrite existing files with the same name.
        // transformation: [{ crop: 'fill' }],
        // eager:[{}] // zay transformation bs bte3ml (kaza) sora tanya fe makan tany
      }); //kaman bey3ml secure url //bnkhzn eager w public id fe db
      console.log(data);

      successResponse({ res, data });
    } catch (error) {
      console.log(error);
      console.log(error.message);
      console.log(error.stack);
    }
  },
);
userRouter.post("/logout", authenticate, logOut);
userRouter.patch("/confirmEmail", confirmEmail);
userRouter.patch("/resendOTP", resendOTP);
userRouter.post("/toggleTwoStepVerification", authenticate, toggletwoStepVerification);
userRouter.patch("/updatePassword", authenticate, updatePassword)
userRouter.patch("/forgetPassword", forgetPassword)
userRouter.patch("/resetPassword", resetPassword)