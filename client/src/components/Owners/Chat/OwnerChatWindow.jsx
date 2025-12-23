import React, { useState, useEffect, useRef } from "react";
import {
  MoreVertical,
  Trash2,
  ChevronDown,
  Download,
  X as XIcon,
} from "lucide-react";
import { useSocket } from "../../../../hooks/useSocket";
import OwnerChatHeader from "./ChatHeader";
import OwnerChatInput from "./ChatInput";
import ConfirmationDialog from "../../../Common/ConfirmationDialog";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const OwnerChatWindow = ({ room, userRole, currentUserId }) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const { socket, on, emit, isConnected } = useSocket();
  const [isOppositeOnline, setIsOppositeOnline] = useState(false);
  const [wallpaper, setWallpaper] = useState(room?.wallpaper || "default");
  const [showWallpaperPicker, setShowWallpaperPicker] = useState(false);
  const wallpaperInputRef = useRef(null);
  const [viewImage, setViewImage] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

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

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);
  const [messageMenu, setMessageMenu] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  useEffect(() => {
    if (!room) return;
    fetchMessages();
  }, [room]);

  useEffect(() => {
    if (!room || !isConnected) return;

    emit("chat:join", {
      roomId: room._id,
      userId: currentUserId,
    });

    emit("chat:mark:read", {
      roomId: room._id,
    });

    const unsubMessage = on("chat:message:new", (data) => {
      if (data.roomId === room._id) {
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === data.message._id);
          if (exists) return prev;
          return [...prev, data.message];
        });

        if (
          data.message.senderId?.toString() !== currentUserId?.toString() &&
          data.message.senderId?._id?.toString() !== currentUserId?.toString()
        ) {
          setTimeout(async () => {
            try {
              await fetch(
                `${API_URL}/api/chat/messages/${data.message._id}/read`,
                {
                  method: "PATCH",
                  credentials: "include",
                }
              );
            } catch (error) {
              console.error("Mark read error:", error);
            }
          }, 500);
        }
      }
    });

    const unsubTyping = on("chat:user:typing", (data) => {
      if (data.roomId === room._id && data.userId !== currentUserId) {
        setIsTyping(data.isTyping);
      }
    });

    const unsubRoomUpdate = on("chat:room:update", (data) => {
      if (data.roomId === room._id) {
        //
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
        ? room.shelterId?._id?.toString() || room.shelterId?.toString()
        : room.ownerId?._id?.toString() || room.ownerId?.toString();

    setIsOppositeOnline(false);

    const unsubOnline = on("user:online", (data) => {
      if (
        data.userId?.toString() === oppositeId &&
        data.roomId?.toString() === room._id?.toString()
      ) {
        setIsOppositeOnline(true);
      }
    });

    const unsubOffline = on("user:offline", (data) => {
      if (
        data.userId?.toString() === oppositeId &&
        data.roomId?.toString() === room._id?.toString()
      ) {
        setIsOppositeOnline(false);
      }
    });

    return () => {
      unsubOnline();
      unsubOffline();
      setIsOppositeOnline(false);
    };
  }, [room, isConnected, userRole, on]);

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
    if (!room || !isConnected) return;

    const unsubDelivered = on("chat:message:delivered", (data) => {
      if (data.roomId === room._id) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === data.messageId
              ? {
                  ...m,
                  deliveredTo: [
                    ...(m.deliveredTo || []),
                    { userId: data.userId, deliveredAt: data.deliveredAt },
                  ],
                }
              : m
          )
        );
      }
    });

    const unsubRead = on("chat:message:read", (data) => {
      if (data.roomId === room._id) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === data.messageId
              ? {
                  ...m,
                  readBy: [
                    ...(m.readBy || []),
                    { userId: data.readBy, readAt: data.readAt },
                  ],
                }
              : m
          )
        );
      }
    });

    return () => {
      unsubDelivered();
      unsubRead();
    };
  }, [room, isConnected, on]);

  useEffect(() => {
    if (!room || !isConnected || messages.length === 0) return;

    const undeliveredMessages = messages.filter(
      (msg) =>
        msg.senderId?.toString() !== currentUserId?.toString() &&
        msg.senderId?._id?.toString() !== currentUserId?.toString() &&
        (!msg.deliveredTo ||
          !msg.deliveredTo.some(
            (d) => d.userId?.toString() === currentUserId?.toString()
          ))
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
  }, [messages, room, currentUserId, isConnected]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;
      setShowScrollButton(!isNearBottom);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

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
    setDeleteConfirmation({
      type: "danger",
      title: "Block Chat",
      message: "Are you sure you want to block this chat?",
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
            setShowMenu(false);
          }
        } catch (error) {
          console.error("Block room error:", error);
        }
      },
    });
  };

  const handleCloseRoom = async () => {
    setDeleteConfirmation({
      type: "warning",
      title: "Close Chat",
      message: "Are you sure you want to close this chat?",
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
            setShowMenu(false);
          }
        } catch (error) {
          console.error("Close room error:", error);
        }
      },
    });
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

  const handleDeleteMessage = async (messageId, deleteForEveryone) => {
    try {
      const response = await fetch(
        `${API_URL}/api/chat/messages/${messageId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ deleteForEveryone }),
        }
      );

      const data = await response.json();
      if (data.success) {
        if (deleteForEveryone) {
          setMessages((prev) =>
            prev.map((m) =>
              m._id === messageId
                ? {
                    ...m,
                    deletedForEveryone: true,
                    content: "This message was deleted",
                  }
                : m
            )
          );
        } else {
          setMessages((prev) => prev.filter((m) => m._id !== messageId));
        }
        setMessageMenu(null);
      }
    } catch (error) {
      console.error("Delete message error:", error);
    }
  };

  const openDeleteConfirmation = (messageId, deleteForEveryone) => {
    setDeleteConfirmation({
      type: "danger",
      title: deleteForEveryone ? "Delete for Everyone" : "Delete for Me",
      message: deleteForEveryone
        ? "This message will be deleted for all participants. This action cannot be undone."
        : "This message will only be deleted from your view.",
      onConfirm: () => handleDeleteMessage(messageId, deleteForEveryone),
    });
    setMessageMenu(null);
  };

  const handleImageDownload = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = "chat-image.jpg";
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Image download failed:", error);
    }
  };

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
        setWallpaper(wallpaperUrl);
        setShowWallpaperPicker(false);
      }
    } catch (error) {
      console.error("Wallpaper change error:", error);
    }
  };

  const handleCustomWallpaperUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
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
        setWallpaper(data.wallpaperUrl);
        setShowWallpaperPicker(false);
      }
    } catch (error) {
      console.error("Wallpaper upload error:", error);
    }
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
    <div className="flex-1 flex flex-col min-h-0 bg-[#1e202c] relative">
      <OwnerChatHeader
        room={room}
        userRole={userRole}
        oppositeProfile={oppositeProfile}
        isOppositeOnline={isOppositeOnline}
        isTyping={isTyping}
        showMenu={showMenu}
        setShowMenu={setShowMenu}
        handleCloseRoom={handleCloseRoom}
        handleBlockRoom={handleBlockRoom}
        wallpaper={wallpaper}
        showWallpaperPicker={showWallpaperPicker}
        setShowWallpaperPicker={setShowWallpaperPicker}
        presetWallpapers={presetWallpapers}
        handleWallpaperChange={handleWallpaperChange}
        wallpaperInputRef={wallpaperInputRef}
        handleCustomWallpaperUpload={handleCustomWallpaperUpload}
      />

      <div
        ref={messagesContainerRef}
        className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 relative"
        style={{
          backgroundImage:
            wallpaper === "default" ? "none" : `url(${wallpaper})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundAttachment: "scroll",
          backgroundColor: "#1e202c",
        }}
      >
        {messages.map((message, idx) => {
          const isOwn =
            message.senderId?.toString?.() === currentUserId?.toString?.();

          const showDate =
            idx === 0 ||
            new Date(messages[idx - 1].createdAt).toDateString() !==
              new Date(message.createdAt).toDateString();

          return (
            <div key={message._id}>
              {showDate && (
                <div className="flex justify-center my-4">
                  <div className="bg-[#31323e]/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white/60 shadow-lg">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </div>
                </div>
              )}

              {message.messageType === "system" ? (
                <div className="flex justify-center">
                  <div className="bg-[#31323e]/90 backdrop-blur-sm rounded-lg px-4 py-2 text-xs text-white/60 shadow-lg">
                    {message.content}
                  </div>
                </div>
              ) : (
                <div
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div className="relative group max-w-[70%]">
                    <div
                      className={`rounded-2xl px-4 py-2 shadow-lg ${
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

                      {message.messageType === "image" &&
                        message.images &&
                        message.images.length > 0 && (
                          <div className="relative group mb-2">
                            <img
                              src={message.images[0]}
                              alt="Shared"
                              className="rounded-lg max-w-xs cursor-pointer transition-transform hover:scale-105"
                              onClick={() => setViewImage(message.images[0])}
                            />

                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 rounded-lg">
                              <button
                                onClick={() => setViewImage(message.images[0])}
                                className="bg-white/90 hover:bg-white text-black text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:scale-105"
                              >
                                View
                              </button>

                              <button
                                onClick={() =>
                                  handleImageDownload(message.images[0])
                                }
                                className="bg-white/90 hover:bg-white text-black text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:scale-105 flex items-center gap-1"
                              >
                                <Download size={12} />
                                Download
                              </button>
                            </div>
                          </div>
                        )}

                      {message.content && (
                        <p className="text-sm break-words leading-relaxed">
                          {message.content}
                        </p>
                      )}

                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-xs opacity-70">
                          {formatTime(message.createdAt)}
                        </span>

                        {isOwn && (
                          <span className="text-xs">
                            {message.readBy?.length > 0 ? (
                              <span className="text-blue-400">✓✓</span>
                            ) : message.deliveredTo?.length > 0 ? (
                              <span className="text-white/60">✓✓</span>
                            ) : (
                              <span className="text-white/40">✓</span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    {isOwn && (
                      <div className="absolute top-2 -left-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() =>
                            setMessageMenu(
                              messageMenu === message._id ? null : message._id
                            )
                          }
                          className="p-1.5 rounded-full
                          bg-black/40 backdrop-blur-sm border border-white/20 shadow-md
                        hover:bg-black/60 transition-all "
                        >
                          <MoreVertical size={16} className="text-white" />
                        </button>

                        {messageMenu === message._id && (
                          <div className="absolute right-0 top-full mt-1 bg-[#31323e] border border-white/10 rounded-lg shadow-xl z-10 min-w-[180px] overflow-hidden">
                            <button
                              onClick={() =>
                                openDeleteConfirmation(message._id, false)
                              }
                              className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2 transition-all"
                            >
                              <Trash2 size={14} />
                              Delete for me
                            </button>

                            <button
                              onClick={() =>
                                openDeleteConfirmation(message._id, true)
                              }
                              className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-all"
                            >
                              <Trash2 size={14} />
                              Delete for everyone
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 right-6 p-3 rounded-full bg-[#60519b] hover:bg-[#7d6ab8] text-white shadow-lg transition-all hover:scale-110 active:scale-95 z-10"
        >
          <ChevronDown size={20} />
        </button>
      )}

      <OwnerChatInput
        messageInput={messageInput}
        setMessageInput={setMessageInput}
        sendMessage={sendMessage}
        handleTyping={handleTyping}
        handlePaste={handlePaste}
        showEmojiPicker={showEmojiPicker}
        setShowEmojiPicker={setShowEmojiPicker}
        insertEmoji={insertEmoji}
        commonEmojis={commonEmojis}
        imagePreview={imagePreview}
        clearImage={clearImage}
        fileInputRef={fileInputRef}
        handleImageSelect={handleImageSelect}
        imageFile={imageFile}
        inputRef={inputRef}
        isReadOnly={isReadOnly}
      />

      {viewImage && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setViewImage(null)}
        >
          <button
            onClick={() => setViewImage(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <XIcon size={24} />
          </button>
          <img
            src={viewImage}
            alt="Full size"
            className="max-w-full max-h-full rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {deleteConfirmation && (
        <ConfirmationDialog
          isOpen={true}
          onClose={() => setDeleteConfirmation(null)}
          onConfirm={deleteConfirmation.onConfirm}
          title={deleteConfirmation.title}
          message={deleteConfirmation.message}
          type={deleteConfirmation.type}
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}
    </div>
  );
};

export default OwnerChatWindow;
