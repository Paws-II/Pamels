import React, { useEffect } from "react";
import { AlertTriangle, Bell, CheckCircle, Info, X } from "lucide-react";

const ICON_MAP = {
  success: CheckCircle,
  error: AlertTriangle,
  info: Info,
  notify: Bell,
};

const COLOR_MAP = {
  success: "from-emerald-400 to-emerald-600",
  error: "from-red-400 to-red-600",
  info: "from-sky-400 to-sky-600",
  notify: "from-[#60519b] to-[#7d6ab8]",
};

const OwnerToast = ({
  type = "notify",
  title = "Notification",
  message = "Something happened",
  duration = 4000,
  onClose,
}) => {
  const Icon = ICON_MAP[type] || Bell;

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onClose?.();
    }, duration);

    return () => clearTimeout(timeoutId);
  }, [duration, onClose]);

  return (
    <>
      <style>
        {`
          @keyframes owner-toast-in {
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

          @keyframes owner-toast-out {
            to {
              transform: translateX(-120%);
              opacity: 0;
            }
          }

          @keyframes owner-toast-progress {
            from {
              width: 100%;
            }
            to {
              width: 0%;
            }
          }

          .owner-toast-in {
            animation: owner-toast-in 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .owner-toast-progress {
            animation-name: owner-toast-progress;
            animation-timing-function: linear;
            animation-fill-mode: forwards;
          }
        `}
      </style>

      <div className="fixed right-6 top-6 z-50 owner-toast-in">
        <div className="group relative w-[360px] overflow-hidden rounded-2xl border border-white/10 bg-[#1e202c]/95 shadow-2xl shadow-black/50 backdrop-blur-xl">
          <div
            className={`absolute inset-y-0 left-0 w-1.5 bg-linear-to-b ${COLOR_MAP[type]}`}
          />

          <div
            className={`absolute -left-10 -top-10 h-32 w-32 rounded-full bg-linear-to-br ${COLOR_MAP[type]} opacity-25 blur-3xl`}
          />

          <div className="relative flex gap-4 p-5">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br ${COLOR_MAP[type]}`}
            >
              <Icon size={20} className="text-white" />
            </div>

            <div className="flex-1">
              <h4 className="text-sm font-semibold text-white">{title}</h4>
              <p className="mt-1 text-sm leading-relaxed text-[#bfc0d1]">
                {message}
              </p>
            </div>

            <button
              onClick={onClose}
              className="mt-1 rounded-lg p-1 text-[#bfc0d1] transition-colors hover:bg-white/10 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          <div className="h-1 w-full bg-white/5">
            <div
              className={`h-full bg-linear-to-r ${COLOR_MAP[type]} owner-toast-progress`}
              style={{ animationDuration: `${duration}ms` }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default OwnerToast;
