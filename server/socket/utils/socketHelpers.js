export const emitToUser = (io, userId, eventName, payload) => {
  io.to(`user:${userId}`).emit(eventName, payload);
};

export const emitToRole = (io, role, eventName, payload) => {
  io.to(`role:${role}`).emit(eventName, payload);
};

export const emitToAll = (io, eventName, payload) => {
  io.emit(eventName, payload);
};

export const getUserRoom = (userId) => {
  return `user:${userId}`;
};

export const getRoleRoom = (role) => {
  return `role:${role}`;
};

export const safeEmit = (socket, eventName, payload) => {
  try {
    socket.emit(eventName, payload);
  } catch (error) {
    console.error(`Error emitting ${eventName}:`, error);
  }
};
