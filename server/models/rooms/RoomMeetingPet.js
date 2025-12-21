import mongoose from "mongoose";

const roomMeetingPetSchema = new mongoose.Schema(
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
      index: true,
    },
    status: {
      type: String,
      enum: ["open", "ongoing", "closed", "blocked"],
      default: "open",
      index: true,
    },
  },
  { timestamps: true }
);

roomMeetingPetSchema.index({ applicationId: 1 }, { unique: true });
export default mongoose.model("RoomMeetingPet", roomMeetingPetSchema);
