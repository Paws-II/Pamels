import mongoose from "mongoose";

const checkLoginSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["owner", "shelter"],
      required: true,
    },

    loginMode: {
      type: String,
      enum: ["manual", "google"],
      required: true,
    },

    loginTime: {
      type: Date,
      default: Date.now,
    },

    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "roleRef",
    },

    roleRef: {
      type: String,
      required: true,
      enum: ["OwnerLogin", "ShelterLogin"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("CheckLogin", checkLoginSchema);
