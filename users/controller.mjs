const signup = (req, res, next) => {
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
