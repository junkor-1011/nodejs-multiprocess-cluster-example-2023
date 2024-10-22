import { z } from "zod";

export const taskArgsSchema = z.object({
  id: z.number(),
  message: z.string(),
});
export type TaskArgs = z.infer<typeof taskArgsSchema>;
