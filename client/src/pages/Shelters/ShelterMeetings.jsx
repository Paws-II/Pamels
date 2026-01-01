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
import ConfirmationDialog from "../../Common/ConfirmationDialog";
import ShelterToast from "../../Common/ShelterToast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const ShelterMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [eligibleOwners, setEligibleOwners] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState(null);
  const [applications, setApplications] = useState([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState("");

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

  const resetForm = () => {
    setSelectedApplicationId("");
    setFormData({
      ownerId: "",
      scheduledDate: "",
      scheduledTime: "",
      durationMinutes: 30,
      meetingLink: "",
      meetingPlatform: "google-meet",
      notes: "",
    });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [meetingsRes, ownersRes, applicationsRes] = await Promise.all([
        axios.get(`${API_URL}/api/shelter/meetings`, { withCredentials: true }),
        axios.get(`${API_URL}/api/shelter/meetings/eligible-owners`, {
          withCredentials: true,
        }),
        axios.get(`${API_URL}/api/shelter/applications`, {
          withCredentials: true,
        }),
      ]);

      if (meetingsRes.data.success) setMeetings(meetingsRes.data.meetings);
      if (ownersRes.data.success) setEligibleOwners(ownersRes.data.owners);
      if (applicationsRes.data.success) {
        const flatApplications = applicationsRes.data.data.flatMap((group) =>
          group.applications.map((app) => ({
            ...app,
            petName: group.pet.name,
            ownerName:
              app.applicationData?.fullName || app.ownerId?.email || "Unknown",
          }))
        );
        setApplications(flatApplications);
      }
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
          applicationId: selectedApplicationId,
          scheduledAt,
          durationMinutes: formData.durationMinutes,
          meetingLink: formData.meetingLink,
          meetingPlatform: formData.meetingPlatform,
          notes: formData.notes,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        setToast({
          type: "success",
          title: "Meeting Scheduled",
          message: "Meeting has been scheduled successfully",
        });
        setMeetings([res.data.meeting, ...meetings]);
        setShowAddModal(false);
        setSelectedApplicationId("");
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
      setToast({
        type: "error",
        title: "Meeting Failed",
        message: err.response?.data?.message || "Failed to create meeting",
      });
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
        setToast({
          type: "success",
          title: "Meeting Updated",
          message: "Meeting details updated successfully",
        });

        setShowEditModal(false);
        setSelectedMeeting(null);
      }
    } catch (err) {
      setToast({
        type: "error",
        title: "Update Failed",
        message: err.response?.data?.message || "Failed to update meeting",
      });
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
      setToast({
        type: "error",
        title: "Confirmation Failed",
        message: "Owner name does not match. Please type the correct name.",
      });
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
      setToast({
        type: "error",
        title: "Cancellation Failed",
        message: err.response?.data?.message || "Failed to cancel meeting",
      });
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
      setToast({
        type: "error",
        title: "Action Failed",
        message: err.response?.data?.message || "Unable to complete meeting",
      });
    }
  };

  const handleDeleteMeeting = async () => {
    try {
      const res = await axios.delete(
        `${API_URL}/api/shelter/meetings/${meetingToDelete._id}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        setMeetings(meetings.filter((m) => m._id !== meetingToDelete._id));
        setToast({
          type: "success",
          title: "Meeting Deleted",
          message: "Meeting removed successfully",
        });
      }
    } catch (err) {
      setToast({
        type: "error",
        title: "Delete Failed",
        message: err.response?.data?.message || "Unable to delete meeting",
      });
    } finally {
      setShowDeleteModal(false);
      setMeetingToDelete(null);
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
              meetings
                .filter((meeting) => meeting.status !== "open")
                .map((meeting) => {
                  const canInteract = canJoinOrComplete(meeting.scheduledAt);

                  return (
                    <div
                      key={meeting._id}
                      className={`relative rounded-2xl border bg-gradient-to-br from-[#31323e] to-[#2a2c38] p-6 shadow-lg transition-all hover:shadow-xl ${
                        meeting.status === "scheduled"
                          ? "border-emerald-500/30"
                          : meeting.status === "cancelled"
                          ? "border-red-500/30"
                          : "border-[#4a5568]/30"
                      }`}
                    >
                      <div
                        className={`absolute left-0 top-6 h-10 w-1 rounded-r-full ${
                          meeting.status === "scheduled"
                            ? "bg-emerald-400"
                            : meeting.status === "cancelled"
                            ? "bg-red-400"
                            : "bg-gray-400"
                        }`}
                      />

                      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-3">
                            <h3 className="text-2xl font-bold text-white">
                              {meeting.ownerName}
                            </h3>

                            <span
                              className={`rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wide ${getStatusBadge(
                                meeting.status
                              )}`}
                            >
                              {meeting.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[#bfc0d1]">
                            <div className="flex items-center gap-2">
                              <Calendar size={16} className="text-[#4a5568]" />
                              {new Date(
                                meeting.scheduledAt
                              ).toLocaleDateString()}
                            </div>

                            <div className="flex items-center gap-2">
                              <Clock size={16} className="text-[#4a5568]" />
                              {new Date(
                                meeting.scheduledAt
                              ).toLocaleTimeString()}{" "}
                              · {meeting.durationMinutes} min
                            </div>

                            {meeting.meetingPlatform && (
                              <div className="flex items-center gap-2">
                                <Video size={16} className="text-[#4a5568]" />
                                {meeting.meetingPlatform}
                              </div>
                            )}
                          </div>

                          {meeting.notes && (
                            <div className="rounded-xl bg-black/20 p-4 text-sm text-[#bfc0d1]">
                              {meeting.notes}
                            </div>
                          )}

                          {meeting.status === "cancelled" && (
                            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                              <p className="text-red-400 font-semibold text-sm">
                                Cancelled by {meeting.cancelledBy}
                              </p>
                              <p className="text-red-400/80 text-sm mt-1">
                                {meeting.cancellationReason}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          {meeting.status === "scheduled" && (
                            <button
                              onClick={() =>
                                meeting.meetingLink &&
                                canJoinOrComplete(meeting.scheduledAt) &&
                                window.open(meeting.meetingLink, "_blank")
                              }
                              disabled={!canJoinOrComplete(meeting.scheduledAt)}
                              className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
                                canJoinOrComplete(meeting.scheduledAt)
                                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                                  : "bg-gray-600/30 text-gray-400 cursor-not-allowed"
                              }`}
                            >
                              <Video size={18} />
                              Join Meeting
                            </button>
                          )}

                          {meeting.status === "scheduled" && (
                            <button
                              onClick={() => handleMarkComplete(meeting._id)}
                              disabled={!canJoinOrComplete(meeting.scheduledAt)}
                              className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
                                canJoinOrComplete(meeting.scheduledAt)
                                  ? "bg-blue-500 text-white hover:bg-blue-600"
                                  : "bg-gray-600/30 text-gray-400 cursor-not-allowed"
                              }`}
                            >
                              <CheckCircle2 size={18} />
                              Mark Complete
                            </button>
                          )}

                          {meeting.status !== "completed" &&
                            meeting.status !== "cancelled" && (
                              <>
                                <button
                                  onClick={() => openEditModal(meeting)}
                                  className="rounded-xl bg-[#4a5568]/20 p-3 text-[#bfc0d1] hover:bg-[#4a5568]/30"
                                  title="Edit"
                                >
                                  <Edit size={18} />
                                </button>

                                <button
                                  onClick={() => openCancelModal(meeting)}
                                  className="rounded-xl bg-red-500/20 p-3 text-red-400 hover:bg-red-500/30"
                                  title="Cancel"
                                >
                                  <AlertTriangle size={18} />
                                </button>
                              </>
                            )}

                          <button
                            onClick={() => {
                              setMeetingToDelete(meeting);
                              setShowDeleteModal(true);
                            }}
                            className="rounded-xl bg-red-500/20 p-3 text-red-400 hover:bg-red-500/30"
                            title="Delete"
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

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="flex min-h-screen items-start justify-center px-4 py-10">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#4a5568]/20 bg-[#31323e] p-6 md:p-8 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  Schedule New Meeting
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="rounded-lg p-2 text-[#bfc0d1] transition-all hover:bg-white/10"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddMeeting} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-white">
                    Select Application
                  </label>
                  <select
                    value={selectedApplicationId}
                    onChange={(e) => {
                      const appId = e.target.value;
                      setSelectedApplicationId(appId);

                      const selectedApp = applications.find(
                        (app) => app._id === appId
                      );

                      if (selectedApp) {
                        setFormData((prev) => ({
                          ...prev,
                          ownerId:
                            selectedApp.ownerId?._id || selectedApp.ownerId,
                        }));
                      }
                    }}
                    required
                    className="w-full rounded-lg border border-[#4a5568]/20 bg-[#1e202c] px-4 py-3 text-white focus:border-[#4a5568] focus:outline-none"
                  >
                    <option value="">-- Select an application --</option>
                    {applications
                      .filter((app) =>
                        [
                          "submitted",
                          "withdrawn",
                          "review",
                          "video-verification-scheduled",
                        ].includes(app.status)
                      )
                      .map((app) => (
                        <option key={app._id} value={app._id}>
                          {app._id.slice(-6)} |{" "}
                          {new Date(app.createdAt).toLocaleDateString()} | Pet:{" "}
                          {app.petName} | Owner: {app.ownerName} | Status:{" "}
                          {app.status}
                        </option>
                      ))}
                  </select>
                </div>

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
                    disabled={!selectedApplicationId}
                    className="w-full rounded-lg border border-[#4a5568]/20 bg-[#1e202c] px-4 py-3 text-white focus:border-[#4a5568] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">-- Select an owner --</option>
                    {eligibleOwners.map((owner) => (
                      <option key={owner.ownerId} value={owner.ownerId}>
                        {owner.name} ({owner.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      setFormData({
                        ...formData,
                        meetingLink: e.target.value,
                      })
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

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-[#4a5568] py-3 font-semibold text-white transition-all hover:bg-[#5a6678]"
                  >
                    Schedule Meeting
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="flex-1 rounded-lg bg-[#1e202c] py-3 font-semibold text-[#bfc0d1] transition-all hover:bg-[#1e202c]/80"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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

      {showDeleteModal && meetingToDelete && (
        <ConfirmationDialog
          isOpen={showDeleteModal}
          title="Delete Meeting"
          message="This action cannot be undone. Are you sure you want to delete this meeting?"
          confirmText="Delete"
          cancelText="Cancel"
          type="error"
          onConfirm={handleDeleteMeeting}
          onClose={() => {
            setShowDeleteModal(false);
            setMeetingToDelete(null);
          }}
        />
      )}

      {toast && (
        <ShelterToast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ShelterMeetings;
