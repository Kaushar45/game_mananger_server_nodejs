const createSession = async (req, res, next) => {
  res.json({ msg: "create session" });
};
const addPlayer = async (req, res, next) => {
  res.json({ msg: "add player" });
};
const listSession = async (req, res, next) => {
  const gameID = req.params.game_id;
  res.json({ msg: "list session", gameID });
};

export { createSession, addPlayer, listSession };
