import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const redis = new Redis({
  maxRetriesPerRequest: null,
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_POST,
  username: "default",
  password: process.env.REDIS_PASSWORD,
});

export default redis;
