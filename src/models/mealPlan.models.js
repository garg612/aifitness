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
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: "",
    },
    items: {
      type: [
        {
          foodName: { type: String, required: true },
          quantity: { type: Number, required: true },
          unit: { type: String, default: "g" },
          calories: { type: Number, default: 0 },
          protein: { type: Number, default: 0 },
          carbs: { type: Number, default: 0 },
          fats: { type: Number, default: 0 },
          fibre: { type: Number, default: 0 },
          sugar: { type: Number, default: 0 },
          sodium: { type: Number, default: 0 },
        }
      ],
      default: [],
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