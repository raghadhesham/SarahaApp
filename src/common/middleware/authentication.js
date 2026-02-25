import { extractTokenFromHeader, verifyToken } from "../utils/auth/token.js";

export const authenticate = (req, res, next) => {
  try {
    // Extract token from header
    const token = extractTokenFromHeader(req.headers.authorization);
    if (!token) {
      ;
      return res.status(401).json({
        message: "Access denied. No token provided.",
      });
    }
    // Verify token
    const decoded = verifyToken(token);

    // Attach user info to request
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.user = decoded; // Full decoded token
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
      error: error.message,
    });
  }
};
