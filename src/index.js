import express from "express";
import { bootstrap } from "./app.controller.js";
const app = express();

await bootstrap(app);
export default app;
