import { Worker } from "bullmq";
import redis from "../redis.mjs";
import sendEmail from "../email.mjs";

const worker = new Worker(
  "email_queue",
  async (job) => {
    const { to, subject, body } = job.data;
    await sendEmail(to, subject, body);
  },
  { connection: redis }
);

worker.on("completed", (job) => {
  console.log(`Job Done!! ${job}`);
});
worker.on("failed", (job, err) => {
  console.log(`Job Failed ${job} err:${err}`);
});
