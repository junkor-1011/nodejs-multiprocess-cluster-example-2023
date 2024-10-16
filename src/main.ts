import cluster from "node:cluster";
import { availableParallelism } from "node:os";
import process from "node:process";

if (cluster.isPrimary) {
  const numCPUs = availableParallelism();
  console.debug(`Primary process, pid: ${process.pid}`);

  for (let i = 0; i < numCPUs; i++) {
    const _worker = cluster.fork();
  }

  console.log("hello, world");
} else if (cluster.isWorker) {
  console.debug(`sub process, pid: ${process.pid}`);

  process.kill(process.pid);
}
