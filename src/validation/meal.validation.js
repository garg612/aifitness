import { z } from "zod";

export const createMealSchema = z.object({
  title: z.string().min(1),

  description: z.string().optional(),

  mealType: z.enum([
    "breakfast",
    "lunch",
    "dinner",
    "snack",
  ]),

  items: z.array(
    z.object({
      foodName: z.string(),

      quantity: z.string(),

      calories: z.number(),

      protein: z.number().optional(),

      carbs: z.number().optional(),

      fats: z.number().optional(),
    })
  ),
});