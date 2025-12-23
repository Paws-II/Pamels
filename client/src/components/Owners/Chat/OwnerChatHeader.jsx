import React, { useState, useRef } from "react";
import {
  User,
  Circle,
  MoreVertical,
  Ban,
  X as XIcon,
  Image as ImageIcon,
  Video,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const OwnerChatHeader = ({
  room,
  userRole,
  isOppositeOnline,
  isTyping,
  wallpaper,
  onWallpaperChange,
  showConfirmDialog,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showWallpaperPicker, setShowWallpaperPicker] = useState(false);
  const wallpaperInputRef = useRef(null);

  const presetWallpapers = [
    { id: "default", name: "Default", url: null },
    {
      id: "preset1",
      name: "Nature",
      url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    },
    {
      id: "preset2",
      name: "Ocean",
      url: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&q=80",
    },
    {
      id: "preset3",
      name: "Mountains",
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    },
    {
      id: "preset4",
      name: "Desert",
      url: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80",
    },
    {
      id: "preset5",
      name: "Forest",
      url: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80",
    },
    {
      id: "preset6",
      name: "Abstract",
      url: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800&q=80",
    },
  ];

  const oppositeProfile =
    userRole === "owner" ? room.shelterProfile : room.ownerProfile;

  const handleWallpaperChange = async (wallpaperUrl) => {
    try {
      const response = await fetch(
        `${API_URL}/api/chat/rooms/${room._id}/wallpaper`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ wallpaper: wallpaperUrl }),
        }
      );

      const data = await response.json();
      if (data.success) {
        onWallpaperChange(wallpaperUrl);
        setShowWallpaperPicker(false);
      }
    } catch (error) {
      console.error("Wallpaper change error:", error);
    }
  };

  const handleCustomWallpaperUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      showConfirmDialog({
        title: "Invalid File",
        message: "Please select a valid image file",
        type: "error",
        showCancel: false,
      });
      return;
    }

    const formData = new FormData();
    formData.append("wallpaper", file);

    try {
      const response = await fetch(
        `${API_URL}/api/chat/rooms/${room._id}/wallpaper/upload`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await response.json();
      if (data.success) {
        onWallpaperChange(data.wallpaperUrl);
        setShowWallpaperPicker(false);
      }
    } catch (error) {
      console.error("Wallpaper upload error:", error);
      showConfirmDialog({
        title: "Upload Failed",
        message: "Failed to upload wallpaper",
        type: "error",
        showCancel: false,
      });
    }
  };

  const handleBlockRoom = () => {
    showConfirmDialog({
      title: "Block Chat",
      message: "Are you sure you want to block this chat?",
      type: "warning",
      onConfirm: async () => {
        try {
          const response = await fetch(
            `${API_URL}/api/chat/rooms/${room._id}/block`,
            {
              method: "PATCH",
              credentials: "include",
            }
          );

          const data = await response.json();
          if (data.success) {
            showConfirmDialog({
              title: "Success",
              message: "Chat blocked successfully",
              type: "success",
              showCancel: false,
            });
            setShowMenu(false);
          }
        } catch (error) {
          console.error("Block room error:", error);
        }
      },
    });
  };

  const handleCloseRoom = () => {
    showConfirmDialog({
      title: "Close Chat",
      message: "Are you sure you want to close this chat?",
      type: "warning",
      onConfirm: async () => {
        try {
          const response = await fetch(
            `${API_URL}/api/chat/rooms/${room._id}/close`,
            {
              method: "PATCH",
              credentials: "include",
            }
          );

          const data = await response.json();
          if (data.success) {
            showConfirmDialog({
              title: "Success",
              message: "Chat closed successfully",
              type: "success",
              showCancel: false,
            });
            setShowMenu(false);
          }
        } catch (error) {
          console.error("Close room error:", error);
        }
      },
    });
  };

  return (
    <div className="bg-[#31323e] border-b border-white/10 p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="h-10 w-10 rounded-full bg-[#60519b]/20 flex items-center justify-center overflow-hidden ring-2 ring-transparent hover:ring-[#60519b]/50 transition-all">
            {oppositeProfile?.avatar ? (
              <img
                src={oppositeProfile.avatar}
                alt={oppositeProfile.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <User size={20} className="text-[#60519b]" />
            )}
          </div>
          {isOppositeOnline && (
            <Circle
              size={8}
              className="absolute bottom-0 right-0 text-green-500 fill-green-500"
            />
          )}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">
            {oppositeProfile?.name || "Unknown User"}
          </h3>
          <p className="text-xs text-white/60">
            {isTyping ? "typing..." : room.petId?.name || ""}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Video Call Button */}
        <button
          onClick={() => {}}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          title="Video call"
        >
          <Video size={20} className="text-white" />
        </button>

        {/* Wallpaper Button */}
        <div className="relative">
          <button
            onClick={() => setShowWallpaperPicker(!showWallpaperPicker)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="Change wallpaper"
          >
            <ImageIcon size={20} className="text-white" />
          </button>

          {showWallpaperPicker && (
            <div className="absolute right-0 top-full mt-2 bg-[#31323e] border border-white/10 rounded-lg shadow-xl z-20 w-72 p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">
                  Choose Wallpaper
                </h3>
                <button
                  onClick={() => setShowWallpaperPicker(false)}
                  className="p-1 rounded hover:bg-white/10"
                >
                  <XIcon size={16} className="text-white/60" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                {presetWallpapers.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() =>
                      handleWallpaperChange(preset.url || "default")
                    }
                    className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      wallpaper === (preset.url || "default")
                        ? "border-[#60519b]"
                        : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    {preset.url ? (
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#1e202c] flex items-center justify-center">
                        <span className="text-xs text-white/60">Default</span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                      <p className="text-xs text-white truncate">
                        {preset.name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <input
                type="file"
                ref={wallpaperInputRef}
                accept="image/*"
                onChange={handleCustomWallpaperUpload}
                className="hidden"
              />
              <button
                onClick={() => wallpaperInputRef.current?.click()}
                className="w-full bg-[#60519b] hover:bg-[#7d6ab8] text-white text-sm py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <ImageIcon size={16} />
                Upload Custom Wallpaper
              </button>
            </div>
          )}
        </div>

        {/* 3-dot Menu (Shelter only) */}
        {userRole === "shelter" && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <MoreVertical size={20} className="text-white" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-2 bg-[#31323e] border border-white/10 rounded-lg shadow-xl z-10 min-w-[160px]">
                <button
                  onClick={handleCloseRoom}
                  className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <XIcon size={16} />
                  Close Chat
                </button>
                <button
                  onClick={handleBlockRoom}
                  className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                >
                  <Ban size={16} />
                  Block Chat
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerChatHeader;
