import React, { useState } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ChatSidebar from "../../components/Chat/ChatSidebar";
import ChatWindow from "../../components/Chat/ChatWindow";

const ShelterChatRoom = () => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:8000"
          }/api/auth/shelter/profile`,
          { credentials: "include" }
        );
        const data = await response.json();
        if (data.success) {
          console.log(data);
          setCurrentUserId(data.profile.shelterId._id);
        }
      } catch (error) {
        console.error("Fetch user ID error:", error);
      }
    };
    fetchUserId();
  }, []);

  return (
    <div className="min-h-screen bg-[#1e202c] flex flex-col">
      <div className="bg-[#31323e] border-b border-white/10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/shelter-dashboard")}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div className="flex items-center gap-2">
            <MessageCircle size={24} className="text-[#4a5568]" />
            <h1 className="text-xl font-bold text-white">Chat</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <ChatSidebar
          onSelectRoom={setSelectedRoom}
          selectedRoomId={selectedRoom?._id}
          userRole="shelter"
        />

        {selectedRoom ? (
          <ChatWindow
            room={selectedRoom}
            userRole="shelter"
            currentUserId={currentUserId}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#1e202c]">
            <div className="text-center text-white/40">
              <MessageCircle size={64} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">Select a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShelterChatRoom;
