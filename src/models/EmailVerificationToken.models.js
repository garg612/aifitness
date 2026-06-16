import mongoose from "mongoose";

const emailVerificationTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    tokenHash: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      expires: 0, // TTL
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "EmailVerificationToken",
  emailVerificationTokenSchema
);