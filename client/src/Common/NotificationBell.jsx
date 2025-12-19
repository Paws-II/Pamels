import React, { useState, useEffect, useRef } from "react";
import { Bell, Check, CheckCheck, X, Inbox } from "lucide-react";
import axios from "axios";
import { useSocket } from "../../hooks/useSocket";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const containerRef = useRef(null);
  const { on } = useSocket();

  /* ============================= DATA FETCHING ============================= */
  useEffect(() => {
    fetchNotifications();

    const unsubscribe = on("notification:new", (notification) => {
      setNotifications((prev) => {
        const updated = [notification, ...prev];
        return sortNotifications(updated).slice(0, 50); // Keep max 50 in memory
      });
      setUnreadCount((prev) => prev + 1);
    });

    return () => unsubscribe();
  }, []);

  /* ============================ CLICK OUTSIDE ============================== */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  /* ================================= API =================================== */
  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/notifications`, {
        withCredentials: true,
      });
      if (res.data.success) {
        const sorted = sortNotifications(res.data.notifications);
        setNotifications(sorted);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error("Fetch notifications failed:", err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.patch(
        `${API_URL}/api/notifications/${id}/read`,
        {},
        { withCredentials: true }
      );

      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error("Mark read failed:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch(
        `${API_URL}/api/notifications/mark-all-read`,
        {},
        { withCredentials: true }
      );

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Mark all read failed:", err);
    }
  };

  /* ================================ UTILS ================================== */
  const sortNotifications = (notifs) => {
    return [...notifs].sort((a, b) => {
      // Unread first
      if (a.read !== b.read) return a.read ? 1 : -1;
      // Then by timestamp (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  };

  const formatTime = (ts) => {
    const diff = Date.now() - new Date(ts).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return "Just now";
    if (min < 60) return `${min}m ago`;
    const hours = Math.floor(min / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getTypeColor = (type) => {
    const colors = {
      profile: "text-blue-400 bg-blue-500/10",
      security: "text-red-400 bg-red-500/10",
      avatar: "text-purple-400 bg-purple-500/10",
      general: "text-green-400 bg-green-500/10",
    };
    return colors[type] || colors.general;
  };

  /* ================================== UI =================================== */
  return (
    <div ref={containerRef} className="relative">
      {/* 🔔 BELL BUTTON */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="relative rounded-full p-2.5 transition-all duration-200 hover:bg-white/10 active:scale-95"
        aria-label="Notifications"
      >
        <Bell size={20} className="text-white/90" strokeWidth={2.5} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 px-1 text-[10px] font-bold text-white shadow-lg animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* ========================== DROPDOWN ========================== */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-3 w-[380px] max-w-[calc(100vw-2rem)] z-50 
                     animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="rounded-2xl border border-white/10 bg-[#2a2b36] shadow-2xl shadow-black/40 backdrop-blur-xl overflow-hidden">
            {/* HEADER */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#2a2b36]/95 backdrop-blur-sm px-5 py-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-lg">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-400">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-blue-400 
                             transition-all hover:bg-blue-500/10 active:scale-95"
                  >
                    <CheckCheck size={14} strokeWidth={2.5} />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 text-white/60 transition-all hover:bg-white/10 hover:text-white active:scale-95"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* BODY - Fixed Height with Internal Scroll */}
            <div className="max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6">
                  <div className="rounded-full bg-white/5 p-4 mb-4">
                    <Inbox
                      size={32}
                      className="text-white/40"
                      strokeWidth={1.5}
                    />
                  </div>
                  <p className="text-sm font-medium text-white/60">
                    All caught up!
                  </p>
                  <p className="text-xs text-white/40 mt-1">
                    No new notifications
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {notifications.map((n) => (
                    <div
                      key={n._id}
                      className={`group relative transition-all duration-200 hover:bg-white/5 
                                ${!n.read ? "bg-blue-500/5" : ""}`}
                    >
                      <div className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          {/* Type Indicator */}
                          <div
                            className={`mt-0.5 rounded-lg p-2 ${getTypeColor(
                              n.type
                            )}`}
                          >
                            <Bell size={14} strokeWidth={2.5} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="text-sm font-semibold text-white leading-tight">
                                {n.title}
                              </h4>
                              {!n.read && (
                                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse mt-1 shrink-0" />
                              )}
                            </div>

                            <p className="text-xs text-white/70 leading-relaxed mb-3">
                              {n.message}
                            </p>

                            <div className="flex items-center justify-between">
                              <span className="text-xs text-white/50 font-medium">
                                {formatTime(n.createdAt)}
                              </span>

                              {!n.read && (
                                <button
                                  onClick={() => markAsRead(n._id)}
                                  className="flex items-center gap-1.5 rounded-lg bg-blue-500/20 px-2.5 py-1 
                                           text-xs font-medium text-blue-400 transition-all 
                                           hover:bg-blue-500/30 active:scale-95 opacity-0 group-hover:opacity-100"
                                >
                                  <Check size={12} strokeWidth={2.5} />
                                  Mark read
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Unread Left Border Accent */}
                      {!n.read && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-600" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* FOOTER - Only show if there are notifications */}
            {notifications.length > 0 && (
              <div className="border-t border-white/10 bg-[#2a2b36]/95 backdrop-blur-sm px-5 py-3">
                <button className="w-full rounded-lg py-2 text-xs font-semibold text-white/70 transition-all hover:bg-white/5 hover:text-white">
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
