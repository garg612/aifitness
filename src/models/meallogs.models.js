// models/mealLog.models.js

import mongoose from "mongoose";

const mealLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    mealPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MealPlan",
      required: true,
    },

    consumedAt: {
      type: Date,
      default: Date.now,
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
  "MealLog",
  mealLogSchema
);