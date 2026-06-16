import { z } from "zod";
import {
  GOALS,
  ACTIVITY_LEVELS,
  EXPERIENCE_LEVELS,
} from "../constants/profile.constants.js";

export const updateProfileSchema = z.object({
  gender: z.enum(["male", "female", "other"]).optional(),

  dob: z.string().optional(),

  height: z.number().positive().optional(),

  weight: z.number().positive().optional(),

  targetWeight: z.number().positive().optional(),

  goal: z.enum(GOALS).optional(),

  activityLevel: z.enum(ACTIVITY_LEVELS).optional(),

  experienceLevel: z.enum(EXPERIENCE_LEVELS).optional(),
});