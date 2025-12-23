import React, { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ShelterChatSidebar from "../../components/Shelters/Chat/ShelterChatSidebar";
import ShelterChatWindow from "../../components/Shelters/Chat/ShelterChatWindow";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const ShelterChatPage = () => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/shelter/profile`, {
          credentials: "include",
        });
        const data = await response.json();
        if (data.success) {
          setCurrentUserId(data.profile.shelterId._id);
        }
      } catch (error) {
        console.error("Fetch user ID error:", error);
      }
    };
    fetchUserId();
  }, []);

  return (
    <div className="h-screen bg-[#1e202c] flex flex-col overflow-hidden">
      <div className="flex-1 flex overflow-hidden min-h-0">
        <ShelterChatSidebar
          onSelectRoom={setSelectedRoom}
          selectedRoomId={selectedRoom?._id}
          userRole="shelter"
        />
        {selectedRoom ? (
          <ShelterChatWindow
            room={selectedRoom}
            userRole="shelter"
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

export default ShelterChatPage;
