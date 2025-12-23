import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  User,
  Circle,
  MoreVertical,
  Ban,
  X as XIcon,
  Image as ImageIcon,
  Smile,
} from "lucide-react";
import { useSocket } from "../../../hooks/useSocket";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const ChatWindow = ({ room, userRole, currentUserId, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { socket, on, emit, isConnected } = useSocket();
  const [isOppositeOnline, setIsOppositeOnline] = useState(false);
  const [wallpaper, setWallpaper] = useState(room?.wallpaper || "default");

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    console.group("👤 CURRENT LOGIN USER (ChatWindow)");

    console.log("currentUserId:", currentUserId, typeof currentUserId);
    console.log("userRole:", userRole);

    console.log("room.ownerId:", room?.ownerId?.toString());
    console.log("room.shelterId:", room?.shelterId?.toString());

    console.log(
      "Is Owner?",
      currentUserId?.toString() === room?.ownerId?.toString()
    );

    console.log(
      "Is Shelter?",
      currentUserId?.toString() === room?.shelterId?.toString()
    );

    console.log("Socket connected:", isConnected);
    console.log("Socket id:", socket?.id);

    console.groupEnd();
  }, []);

  useEffect(() => {
    if (!room) return;
    fetchMessages();
  }, [room]);

  useEffect(() => {
    if (!room || !isConnected) return;

    emit("chat:join", { roomId: room._id });

    const unsubMessage = on("chat:message:new", (data) => {
      console.group("📥 SOCKET MESSAGE RECEIVED");
      console.log("Room ID (from socket):", data.roomId, typeof data.roomId);
      console.log("Current Room ID:", room._id, typeof room._id);

      console.log("Message Object:", data.message);
      console.log("Message _id:", data.message?._id, typeof data.message?._id);

      console.log(
        "Sender ID (raw):",
        data.message?.senderId,
        typeof data.message?.senderId
      );

      console.log(
        "Sender ID._id:",
        data.message?.senderId?._id,
        typeof data.message?.senderId?._id
      );

      console.log("Current User ID:", currentUserId, typeof currentUserId);

      console.log(
        "Sender === CurrentUser ?",
        data.message?.senderId?.toString?.() === currentUserId?.toString?.()
      );

      console.groupEnd();
      if (data.roomId === room._id) {
        setMessages((prev) => {
          // Avoid duplicates
          const exists = prev.some((m) => m._id === data.message._id);
          if (exists) return prev;
          return [...prev, data.message];
        });
      }
    });

    const unsubTyping = on("chat:user:typing", (data) => {
      if (data.roomId === room._id && data.userId !== currentUserId) {
        setIsTyping(data.isTyping);
      }
    });

    const unsubRoomUpdate = on("chat:room:update", (data) => {
      if (data.roomId === room._id) {
        // Room metadata updated
      }
    });

    return () => {
      emit("chat:leave", { roomId: room._id });
      unsubMessage();
      unsubTyping();
      unsubRoomUpdate();
    };
  }, [room, isConnected, currentUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!room || !isConnected) return;

    const oppositeId =
      userRole === "owner"
        ? room.shelterId.toString()
        : room.ownerId.toString();

    const unsubOnline = on("user:online", (data) => {
      if (data.userId === oppositeId && data.roomId === room._id) {
        setIsOppositeOnline(true);
      }
    });

    const unsubOffline = on("user:offline", (data) => {
      if (data.userId === oppositeId && data.roomId === room._id) {
        setIsOppositeOnline(false);
      }
    });

    return () => {
      unsubOnline();
      unsubOffline();
    };
  }, [room, isConnected, userRole]);

  useEffect(() => {
    if (!room || !isConnected) return;

    const unsubWallpaper = on("chat:wallpaper:changed", (data) => {
      if (data.roomId === room._id) {
        setWallpaper(data.wallpaper);
      }
    });

    return () => {
      unsubWallpaper();
    };
  }, [room, isConnected]);
  useEffect(() => {
    if (!room || !isConnected || messages.length === 0) return;

    // Mark received messages as delivered
    const undeliveredMessages = messages.filter(
      (msg) =>
        msg.senderId !== currentUserId &&
        (!msg.deliveredTo ||
          !msg.deliveredTo.some((d) => d.userId === currentUserId))
    );

    undeliveredMessages.forEach(async (msg) => {
      try {
        await fetch(`${API_URL}/api/chat/messages/${msg._id}/delivered`, {
          method: "PATCH",
          credentials: "include",
        });
      } catch (error) {
        console.error("Mark delivered error:", error);
      }
    });

    const unsubDelivered = on("chat:message:delivered", (data) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === data.messageId
            ? {
                ...m,
                deliveredTo: [
                  ...(m.deliveredTo || []),
                  { userId: data.userId, deliveredAt: new Date() },
                ],
              }
            : m
        )
      );
    });

    const unsubRead = on("chat:read", (data) => {
      if (data.roomId === room._id) {
        setMessages((prev) =>
          prev.map((m) => ({
            ...m,
            readBy:
              m.senderId === currentUserId
                ? [{ userId: data.readBy }]
                : m.readBy,
          }))
        );
      }
    });

    return () => {
      unsubDelivered();
      unsubRead();
    };
  }, [room, messages, currentUserId, isConnected]);
  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/chat/rooms/${room._id}/messages`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();
      if (data.success) {
        console.group("📦 FETCHED MESSAGES");
        data.data.messages.forEach((msg, i) => {
          console.log(`Message #${i}`);
          console.log("Message ID:", msg._id);
          console.log("Sender ID:", msg.senderId);
          console.log("Sender ID type:", typeof msg.senderId);
          console.log("Sender ID._id:", msg.senderId?._id);
          console.log(
            "Is Own Message?",
            msg.senderId?.toString?.() === currentUserId?.toString?.()
          );
          console.log("-----");
        });
        console.groupEnd();
        setMessages(data.data.messages);
      }
    } catch (error) {
      console.error("Fetch messages error:", error);
    } finally {
      setLoading(false);
    }
  };

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
  ];

  const insertEmoji = (emoji) => {
    setMessageInput((prev) => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const sendMessage = async () => {
    if (!messageInput.trim() && !imageFile) return;

    console.group("📤 SEND MESSAGE CLICKED");

    console.log("Room ID:", room._id, typeof room._id);
    console.log("Current User ID:", currentUserId, typeof currentUserId);
    console.log("User Role:", userRole);

    console.log("Message Text:", messageInput);
    console.log("Has Image:", !!imageFile);

    console.groupEnd();

    const formData = new FormData();

    if (imageFile) {
      formData.append("image", imageFile);
      formData.append("messageType", "image");
      formData.append("content", messageInput.trim());
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
        console.group("✅ MESSAGE SENT - API RESPONSE");

        console.log("Returned Message:", data.data);
        console.log("Message ID:", data.data._id);

        console.log(
          "Sender ID:",
          data.data.senderId,
          typeof data.data.senderId
        );

        console.log(
          "Sender ID._id:",
          data.data.senderId?._id,
          typeof data.data.senderId?._id
        );

        console.log("Current User ID:", currentUserId, typeof currentUserId);

        console.log(
          "Is Own Message?",
          data.data.senderId?.toString?.() === currentUserId?.toString?.()
        );

        console.groupEnd();

        setMessages((prev) => [...prev, data.data]);
      }
    } catch (error) {
      console.error("Send message error:", error);
    }
  };

  const typingTimeout = useRef(null);

  const handleTyping = (e) => {
    const value = e.target.value;
    setMessageInput(value);

    if (!isConnected) return;

    emit("chat:typing", { roomId: room._id, isTyping: true });

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      emit("chat:typing", { roomId: room._id, isTyping: false });
    }, 800);
  };

  const handleBlockRoom = async () => {
    if (!confirm("Are you sure you want to block this chat?")) return;

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
        alert("Chat blocked successfully");
        setShowMenu(false);
      }
    } catch (error) {
      console.error("Block room error:", error);
    }
  };

  const handleCloseRoom = async () => {
    if (!confirm("Are you sure you want to close this chat?")) return;

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
        alert("Chat closed successfully");
        setShowMenu(false);
      }
    } catch (error) {
      console.error("Close room error:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const oppositeProfile =
    userRole === "owner" ? room.shelterProfile : room.ownerProfile;

  const isReadOnly = room.status === "blocked" || room.status === "closed";

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-white/60">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#1e202c]">
      {/* Header */}
      <div className="bg-[#31323e] border-b border-white/10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-[#60519b]/20 flex items-center justify-center overflow-hidden">
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

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{
          backgroundImage:
            wallpaper === "default" ? "none" : `url(${wallpaper})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {messages.map((message, idx) => {
          console.group("🧱 RENDER MESSAGE");

          console.log("Message ID:", message._id);
          console.log("Sender ID (raw):", message.senderId);
          console.log("Sender ID type:", typeof message.senderId);

          console.log("Sender ID._id:", message.senderId?._id);
          console.log("Current User ID:", currentUserId);

          console.log(
            "String Compare (sender vs current):",
            message.senderId?.toString?.(),
            currentUserId?.toString?.()
          );

          console.log(
            "isOwn:",
            message.senderId?.toString?.() === currentUserId?.toString?.() ||
              message.senderId?._id?.toString?.() ===
                currentUserId?.toString?.()
          );

          console.groupEnd();

          const isOwn =
            message.senderId?.toString() === currentUserId?.toString() ||
            message.senderId?._id?.toString() === currentUserId?.toString();

          const showDate =
            idx === 0 ||
            new Date(messages[idx - 1].createdAt).toDateString() !==
              new Date(message.createdAt).toDateString();

          return (
            <div key={message._id}>
              {showDate && (
                <div className="flex justify-center my-4">
                  <div className="bg-[#31323e] rounded-full px-3 py-1 text-xs text-white/60">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </div>
                </div>
              )}

              {message.messageType === "system" ? (
                <div className="flex justify-center">
                  <div className="bg-[#31323e] rounded-lg px-4 py-2 text-xs text-white/60">
                    {message.content}
                  </div>
                </div>
              ) : (
                <div
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      isOwn
                        ? "bg-[#60519b] text-white"
                        : "bg-[#31323e] text-white"
                    }`}
                  >
                    {message.replyTo && (
                      <div className="mb-2 p-2 bg-black/20 rounded text-xs border-l-2 border-white/20">
                        {message.replyTo.content}
                      </div>
                    )}

                    {/* IMAGE MESSAGE */}
                    {message.messageType === "image" &&
                      message.images &&
                      message.images.length > 0 && (
                        <img
                          src={message.images[0]}
                          alt="Shared image"
                          className="rounded-lg mb-2 max-w-xs"
                        />
                      )}

                    {/* TEXT MESSAGE */}
                    {message.content && (
                      <p className="text-sm break-words">{message.content}</p>
                    )}

                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-xs opacity-70">
                        {formatTime(message.createdAt)}
                      </span>
                      {isOwn && (
                        <span className="text-xs">
                          {message.readBy && message.readBy.length > 0 ? (
                            <span className="text-blue-400">✓✓</span>
                          ) : message.deliveredTo &&
                            message.deliveredTo.length > 0 ? (
                            <span className="text-white/60">✓✓</span>
                          ) : (
                            <span className="text-white/40">✓</span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Status Messages */}
      {room.status === "blocked" && (
        <div className="bg-red-500/10 border-t border-red-500/20 p-3 text-center">
          <p className="text-sm text-red-400">
            This chat has been blocked. No messages can be sent.
          </p>
        </div>
      )}

      {room.status === "closed" && (
        <div className="bg-yellow-500/10 border-t border-yellow-500/20 p-3 text-center">
          <p className="text-sm text-yellow-400">
            This chat has been closed. No messages can be sent.
          </p>
        </div>
      )}

      {/* Input */}
      {!isReadOnly && (
        <div className="bg-[#31323e] border-t border-white/10 p-4">
          {imagePreview && (
            <div className="mb-3 relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="h-20 w-20 object-cover rounded-lg"
              />
              <button
                onClick={clearImage}
                className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
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
            >
              <ImageIcon size={20} className="text-white/60" />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Smile size={20} className="text-white/60" />
              </button>

              {showEmojiPicker && (
                <div className="absolute bottom-full mb-2 left-0 bg-[#1e202c] border border-white/10 rounded-lg p-2 shadow-xl">
                  <div className="grid grid-cols-5 gap-1">
                    {commonEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => insertEmoji(emoji)}
                        className="text-2xl hover:bg-white/10 rounded p-1 transition-colors"
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
              className="flex-1 bg-[#1e202c] border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/20"
            />

            <button
              onClick={sendMessage}
              disabled={!messageInput.trim() && !imageFile}
              className="bg-[#60519b] hover:bg-[#7d6ab8] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg p-2 transition-colors"
            >
              <Send size={20} className="text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
