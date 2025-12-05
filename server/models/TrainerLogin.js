import mongoose from "mongoose";
import crypto from "crypto";

const trainerLoginSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      default: "trainer",
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
  },
  { timestamps: true }
);

export default mongoose.model("TrainerLogin", trainerLoginSchema);
