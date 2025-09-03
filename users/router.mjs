import express from "express";
const userRouter = express.Router();
import { login, signup } from "./controller.mjs";

userRouter.post("/signup", signup).post("/login", login);

export default userRouter;
