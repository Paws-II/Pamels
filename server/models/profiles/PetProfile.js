import mongoose from "mongoose";

const petProfileSchema = new mongoose.Schema(
  {
    shelterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShelterLogin",
      required: true,
      index: true,
    },

    adoptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OwnerLogin",
      default: null,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    species: {
      type: String,
      required: true,
      trim: true,
    },

    breed: {
      type: String,
      default: "Unknown",
      trim: true,
    },

    gender: {
      type: String,
      enum: ["male", "female", "unknown"],
      default: "unknown",
    },

    dateOfBirth: {
      type: Date,
      default: null,
    },

    age: {
      type: Number,
      min: 0,
      default: null,
    },

    ageUnit: {
      type: String,
      enum: ["months", "years"],
      default: "years",
    },

    size: {
      type: String,
      enum: ["small", "medium", "large"],
      default: "medium",
    },

    color: {
      type: String,
      default: "",
    },

    images: [
      {
        type: String,
      },
    ],

    vaccinated: {
      type: Boolean,
      default: false,
    },
    medicalNotes: {
      type: String,
      default: "",
    },
    temperament: {
      type: [String],
      default: [],
    },
    spayedNeutered: {
      type: Boolean,
      default: false,
    },
    houseTrained: {
      type: Boolean,
      default: false,
    },
    specialNeeds: {
      type: Boolean,
      default: false,
    },
    specialNeedsDescription: {
      type: String,
      default: "",
    },

    specialNeeds: {
      type: Boolean,
      default: false,
    },

    adoptionStatus: {
      type: String,
      enum: ["available", "reserved", "adopted"],
      default: "available",
      index: true,
    },

    adoptionFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    donation: {
      type: Number,
      default: 0,
      min: 0,
    },
    maintenanceCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAdoptionCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    coverImage: {
      type: String,
      default: null,
    },

    description: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("PetProfile", petProfileSchema);
