import mongoose from "mongoose";
import crypto from "crypto";

const shelterLoginSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: false,
      default: null,
    },

    role: {
      type: String,
      default: "shelter",
      immutable: true,
    },

    mode: {
      type: String,
      enum: ["manual", "google"],
      default: "manual",
    },

    tempPassword: {
      type: String,
      default: function () {
        if (this.mode === "google") {
          return crypto.randomBytes(10).toString("hex");
        }
        return null;
      },
    },

    otp: {
      type: String,
      default: null,
    },

    otpExpiresAt: {
      type: Date,
      default: null,
    },

    otpVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ShelterLogin", shelterLoginSchema);
