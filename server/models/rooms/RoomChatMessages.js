import mongoose from "mongoose";

const roomChatMessagesSchema = new mongoose.Schema(
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
    imageUrl: {
      type: String,
      default: null,
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RoomChatMessages",
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
    deletedBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        deletedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    deletedForEveryone: {
      type: Boolean,
      default: false,
    },
    deliveredTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    readBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
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

roomChatMessagesSchema.index({ roomId: 1, createdAt: -1 });
roomChatMessagesSchema.index({ senderId: 1 });

export default mongoose.model("RoomChatMessages", roomChatMessagesSchema);
