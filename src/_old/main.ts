import cluster from "node:cluster";
import { availableParallelism } from "node:os";
import process from "node:process";

import { z } from "zod";
const dummyMessageSchema = z.object({ message: z.string() });

if (cluster.isPrimary) {
  const numCPUs = availableParallelism();
  console.debug(`Primary process, pid: ${process.pid}`);

  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork();
    console.debug(`worker id: ${worker.id}, pid: ${worker.process?.pid}`);

    worker.on("message", (obj) => {
      console.log(
        `received message from ${worker.process?.pid}: ${obj?.message}`,
      );
    });

    setTimeout(() => {
      worker.send({ message: "Hello from Primary" });
    }, 100);

    worker
      .on("exit", (code, signal) => {
        console.debug(
          `subprocess exit: pid=${worker.process?.pid}, code=${code}, signal=${signal}`,
        );
      });
  }

  console.log("hello, world");
} else {
  console.debug(`sub process, pid: ${process.pid}`);

  process.on("message", (msg) => {
    const messageObject = dummyMessageSchema.parse(msg);
    console.debug(
      `[pid: ${process.pid}]received message: ${messageObject.message}`,
    );

    process.send?.({ message: `message from pid: ${process.pid}` }, () => {
      process.kill(process.pid);
    });
  });
}
