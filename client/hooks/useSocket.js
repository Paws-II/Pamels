import { useEffect, useCallback } from "react";
import { useSocketContext } from "../contexts/SocketContext";
export const useSocket = () => {
  const { socket, isConnected, connectionError } = useSocketContext();
  const emit = useCallback(
    (event, data) => {
      if (!socket?.connected) return;

      socket.emit(event, data);
    },
    [socket]
  );

  const on = useCallback(
    (event, callback) => {
      socket.on(event, callback);
      return () => {
        socket.off(event, callback);
      };
    },
    [socket]
  );
  return {
    socket,
    isConnected,
    connectionError,
    emit,
    on,
  };
};
export const useDashboardSocket = () => {
  const { emit, on } = useSocket();
  const subscribeToDashboard = useCallback(() => {
    emit("dashboard:subscribe");
  }, [emit]);
  const unsubscribeFromDashboard = useCallback(() => {
    emit("dashboard:unsubscribe");
  }, [emit]);
  const refreshDashboard = useCallback(() => {
    emit("dashboard:refresh");
  }, [emit]);
  const onDashboardUpdate = useCallback(
    (callback) => {
      return on("dashboard:update", callback);
    },
    [on]
  );
  return {
    subscribeToDashboard,
    unsubscribeFromDashboard,
    refreshDashboard,
    onDashboardUpdate,
  };
};
export const useNotificationSocket = () => {
  const { emit, on } = useSocket();
  const markAsRead = useCallback(
    (notificationId) => {
      emit("notification:read", { notificationId });
    },
    [emit]
  );
  const markAllAsRead = useCallback(() => {
    emit("notification:read:all");
  }, [emit]);
  const onNewNotification = useCallback(
    (callback) => {
      return on("notification:new", callback);
    },
    [on]
  );
  return {
    markAsRead,
    markAllAsRead,
    onNewNotification,
  };
};
export const useStatusSocket = () => {
  const { emit, on } = useSocket();
  const updateStatus = useCallback(
    (status, details) => {
      emit("status:update", { status, details });
    },
    [emit]
  );
  const subscribeToStatus = useCallback(
    (targetUserId) => {
      emit("status:subscribe", { targetUserId });
    },
    [emit]
  );
  const unsubscribeFromStatus = useCallback(
    (targetUserId) => {
      emit("status:unsubscribe", { targetUserId });
    },
    [emit]
  );
  const onStatusChanged = useCallback(
    (callback) => {
      return on("status:changed", callback);
    },
    [on]
  );
  return {
    updateStatus,
    subscribeToStatus,
    unsubscribeFromStatus,
    onStatusChanged,
  };
};
