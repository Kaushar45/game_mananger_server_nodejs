import express from "express";
const userRouter = express.Router();
import {
  login,
  signup,
  forgotPassword,
  resetPassword,
  getMyProfile,
  updateProfileImage,
  deleteProfileImage,
} from "./controller.mjs";
import { authentication } from "../auth.mjs";
import { singleImageUpload } from "../storage/config.mjs";

userRouter
  .post("/signup", signup)
  .post("/login", login)
  .patch("/forgotPassword", forgotPassword)
  .patch("/resetPassword/:token", resetPassword)
  .get("/profile", authentication, getMyProfile)
  .patch(
    "/profile/image",
    authentication,
    singleImageUpload("image"),
    updateProfileImage
  )
  .delete("/profile/delete", authentication, deleteProfileImage);

export default userRouter;
