import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket?.connected) {
      console.log("Socket already connected");
      return this.socket;
    }

    this.socket = io(API_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    this.setupDefaultListeners();
    return this.socket;
  }

  setupDefaultListeners() {
    this.socket.on("connect", () => {
      console.log("✓ Socket connected:", this.socket.id);
    });

    this.socket.on("connection:success", (data) => {
      console.log("✓ Connection authenticated:", data);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("✗ Socket disconnected:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      console.log("Socket disconnected manually");
    }
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn("Cannot emit - socket not connected");
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);

      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push(callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);

      if (this.listeners.has(event)) {
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    }
  }

  removeAllListeners() {
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        this.socket?.off(event, callback);
      });
    });
    this.listeners.clear();
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export default new SocketService();
