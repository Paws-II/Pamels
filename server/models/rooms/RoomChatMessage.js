import mongoose from "mongoose";

const roomChatMessageSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RoomChatPet",
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "senderModel",
    },
    senderModel: {
      type: String,
      required: true,
      enum: ["OwnerLogin", "ShelterLogin"],
    },
    messageType: {
      type: String,
      enum: ["text", "image", "system"],
      default: "text",
      required: true,
    },
    content: {
      type: String,
      default: "",
    },
    images: [
      {
        type: String,
      },
    ],
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RoomChatMessage",
      default: null,
    },
    reactions: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        emoji: {
          type: String,
          required: true,
        },
      },
    ],
    deletedFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    deletedForEveryone: {
      type: Boolean,
      default: false,
    },
    deliveredTo: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        deliveredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    readBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

roomChatMessageSchema.index({ roomId: 1, createdAt: -1 });
roomChatMessageSchema.index({ senderId: 1 });

export default mongoose.model("RoomChatMessage", roomChatMessageSchema);
