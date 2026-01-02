import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(API_URL, {
      withCredentials: true,
      autoConnect: false, // 🔥 IMPORTANT
      auth: {
        token, // 🔥 JWT passed explicitly
      },
    });

    this.setupDefaultListeners();
    this.socket.connect();

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
    }
  }

  on(event, callback) {
    if (!this.socket) return;

    this.socket.on(event, callback);

    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    this.socket?.off(event, callback);
  }

  removeAllListeners() {
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((cb) => this.socket?.off(event, cb));
    });
    this.listeners.clear();
  }

  getSocket() {
    return this.socket;
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export default new SocketService();
