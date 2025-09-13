import { ServerError } from "../error.mjs";
import bcrypt from "bcrypt";
import prisma from "../prisma/db.mjs";
import { errorPritify, UserSignupModel, UserLoginModel } from "./validator.mjs";
import emailQueue from "../queue/email.queue.mjs";
import { asyncJwtSign } from "../async_jwt.mjs";
import Randomstring from "randomstring";
import dayjs from "dayjs";
import dotenv from "dotenv";
dotenv.config();

const signup = async (req, res, next) => {
  const result = await UserSignupModel.safeParseAsync(req.body);

  if (!result.success) {
    throw new ServerError(400, errorPritify(result));
  }
  const hasedPassword = await bcrypt.hash(req.body.password, 10);

  const newUser = await prisma.user.create({
    data: {
      email: req.body.email,
      name: req.body.name,
      password: hasedPassword,
    },
  });
  await emailQueue.add("Welcome Email", {
    to: newUser.email,
    subject: "Verification Email",
    body: `<html>
      <h1>Welcome ${newUser.name}</h1>
      <a href="http:localhost5000/signup"> click here to veriy account</a>
    </html>`,
  });

  res.json({ msg: "signup is successful" });
};

const login = async (req, res, next) => {
  const result = await UserLoginModel.safeParseAsync(req.body);

  if (!result.success) {
    throw new ServerError(400, errorPritify(result));
  }
  // find user in DB
  const user = await prisma.user.findUnique({
    where: {
      email: req.body.email,
    },
  });

  if (!user) {
    throw new ServerError(404, "user not found.");
  }

  const isOk = await bcrypt.compare(req.body.password, user.password);

  if (!isOk) {
    throw new ServerError(401, "wrong password.");
  }

  const token = await asyncJwtSign(
    { id: user.id, name: user.name, email: user.email },
    process.env.TOKEN_SECRET
  );

  res.json({
    msg: "login is successful",
    token,
    name: user.name,
    email: user.email,
  });
};

const forgotPassword = async (req, res, next) => {
  const user = await prisma.user.findUnique({
    where: {
      email: req.body.email,
    },
  });

  if (!user) {
    throw new ServerError(404, "User Does Not Exist.");
  }

  const token = Randomstring.generate(32);
  console.log(token);
  await prisma.user.update({
    where: { email: req.body.email },
    data: { resetToken: token, resetTokenExpiry: new Date(Date.now()) },
  });

  await emailQueue.add("Forgot_Password Email", {
    to: user.email,
    subject: "Forgot Password Email",
    body: `<html><body>Click this link <a href="http://localhost:5000/reset_password/${token}">Click Here</a></body></html>`,
  });

  res.json({ msg: "Email sent successfully, check your email" });
};

const resetPassword = async (req, res, next) => {
  const users = await prisma.user.findMany({
    where: {
      resetToken: req.body.token,
    },
  });

  if (!users) {
    throw new ServerError(404, "invalid reset link");
  }

  const user = users[0];
  console.log(user);

  if (dayjs().isAfter(dayjs(user.resetTokenExpiry))) {
    throw new ServerError(400, "Link has expired! Try again");
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  await prisma.user.update({
    where: {
      id: user.id,
    },

    data: {
      resetToken: null,
      password: hashedPassword,
      resetTokenExpiry: null,
    },
  });
  res.json({ message: "password reset successful" });
};

const getMyProfile = async (req, res, next) => {
  res.json({ message: "This is My Profile" });
};

export { signup, login, forgotPassword, resetPassword, getMyProfile };
