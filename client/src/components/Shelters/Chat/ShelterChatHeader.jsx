import React from "react";
import {
  User,
  Circle,
  MoreVertical,
  Ban,
  X as XIcon,
  Image as ImageIcon,
  Video,
} from "lucide-react";

const ShelterChatHeader = ({
  room,
  userRole,
  oppositeProfile,
  isOppositeOnline,
  isTyping,
  showMenu,
  setShowMenu,
  handleCloseRoom,
  handleBlockRoom,
  wallpaper,
  showWallpaperPicker,
  setShowWallpaperPicker,
  presetWallpapers,
  handleWallpaperChange,
  wallpaperInputRef,
  handleCustomWallpaperUpload,
}) => {
  return (
    <div className="bg-[#31323e] border-b border-white/10 p-4 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="h-10 w-10 rounded-full bg-[#4a5568]/20 flex items-center justify-center overflow-hidden transition-all hover:ring-2 hover:ring-[#4a5568]/50">
            {oppositeProfile?.avatar ? (
              <img
                src={oppositeProfile.avatar}
                alt={oppositeProfile.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <User size={20} className="text-[#4a5568]" />
            )}
          </div>

          {isOppositeOnline && (
            <Circle
              size={8}
              className="absolute bottom-0 right-0 text-green-500 fill-green-500 animate-pulse"
            />
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">
            {oppositeProfile?.name || "Unknown User"}
          </h3>
          <p className="text-xs text-white/60">
            {isTyping ? (
              <span className="italic text-[#4a5568]">typing...</span>
            ) : (
              room?.petId?.name || ""
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {userRole === "shelter" && (
          <>
            <button
              onClick={handleCloseRoom}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20
                 text-white text-sm flex items-center gap-1.5
                 transition-all active:scale-95"
              title="Close Chat"
            >
              <XIcon size={16} />
              Close
            </button>

            <button
              onClick={handleBlockRoom}
              className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30
                 text-red-400 text-sm flex items-center gap-1.5
                 transition-all active:scale-95"
              title="Block Chat"
            >
              <Ban size={16} />
              Block
            </button>
          </>
        )}

        <button
          onClick={() => {}}
          className="p-2 rounded-lg hover:bg-white/10 transition-all text-white/80 hover:text-white"
          title="Video call (Coming soon)"
        >
          <Video size={20} />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowWallpaperPicker(!showWallpaperPicker)}
            className="p-2 rounded-lg hover:bg-white/10 transition-all text-white/80 hover:text-white"
            title="Change wallpaper"
          >
            <ImageIcon size={20} />
          </button>

          {showWallpaperPicker && (
            <div className="absolute right-0 top-full mt-2 bg-[#31323e] border border-white/10 rounded-xl shadow-2xl z-20 w-80 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-white">
                  Choose Wallpaper
                </h3>
                <button
                  onClick={() => setShowWallpaperPicker(false)}
                  className="p-1 hover:bg-white/10 rounded transition-all text-white/60 hover:text-white"
                >
                  <XIcon size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                {presetWallpapers.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() =>
                      handleWallpaperChange(preset.url || "default")
                    }
                    className={`h-20 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                      wallpaper === (preset.url || "default")
                        ? "border-[#4a5568] ring-2 ring-[#4a5568]/30"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    {preset.url ? (
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="h-full bg-[#1e202c] flex items-center justify-center text-xs text-white/60">
                        Default
                      </div>
                    )}
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
                className="w-full bg-[#4a5568] hover:bg-[#5a6678] py-2.5 rounded-lg text-white text-sm font-medium transition-all hover:scale-105 active:scale-95"
              >
                Upload Custom Wallpaper
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShelterChatHeader;
