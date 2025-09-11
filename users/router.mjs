import express from "express";
const userRouter = express.Router();
import {
  login,
  signup,
  forgotPassword,
  resetPassword,
  getMyProfile,
} from "./controller.mjs";
import { authentication } from "../auth.mjs";

userRouter
  .post("/signup", signup)
  .post("/login", login)
  .patch("/forgotPassword", forgotPassword)
  .patch("/resetPassword/:token", resetPassword)
  .get("/profile", authentication, getMyProfile);
export default userRouter;
