import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  AlertCircle,
  Heart,
  MapPin,
  Mail,
  Phone,
  Home,
  User,
  Users,
  Award,
  Calendar,
  XCircle,
} from "lucide-react";
import Navbar from "../../components/Owners/NavbarOwner";
import NotificationBell from "../../Common/NotificationBell";
import FullPageLoader from "../../Common/FullPageLoader";
import FullPageError from "../../Common/FullPageError";
import OwnerToast from "../../Common/OwnerToast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const OwnerApplicationDetail = () => {
  const navigate = useNavigate();
  const { applicationId } = useParams();

  const [application, setApplication] = useState(null);
  const [pet, setPet] = useState(null);
  const [shelter, setShelter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchApplicationDetail();
  }, [applicationId]);

  const fetchApplicationDetail = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        `${API_URL}/api/owner/adoption/application/${applicationId}`,
        { withCredentials: true }
      );

      if (!res.data?.success || !res.data?.data?.application) {
        setError("Application not found");
        return;
      }

      const { application, shelterProfile } = res.data.data;
      const petData =
        typeof application.petId === "object" ? application.petId : null;

      setApplication(application);
      setPet(petData || null);
      setShelter(shelterProfile || null);
    } catch (err) {
      console.error("Fetch application detail error:", err);
      setError("Failed to load application details");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleting) return;

    try {
      setDeleting(true);
      const res = await axios.delete(
        `${API_URL}/api/owner/adoption/application/${applicationId}/delete`,
        { withCredentials: true }
      );

      if (res.data.success) {
        showToast(
          "success",
          "Application Archived",
          "The application has been moved to archived applications"
        );

        setTimeout(() => {
          navigate("/applications-owner");
        }, 2000);
      }
    } catch (err) {
      console.error("Delete application error:", err);
      showToast(
        "error",
        "Error",
        err.response?.data?.message || "Failed to archive application"
      );
      setDeleting(false);
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      submitted: {
        bg: "bg-blue-500/20",
        text: "text-blue-400",
        label: "Pending Review",
      },
      review: {
        bg: "bg-yellow-500/20",
        text: "text-yellow-400",
        label: "Under Review",
      },
      "application-rejected": {
        bg: "bg-red-500/20",
        text: "text-red-400",
        label: "Rejected",
      },
      "video-verification-reject": {
        bg: "bg-orange-500/20",
        text: "text-orange-400",
        label: "Video Rejected",
      },
      "final-reject": {
        bg: "bg-red-600/20",
        text: "text-red-600",
        label: "Final Rejection",
      },
    };
    return badges[status] || badges.submitted;
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
    return <FullPageError message={error} onRetry={fetchApplicationDetail} />;

  if (!application || !pet) {
    return <FullPageError message="Application not found" />;
  }

  const appData = application.applicationData;
  const displayImage = pet.coverImage || pet.images?.[0] || "";
  const statusBadge = getStatusBadge(application.status);

  return (
    <div className="min-h-screen bg-[#1e202c] flex">
      <Navbar onLogout={handleLogout} />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl p-4 md:p-6 lg:p-8">
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => navigate("/applications-owner")}
              className="flex items-center gap-2 text-[#bfc0d1] hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back to My Applications</span>
            </button>
            <NotificationBell />
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Application Details
              </h1>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge.bg} ${statusBadge.text}`}
              >
                {statusBadge.label}
              </span>
            </div>
            <p className="text-sm text-[#bfc0d1]">
              View the details of your adoption application
            </p>
          </div>

          <div className="mt-2 space-y-1 text-xs text-[#bfc0d1]/70">
            <p>
              Application ID:{" "}
              <span className="font-mono text-[#9f8cff]">{applicationId}</span>
            </p>

            {application?.ownerId && (
              <p>
                Owner ID:{" "}
                <span className="font-mono text-[#9f8cff]">
                  {application.ownerId}
                </span>
              </p>
            )}

            {(pet?._id || application?.petId) && (
              <p>
                Pet ID:{" "}
                <span className="font-mono text-[#9f8cff]">
                  {pet?._id || application.petId}
                </span>
              </p>
            )}

            {(shelter?._id || application?.shelterId) && (
              <p>
                Shelter ID:{" "}
                <span className="font-mono text-[#9f8cff]">
                  {shelter?._id || application.shelterId}
                </span>
              </p>
            )}
          </div>

          {application.status === "application-rejected" && (
            <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-red-500/20 p-3">
                  <AlertCircle size={24} className="text-red-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-red-400 mb-2">
                    Application Rejected
                  </h2>
                  <p className="text-sm text-red-300 mb-4 leading-relaxed">
                    Unfortunately, your application was not approved. Here's the
                    reason:
                  </p>
                  <div className="rounded-lg bg-red-500/20 border border-red-500/30 p-4">
                    <p className="text-sm text-white leading-relaxed">
                      {application.rejectionReason ||
                        "No specific reason provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6 rounded-2xl border border-[#60519b]/20 bg-[#31323e] p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Heart size={20} className="text-[#60519b]" />
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
                    <Heart size={28} className="text-[#60519b]" />
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

          <div className="mb-6 rounded-2xl border border-[#60519b]/20 bg-[#31323e] p-6">
            <h2 className="text-lg font-bold text-white mb-4">
              Application Timeline
            </h2>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-400" />
                <div>
                  <p className="text-sm text-white font-medium">
                    Application Submitted
                  </p>
                  <p className="text-xs text-[#bfc0d1]/60">
                    {formatDate(application.submittedAt)}
                  </p>
                </div>
              </div>

              {application.reviewedAt &&
                application.status === "application-rejected" && (
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-red-400" />
                    <div>
                      <p className="text-sm text-white font-medium">
                        Application Rejected
                      </p>
                      <p className="text-xs text-[#bfc0d1]/60">
                        {formatDate(application.reviewedAt)}
                      </p>
                    </div>
                  </div>
                )}
            </div>
          </div>

          {application.status === "application-rejected" && (
            <div className="mb-6">
              <button
                onClick={() => {
                  if (
                    confirm(
                      "Are you sure you want to archive this application? It will be moved to archived applications."
                    )
                  ) {
                    handleDeleteConfirm();
                  }
                }}
                disabled={deleting}
                className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm font-semibold text-orange-400 transition-all hover:bg-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                <XCircle size={16} />
                {deleting ? "Archiving..." : "Archive Application"}
              </button>
            </div>
          )}
        </div>
      </main>

      {toast && (
        <OwnerToast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default OwnerApplicationDetail;
