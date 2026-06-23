// src/models/UserProfile.js

import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },

    dob: {
      type: Date,
    },

    height: {
      type: Number, // cm
    },

    weight: {
      type: Number, // kg
    },

    targetWeight: {
      type: Number,
    },

    startWeight: {
      type: Number,
    },
    
    dietPreference: {
      type: String,
      enum: ["Vegetarian", "Non-Vegetarian", "Vegan", "Eggetarian"],
      default: "Non-Vegetarian",
    },

    goal: {
      type: String,
      enum: [
        "weight_loss",
        "weight_gain",
        "muscle_building",
        "marathon_training",
        "running",
        "endurance",
        "strength_training",
      ],
    },

    activityLevel: {
      type: String,
      enum: [
        "sedentary",
        "light",
        "moderate",
        "active",
        "very_active",
      ],
    },

    experienceLevel: {
      type: String,
      enum: [
        "beginner",
        "intermediate",
        "advanced",
      ],
      default: "beginner",
    },
  },
  {
    timestamps: true,
  }
);

const UserProfile = mongoose.model(
  "UserProfile",
  userProfileSchema
);

export default UserProfile;