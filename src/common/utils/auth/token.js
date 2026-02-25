import jwt from "jsonwebtoken";
import configServices from "../../../config/configServices.js";
export const generateAccessToken = (
  payload,
  // expiresIn = configServices.jwt.expires,
) => {
  return jwt.sign(payload, configServices.jwt.key);
};
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, configServices.jwt.key);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Token has expired");
    }
    if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid token");
    }
    throw new Error("Token verification failed");
  }
};
export const createTokenPayload = (user) => {
  return {
    userId: user._id.toString(),
    email: user.email,
    sub: user.email,
  }; //sub: refers to the holder of the token 
};

export const decodeToken = async ({ token } = {}) => {
  const decoded = jwt.decode(token);
  console.log(decoded);
};
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.split(" ")[1];
};
