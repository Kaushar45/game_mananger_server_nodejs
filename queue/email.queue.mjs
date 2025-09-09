import { Queue } from "bullmq";
import redis from "../redis.mjs";

const emailQueue = new Queue("email_queue", {
  connection: redis,
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 5000,
  },
});

export default emailQueue;
