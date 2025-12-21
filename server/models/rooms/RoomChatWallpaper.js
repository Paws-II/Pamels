import mongoose from "mongoose";

const roomChatWallpaperSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RoomChatPet",
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    wallpaperType: {
      type: String,
      enum: ["preset", "custom"],
      default: "preset",
    },
    wallpaperUrl: {
      type: String,
      required: true,
    },
    presetName: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("RoomChatWallpaper", roomChatWallpaperSchema);
