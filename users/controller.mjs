const signup = (req, res, next) => {
  res.json({ msg: "signup done" });
};

const login = (req, res, next) => {
  res.json({ msg: "login done" });
};

export { signup, login };
