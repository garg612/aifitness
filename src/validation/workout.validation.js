import { z } from "zod";
export const createWorkoutSchema = z.object({
  title: z.string().min(1),

  description: z.string().optional(),

  duration: z.number().positive(),

  difficulty: z
    .enum([
      "beginner",
      "intermediate",
      "advanced",
    ])
    .optional(),

  exercises: z.array(
    z.object({
      exerciseName: z.string(),

      sets: z.number(),

      reps: z.number(),

      weight: z.number().optional(),

      duration: z.number().optional(),

      caloriesBurned: z.number().optional(),
    })
  ),
});