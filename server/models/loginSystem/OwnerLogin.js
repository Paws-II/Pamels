import mongoose from "mongoose";
import crypto from "crypto";

const ownerLoginSchema = new mongoose.Schema(
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
      default: "owner",
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

    passwordChanged: {
      type: Boolean,
      default: false,
    },
    securityOTP: {
      type: String,
      default: null,
    },
    securityOTPExpiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("OwnerLogin", ownerLoginSchema);
