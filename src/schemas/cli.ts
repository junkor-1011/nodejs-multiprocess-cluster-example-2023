import { z } from "zod";

export const cliOptsSchema = z.object({
  number: z.number().positive(),
});
export type CliOpts = z.infer<typeof cliOptsSchema>;
