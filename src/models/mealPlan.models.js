// models/mealPlan.models.js

import mongoose from "mongoose";

const mealPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    mealType: {
      type: String,
      enum: [
        "breakfast",
        "lunch",
        "dinner",
        "snack",
      ],
      required: true,
    },

    totalCalories: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "MealPlan",
  mealPlanSchema
);