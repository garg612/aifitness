import mongoose from "mongoose";

const aiRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    requestType: {
      type: String,
      enum: ["workout-plan", "meal-plan"],
      required: true,
    },

    prompt: {
      type: String,
      required: true,
    },

    response: {
      type: String,
    },

    tokensUsed: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },

    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("AIRequest", aiRequestSchema);
