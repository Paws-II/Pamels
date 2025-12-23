import React, { useState, useEffect } from "react";
import { Search, User, Circle, Menu, X } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const OwnerChatSidebar = ({
  onSelectRoom,
  selectedRoomId,
  userRole,
  isOpen,
  onToggle,
}) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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

  if (loading) {
    return (
      <div
        className={`bg-[#31323e] flex items-center justify-center transition-all duration-300 ${
          isOpen ? "w-80" : "w-16"
        } border-r border-white/10`}
      >
        <div className="text-white/60 text-sm">
          {isOpen ? "Loading..." : "..."}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-[#31323e] flex flex-col transition-all duration-300 ${
        isOpen ? "w-80" : "w-16"
      } border-r border-white/10`}
    >
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        {isOpen && <h2 className="text-xl font-bold text-white">Chats</h2>}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200 hover:scale-110"
        >
          {isOpen ? (
            <X size={20} className="text-white" />
          ) : (
            <Menu size={20} className="text-white" />
          )}
        </button>
      </div>

      {isOpen && (
        <div className="p-4 border-b border-white/10">
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
              className="w-full bg-[#1e202c] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#60519b] transition-colors"
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {filteredRooms.length === 0 ? (
          isOpen ? (
            <div className="flex flex-col items-center justify-center h-full text-white/40 text-sm px-4">
              <User size={48} className="mb-2" />
              <p>No chats yet</p>
            </div>
          ) : (
            <div className="flex justify-center pt-8">
              <User size={24} className="text-white/40" />
            </div>
          )
        ) : (
          filteredRooms.map((room) => {
            const oppositeProfile =
              userRole === "owner" ? room.shelterProfile : room.ownerProfile;
            const isSelected = selectedRoomId === room._id;
            const hasUnread = room.unreadCount > 0;

            return (
              <div
                key={room._id}
                onClick={() => onSelectRoom(room)}
                className={`p-4 border-b border-white/5 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "bg-[#60519b]/20 border-l-4 border-l-[#60519b]"
                    : "hover:bg-[#1e202c]/50 hover:scale-[1.02]"
                } ${!isOpen && "flex justify-center"}`}
              >
                {isOpen ? (
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className="h-12 w-12 rounded-full bg-[#60519b]/20 flex items-center justify-center overflow-hidden ring-2 ring-transparent hover:ring-[#60519b]/30 transition-all">
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
                      {room.status === "ongoing" && (
                        <Circle
                          size={10}
                          className="absolute bottom-0 right-0 text-green-500 fill-green-500 ring-2 ring-[#31323e]"
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-semibold text-white truncate">
                          {room.petId?.name || "Unknown Pet"}
                        </h3>
                        {room.lastMessage?.timestamp && (
                          <span className="text-xs text-white/40">
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
                          <span className="bg-[#60519b] text-white text-xs font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1.5 shadow-lg">
                            {room.unreadCount > 99 ? "99+" : room.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="h-10 w-10 rounded-full bg-[#60519b]/20 flex items-center justify-center overflow-hidden ring-2 ring-transparent hover:ring-[#60519b]/50 transition-all">
                      {room.petId?.coverImage || room.petId?.images?.[0] ? (
                        <img
                          src={room.petId.coverImage || room.petId.images[0]}
                          alt={room.petId.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xl">🐾</span>
                      )}
                    </div>
                    {hasUnread && (
                      <span className="absolute -top-1 -right-1 bg-[#60519b] text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-lg">
                        {room.unreadCount > 9 ? "9+" : room.unreadCount}
                      </span>
                    )}
                    {room.status === "ongoing" && (
                      <Circle
                        size={8}
                        className="absolute bottom-0 right-0 text-green-500 fill-green-500 ring-2 ring-[#31323e]"
                      />
                    )}
                  </div>
                )}

                {isOpen && room.status === "blocked" && (
                  <div className="mt-2 text-xs text-red-400 bg-red-500/10 rounded px-2 py-1">
                    Blocked
                  </div>
                )}
                {isOpen && room.status === "closed" && (
                  <div className="mt-2 text-xs text-yellow-400 bg-yellow-500/10 rounded px-2 py-1">
                    Closed
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default OwnerChatSidebar;
