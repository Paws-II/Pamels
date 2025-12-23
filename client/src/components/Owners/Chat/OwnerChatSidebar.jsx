import React, { useState, useEffect } from "react";
import { Search, User, Circle, Menu, X, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const OwnerChatSidebar = ({ onSelectRoom, selectedRoomId, userRole }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/chat/rooms`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setRooms(response.data.data);
      }
    } catch (error) {
      console.error("Fetch rooms error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = rooms.filter((room) => {
    const oppositeProfile =
      userRole === "owner" ? room.shelterProfile : room.ownerProfile;
    const petName = room.petId?.name || "";
    const oppositeName = oppositeProfile?.name || "";

    return (
      petName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      oppositeName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const handleRoomSelect = (room) => {
    onSelectRoom(room);
    setIsMobileOpen(false);
  };

  if (loading) {
    return (
      <>
        {/* Mobile Toggle */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="lg:hidden fixed top-20 left-4 z-50 p-3 rounded-full bg-[#60519b] text-white shadow-lg"
        >
          <Menu size={20} />
        </button>

        {/* Loading State */}
        <div
          className={`${
            isCollapsed ? "w-20" : "w-80"
          } border-r border-white/10 bg-[#31323e] flex items-center justify-center transition-all duration-300 hidden lg:flex`}
        >
          <div className="text-white/60">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 p-3 rounded-full bg-[#60519b] text-white shadow-lg hover:bg-[#7d6ab8] transition-all"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          ${isCollapsed ? "w-20" : "w-80"}
          border-r border-white/10 bg-[#31323e] flex flex-col transition-all duration-300
          fixed lg:relative inset-y-0 left-0 z-40
          ${
            isMobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex-shrink-0">
          {/* Back to Dashboard */}
          <button
            onClick={() => navigate("/owner-dashboard")}
            className="flex items-center gap-2 mb-3 text-white/70 hover:text-white transition-all"
          >
            <ArrowLeft size={18} />
            {!isCollapsed && <span className="text-sm">Back to Dashboard</span>}
          </button>

          <div className="flex items-center justify-between mb-3">
            {!isCollapsed && (
              <h2 className="text-xl font-bold text-white">Chats</h2>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:block p-2 rounded-lg hover:bg-white/10 text-white"
              >
                {isCollapsed ? <Menu size={18} /> : <X size={18} />}
              </button>

              <button
                onClick={() => setIsMobileOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-white"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {!isCollapsed && (
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
              />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1e202c] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white"
              />
            </div>
          )}
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/40 text-sm p-4">
              {isCollapsed ? (
                <User size={32} className="mb-2" />
              ) : (
                <>
                  <User size={48} className="mb-2" />
                  <p>No chats yet</p>
                </>
              )}
            </div>
          ) : (
            filteredRooms.map((room) => {
              const oppositeProfile =
                userRole === "owner" ? room.shelterProfile : room.ownerProfile;
              const isSelected = selectedRoomId === room._id;
              const hasUnread = room.unreadCount > 0;

              return (
                <div
                  key={room._id}
                  onClick={() => handleRoomSelect(room)}
                  className={`
                    p-4 border-b border-white/5 cursor-pointer transition-all duration-200
                    ${
                      isSelected
                        ? "bg-[#60519b]/20 border-l-4 border-l-[#60519b]"
                        : "hover:bg-[#1e202c]/50 hover:border-l-4 hover:border-l-[#60519b]/50"
                    }
                    ${isCollapsed ? "flex justify-center" : ""}
                  `}
                >
                  {isCollapsed ? (
                    <div className="relative">
                      <div className="h-12 w-12 rounded-full bg-[#60519b]/20 flex items-center justify-center overflow-hidden">
                        {room.petId?.coverImage || room.petId?.images?.[0] ? (
                          <img
                            src={room.petId.coverImage || room.petId.images[0]}
                            alt={room.petId.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl">🐾</span>
                        )}
                      </div>
                      {hasUnread && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {room.unreadCount > 9 ? "9+" : room.unreadCount}
                        </span>
                      )}
                      {room.status === "ongoing" && (
                        <Circle
                          size={10}
                          className="absolute bottom-0 right-0 text-green-500 fill-green-500"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-[#60519b]/20 flex items-center justify-center overflow-hidden">
                          {room.petId?.coverImage || room.petId?.images?.[0] ? (
                            <img
                              src={
                                room.petId.coverImage || room.petId.images[0]
                              }
                              alt={room.petId.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl">🐾</span>
                          )}
                        </div>
                        {room.status === "ongoing" && (
                          <Circle
                            size={10}
                            className="absolute bottom-0 right-0 text-green-500 fill-green-500"
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-semibold text-white truncate">
                            {room.petId?.name || "Unknown Pet"}
                          </h3>
                          {room.lastMessage?.timestamp && (
                            <span className="text-xs text-white/40 flex-shrink-0 ml-2">
                              {formatTime(room.lastMessage.timestamp)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/60 mb-1 truncate">
                          {oppositeProfile?.name || "Unknown User"}
                        </p>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs text-white/50 truncate flex-1">
                            {room.lastMessage?.content || "No messages yet"}
                          </p>
                          {hasUnread && (
                            <span className="bg-[#60519b] text-white text-xs font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1.5 flex-shrink-0">
                              {room.unreadCount > 99 ? "99+" : room.unreadCount}
                            </span>
                          )}
                        </div>

                        {room.status === "blocked" && (
                          <div className="mt-2 text-xs text-red-400 bg-red-500/10 rounded px-2 py-1 inline-block">
                            Blocked
                          </div>
                        )}
                        {room.status === "closed" && (
                          <div className="mt-2 text-xs text-yellow-400 bg-yellow-500/10 rounded px-2 py-1 inline-block">
                            Closed
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default OwnerChatSidebar;
