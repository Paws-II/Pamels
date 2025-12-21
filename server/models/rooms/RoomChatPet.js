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
      index: true,
    },
  },
  { timestamps: true }
);

roomChatPetSchema.index({ applicationId: 1 }, { unique: true });

export default mongoose.model("RoomChatPet", roomChatPetSchema);
