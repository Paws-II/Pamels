import mongoose from "mongoose";

const roomChatPetSchema = new mongoose.Schema(
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
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdoptionApplication",
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "ongoing", "closed", "blocked"],
      default: "open",
      index: true,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    participantTyping: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
      },
      isTyping: {
        type: Boolean,
        default: false,
      },
      lastTypingAt: {
        type: Date,
        default: null,
      },
    },
  },
  { timestamps: true }
);

roomChatPetSchema.index(
  { shelterId: 1, ownerId: 1, petId: 1 },
  { unique: true }
);
roomChatPetSchema.index({ applicationId: 1 });

export default mongoose.model("RoomChatPet", roomChatPetSchema);
