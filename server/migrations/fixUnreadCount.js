import mongoose from "mongoose";
import RoomChatPet from "../models/rooms/RoomChatPet.js";
import dotenv from "dotenv";
dotenv.config({ path: "./server/.env" });

const fixUnreadCount = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to database");

    const result = await RoomChatPet.updateMany(
      {
        $or: [{ unreadCount: { $exists: false } }, { unreadCount: null }],
      },
      {
        $set: {
          unreadCount: {
            owner: 0,
            shelter: 0,
          },
        },
      }
    );

    console.log(`Updated ${result.modifiedCount} rooms`);
    process.exit(0);
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
};

fixUnreadCount();
