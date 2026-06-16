// models/mealItem.models.js

import mongoose from "mongoose";

const mealItemSchema = new mongoose.Schema(
  {
    mealPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MealPlan",
      required: true,
      index: true,
    },

    foodName: {
      type: String,
      required: true,
    },

    quantity: {
      type: String,
      required: true,
    },

    calories: {
      type: Number,
      default: 0,
    },

    protein: {
      type: Number,
      default: 0,
    },

    carbs: {
      type: Number,
      default: 0,
    },

    fats: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "MealItem",
  mealItemSchema
);