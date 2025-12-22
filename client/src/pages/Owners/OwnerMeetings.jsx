import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Calendar,
  Clock,
  Video,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Building2,
  PawPrint,
} from "lucide-react";
import Navbar from "../../components/Owners/NavbarOwner";
import FullPageLoader from "../../Common/FullPageLoader";
import FullPageError from "../../Common/FullPageError";
import NotificationBell from "../../Common/NotificationBell";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const OwnerMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    fetchMeetings();

    // Update current time every minute to refresh join button states
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/shelter/meetings/owner`,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setMeetings(response.data.data);
      }
    } catch (err) {
      console.error("Fetch meetings error:", err);
      setError(err.response?.data?.message || "Failed to load meetings");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        `${API_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const canJoinMeeting = (meeting) => {
    if (meeting.status === "cancelled" || meeting.status === "completed") {
      return { allowed: false, reason: "Meeting is not active" };
    }

    if (meeting.status !== "scheduled") {
      return { allowed: false, reason: "Meeting is not scheduled yet" };
    }

    if (!meeting.scheduledAt) {
      return { allowed: false, reason: "No scheduled time set" };
    }

    const meetingTime = new Date(meeting.scheduledAt).getTime();
    const tenMinutesBefore = meetingTime - 10 * 60 * 1000;

    if (currentTime < tenMinutesBefore) {
      const minutesUntil = Math.ceil((tenMinutesBefore - currentTime) / 60000);
      return {
        allowed: false,
        reason: `Meeting opens in ${minutesUntil} minute${
          minutesUntil !== 1 ? "s" : ""
        }`,
      };
    }

    if (!meeting.meetingLink) {
      return { allowed: false, reason: "Meeting link not available" };
    }

    return { allowed: true, reason: "" };
  };

  const handleJoinMeeting = (meeting) => {
    const joinStatus = canJoinMeeting(meeting);
    if (joinStatus.allowed && meeting.meetingLink) {
      window.open(meeting.meetingLink, "_blank", "noopener,noreferrer");
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Not scheduled";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusConfig = (status) => {
    const configs = {
      open: {
        label: "Open",
        color: "text-blue-400 bg-blue-500/20 border-blue-500/30",
        icon: AlertCircle,
      },
      scheduled: {
        label: "Scheduled",
        color: "text-green-400 bg-green-500/20 border-green-500/30",
        icon: CheckCircle,
      },
      completed: {
        label: "Completed",
        color: "text-gray-400 bg-gray-500/20 border-gray-500/30",
        icon: CheckCircle,
      },
      cancelled: {
        label: "Cancelled",
        color: "text-red-400 bg-red-500/20 border-red-500/30",
        icon: XCircle,
      },
    };
    return configs[status] || configs.open;
  };

  const getPlatformIcon = (platform) => {
    return Video;
  };

  if (loading) {
    return (
      <FullPageLoader
        title="Loading Your Meetings"
        subtitle="Fetching your scheduled meetings with shelters"
      />
    );
  }

  if (error) {
    return <FullPageError message={error} onAction={fetchMeetings} />;
  }

  return (
    <div className="min-h-screen bg-[#1e202c] flex">
      <Navbar onLogout={handleLogout} />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
          {/* Notification Bell */}
          <div className="mb-4 flex justify-end">
            <NotificationBell />
          </div>

          {/* Page Header */}
          <div className="mb-8">
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#60519b] via-[#7d6ab8] to-[#60519b] p-8 md:p-10 shadow-2xl shadow-[#60519b]/20">
              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/5 to-transparent" />
              <div className="relative z-10 flex items-center gap-4">
                <div className="rounded-xl bg-white/10 p-3">
                  <Calendar size={32} className="text-white" strokeWidth={2} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white md:text-4xl tracking-tight">
                    My Meetings
                  </h1>
                  <p className="mt-2 text-base text-white/90 md:text-lg">
                    Your scheduled meetings with shelters
                  </p>
                </div>
              </div>
              <div className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
            </div>
          </div>

          {/* Meetings List */}
          {meetings.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-[#60519b]/20 bg-[#31323e] p-16 text-center">
              <div className="mb-4 rounded-full bg-[#60519b]/20 p-6">
                <Calendar
                  size={48}
                  className="text-[#60519b]"
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="mb-2 text-xl font-bold text-white">
                No Meetings Yet
              </h3>
              <p className="text-sm text-[#bfc0d1]">
                You don't have any scheduled meetings at the moment
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {meetings.map((meeting) => {
                const statusConfig = getStatusConfig(meeting.status);
                const StatusIcon = statusConfig.icon;
                const PlatformIcon = getPlatformIcon(meeting.meetingPlatform);
                const joinStatus = canJoinMeeting(meeting);

                return (
                  <div
                    key={meeting._id}
                    className="group rounded-2xl border border-[#60519b]/20 bg-[#31323e] p-6 transition-all hover:border-[#60519b]/40 hover:shadow-lg hover:shadow-[#60519b]/10"
                  >
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                      {/* Left Section - Meeting Info */}
                      <div className="flex-1 space-y-4">
                        {/* Header Row */}
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Building2 size={18} className="text-[#60519b]" />
                            <h3 className="text-lg font-semibold text-white">
                              {meeting.shelterProfile?.name || "Shelter"}
                            </h3>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${statusConfig.color}`}
                          >
                            <StatusIcon size={12} strokeWidth={2.5} />
                            {statusConfig.label}
                          </span>
                        </div>

                        {/* Pet Info */}
                        {meeting.petId && (
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-[#60519b]/20 bg-[#1e202c]">
                              {meeting.petId.coverImage ? (
                                <img
                                  src={meeting.petId.coverImage}
                                  alt={meeting.petId.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <PawPrint
                                  size={20}
                                  className="text-[#60519b]"
                                />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">
                                {meeting.petId.name}
                              </p>
                              <p className="text-xs text-[#bfc0d1]/60">
                                {meeting.petId.breed} • {meeting.petId.species}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Meeting Details Grid */}
                        <div className="grid gap-3 sm:grid-cols-2">
                          {/* Date & Time */}
                          <div className="flex items-start gap-2">
                            <Clock
                              size={16}
                              className="mt-0.5 text-[#60519b]"
                            />
                            <div>
                              <p className="text-xs text-[#bfc0d1]/60">
                                Date & Time
                              </p>
                              <p className="text-sm text-white">
                                {formatDateTime(meeting.scheduledAt)}
                              </p>
                            </div>
                          </div>

                          {/* Duration */}
                          <div className="flex items-start gap-2">
                            <Clock
                              size={16}
                              className="mt-0.5 text-[#60519b]"
                            />
                            <div>
                              <p className="text-xs text-[#bfc0d1]/60">
                                Duration
                              </p>
                              <p className="text-sm text-white">
                                {meeting.durationMinutes || 30} minutes
                              </p>
                            </div>
                          </div>

                          {/* Platform */}
                          <div className="flex items-start gap-2">
                            <PlatformIcon
                              size={16}
                              className="mt-0.5 text-[#60519b]"
                            />
                            <div>
                              <p className="text-xs text-[#bfc0d1]/60">
                                Platform
                              </p>
                              <p className="text-sm capitalize text-white">
                                {meeting.meetingPlatform?.replace("-", " ") ||
                                  "Google Meet"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Notes */}
                        {meeting.notes && (
                          <div className="rounded-lg border border-[#60519b]/10 bg-[#1e202c]/50 p-3">
                            <p className="text-xs text-[#bfc0d1]/60 mb-1">
                              Notes
                            </p>
                            <p className="text-sm text-[#bfc0d1] leading-relaxed">
                              {meeting.notes}
                            </p>
                          </div>
                        )}

                        {/* Cancellation Info */}
                        {meeting.status === "cancelled" &&
                          meeting.cancellationReason && (
                            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                              <p className="text-xs text-red-400 mb-1">
                                Cancellation Reason
                              </p>
                              <p className="text-sm text-[#bfc0d1] leading-relaxed">
                                {meeting.cancellationReason}
                              </p>
                            </div>
                          )}
                      </div>

                      {/* Right Section - Actions */}
                      <div className="flex flex-col gap-3 lg:items-end">
                        {/* Join Button */}
                        {meeting.status === "scheduled" && (
                          <div className="relative group/tooltip">
                            <button
                              onClick={() => handleJoinMeeting(meeting)}
                              disabled={!joinStatus.allowed}
                              className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-300 ${
                                joinStatus.allowed
                                  ? "bg-gradient-to-r from-[#60519b] to-[#7d6ab8] text-white shadow-lg shadow-[#60519b]/30 hover:shadow-[#60519b]/50 hover:scale-105 active:scale-95"
                                  : "bg-[#60519b]/20 text-[#60519b]/50 cursor-not-allowed"
                              }`}
                            >
                              <ExternalLink size={16} strokeWidth={2.5} />
                              Join Meeting
                            </button>

                            {/* Tooltip */}
                            {!joinStatus.allowed && joinStatus.reason && (
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:block z-10">
                                <div className="rounded-lg bg-[#1e202c] border border-[#60519b]/30 px-3 py-2 text-xs text-white whitespace-nowrap shadow-xl">
                                  {joinStatus.reason}
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                                    <div className="border-4 border-transparent border-t-[#1e202c]" />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Joined Indicators */}
                        {meeting.status === "scheduled" && (
                          <div className="flex flex-col gap-2 text-xs">
                            {meeting.ownerJoined && (
                              <div className="flex items-center gap-1.5 text-green-400">
                                <CheckCircle size={12} strokeWidth={2.5} />
                                You joined
                              </div>
                            )}
                            {meeting.shelterJoined && (
                              <div className="flex items-center gap-1.5 text-blue-400">
                                <CheckCircle size={12} strokeWidth={2.5} />
                                Shelter joined
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OwnerMeetings;
