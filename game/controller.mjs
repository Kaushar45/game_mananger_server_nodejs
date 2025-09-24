import { ServerError } from "../error.mjs";
import prisma, { DB_ERR_CODES } from "../prisma/db.mjs";

const addGame = async (req, res, next) => {
  const game = await prisma.game.create({
    data: {
      name: req.body.name,
      minPlayer: req.body.minPlayer,
      maxPlayer: req.body.maxPlayer,
    },
  });

  res.json({ msg: "successful", game });
};
const listGame = async (req, res, next) => {
  const games = await prisma.game.findMany();
  res.json({ msg: "successful", games });
};

const requestGame = async (req, res, name) => {
  if (!req.body.gameID) {
    throw new ServerError(400, "Game ID must be Supplied");
  }

  let gameSession = await prisma.gameSession.findFirst({
    where: { gameID: req.body.gameID, status: "WAITING" },
  });

  if (!gameSession) {
    gameSession = await prisma.gameSession.create({
      data: {
        gameID: req.body.gameID,
      },
    });
  }
  try {
    const gameSessionPlayer = await prisma.gameSessionPlayer.create({
      data: {
        sessionID: gameSession.id,
        playerID: req.user.id,
      },
    });

    res.json({
      msg: "successful",
      gameID: req.body.gameID,
      gameSession,
      gameSessionPlayer,
    });
  } catch (err){
    if (err.code === DB_ERR_CODES.UNIQUE_ERR) {
      throw new ServerError(
        400,
        "player is already exist in this game session"
      );
    }
    throw err;
  }
};

export { addGame, listGame, requestGame };
