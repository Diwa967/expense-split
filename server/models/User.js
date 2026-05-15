import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },

    profile: { type: String, default: "" },

    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    googleId: { type: String, sparse: true, unique: true },

    isVerified: { type: Boolean, default: false },
    verifyOtp: String,
    verifyOtpExpireAt: Date,

    resetOtp: String,
    resetOtpExpireAt: Date,

    // 🔥 New Ban Fields
    isBanned: {
      type: Boolean,
      default: false,
    },
    banReason: {
      type: String,
      default: "",
    },
    bannedAt: {
      type: Date,
      default: null,
    },
    bannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);