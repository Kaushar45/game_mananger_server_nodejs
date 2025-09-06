import { ServerError } from "../error.mjs";
import { errorPritify, UserSignupModel } from "./validator.mjs";

const signup = async (req, res, next) => {
  const result = await UserSignupModel.safeParseAsync(req.body);
  if (!result.success) {
    throw new ServerError(400, errorPritify(result));
  }
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
