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
        "full_day",
      ],
      default: "full_day",
    },

    totalCalories: {
      type: Number,
      default: 0,
    },

    dailyCalorieTarget: {
      type: Number,
      default: 0,
    },

    meals: {
      type: Array,
      default: [],
    },

    weeklyPlan: {
      type: Array,
      default: [],
    },

    dietPreference: {
        type: String,
        enum: ["Vegetarian", "Non-Vegetarian", "Vegan", "Eggetarian"],
    },
    tdee: {
        type: Number,
    },
    generatedByAI: {
        type: Boolean,
        default: false,
    },
    source: {
        type: String,
        enum: ["manual", "ai-generated"],
        default: "manual",
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