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
      enum: ["open", "scheduled", "completed"],
      default: "open",
      index: true,
    },

    scheduledAt: {
      type: Date,
      default: null,
    },

    durationMinutes: {
      type: Number,
      default: 30,
    },

    meetingLink: {
      type: String,
      default: null,
    },

    meetingPlatform: {
      type: String,
      enum: ["google-meet", "zoom", "teams", "other"],
      default: "google-meet",
    },

    ownerJoined: {
      type: Boolean,
      default: false,
    },

    shelterJoined: {
      type: Boolean,
      default: false,
    },

    ownerJoinedAt: {
      type: Date,
      default: null,
    },

    shelterJoinedAt: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      default: "",
    },

    cancelledBy: {
      type: String,
      enum: ["owner", "shelter", null],
      default: null,
    },

    cancellationReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

roomMeetingPetSchema.index({ applicationId: 1 }, { unique: true });

export default mongoose.model("RoomMeetingPet", roomMeetingPetSchema);
