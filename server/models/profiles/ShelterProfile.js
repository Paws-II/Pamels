import mongoose from "mongoose";

const shelterProfileSchema = new mongoose.Schema(
  {
    shelterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShelterLogin",
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      default: "shelter",
      immutable: true,
    },

    name: {
      type: String,
      default: "New Shelter",
    },

    avatar: {
      type: String,
      default: "url",
    },

    phone: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    specialization: {
      type: String,
      default: "General Pet Training",
    },

    experience: {
      type: Number,
      default: 0,
    },

    bio: {
      type: String,
      default: "Certified shelter with a passion for pet behavior and care.",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ShelterProfile", shelterProfileSchema);
