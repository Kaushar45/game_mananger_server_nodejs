import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

export default prisma;

export const DB_ERR_CODES = {
  UNIQUE_ERR: "P2002",
};
