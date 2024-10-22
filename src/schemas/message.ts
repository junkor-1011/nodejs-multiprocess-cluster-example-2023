import { z } from "zod";

export const workerInitMessageSchema = z.object({
  pid: z.number().positive(),
  type: z.enum(["init"]),
});
export type WorkerInitMessage = z.infer<typeof workerInitMessageSchema>;

export const workerJobCompleteMessageSchema = z.object({
  pid: z.number().positive(),
  type: z.enum(["complete"]),
  message: z.string(),
});
export type WorkerJobCompleteMessage = z.infer<
  typeof workerJobCompleteMessageSchema
>;

export const workerMessageSchema = z.union([
  workerInitMessageSchema,
  workerJobCompleteMessageSchema,
]);
export type WorkerMessage = z.infer<typeof workerMessageSchema>;

export const jobRequestSchema = z.object({
  id: z.number(),
  message: z.string(),
});
export type JobRequest = z.infer<typeof jobRequestSchema>;
