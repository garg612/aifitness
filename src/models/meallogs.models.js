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
      required: false,
    },

    mealName: {
      type: String,
      required: true,
    },

    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack"],
      default: "lunch",
    },

    consumedAt: {
      type: Date,
      default: Date.now,
    },

    totalCalories: {
      type: Number,
      default: 0,
    },
    totalCarbs: {
      type: Number,
      default: 0,
    },
    totalProtein: {
      type: Number,
      default: 0,
    },
    totalFat: {
      type: Number,
      default: 0,
    },
    totalFibre: {
      type: Number,
      default: 0,
    },
    totalSugar: {
      type: Number,
      default: 0,
    },
    totalSodium: {
      type: Number,
      default: 0,
    },
    foods: {
      type: [
        {
          name: { type: String, required: true },
          quantity: { type: Number, required: true },
          unit: { type: String, default: "g" },
          calories: { type: Number, default: 0 },
          protein: { type: Number, default: 0 },
          carbs: { type: Number, default: 0 },
          fat: { type: Number, default: 0 },
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
  "MealLog",
  mealLogSchema
);