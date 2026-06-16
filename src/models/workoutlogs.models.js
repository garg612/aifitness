import mongoose from "mongoose";

const workoutLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    workout: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workout",
      required: true,
    },

    completed: {
      type: Boolean,
      default: true,
    },

    completedAt: {
      type: Date,
      default: Date.now,
    },

    caloriesBurned: Number,

    duration: Number,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "WorkoutLog",
  workoutLogSchema
);