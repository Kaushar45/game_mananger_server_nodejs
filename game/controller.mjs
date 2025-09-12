import prisma from "../prisma/db.mjs";

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

export { addGame, listGame };
