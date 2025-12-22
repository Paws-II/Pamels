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
    wallpaper: {
      type: String,
      default: "default",
    },
    lastMessage: {
      content: {
        type: String,
        default: "",
      },
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
      },
      timestamp: {
        type: Date,
        default: null,
      },
    },
    unreadCount: {
      owner: {
        type: Number,
        default: 0,
      },
      shelter: {
        type: Number,
        default: 0,
      },
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

roomChatPetSchema.pre("save", function () {
  if (!this.unreadCount) {
    this.unreadCount = { owner: 0, shelter: 0 };
  }
});
export default mongoose.model("RoomChatPet", roomChatPetSchema);
