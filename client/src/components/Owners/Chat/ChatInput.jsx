import React, { useState } from "react";
import { Send, Image as ImageIcon, Smile, X as XIcon } from "lucide-react";

const KAOMOJIS = [
  "(＾▽＾)",
  "(￣▽￣)",
  "(⌒‿⌒)",
  "(≧◡≦)",
  "(✿◕‿◕)",
  "(•‿•)",
  "(•̀ᴗ•́)و",
  "(ง •̀_•́)ง",
  "(╯°□°）╯︵ ┻━┻",
  "┬─┬ ノ( ゜-゜ノ)",
  "(ಥ﹏ಥ)",
  "(T_T)",
  "(ಥ_ಥ)",
  "(¬‿¬)",
  "(•̀⌓•́)",
  "(ʘ‿ʘ)",
  "(ಠ_ಠ)",
  "(ಠ‿ಠ)",
  "(≖‿≖)",
  "(づ｡◕‿‿◕｡)づ",
  "(っ◔◡◔)っ",
  "(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧",
];

const OwnerChatInput = ({
  messageInput,
  setMessageInput,
  sendMessage,
  handleTyping,
  handlePaste,
  showEmojiPicker,
  setShowEmojiPicker,
  insertEmoji,
  commonEmojis,
  imagePreview,
  clearImage,
  fileInputRef,
  handleImageSelect,
  imageFile,
  inputRef,
  isReadOnly,
}) => {
  const [pickerMode, setPickerMode] = useState("emoji");
  if (isReadOnly) return null;

  return (
    <div className="bg-[#31323e] border-t border-white/10 p-4 flex-shrink-0">
      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-3 relative inline-block">
          <img
            src={imagePreview}
            alt="Preview"
            className="h-20 w-20 object-cover rounded-lg border-2 border-white/10"
          />
          <button
            onClick={clearImage}
            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 rounded-full p-1 transition-all hover:scale-110 active:scale-95 shadow-lg"
          >
            <XIcon size={12} className="text-white" />
          </button>
        </div>
      )}

      {/* Input Row */}
      <div className="flex items-center gap-2">
        {/* Image Upload Button */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 rounded-lg hover:bg-white/10 transition-all text-white/60 hover:text-white"
          title="Upload image"
        >
          <ImageIcon size={20} />
        </button>

        {/* Emoji Picker */}
        <div className="relative">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2.5 rounded-lg hover:bg-white/10 transition-all text-white/60 hover:text-white"
            title="Add emoji"
          >
            <Smile size={20} />
          </button>

          {showEmojiPicker && (
            <div
              className="fixed bottom-24 left-4 bg-[#1e202c] border border-white/10 rounded-xl p-3 shadow-2xl z-50 w-72"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Tabs */}
              <div className="flex mb-2 border-b border-white/10">
                <button
                  onClick={() => setPickerMode("emoji")}
                  className={`flex-1 py-1 text-sm ${
                    pickerMode === "emoji"
                      ? "text-white border-b-2 border-[#60519b]"
                      : "text-white/50"
                  }`}
                >
                  Emoji
                </button>
                <button
                  onClick={() => setPickerMode("kaomoji")}
                  className={`flex-1 py-1 text-sm ${
                    pickerMode === "kaomoji"
                      ? "text-white border-b-2 border-[#60519b]"
                      : "text-white/50"
                  }`}
                >
                  Kaomoji
                </button>
              </div>

              {/* Content */}
              {pickerMode === "emoji" ? (
                <div className="grid grid-cols-5 gap-1">
                  {commonEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => insertEmoji(emoji)}
                      className="text-2xl hover:bg-white/10 rounded-lg p-2 transition-all hover:scale-110"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {KAOMOJIS.map((k) => (
                    <button
                      key={k}
                      onClick={() => insertEmoji(k)}
                      className="text-sm text-left bg-[#31323e] hover:bg-[#3a3b47] rounded-lg px-2 py-1 transition-all"
                    >
                      {k}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Text Input */}
        <input
          ref={inputRef}
          value={messageInput}
          onChange={handleTyping}
          onPaste={handlePaste}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 bg-[#1e202c] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#60519b]/50 focus:ring-2 focus:ring-[#60519b]/20 transition-all"
        />

        {/* Send Button */}
        <button
          onClick={sendMessage}
          disabled={!messageInput.trim() && !imageFile}
          className="bg-[#60519b] hover:bg-[#7d6ab8] p-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100"
          title="Send message"
        >
          <Send size={20} className="text-white" />
        </button>
      </div>
    </div>
  );
};

export default OwnerChatInput;
