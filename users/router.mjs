import express from "express";
const userRouter = express.Router();
import { login, signup, forgotPassword, resetPassword } from "./controller.mjs";
userRouter
  .post("/signup", signup)
  .post("/login", login)
  .patch("/forgotPassword", forgotPassword)
  .patch("/resetPassword/:token", resetPassword);
export default userRouter;
