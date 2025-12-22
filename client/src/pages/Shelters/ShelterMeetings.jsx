import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Video,
  Plus,
  Edit,
  Trash2,
  X,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import axios from "axios";
import NavbarShelter from "../../components/Shelters/NavbarShelter";
import FullPageLoader from "../../Common/FullPageLoader";
import FullPageError from "../../Common/FullPageError";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const ShelterMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [eligibleOwners, setEligibleOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  const [formData, setFormData] = useState({
    ownerId: "",
    scheduledDate: "",
    scheduledTime: "",
    durationMinutes: 30,
    meetingLink: "",
    meetingPlatform: "google-meet",
    notes: "",
  });

  const [cancelData, setCancelData] = useState({
    reason: "",
    confirmName: "",
  });

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [meetingsRes, ownersRes] = await Promise.all([
        axios.get(`${API_URL}/api/shelter/meetings`, { withCredentials: true }),
        axios.get(`${API_URL}/api/shelter/meetings/eligible-owners`, {
          withCredentials: true,
        }),
      ]);

      if (meetingsRes.data.success) setMeetings(meetingsRes.data.meetings);
      if (ownersRes.data.success) setEligibleOwners(ownersRes.data.owners);
    } catch (err) {
      setError("Failed to load meetings");
      console.error(err);
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

  const canJoinOrComplete = (scheduledAt) => {
    const meetingTime = new Date(scheduledAt);
    const tenMinutesBefore = new Date(meetingTime.getTime() - 10 * 60 * 1000);
    return currentTime >= tenMinutesBefore;
  };

  const handleAddMeeting = async (e) => {
    e.preventDefault();
    try {
      const scheduledAt = new Date(
        `${formData.scheduledDate}T${formData.scheduledTime}`
      );

      const res = await axios.post(
        `${API_URL}/api/shelter/meetings`,
        {
          ownerId: formData.ownerId,
          scheduledAt,
          durationMinutes: formData.durationMinutes,
          meetingLink: formData.meetingLink,
          meetingPlatform: formData.meetingPlatform,
          notes: formData.notes,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        setMeetings([res.data.meeting, ...meetings]);
        setShowAddModal(false);
        setFormData({
          ownerId: "",
          scheduledDate: "",
          scheduledTime: "",
          durationMinutes: 30,
          meetingLink: "",
          meetingPlatform: "google-meet",
          notes: "",
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create meeting");
    }
  };

  const handleEditMeeting = async (e) => {
    e.preventDefault();
    try {
      const scheduledAt = new Date(
        `${formData.scheduledDate}T${formData.scheduledTime}`
      );

      const res = await axios.patch(
        `${API_URL}/api/shelter/meetings/${selectedMeeting._id}`,
        {
          scheduledAt,
          durationMinutes: formData.durationMinutes,
          meetingLink: formData.meetingLink,
          meetingPlatform: formData.meetingPlatform,
          notes: formData.notes,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        setMeetings(
          meetings.map((m) =>
            m._id === selectedMeeting._id ? res.data.meeting : m
          )
        );
        setShowEditModal(false);
        setSelectedMeeting(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update meeting");
    }
  };

  const handleCancelMeeting = async (e) => {
    e.preventDefault();

    const owner = eligibleOwners.find(
      (o) => o.ownerId === selectedMeeting.ownerId._id
    );
    if (
      cancelData.confirmName.trim().toLowerCase() !== owner?.name.toLowerCase()
    ) {
      alert(
        "Owner name doesn't match. Please type the correct name to confirm."
      );
      return;
    }

    try {
      const res = await axios.patch(
        `${API_URL}/api/shelter/meetings/${selectedMeeting._id}/cancel`,
        { cancellationReason: cancelData.reason },
        { withCredentials: true }
      );

      if (res.data.success) {
        setMeetings(
          meetings.map((m) =>
            m._id === selectedMeeting._id
              ? {
                  ...m,
                  status: "cancelled",
                  cancellationReason: cancelData.reason,
                  cancelledBy: "shelter",
                }
              : m
          )
        );
        setShowCancelModal(false);
        setSelectedMeeting(null);
        setCancelData({ reason: "", confirmName: "" });
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel meeting");
    }
  };

  const handleMarkComplete = async (meetingId) => {
    try {
      const res = await axios.patch(
        `${API_URL}/api/shelter/meetings/${meetingId}/complete`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        setMeetings(
          meetings.map((m) =>
            m._id === meetingId ? { ...m, status: "completed" } : m
          )
        );
      }
    } catch (err) {
      alert(
        err.response?.data?.message || "Failed to mark meeting as complete"
      );
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (!confirm("Are you sure you want to delete this meeting?")) return;

    try {
      const res = await axios.delete(
        `${API_URL}/api/shelter/meetings/${meetingId}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        setMeetings(meetings.filter((m) => m._id !== meetingId));
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete meeting");
    }
  };

  const openEditModal = (meeting) => {
    const scheduledDate = new Date(meeting.scheduledAt);
    setSelectedMeeting(meeting);
    setFormData({
      ownerId: meeting.ownerId._id,
      scheduledDate: scheduledDate.toISOString().split("T")[0],
      scheduledTime: scheduledDate.toTimeString().slice(0, 5),
      durationMinutes: meeting.durationMinutes,
      meetingLink: meeting.meetingLink,
      meetingPlatform: meeting.meetingPlatform,
      notes: meeting.notes,
    });
    setShowEditModal(true);
  };

  const openCancelModal = (meeting) => {
    setSelectedMeeting(meeting);
    setShowCancelModal(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: "bg-blue-500/20 text-blue-400",
      scheduled: "bg-green-500/20 text-green-400",
      completed: "bg-gray-500/20 text-gray-400",
      cancelled: "bg-red-500/20 text-red-400",
    };
    return badges[status] || badges.open;
  };

  if (loading) {
    return (
      <FullPageLoader
        title="Loading Meetings..."
        subtitle="Preparing your schedule"
      />
    );
  }

  if (error) {
    return <FullPageError message={error} onRetry={fetchData} />;
  }

  return (
    <div className="min-h-screen bg-[#1e202c] flex">
      <NavbarShelter onLogout={handleLogout} />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Meetings
              </h1>
              <p className="text-[#bfc0d1] mt-2">
                Schedule and manage meetings with pet owners
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 rounded-xl bg-[#4a5568] px-6 py-3 text-white font-semibold transition-all hover:bg-[#5a6678] hover:scale-105 active:scale-95"
            >
              <Plus size={20} />
              Add Meeting
            </button>
          </div>

          {/* Meetings List */}
          <div className="space-y-4">
            {meetings.length === 0 ? (
              <div className="rounded-2xl border border-[#4a5568]/20 bg-[#31323e] p-12 text-center">
                <Calendar size={48} className="mx-auto mb-4 text-[#4a5568]" />
                <p className="text-white font-semibold">
                  No meetings scheduled
                </p>
                <p className="text-[#bfc0d1] text-sm mt-2">
                  Click "Add Meeting" to schedule your first meeting
                </p>
              </div>
            ) : (
              meetings.map((meeting) => {
                const canInteract = canJoinOrComplete(meeting.scheduledAt);

                return (
                  <div
                    key={meeting._id}
                    className="rounded-2xl border border-[#4a5568]/20 bg-[#31323e] p-6 transition-all hover:border-[#4a5568]/40"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-bold text-white">
                            {meeting.ownerName}
                          </h3>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(
                              meeting.status
                            )}`}
                          >
                            {meeting.status}
                          </span>
                        </div>

                        <div className="space-y-2 text-sm text-[#bfc0d1]">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-[#4a5568]" />
                            <span>
                              {new Date(
                                meeting.scheduledAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-[#4a5568]" />
                            <span>
                              {new Date(
                                meeting.scheduledAt
                              ).toLocaleTimeString()}{" "}
                              ({meeting.durationMinutes} min)
                            </span>
                          </div>
                          {meeting.meetingLink && (
                            <div className="flex items-center gap-2">
                              <Video size={16} className="text-[#4a5568]" />
                              <span className="text-[#4a5568] truncate">
                                {meeting.meetingPlatform}
                              </span>
                            </div>
                          )}
                          {meeting.notes && (
                            <p className="mt-2 text-[#bfc0d1]/80">
                              {meeting.notes}
                            </p>
                          )}
                          {meeting.status === "cancelled" && (
                            <div className="mt-3 rounded-lg bg-red-500/10 p-3 border border-red-500/20">
                              <p className="text-red-400 text-xs font-semibold">
                                Cancelled by {meeting.cancelledBy}
                              </p>
                              <p className="text-red-400/80 text-xs mt-1">
                                {meeting.cancellationReason}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {meeting.status === "scheduled" && (
                          <>
                            <div className="relative group">
                              <button
                                onClick={() =>
                                  meeting.meetingLink &&
                                  canInteract &&
                                  window.open(meeting.meetingLink, "_blank")
                                }
                                disabled={!canInteract}
                                className={`rounded-lg p-2 transition-all ${
                                  canInteract
                                    ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                    : "bg-[#31323e] text-[#bfc0d1]/30 cursor-not-allowed"
                                }`}
                                title={canInteract ? "Join Meeting" : ""}
                              >
                                <Video size={18} />
                              </button>
                              {!canInteract && (
                                <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block w-48 bg-[#1e202c] border border-[#4a5568]/20 rounded-lg p-2 text-xs text-[#bfc0d1]">
                                  Meeting will open 10 minutes before scheduled
                                  time
                                </div>
                              )}
                            </div>

                            <div className="relative group">
                              <button
                                onClick={() => handleMarkComplete(meeting._id)}
                                disabled={!canInteract}
                                className={`rounded-lg p-2 transition-all ${
                                  canInteract
                                    ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                                    : "bg-[#31323e] text-[#bfc0d1]/30 cursor-not-allowed"
                                }`}
                                title={canInteract ? "Mark as Complete" : ""}
                              >
                                <CheckCircle2 size={18} />
                              </button>
                              {!canInteract && (
                                <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block w-48 bg-[#1e202c] border border-[#4a5568]/20 rounded-lg p-2 text-xs text-[#bfc0d1]">
                                  You can mark this meeting as complete once it
                                  starts
                                </div>
                              )}
                            </div>
                          </>
                        )}

                        {meeting.status !== "completed" &&
                          meeting.status !== "cancelled" && (
                            <>
                              <button
                                onClick={() => openEditModal(meeting)}
                                className="rounded-lg bg-[#4a5568]/20 p-2 text-[#4a5568] transition-all hover:bg-[#4a5568]/30"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => openCancelModal(meeting)}
                                className="rounded-lg bg-red-500/20 p-2 text-red-400 transition-all hover:bg-red-500/30"
                              >
                                <AlertTriangle size={18} />
                              </button>
                            </>
                          )}

                        <button
                          onClick={() => handleDeleteMeeting(meeting._id)}
                          className="rounded-lg bg-red-500/20 p-2 text-red-400 transition-all hover:bg-red-500/30"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Add Meeting Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-[#4a5568]/20 bg-[#31323e] p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                Schedule New Meeting
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-2 text-[#bfc0d1] transition-all hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddMeeting} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-white">
                  Select Owner
                </label>
                <select
                  value={formData.ownerId}
                  onChange={(e) =>
                    setFormData({ ...formData, ownerId: e.target.value })
                  }
                  required
                  className="w-full rounded-lg border border-[#4a5568]/20 bg-[#1e202c] px-4 py-3 text-white focus:border-[#4a5568] focus:outline-none"
                >
                  <option value="">-- Select an owner --</option>
                  {eligibleOwners.map((owner) => (
                    <option key={owner.ownerId} value={owner.ownerId}>
                      {owner.name} ({owner.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-white">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        scheduledDate: e.target.value,
                      })
                    }
                    min={new Date().toISOString().split("T")[0]}
                    required
                    className="w-full rounded-lg border border-[#4a5568]/20 bg-[#1e202c] px-4 py-3 text-white focus:border-[#4a5568] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-white">
                    Time
                  </label>
                  <input
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        scheduledTime: e.target.value,
                      })
                    }
                    required
                    className="w-full rounded-lg border border-[#4a5568]/20 bg-[#1e202c] px-4 py-3 text-white focus:border-[#4a5568] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-white">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.durationMinutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      durationMinutes: parseInt(e.target.value),
                    })
                  }
                  min="15"
                  max="180"
                  required
                  className="w-full rounded-lg border border-[#4a5568]/20 bg-[#1e202c] px-4 py-3 text-white focus:border-[#4a5568] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-white">
                  Meeting Platform
                </label>
                <select
                  value={formData.meetingPlatform}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      meetingPlatform: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-[#4a5568]/20 bg-[#1e202c] px-4 py-3 text-white focus:border-[#4a5568] focus:outline-none"
                >
                  <option value="google-meet">Google Meet</option>
                  <option value="zoom">Zoom</option>
                  <option value="teams">Microsoft Teams</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-white">
                  Meeting Link
                </label>
                <input
                  type="url"
                  value={formData.meetingLink}
                  onChange={(e) =>
                    setFormData({ ...formData, meetingLink: e.target.value })
                  }
                  placeholder="https://meet.google.com/..."
                  className="w-full rounded-lg border border-[#4a5568]/20 bg-[#1e202c] px-4 py-3 text-white focus:border-[#4a5568] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-white">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows="3"
                  className="w-full rounded-lg border border-[#4a5568]/20 bg-[#1e202c] px-4 py-3 text-white focus:border-[#4a5568] focus:outline-none"
                  placeholder="Add any additional information..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-[#4a5568] py-3 font-semibold text-white transition-all hover:bg-[#5a6678]"
                >
                  Schedule Meeting
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-lg bg-[#1e202c] py-3 font-semibold text-[#bfc0d1] transition-all hover:bg-[#1e202c]/80"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal - Similar structure to Add Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-[#4a5568]/20 bg-[#31323e] p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Edit Meeting</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedMeeting(null);
                }}
                className="rounded-lg p-2 text-[#bfc0d1] transition-all hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditMeeting} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-white">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        scheduledDate: e.target.value,
                      })
                    }
                    min={new Date().toISOString().split("T")[0]}
                    required
                    className="w-full rounded-lg border border-[#4a5568]/20 bg-[#1e202c] px-4 py-3 text-white focus:border-[#4a5568] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-white">
                    Time
                  </label>
                  <input
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        scheduledTime: e.target.value,
                      })
                    }
                    required
                    className="w-full rounded-lg border border-[#4a5568]/20 bg-[#1e202c] px-4 py-3 text-white focus:border-[#4a5568] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-white">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.durationMinutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      durationMinutes: parseInt(e.target.value),
                    })
                  }
                  min="15"
                  max="180"
                  required
                  className="w-full rounded-lg border border-[#4a5568]/20 bg-[#1e202c] px-4 py-3 text-white focus:border-[#4a5568] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-white">
                  Meeting Link
                </label>
                <input
                  type="url"
                  value={formData.meetingLink}
                  onChange={(e) =>
                    setFormData({ ...formData, meetingLink: e.target.value })
                  }
                  className="w-full rounded-lg border border-[#4a5568]/20 bg-[#1e202c] px-4 py-3 text-white focus:border-[#4a5568] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-white">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows="3"
                  className="w-full rounded-lg border border-[#4a5568]/20 bg-[#1e202c] px-4 py-3 text-white focus:border-[#4a5568] focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-[#4a5568] py-3 font-semibold text-white transition-all hover:bg-[#5a6678]"
                >
                  Update Meeting
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedMeeting(null);
                  }}
                  className="flex-1 rounded-lg bg-[#1e202c] py-3 font-semibold text-[#bfc0d1] transition-all hover:bg-[#1e202c]/80"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && selectedMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-[#31323e] p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-red-400">
                Cancel Meeting
              </h2>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedMeeting(null);
                  setCancelData({ reason: "", confirmName: "" });
                }}
                className="rounded-lg p-2 text-[#bfc0d1] transition-all hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCancelMeeting} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-white">
                  Cancellation Reason
                </label>
                <textarea
                  value={cancelData.reason}
                  onChange={(e) =>
                    setCancelData({ ...cancelData, reason: e.target.value })
                  }
                  required
                  rows="3"
                  className="w-full rounded-lg border border-[#4a5568]/20 bg-[#1e202c] px-4 py-3 text-white focus:border-[#4a5568] focus:outline-none"
                  placeholder="Explain why you're cancelling this meeting..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-white">
                  Type owner's name to confirm:{" "}
                  <span className="text-red-400">
                    {selectedMeeting.ownerName}
                  </span>
                </label>
                <input
                  type="text"
                  value={cancelData.confirmName}
                  onChange={(e) =>
                    setCancelData({
                      ...cancelData,
                      confirmName: e.target.value,
                    })
                  }
                  required
                  className="w-full rounded-lg border border-[#4a5568]/20 bg-[#1e202c] px-4 py-3 text-white focus:border-[#4a5568] focus:outline-none"
                  placeholder="Type owner's name..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-red-500 py-3 font-semibold text-white transition-all hover:bg-red-600"
                >
                  Cancel Meeting
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCancelModal(false);
                    setSelectedMeeting(null);
                    setCancelData({ reason: "", confirmName: "" });
                  }}
                  className="flex-1 rounded-lg bg-[#1e202c] py-3 font-semibold text-[#bfc0d1] transition-all hover:bg-[#1e202c]/80"
                >
                  Go Back
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShelterMeetings;
