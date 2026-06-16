import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema(
  {
    workout: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workout",
      required: true,
      index: true,
    },

    exerciseName: {
      type: String,
      required: true,
    },

    sets: Number,

    reps: Number,

    weight: Number,

    duration: Number,

    caloriesBurned: Number,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Exercise", exerciseSchema);