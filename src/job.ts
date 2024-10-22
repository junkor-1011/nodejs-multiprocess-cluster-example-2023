import { TaskArgs } from "./schemas/job";
import { sleep } from "./utils";

export async function task(args: TaskArgs): Promise<void> {
  console.log(`[job init]jobId: ${args.id}, requestMessage: ${args.message}`);

  await sleep(1000);

  console.log(`[job complete]finished at ${(new Date()).toISOString()}`);
}
