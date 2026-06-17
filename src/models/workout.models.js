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
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Workout", workoutSchema);