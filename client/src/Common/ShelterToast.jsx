import React, { useEffect } from "react";
import { CheckCircle, AlertTriangle, Info, X, Home } from "lucide-react";

const ICONS = {
  success: CheckCircle,
  error: AlertTriangle,
  info: Info,
  shelter: Home,
};

const COLORS = {
  success: "from-emerald-400 to-emerald-600",
  error: "from-red-400 to-red-600",
  info: "from-cyan-400 to-cyan-600",
  shelter: "from-teal-400 to-emerald-500",
};

const ShelterToast = ({
  type = "shelter",
  title = "Shelter Update",
  message = "You have a new update",
  duration = 4000,
  onClose,
}) => {
  const Icon = ICONS[type] || Home;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <>
      {/* 🔥 Animations inside component */}
      <style>
        {`
          @keyframes shelter-toast-in {
            0% {
              transform: translateX(120%);
              opacity: 0;
            }
            60% {
              transform: translateX(-8%);
              opacity: 1;
            }
            100% {
              transform: translateX(0);
            }
          }

          @keyframes shelter-toast-progress {
            from {
              width: 100%;
            }
            to {
              width: 0%;
            }
          }

          .shelter-toast-in {
            animation: shelter-toast-in 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .shelter-toast-progress {
            animation-name: shelter-toast-progress;
            animation-timing-function: linear;
            animation-fill-mode: forwards;
          }
        `}
      </style>

      <div className="fixed top-6 right-6 z-50 shelter-toast-in">
        <div className="group relative w-[360px] overflow-hidden rounded-2xl border border-white/10 bg-[#0f1f1c]/95 shadow-2xl shadow-black/50 backdrop-blur-xl">
          {/* Gradient accent */}
          <div
            className={`absolute inset-y-0 left-0 w-1.5 bg-linear-to-b ${COLORS[type]}`}
          />

          {/* Ambient glow */}
          <div
            className={`absolute -top-10 -left-10 h-32 w-32 rounded-full bg-linear-to-br ${COLORS[type]} opacity-25 blur-3xl`}
          />

          {/* Content */}
          <div className="relative flex gap-4 p-5">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br ${COLORS[type]}`}
            >
              <Icon size={20} className="text-white" />
            </div>

            <div className="flex-1">
              <h4 className="text-sm font-semibold text-white">{title}</h4>
              <p className="mt-1 text-sm text-emerald-100/80 leading-relaxed">
                {message}
              </p>
            </div>

            <button
              onClick={onClose}
              className="mt-1 rounded-lg p-1 text-emerald-100/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-1 w-full bg-white/5">
            <div
              className={`h-full bg-linear-to-r ${COLORS[type]} shelter-toast-progress`}
              style={{ animationDuration: `${duration}ms` }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ShelterToast;
