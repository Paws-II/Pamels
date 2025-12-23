import React from "react";
import { AlertCircle, X } from "lucide-react";

const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning",
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    warning: {
      icon: "text-yellow-400",
      button: "bg-yellow-500 hover:bg-yellow-600",
      border: "border-yellow-500/20",
    },
    danger: {
      icon: "text-red-400",
      button: "bg-red-500 hover:bg-red-600",
      border: "border-red-500/20",
    },
    info: {
      icon: "text-blue-400",
      button: "bg-blue-500 hover:bg-blue-600",
      border: "border-blue-500/20",
    },
  };

  const styles = typeStyles[type] || typeStyles.warning;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={`bg-[#31323e] rounded-xl border ${styles.border} max-w-md w-full shadow-2xl transform transition-all`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`shrink-0 ${styles.icon}`}>
              <AlertCircle size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-white/70 leading-relaxed">{message}</p>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 p-1 rounded-lg hover:bg-white/10 transition-all"
            >
              <X size={18} className="text-white/60" />
            </button>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 px-4 py-2.5 rounded-lg ${styles.button} text-white font-medium transition-all`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
