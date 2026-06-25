import { z } from "zod";

export const logWaterSchema = z.object({
  amount: z.number().positive("Amount must be a positive number"),
  consumedAt: z.string().optional(),
});

export const updateWaterGoalSchema = z.object({
  waterGoal: z.number().positive("Water goal must be a positive number"),
});
