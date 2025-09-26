import { ServerError } from "../error.mjs";
import bcrypt from "bcrypt";
import prisma from "../prisma/db.mjs";
import { errorPritify, UserSignupModel, UserLoginModel } from "./validator.mjs";
import emailQueue from "../queue/email.queue.mjs";
import { asyncJwtSign } from "../async_jwt.mjs";
import dayjs from "dayjs";
import { generateSecureRandomString } from "../utils.mjs";
import { uploadImage, deleteImage } from "../storage/storage.mjs";
import dotenv from "dotenv";
dotenv.config();

const signup = async (req, res, next) => {
  const result = await UserSignupModel.safeParseAsync(req.body);

  if (!result.success) {
    throw new ServerError(400, errorPritify(result));
  }
  const existingUser = await prisma.user.findUnique({
    where: { email: req.body.email },
  });

  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }
  const hasedPassword = await bcrypt.hash(req.body.password, 10);

  const token = generateSecureRandomString(32);

  const expiryTime = dayjs().add(15, "minute");

  const newUser = await prisma.user.create({
    data: {
      email: req.body.email,
      name: req.body.name,
      password: hasedPassword,
      resetToken: token,
      resetTokenExpiry: expiryTime,
    },
  });

  const link = `${req.protocol}://${process.env.FRONTEND_URL}/${token}`;

  await emailQueue.add("Welcome Email", {
    to: newUser.email,
    subject: "Verification Email",
    body: `<html>
      <h1>Welcome ${newUser.name}</h1>
      <a href= ${link}> click here to veriy account</a>
    </html>`,
  });

  res.json({ msg: "signup is successful" });
};

const login = async (req, res, next) => {
  const result = await UserLoginModel.safeParseAsync(req.body);
  if (!result.success) {
    throw new ServerError(400, errorPritify(result));
  }

  const user = await prisma.user.findUnique({
    where: {
      email: req.body.email,
    },
  });

  if (!user) {
    throw new ServerError(404, "user is not found");
  }

  if (!user.accountVerified) {
    throw new ServerError(404, "verify you account");
  }

  if (!(await bcrypt.compare(req.body.password, user.password))) {
    throw new ServerError(401, "password does not match");
  }

  const token = await asyncJwtSign(
    { id: user.id, name: user.name, email: user.email },
    process.env.TOKEN_SECRET,
    { expiresIn: process.env.RESET_LINK_EXPIRY_TIME_IN_MINUTES }
  );
  res.json({
    msg: "login successful",
    token,
    id: user.id,
    name: user.name,
    email: user.email,
    profilePhoto: user.profilePhoto,
  });
};

const forgotPassword = async (req, res, next) => {
  const token = generateSecureRandomString(32);
  const expiryTime = dayjs().add(15, "minute");

  console.log(token);

  const userArr = await prisma.user.updateManyAndReturn({
    where: {
      email: req.body.email,
    },
    data: {
      resetToken: token,
      resetTokenExpiry: expiryTime,
    },
  });

  if (userArr.length === 0) {
    throw new ServerError(404, "User not found, please signup first");
  }

  const user = userArr[0];

  const link = `${req.protocol}://${process.env.FRONTEND_URL}/${token}`;

  await emailQueue.add("Forgot_Password Email", {
    to: user.email,
    subject: "Forgot Password Email",
    body: `<html>
      <h1>Hi, ${user.name}</h1>
      <a href=${link}>Click Here to reset password</a>
    </html>`,
  });

  res.json({ msg: "Email sent successfully, check your email" });
};

const resetPassword = async (req, res, next) => {
  // 1. Extract token from req.body
  if (!req.body || !req.body.token) {
    throw new ServerError(401, "Invalid link or token");
  }
  console.log(token);
  // 2. find User via token from DB
  const user = await prisma.user.findFirst({
    where: {
      resetToken: req.body.token,
    },
  });
  console.log(user);
  if (!user) {
    throw new ServerError(401, "Invalid link or token");
  }
  if (dayjs(user.tokenExpiry).isBefore(dayjs())) {
    throw new ServerError(401, "Link expired");
  }
  if (user.accountVerified && !req.body.password) {
    if (req.body.password.length < 6) {
      throw new ServerError(401, "password should not be less than 6");
    }
    throw new ServerError(401, "password must be supplied");
  }

  if (user.accountVerified) {
    const hashedPass = await bcrypt.hash(req.body.password, 10);
    await prisma.user.updateMany({
      where: { id: user.id },
      data: {
        password: hashedPass,
        resetToken: null,
        tokenExpiry: null,
      },
    });
    res.json({ msg: "reset password successful" });
  } else {
    await prisma.user.updateMany({
      where: { id: user.id },
      data: {
        accountVerified: true,
        resetToken: null,
        tokenExpiry: null,
      },
    });
    res.json({ msg: "Account verification successful" });
  }
};

const getMyProfile = async (req, res, next) => {
  const user = await prisma.user.findUnique({
    where: {
      email: req.body.email,
    },
  });

  if (!user) {
    throw new ServerError(404, "user is not found");
  }
  console.log(user);
  res.json({
    message: "This is My Profile",
    name: user.name,
    email: user.email,
    profilePhoto: user.profilePhoto,
    createdAt: user.createdAt,
  });
};

const updateProfileImage = async (req, res, next) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.user.id,
    },
  });
  let result;
  if (!user.profilePhoto) {
    const fileName = `${generateSecureRandomString(32)}`;
    result = await uploadImage(req.file.buffer, fileName, "profiles", true);
  } else {
    const splittedUrl = user.profilePhoto.split("/");
    const fileNameWithExt = splittedUrl[splittedUrl.length - 1];
    const fileName = fileNameWithExt.split(".")[0];
    result = await uploadImage(req.file.buffer, fileName, "profiles", true);
  }
  await prisma.user.update({
    where: { id: req.user.id },
    data: {
      profilePhoto: result.secure_url,
    },
  });
  res.json({ msg: "Profile Photo Update" });
};

const deleteProfileImage = async (req, res, next) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.user.id,
    },
  });

  if (!user || !user.profilePhoto) {
    return res.status(404).json({ message: "Profile photo not found" });
  }

  const splittedUrl = user.profilePhoto.split("/");
  const fileNameWithExt = splittedUrl[splittedUrl.length - 1];
  const fileName = fileNameWithExt.split(".")[0];

  await deleteImage(fileName, "profiles");

  await prisma.user.update({
    where: { id: req.user.id },
    data: {
      profilePhoto: null,
    },
  });

  res.json({
    message: "Profile photo deleted successfully",
  });
};

export {
  signup,
  login,
  forgotPassword,
  resetPassword,
  getMyProfile,
  updateProfileImage,
  deleteProfileImage,
};
