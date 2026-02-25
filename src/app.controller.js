import { checkConnectionDB } from "./DB/connectionDB.js";
import express from "express";
import configServices from "./config/configServices.js";
import { userRouter } from "./modules/users/users.controllers.js";
import { messageRouter } from "./modules/messages/messages.controllers.js";
import cors from 'cors';
const app = express();
const PORT = configServices.port.port;
export const bootstrap = async (req, res) => {
  app.use(cors(),express.json());
  // app.use(express.urlencoded({ extended: true }));
  app.use("/users", userRouter);
  app.use("/messages",messageRouter)
  app.use("/uploads", express.static("uploads"));

  checkConnectionDB();
  app.get("/", (req, res) => {
    return res.status(200).json("welcome to my app");
  });
  app.listen(PORT, (req, res) => {
    console.log(`server is running on port ${PORT}`);
  });
};
