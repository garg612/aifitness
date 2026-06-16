import { z } from "zod";

export const bmiSchema = z.object({
  height: z.number().positive(),

  weight: z.number().positive(),
});