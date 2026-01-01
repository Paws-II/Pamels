import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Home,
  Heart,
  CheckCircle,
  XCircle,
  Eye,
  Users,
  Clock,
  Award,
  AlertCircle,
  MessageSquare,
  Video,
  X,
} from "lucide-react";
import NavbarShelter from "../../components/Shelters/NavbarShelter";
import NotificationBell from "../../Common/NotificationBell";
import FullPageLoader from "../../Common/FullPageLoader";
import FullPageError from "../../Common/FullPageError";
import ShelterToast from "../../Common/ShelterToast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const REJECTION_REASONS = [
  "Incomplete or inaccurate application",
  "Living situation not suitable for this pet",
  "Pet already matched with another applicant",
  "Experience level not sufficient",
  "Shelter policy constraints",
  "Other",
];

const ShelterApplicationDetail = () => {
  const navigate = useNavigate();
  const { applicationId } = useParams();

  const [application, setApplication] = useState(null);
  const [pet, setPet] = useState(null);
  const [ownerProfile, setOwnerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);
  const [creatingMeeting, setCreatingMeeting] = useState(false);
  const [chatRoomStatus, setChatRoomStatus] = useState(null);
  const [meetingRoomStatus, setMeetingRoomStatus] = useState(null);
  const [closingChat, setClosingChat] = useState(false);
  const [closingMeeting, setClosingMeeting] = useState(false);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchApplicationDetails();
  }, [applicationId]);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_URL}/api/shelter/applications/${applicationId}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        setApplication(res.data.data.application);
        setPet(res.data.data.application.petId);
        setOwnerProfile(res.data.data.ownerProfile);

        await fetchRoomStatuses(res.data.data.application);
      }
    } catch (err) {
      console.error("Fetch application error:", err);
      setError("Failed to load application details");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomStatuses = async (appData) => {
    try {
      const chatRes = await axios
        .get(`${API_URL}/api/shelter/applications/${appData._id}/chat/status`, {
          withCredentials: true,
        })
        .catch(() => ({ data: { success: false } }));

      if (chatRes.data.success && chatRes.data.data) {
        setChatRoomStatus(chatRes.data.data.status);
      }

      const meetingRes = await axios
        .get(
          `${API_URL}/api/shelter/applications/${appData._id}/meeting/status`,
          { withCredentials: true }
        )
        .catch(() => ({ data: { success: false } }));

      if (meetingRes.data.success && meetingRes.data.data) {
        setMeetingRoomStatus(meetingRes.data.data.status);
      }
    } catch (err) {
      console.error("Fetch room statuses error:", err);
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

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleMoveToReview = async () => {
    if (processing) return;

    try {
      setProcessing(true);
      const res = await axios.patch(
        `${API_URL}/api/shelter/applications/${applicationId}/review`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        showToast(
          "success",
          "Application Under Review",
          "Application has been moved to review status"
        );
        setApplication((prev) => ({ ...prev, status: "review" }));
      }
    } catch (err) {
      console.error("Move to review error:", err);
      showToast(
        "error",
        "Error",
        err.response?.data?.message || "Failed to update application"
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectClick = () => {
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (processing) return;

    const finalReason =
      selectedReason === "Other" ? customReason.trim() : selectedReason;

    if (!finalReason) {
      showToast(
        "error",
        "Validation Error",
        "Please select or enter a rejection reason"
      );
      return;
    }

    try {
      setProcessing(true);
      const res = await axios.patch(
        `${API_URL}/api/shelter/applications/${applicationId}/reject-status`,
        { rejectionReason: finalReason },
        { withCredentials: true }
      );

      if (res.data.success) {
        showToast(
          "success",
          "Application Rejected",
          "The applicant has been notified"
        );

        setTimeout(() => {
          navigate("/applications-shelter");
        }, 2000);
      }
    } catch (err) {
      console.error("Reject application error:", err);
      showToast(
        "error",
        "Error",
        err.response?.data?.message || "Failed to reject application"
      );
      setProcessing(false);
    }
  };

  const handleCreateChat = async () => {
    if (creatingChat || processing) return;

    try {
      setCreatingChat(true);
      const res = await axios.post(
        `${API_URL}/api/shelter/applications/${applicationId}/chat`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        const action = res.data.action;
        setChatRoomStatus(res.data.data.status);

        showToast(
          "success",
          action === "reopened"
            ? "Chat Room Reopened"
            : "Chat Connection Created",
          action === "reopened"
            ? "The chat room has been reopened"
            : action === "already_exists"
            ? "Chat connection already exists"
            : "The applicant has been notified"
        );
      }
    } catch (err) {
      console.error("Create chat error:", err);
      showToast(
        "error",
        "Error",
        err.response?.data?.message || "Failed to create chat connection"
      );
    } finally {
      setCreatingChat(false);
    }
  };

  const handleCreateMeeting = async () => {
    if (creatingMeeting || processing) return;

    try {
      setCreatingMeeting(true);
      const res = await axios.post(
        `${API_URL}/api/shelter/applications/${applicationId}/meeting`,
        {},
        { withCredentials: true }
      );
      if (res.data.success) {
        const action = res.data.action;
        setMeetingRoomStatus(res.data.data.status);

        showToast(
          "success",
          action === "reopened"
            ? "Meeting Room Reopened"
            : "Meeting Connection Created",
          action === "reopened"
            ? "The meeting room has been reopened"
            : action === "already_exists"
            ? "Meeting connection already exists"
            : "The applicant has been notified"
        );
      }
    } catch (err) {
      console.error("Create meeting error:", err);
      showToast(
        "error",
        "Error",
        err.response?.data?.message || "Failed to create meeting connection"
      );
    } finally {
      setCreatingMeeting(false);
    }
  };

  const handleCloseChat = async () => {
    if (closingChat || processing) return;

    try {
      setClosingChat(true);
      const res = await axios.patch(
        `${API_URL}/api/shelter/applications/${applicationId}/chat/close`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        setChatRoomStatus("closed");
        showToast(
          "success",
          "Chat Room Closed",
          "The chat room has been closed"
        );
      }
    } catch (err) {
      console.error("Close chat error:", err);
      showToast(
        "error",
        "Error",
        err.response?.data?.message || "Failed to close chat room"
      );
    } finally {
      setClosingChat(false);
    }
  };

  const handleCloseMeeting = async () => {
    if (closingMeeting || processing) return;

    try {
      setClosingMeeting(true);
      const res = await axios.patch(
        `${API_URL}/api/shelter/applications/${applicationId}/meeting/close`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        setMeetingRoomStatus("closed");
        showToast(
          "success",
          "Meeting Room Closed",
          "The meeting room has been closed"
        );
      }
    } catch (err) {
      console.error("Close meeting error:", err);
      showToast(
        "error",
        "Error",
        err.response?.data?.message || "Failed to close meeting room"
      );
    } finally {
      setClosingMeeting(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <FullPageLoader
        title="Loading Application..."
        subtitle="Fetching application details"
      />
    );
  }

  if (error)
    return <FullPageError message={error} onRetry={fetchApplicationDetails} />;

  if (!application || !pet) {
    return <FullPageError message="Application not found" />;
  }

  const appData = application.applicationData;
  const displayImage = pet.coverImage || pet.images?.[0] || "";

  return (
    <div className="min-h-screen bg-[#1e202c] flex">
      <NavbarShelter onLogout={handleLogout} />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl p-4 md:p-6 lg:p-8">
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => navigate("/applications-shelter")}
              className="flex items-center gap-2 text-[#bfc0d1] hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back to Applications</span>
            </button>
            <NotificationBell />
          </div>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
              Application Details
            </h1>
            <p className="text-sm text-[#bfc0d1]">
              Review this adoption application carefully
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border border-[#4a5568]/20 bg-[#31323e] p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Heart size={20} className="text-[#4a5568]" />
                  Pet Information
                </h2>

                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-xl overflow-hidden bg-[#1e202c]">
                    {displayImage ? (
                      <img
                        src={displayImage}
                        alt={pet.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Heart size={28} className="text-[#4a5568]" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {pet.name}
                    </h3>
                    <p className="text-sm text-[#bfc0d1]">
                      {pet.species} • {pet.breed}
                    </p>
                    <p className="text-xs text-[#bfc0d1]/60 mt-1">
                      {pet.age} {pet.ageUnit} • {pet.gender}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#4a5568]/20 bg-[#31323e] p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <User size={20} className="text-[#4a5568]" />
                  Applicant Information
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <User size={18} className="mt-0.5 text-[#4a5568]" />
                    <div>
                      <p className="mb-1 text-xs text-[#bfc0d1]/60">
                        Full Name
                      </p>
                      <p className="text-sm text-white font-medium">
                        {appData.fullName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail size={18} className="mt-0.5 text-[#4a5568]" />
                    <div>
                      <p className="mb-1 text-xs text-[#bfc0d1]/60">Email</p>
                      <p className="text-sm text-white font-medium">
                        {appData.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone size={18} className="mt-0.5 text-[#4a5568]" />
                    <div>
                      <p className="mb-1 text-xs text-[#bfc0d1]/60">Phone</p>
                      <p className="text-sm text-white font-medium">
                        {appData.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="mt-0.5 text-[#4a5568]" />
                    <div>
                      <p className="mb-1 text-xs text-[#bfc0d1]/60">Address</p>
                      <p className="text-sm text-white font-medium">
                        {appData.address}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#4a5568]/20 bg-[#31323e] p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Home size={20} className="text-[#4a5568]" />
                  Living Situation
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-1 text-xs text-[#bfc0d1]/60">
                      Residence Type
                    </p>
                    <p className="text-sm text-white font-medium capitalize">
                      {appData.residenceType}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 text-xs text-[#bfc0d1]/60">
                      Own or Rent
                    </p>
                    <p className="text-sm text-white font-medium capitalize">
                      {appData.ownOrRent}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 text-xs text-[#bfc0d1]/60">
                      Pets Allowed
                    </p>
                    <p className="text-sm text-white font-medium capitalize">
                      {appData.petAllowed}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 text-xs text-[#bfc0d1]/60">
                      Number of People
                    </p>
                    <p className="text-sm text-white font-medium">
                      {appData.numberOfPeople}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#4a5568]/20 bg-[#31323e] p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Users size={20} className="text-[#4a5568]" />
                  Household Composition
                </h2>

                <div className="space-y-4">
                  <div>
                    <p className="mb-1 text-xs text-[#bfc0d1]/60">
                      Has Children
                    </p>
                    <p className="text-sm text-white font-medium">
                      {appData.hasChildren ? "Yes" : "No"}
                    </p>
                    {appData.hasChildren && appData.childrenAgeRange && (
                      <p className="text-xs text-[#bfc0d1]/80 mt-1">
                        Age Range: {appData.childrenAgeRange}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="mb-1 text-xs text-[#bfc0d1]/60">
                      Has Other Pets
                    </p>
                    <p className="text-sm text-white font-medium">
                      {appData.hasOtherPets ? "Yes" : "No"}
                    </p>
                    {appData.hasOtherPets && appData.otherPetsDetails && (
                      <p className="text-xs text-[#bfc0d1]/80 mt-1">
                        {appData.otherPetsDetails}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#4a5568]/20 bg-[#31323e] p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Award size={20} className="text-[#4a5568]" />
                  Experience & Commitment
                </h2>

                <div className="space-y-4">
                  <div>
                    <p className="mb-1 text-xs text-[#bfc0d1]/60">
                      Owned Pets Before
                    </p>
                    <p className="text-sm text-white font-medium">
                      {appData.ownedPetsBefore ? "Yes" : "No"}
                    </p>
                    {appData.ownedPetsBefore && appData.previousPetTypes && (
                      <p className="text-xs text-[#bfc0d1]/80 mt-1">
                        {appData.previousPetTypes}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 text-xs text-[#bfc0d1]/60">
                        Experience Level
                      </p>
                      <p className="text-sm text-white font-medium capitalize">
                        {appData.experienceLevel}
                      </p>
                    </div>

                    <div>
                      <p className="mb-1 text-xs text-[#bfc0d1]/60">
                        Available Hours/Day
                      </p>
                      <p className="text-sm text-white font-medium">
                        {appData.hoursPerDay.replace(/_/g, " ")}
                      </p>
                    </div>

                    <div>
                      <p className="mb-1 text-xs text-[#bfc0d1]/60">
                        Primary Caretaker
                      </p>
                      <p className="text-sm text-white font-medium capitalize">
                        {appData.primaryCaretaker}
                      </p>
                    </div>

                    <div>
                      <p className="mb-1 text-xs text-[#bfc0d1]/60">
                        Can Afford Care
                      </p>
                      <p className="text-sm text-white font-medium">
                        {appData.canAffordCare ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#4a5568]/20 bg-[#31323e] p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Heart size={20} className="text-[#4a5568]" />
                  Adoption Details
                </h2>

                <div className="space-y-4">
                  <div>
                    <p className="mb-1 text-xs text-[#bfc0d1]/60">
                      Reason for Adoption
                    </p>
                    <p className="text-sm text-white leading-relaxed">
                      {appData.adoptionReason}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 text-xs text-[#bfc0d1]/60">
                      Adoption Purpose
                    </p>
                    <p className="text-sm text-white font-medium capitalize">
                      {appData.adoptionPurpose.replace(/_/g, " ")}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 text-xs text-[#bfc0d1]/60">
                      Relocation Plan
                    </p>
                    <p className="text-sm text-white leading-relaxed">
                      {appData.relocatePlan}
                    </p>
                  </div>

                  {appData.additionalNotes && (
                    <div>
                      <p className="mb-1 text-xs text-[#bfc0d1]/60">
                        Additional Notes
                      </p>
                      <p className="text-sm text-white leading-relaxed">
                        {appData.additionalNotes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-[#4a5568]/20 bg-[#31323e] p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  Application Status
                </h3>

                <div className="space-y-4">
                  <div className="rounded-lg bg-[#1e202c]/50 p-3">
                    <p className="text-xs text-[#bfc0d1]/60 mb-1">
                      Current Status
                    </p>
                    <p
                      className={`text-sm font-semibold capitalize ${
                        application.status === "submitted"
                          ? "text-blue-400"
                          : application.status === "review"
                          ? "text-yellow-400"
                          : application.status === "approved"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {application.status}
                    </p>
                  </div>

                  <div className="rounded-lg bg-[#1e202c]/50 p-3">
                    <p className="text-xs text-[#bfc0d1]/60 mb-1">Submitted</p>
                    <p className="text-sm text-white font-medium">
                      {formatDate(application.submittedAt)}
                    </p>
                  </div>

                  {application.reviewedAt && (
                    <div className="rounded-lg bg-[#1e202c]/50 p-3">
                      <p className="text-xs text-[#bfc0d1]/60 mb-1">
                        Last Updated
                      </p>
                      <p className="text-sm text-white font-medium">
                        {formatDate(application.reviewedAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-[#4a5568]/20 bg-[#31323e] p-6">
                <h3 className="text-lg font-bold text-white mb-4">Actions</h3>

                <div className="space-y-3">
                  {application.status === "submitted" && (
                    <button
                      onClick={handleMoveToReview}
                      disabled={processing}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#4a5568] px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-[#5a6678] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                      <Eye size={16} />
                      Move to Review
                    </button>
                  )}

                  {chatRoomStatus === "open" ? (
                    <button
                      disabled
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-500/10 border-2 border-blue-500/20 px-4 py-3 text-sm font-semibold text-blue-400/50 cursor-not-allowed"
                    >
                      <MessageSquare size={16} />
                      Chat Room Created
                    </button>
                  ) : (
                    <button
                      onClick={handleCreateChat}
                      disabled={
                        creatingChat ||
                        processing ||
                        chatRoomStatus === "blocked"
                      }
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-500/20 border-2 border-blue-500/30 px-4 py-3 text-sm font-semibold text-blue-400 transition-all hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                      <MessageSquare size={16} />
                      {creatingChat
                        ? "Creating..."
                        : chatRoomStatus === "closed"
                        ? "Reopen Chat Room"
                        : "Create Chat Connection"}
                    </button>
                  )}

                  {meetingRoomStatus === "open" ? (
                    <button
                      disabled
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-500/10 border-2 border-green-500/20 px-4 py-3 text-sm font-semibold text-green-400/50 cursor-not-allowed"
                    >
                      <Video size={16} />
                      Meeting Room Created
                    </button>
                  ) : (
                    <button
                      onClick={handleCreateMeeting}
                      disabled={
                        creatingMeeting ||
                        processing ||
                        meetingRoomStatus === "blocked"
                      }
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-500/20 border-2 border-green-500/30 px-4 py-3 text-sm font-semibold text-green-400 transition-all hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                      <Video size={16} />
                      {creatingMeeting
                        ? "Creating..."
                        : meetingRoomStatus === "closed"
                        ? "Reopen Meeting Room"
                        : "Create Meeting Connection"}
                    </button>
                  )}

                  {application.status === "rejected" &&
                    chatRoomStatus === "open" && (
                      <button
                        onClick={handleCloseChat}
                        disabled={closingChat || processing}
                        className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm font-semibold text-orange-400 transition-all hover:bg-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                      >
                        <X size={16} />
                        {closingChat ? "Closing..." : "Close Chat Room"}
                      </button>
                    )}

                  {application.status === "rejected" &&
                    meetingRoomStatus === "open" && (
                      <button
                        onClick={handleCloseMeeting}
                        disabled={closingMeeting || processing}
                        className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm font-semibold text-orange-400 transition-all hover:bg-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                      >
                        <X size={16} />
                        {closingMeeting ? "Closing..." : "Close Meeting Room"}
                      </button>
                    )}

                  {(application.status === "submitted" ||
                    application.status === "review") && (
                    <button
                      onClick={handleRejectClick}
                      disabled={processing}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400 transition-all hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                      <XCircle size={16} />
                      Reject Application
                    </button>
                  )}
                </div>
              </div>

              {ownerProfile && (
                <div className="rounded-2xl border border-[#4a5568]/20 bg-[#31323e] p-6">
                  <h3 className="text-lg font-bold text-white mb-4">
                    Owner Profile
                  </h3>

                  <div className="space-y-3">
                    {ownerProfile.name && (
                      <div>
                        <p className="text-xs text-[#bfc0d1]/60 mb-1">Name</p>
                        <p className="text-sm text-white font-medium">
                          {ownerProfile.name}
                        </p>
                      </div>
                    )}

                    {ownerProfile.phone && (
                      <div>
                        <p className="text-xs text-[#bfc0d1]/60 mb-1">Phone</p>
                        <p className="text-sm text-white font-medium">
                          {ownerProfile.phone}
                        </p>
                      </div>
                    )}

                    {ownerProfile.address && (
                      <div>
                        <p className="text-xs text-[#bfc0d1]/60 mb-1">
                          Address
                        </p>
                        <p className="text-sm text-white font-medium">
                          {ownerProfile.address}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {showRejectModal && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => !processing && setShowRejectModal(false)}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-2xl border border-red-500/30 bg-[#31323e] shadow-2xl">
              <div className="flex items-center justify-between border-b border-red-500/20 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-red-500/20 p-2">
                    <AlertCircle size={20} className="text-red-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Reject Application
                  </h3>
                </div>
                <button
                  onClick={() => !processing && setShowRejectModal(false)}
                  disabled={processing}
                  className="rounded-lg p-1.5 text-[#bfc0d1] transition-all hover:bg-white/10 hover:text-white disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="px-6 py-5 space-y-4">
                <p className="text-sm text-[#bfc0d1]">
                  Please select a reason for rejection. This will be shared with
                  the applicant.
                </p>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Rejection Reason *
                  </label>
                  <select
                    value={selectedReason}
                    onChange={(e) => {
                      setSelectedReason(e.target.value);
                      if (e.target.value !== "Other") {
                        setCustomReason("");
                      }
                    }}
                    disabled={processing}
                    className="w-full rounded-lg border border-[#4a5568]/30 bg-[#1e202c] px-4 py-3 text-sm text-white focus:border-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:opacity-50"
                  >
                    <option value="">Select a reason...</option>
                    {REJECTION_REASONS.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedReason === "Other" && (
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Please specify the reason *
                    </label>
                    <textarea
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      disabled={processing}
                      placeholder="Enter the specific reason for rejection..."
                      rows={4}
                      className="w-full rounded-lg border border-[#4a5568]/30 bg-[#1e202c] px-4 py-3 text-sm text-white placeholder-[#bfc0d1]/40 focus:border-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:opacity-50"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 border-t border-red-500/20 px-6 py-4">
                <button
                  onClick={() => setShowRejectModal(false)}
                  disabled={processing}
                  className="flex-1 rounded-xl border-2 border-[#4a5568]/30 bg-transparent px-4 py-2.5 text-sm font-semibold text-[#bfc0d1] transition-all hover:bg-white/5 disabled:opacity-50 active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectConfirm}
                  disabled={
                    processing ||
                    !selectedReason ||
                    (selectedReason === "Other" && !customReason.trim())
                  }
                  className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-600 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  {processing ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </div>
          </div>
        </>
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

export default ShelterApplicationDetail;
