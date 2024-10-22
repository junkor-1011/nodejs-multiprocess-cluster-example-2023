import cluster from "node:cluster";
import { availableParallelism } from "node:os";
import process from "node:process";

import { Mutex } from "async-mutex";
import { Option, program } from "commander";

import { range, sleep } from "./utils";
import { cliOptsSchema } from "./schemas/cli";
import {
  type JobRequest,
  jobRequestSchema,
  WorkerInitMessage,
  WorkerJobCompleteMessage,
  workerMessageSchema,
} from "./schemas/message";
import { task } from "./job";

if (cluster.isPrimary) {
  const numCPUs = availableParallelism();
  console.debug(`Primary process, pid: ${process.pid}`);

  // commander.js
  program
    .name("example-app")
    .description("app with threading")
    .addOption(
      new Option("-n --number <number", "number of jobs").default(100)
        .argParser(parseFloat),
    );
  program.parse();

  const opts = cliOptsSchema.parse(program.opts());

  const jobs: number[] = range(opts.number);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  const mutex = new Mutex();

  cluster.on("message", async (worker, msg) => {
    const message = workerMessageSchema.parse(msg);

    console.debug(message);

    await mutex.runExclusive(async () => {
      const job = jobs.shift();

      if (job != null) {
        const jobRequest = {
          id: job,
          message: `request date: ${(new Date()).toISOString()}`,
        } as const satisfies JobRequest;
        worker.send(jobRequest);
      } else {
        worker.kill();
      }
    });
  });
} else {
  console.debug(`sub process, pid: ${process.pid}`);

  {
    const initMessage = {
      pid: process.pid,
      type: "init",
    } as const satisfies WorkerInitMessage;

    process.send?.(initMessage);
  }

  process.on("message", async (msg) => {
    const jobContent = jobRequestSchema.parse(msg);

    await task({
      id: jobContent.id,
      message: `pid: ${process.pid}`,
    });

    const jobCompleteMessage = {
      pid: process.pid,
      type: "complete",
      message: `jobId: ${jobContent.id} is completed`,
    } as const satisfies WorkerJobCompleteMessage;
    process.send?.(jobCompleteMessage);
  });
}
