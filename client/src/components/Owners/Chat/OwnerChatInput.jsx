import React, { useState, useRef } from "react";
import { Send, Image as ImageIcon, Smile, X as XIcon } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const OwnerChatInput = ({ room, onMessageSent, onTyping, isReadOnly }) => {
  const [messageInput, setMessageInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeout = useRef(null);

  const commonEmojis = [
    "😀",
    "😂",
    "❤️",
    "👍",
    "🙏",
    "😊",
    "🎉",
    "🔥",
    "✨",
    "👏",
    "😍",
    "🥰",
    "😘",
    "😎",
    "🤗",
    "🤔",
    "😢",
    "😭",
    "😡",
    "💪",
    "👌",
    "🙌",
    "🎊",
    "🌟",
    "💯",
    "🎯",
    "🏆",
    "🎁",
    "🌈",
    "⭐",
  ];

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        setImageFile(blob);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(blob);
        e.preventDefault();
      }
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const insertEmoji = (emoji) => {
    setMessageInput((prev) => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleTyping = (e) => {
    const value = e.target.value;
    setMessageInput(value);

    onTyping(true);

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      onTyping(false);
    }, 800);
  };

  const sendMessage = async () => {
    if (!messageInput.trim() && !imageFile) return;

    const formData = new FormData();

    if (imageFile) {
      formData.append("image", imageFile);
      formData.append("messageType", "image");
      if (messageInput.trim()) {
        formData.append("content", messageInput.trim());
      }
    } else {
      formData.append("content", messageInput);
      formData.append("messageType", "text");
    }

    setMessageInput("");
    clearImage();

    try {
      const response = await fetch(
        `${API_URL}/api/chat/rooms/${room._id}/messages`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await response.json();
      if (data.success) {
        onMessageSent(data.data);
      }
    } catch (error) {
      console.error("Send message error:", error);
    }
  };

  if (isReadOnly) {
    return null;
  }

  return (
    <div className="bg-[#31323e] border-t border-white/10 p-4">
      {imagePreview && (
        <div className="mb-3 relative inline-block">
          <img
            src={imagePreview}
            alt="Preview"
            className="h-20 w-20 object-cover rounded-lg ring-2 ring-[#60519b]/30"
          />
          <button
            onClick={clearImage}
            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 rounded-full p-1 transition-colors"
          >
            <XIcon size={12} className="text-white" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          title="Upload image"
        >
          <ImageIcon size={20} className="text-white/60 hover:text-white" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="Add emoji"
          >
            <Smile size={20} className="text-white/60 hover:text-white" />
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-full mb-2 left-0 bg-[#1e202c] border border-white/10 rounded-lg p-3 shadow-xl max-h-64 overflow-y-auto">
              <div className="grid grid-cols-5 gap-2">
                {commonEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => insertEmoji(emoji)}
                    className="text-2xl hover:bg-white/10 rounded p-2 transition-all hover:scale-110"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          placeholder="Type a message..."
          value={messageInput}
          onChange={handleTyping}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          onPaste={handlePaste}
          className="flex-1 bg-[#1e202c] border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#60519b]/50 transition-colors"
        />

        <button
          onClick={sendMessage}
          disabled={!messageInput.trim() && !imageFile}
          className="bg-[#60519b] hover:bg-[#7d6ab8] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg p-2 transition-all hover:scale-105 active:scale-95"
        >
          <Send size={20} className="text-white" />
        </button>
      </div>
    </div>
  );
};

export default OwnerChatInput;
