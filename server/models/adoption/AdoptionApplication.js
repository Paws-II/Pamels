import mongoose from "mongoose";

const adoptionApplicationSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OwnerLogin",
      required: true,
      index: true,
    },
    shelterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShelterLogin",
      required: true,
      index: true,
    },
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PetProfile",
      required: true,
      index: true,
    },

    applicationData: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },

      residenceType: {
        type: String,
        enum: ["apartment", "house", "farm", "other"],
        required: true,
      },
      ownOrRent: {
        type: String,
        enum: ["own", "rent"],
        required: true,
      },
      petAllowed: {
        type: String,
        enum: ["yes", "no", "conditional"],
        default: "yes",
        required: true,
      },

      numberOfPeople: { type: Number, required: true },
      hasChildren: { type: Boolean, default: false },
      childrenAgeRange: { type: String },
      hasOtherPets: { type: Boolean, default: false },
      otherPetsDetails: { type: String },

      ownedPetsBefore: { type: Boolean, required: true },
      previousPetTypes: { type: String },
      experienceLevel: {
        type: String,
        enum: ["beginner", "intermediate", "experienced"],
        required: true,
      },

      hoursPerDay: {
        type: String,
        enum: ["less_than_2", "2_to_4", "4_to_6", "more_than_6"],
        required: true,
      },
      primaryCaretaker: {
        type: String,
        enum: ["self", "family", "shared"],
        required: true,
      },

      adoptionReason: { type: String, required: true },
      adoptionPurpose: {
        type: String,
        enum: ["companionship", "family", "emotional_support", "other"],
        required: true,
      },
      longTermCommitment: { type: Boolean, required: true },

      relocatePlan: { type: String, required: true },
      canAffordCare: { type: Boolean, required: true },

      preferredAdoptionDate: { type: Date },
      additionalNotes: { type: String },
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "withdrawn"],
      default: "pending",
      index: true,
    },

    shelterNotes: { type: String },

    scheduledMeeting: {
      date: { type: Date },
      time: { type: String },
      location: { type: String },
      notes: { type: String },
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "waived"],
      default: "pending",
    },

    agreedToTerms: {
      type: Boolean,
      required: true,
      default: false,
    },

    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

adoptionApplicationSchema.index({ ownerId: 1, petId: 1 });

export default mongoose.model("AdoptionApplication", adoptionApplicationSchema);
