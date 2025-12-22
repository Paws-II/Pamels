import React, { useState, useEffect } from "react";
import { Search, User, Circle } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const ChatSidebar = ({ onSelectRoom, selectedRoomId, userRole }) => {
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
      <div className="w-80 border-r border-white/10 bg-[#31323e] flex items-center justify-center">
        <div className="text-white/60">Loading chats...</div>
      </div>
    );
  }

  return (
    <div className="w-80 border-r border-white/10 bg-[#31323e] flex flex-col">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-xl font-bold text-white mb-3">Chats</h2>
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
            className="w-full bg-[#1e202c] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/20"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/40 text-sm">
            <User size={48} className="mb-2" />
            <p>No chats yet</p>
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
                onClick={() => onSelectRoom(room)}
                className={`p-4 border-b border-white/5 cursor-pointer transition-all ${
                  isSelected
                    ? "bg-[#60519b]/20 border-l-4 border-l-[#60519b]"
                    : "hover:bg-[#1e202c]/50"
                }`}
              >
                <div className="flex items-start gap-3">
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
                        <span className="text-xs text-white/40">
                          {formatTime(room.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/60 mb-1">
                      {oppositeProfile?.name || "Unknown User"}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-white/50 truncate">
                        {room.lastMessage?.content || "No messages yet"}
                      </p>
                      {hasUnread && (
                        <span className="ml-2 bg-[#60519b] text-white text-xs font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1.5">
                          {room.unreadCount > 99 ? "99+" : room.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {room.status === "blocked" && (
                  <div className="mt-2 text-xs text-red-400 bg-red-500/10 rounded px-2 py-1">
                    Blocked
                  </div>
                )}
                {room.status === "closed" && (
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

export default ChatSidebar;
