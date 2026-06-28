import { z } from "zod";
export const createMealSchema = z.object({
  title: z.string().min(1, "Meal name is required"),
  description: z.string().optional(),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  date: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      foodName: z.string().min(1, "Food name is required"),
      quantity: z.number().positive("Quantity must be positive"),
      unit: z.string().default("g"),
      calories: z.number().min(0),
      protein: z.number().min(0).optional(),
      carbs: z.number().min(0).optional(),
      fats: z.number().min(0).optional(),
      fibre: z.number().min(0).optional(),
      sugar: z.number().min(0).optional(),
      sodium: z.number().min(0).optional(),
    })
  ).default([]),
});