import { Router } from "express";
import { deleteUser } from "./admins.services.js";
import { authenticate } from "../../common/middleware/authentication.js";
import { authorization } from "../../common/middleware/authorization.js";
import { validate } from "../../common/middleware/validation.js";
import { roleEnum } from "../../config/enums/user.enum.js";
import { deleteUserSchema } from "./admins.validation.js";
export const adminRouter = Router({ caseSensitive: true, strict: true });
adminRouter.delete(
  "/deleteUser",
  authenticate,
  authorization([roleEnum.admin]),
  validate(deleteUserSchema),
  deleteUser,
);
