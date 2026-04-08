import { checkConnectionDB } from "./DB/connectionDB.js";
import express from "express";
import { config } from "./config/configServices.js";
import { userRouter } from "./modules/users/users.controllers.js";
import { messageRouter } from "./modules/messages/messages.controllers.js";
import cors from "cors";
import path from "path";
import { authRouter } from "./modules/auth/auth.controllers.js";
import { connectRedis } from "./DB/redis/redis.connection.js";
import "./common/utils/cron/cron.js";
import helmet from "helmet";
import ratelimit from "express-rate-limit";
import { adminRouter } from "./modules/admins/admins.controllers.js";
import { errorHandler } from "./common/utils/response/error.response.js";
const app = express();
const PORT = config.port.port;
const limiter = ratelimit({
  windowMs: 15 * 60 * 1000,
  limit: 10, 
});
export const bootstrap = async (req, res) => {
  const whiteList = [config.cors.white_list];
  const corsOptions = {
    origin: function (origin, callback) {
      if (whiteList.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Origin not allowed"));
      }
    },
  };
  app.use(helmet(), cors(corsOptions), limiter, express.json()); //cross origin resource sharing //3aref el api msln ba3et request mn postman
  // fa laa ana bs bsm7 bl origin elly feha domain bta3y w keda
  // postman has no orgin !! its origin is undefind log(req.headers.origin)
  // allow certain origins (whitelist)
  app.use(errorHandler);
  app.use(express.urlencoded({ extended: true }));
  app.use("/users", userRouter);
  app.use("/messages", messageRouter);
  app.use("/uploads", express.static("uploads"));
  app.use("/auth", authRouter);
  app.use("/admins", adminRouter)
  checkConnectionDB();
  await connectRedis();

  app.get("/", (req, res) => {
    return res.status(200).json("welcome to my app");
  });
  app.listen(PORT, (req, res) => {
    console.log(`server is running on port ${PORT}`);
  });
};
