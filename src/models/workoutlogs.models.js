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
      required: false,
    },

    workoutName: {
      type: String,
      required: true,
    },

    workoutType: {
      type: String,
      default: "Strength",
    },

    goal: {
      type: String,
      default: "",
    },

    difficulty: {
      type: String,
      default: "beginner",
    },

    notes: {
      type: String,
      default: "",
    },

    completed: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: ["completed", "missed"],
      default: "completed",
    },

    completedAt: {
      type: Date,
      default: Date.now,
    },

    caloriesBurned: {
      type: Number,
      required: true,
    },

    duration: {
      type: Number,
      required: true,
    },

    exercises: {
      type: [
        {
          exerciseName: { type: String, required: true },
          sets: { type: Number, default: 0 },
          reps: { type: Number, default: 0 },
          weight: { type: Number, default: 0 },
          restTime: { type: Number, default: 0 },
          caloriesBurned: { type: Number, default: 0 },
          notes: { type: String, default: "" },
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
  "WorkoutLog",
  workoutLogSchema
);