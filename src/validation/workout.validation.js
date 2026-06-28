import { z } from "zod";
export const createWorkoutSchema = z.object({
  title: z.string().min(1, "Workout title is required"),
  description: z.string().optional(),
  duration: z.number().positive("Duration must be positive"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  goal: z.string().optional(),
  type: z.string().optional(),
  notes: z.string().optional(),
  date: z.string().optional(),
  exercises: z.array(
    z.object({
      exerciseName: z.string().min(1, "Exercise name is required"),
      sets: z.number().min(0),
      reps: z.number().min(0),
      weight: z.number().min(0).optional(),
      restTime: z.number().min(0).optional(),
      caloriesBurned: z.number().min(0).optional(),
      notes: z.string().optional(),
    })
  ).default([]),
});