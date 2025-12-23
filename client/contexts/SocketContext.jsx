import React, { createContext, useContext, useEffect, useState } from "react";
import socketService from "../services/socketService";
const SocketContext = createContext(null);
export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext must be used within SocketProvider");
  }
  return context;
};
export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  useEffect(() => {
    try {
      socketService.connect();

      socketService.on("connect", () => {
        setIsConnected(true);
        setConnectionError(null);
      });

      socketService.on("disconnect", () => {
        setIsConnected(false);
      });

      socketService.on("connect_error", (error) => {
        setConnectionError(error.message);
        setIsConnected(false);
      });
    } catch (error) {
      console.error("Socket connection failed:", error);
      setConnectionError(error.message);
    }

    return () => {
      socketService.disconnect();
    };
  }, []);

  const value = {
    socket: socketService,
    isConnected,
    connectionError,
  };
  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
