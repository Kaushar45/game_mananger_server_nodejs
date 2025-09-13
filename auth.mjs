// 1. check for token is available
// 2. validate token
// 3. extract playload of token
// 4. attach to request for further use

import jwt from "jsonwebtoken";
import { ServerError } from "./error.mjs";
import dotenv from "dotenv";
dotenv.config();

const authentication = async (req, res, next) => {
  if (!req.headers.authorization) {
    throw new ServerError(400, "token is not sent");
  }

  const barerToken = req.headers.authorization.split(" ");
  const token = barerToken[1];
  if (!token) {
    throw new ServerError(400, "token not valid");
  }

  try {
    jwt.verify(token, process.env.TOKEN_SECRET);
  } catch (e) {
    throw new ServerError(400, e.message);
  }

  req.user = jwt.decode(token);
  next();
};

export { authentication };
