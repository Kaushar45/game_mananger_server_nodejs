import { ServerError } from "../error.mjs";
import bcrypt from "bcrypt";
import prisma from "../prisma/db.mjs";
import { errorPritify, UserSignupModel } from "./validator.mjs";
import emailQueue from "../queue/email.queue.mjs";

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
      <a href="https://google.com"> click here to veriy account</a>
    </html>`,
  });

  res.json({ msg: "signup is successful" });
};

const login = (req, res, next) => {
  res.json({ msg: "login is successful" });
};

const forgotPassword = (req, res, next) => {
  res.json({ msg: "forgot password" });
};
const resetPassword = (req, res, next) => {
  res.json({ msg: "reset password" });
};

export { signup, login, forgotPassword, resetPassword };
