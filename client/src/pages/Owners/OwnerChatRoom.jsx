import React, { useState, useEffect } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import OwnerChatSidebar from "../../components/Owners/Chat/OwnerChatSidebar";
import OwnerChatWindow from "../../components/Owners/Chat/OwnerChatWindow";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const OwnerChatPage = () => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/owner/profile`, {
          credentials: "include",
        });
        const data = await response.json();
        if (data.success) {
          setCurrentUserId(data.profile.ownerId._id);
        }
      } catch (error) {
        console.error("Fetch user ID error:", error);
      }
    };
    fetchUserId();
  }, []);

  return (
    <div className="h-screen bg-[#1e202c] flex flex-col overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        <OwnerChatSidebar
          onSelectRoom={setSelectedRoom}
          selectedRoomId={selectedRoom?._id}
          userRole="owner"
        />

        {selectedRoom ? (
          <OwnerChatWindow
            room={selectedRoom}
            userRole="owner"
            currentUserId={currentUserId}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#1e202c]">
            <div className="text-center text-white/40">
              <MessageCircle
                size={64}
                className="mx-auto mb-4 opacity-50 animate-pulse"
              />
              <p className="text-lg font-medium">
                Select a chat to start messaging
              </p>
              <p className="text-sm mt-2 text-white/30">
                Choose a conversation from the sidebar
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerChatPage;
