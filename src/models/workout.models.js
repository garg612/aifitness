import mongoose from "mongoose";

const workoutSchema = new mongoose.Schema(
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

    duration: {
      type: Number,
      required: true,
    },

    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },

    isTemplate: {
      type: Boolean,
      default: false,
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
    weeklyPlan: {
        type: Array,
        default: [],
    },
    goal: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      default: "Strength",
    },
    notes: {
      type: String,
      default: "",
    },
    date: {
      type: Date,
      default: Date.now,
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

export default mongoose.model("Workout", workoutSchema);