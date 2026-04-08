import { Router } from "express";
import { deleteUser } from "./admins.services.js";
import { authenticate } from "../../common/middleware/authentication.js";
import { authorization } from "../../common/middleware/authorization.js";
import { roleEnum } from "../../config/enums/user.enum.js";
export const adminRouter = Router({ caseSensitive: true, strict: true });
adminRouter.delete(
  "/deleteUser",
  authenticate,
  authorization([roleEnum.admin]),
  deleteUser,
);
