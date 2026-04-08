import {
  createTokenPayload,
  generateAccessToken,
  verifyRefreshToken,
} from "../../common/utils/auth/token.js";
import { successResponse } from "../../common/utils/index.js";
import {config} from "../../config/configServices.js";
import { findOne } from "../../DB/database.repository.js";
import { userModel } from "../../models/user.model.js";

export const refreshToken = async (req, res) => {
  const { authorization } = req.headers;
  if (!authorization) {
    throw new Error("Token must be provided");
  }
  const [prefix, token] = authorization.split(" ");
  if (prefix !== config.jwt.prefix) {
    throw new Error("invalid prefix");
  }
  const decoded = verifyRefreshToken(token, config.jwt.refresh_key);
  console.log(decoded);

  if (!decoded || !decoded?.userId) {
    throw new Error("Token is not valid");
  }
  const user = await findOne({
    model: userModel,
    filter: { _id: decoded.userId },
  });
  if (!user) {
    throw new Error("user does not exist");
  }
  const payload = createTokenPayload(user);
  const access_token = generateAccessToken(payload);
  return successResponse({
    res,
    message: "welcome to our app",
    data: {
      access_token,
    },
  });
};
