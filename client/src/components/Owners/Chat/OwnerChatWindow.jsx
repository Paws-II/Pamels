import React, { useState, useEffect, useRef } from "react";
import { MoreVertical, Trash2, ArrowDown, X as XIcon } from "lucide-react";
import { useSocket } from "../../../../hooks/useSocket";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const OwnerChatWindow = ({
  room,
  userRole,
  currentUserId,
  wallpaper,
  showConfirmDialog,
}) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageMenu, setMessageMenu] = useState(null);
  const [viewImage, setViewImage] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const { socket, on, isConnected } = useSocket();

  useEffect(() => {
    if (!room) return;
    fetchMessages();
  }, [room]);

  useEffect(() => {
    if (!room || !isConnected) return;

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

    const unsubRoomUpdate = on("chat:room:update", (data) => {
      if (data.roomId === room._id) {
        // Room metadata updated
      }
    });

    return () => {
      unsubMessage();
      unsubRoomUpdate();
    };
  }, [room, isConnected, currentUserId, on]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const handleDeleteMessage = (messageId, deleteForEveryone) => {
    showConfirmDialog({
      title: deleteForEveryone ? "Delete for Everyone" : "Delete for Me",
      message: deleteForEveryone
        ? "This message will be deleted for everyone in the chat."
        : "This message will be deleted only for you.",
      type: "warning",
      onConfirm: async () => {
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
      },
    });
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
      showConfirmDialog({
        title: "Download Failed",
        message: "Failed to download image",
        type: "error",
        showCancel: false,
      });
    }
  };

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } =
      messagesContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-white/60">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#1e202c] relative">
      {/* Messages Container - Scrollable */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{
          backgroundImage:
            wallpaper === "default" ? "none" : `url(${wallpaper})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
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
                  <div className="bg-[#31323e]/90 rounded-full px-3 py-1 text-xs text-white/60 backdrop-blur-sm">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </div>
                </div>
              )}

              {message.messageType === "system" ? (
                <div className="flex justify-center">
                  <div className="bg-[#31323e]/90 rounded-lg px-4 py-2 text-xs text-white/60 backdrop-blur-sm">
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
                          : "bg-[#31323e]/90 text-white backdrop-blur-sm"
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
                          <div className="relative group/img mb-2">
                            <img
                              src={message.images[0]}
                              alt="Shared image"
                              className="rounded-lg max-w-xs cursor-pointer"
                              onClick={() => setViewImage(message.images[0])}
                            />

                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-3 rounded-lg">
                              <button
                                onClick={() => setViewImage(message.images[0])}
                                className="bg-white/90 text-black text-xs px-3 py-1 rounded hover:bg-white transition-colors"
                              >
                                View
                              </button>

                              <button
                                onClick={() =>
                                  handleImageDownload(message.images[0])
                                }
                                className="bg-white/90 text-black text-xs px-3 py-1 rounded hover:bg-white transition-colors"
                              >
                                Download
                              </button>
                            </div>
                          </div>
                        )}

                      {message.content && (
                        <p className="text-sm break-words">{message.content}</p>
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
                      <div className="absolute top-2 -left-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() =>
                            setMessageMenu(
                              messageMenu === message._id ? null : message._id
                            )
                          }
                          className="p-1 rounded hover:bg-white/10"
                        >
                          <MoreVertical size={16} className="text-white/60" />
                        </button>

                        {messageMenu === message._id && (
                          <div className="absolute right-0 top-full mt-1 bg-[#31323e] border border-white/10 rounded-lg shadow-xl z-10 min-w-[150px]">
                            <button
                              onClick={() =>
                                handleDeleteMessage(message._id, false)
                              }
                              className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2 transition-colors"
                            >
                              <Trash2 size={14} />
                              Delete for me
                            </button>

                            <button
                              onClick={() =>
                                handleDeleteMessage(message._id, true)
                              }
                              className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
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

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <button
          onClick={() => scrollToBottom(true)}
          className="absolute bottom-4 right-4 bg-[#60519b] hover:bg-[#7d6ab8] text-white rounded-full p-3 shadow-lg transition-all hover:scale-110 z-10"
        >
          <ArrowDown size={20} />
        </button>
      )}

      {/* Image Viewer Modal */}
      {viewImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
          onClick={() => setViewImage(null)}
        >
          <div className="relative max-w-[90%] max-h-[90%]">
            <img
              src={viewImage}
              alt="Full view"
              className="max-w-full max-h-full rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            <button
              onClick={() => setViewImage(null)}
              className="absolute -top-4 -right-4 bg-white text-black rounded-full p-2 shadow-lg hover:bg-gray-200 transition-colors"
            >
              <XIcon size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerChatWindow;
