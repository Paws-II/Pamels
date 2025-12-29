import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  AlertCircle,
  Heart,
} from "lucide-react";
import Navbar from "../../components/Owners/NavbarOwner";
import NotificationBell from "../../Common/NotificationBell";
import FullPageLoader from "../../Common/FullPageLoader";
import FullPageError from "../../Common/FullPageError";
import { useSocket } from "../../../hooks/useSocket";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const OwnerMyApplications = () => {
  const navigate = useNavigate();

  const { on } = useSocket();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchApplications();

    const unsubscribe = on("application:status:updated", (data) => {
      setApplications((prev) =>
        prev.map((app) =>
          app._id?.toString() === data.applicationId?.toString()
            ? {
                ...app,
                status: data.status,
                rejectionReason: data.rejectionReason,
              }
            : app
        )
      );
    });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_URL}/api/owner/adoption/my-applications`,
        { withCredentials: true }
      );

      if (res.data.success) {
        setApplications(res.data.data);
      }
    } catch (err) {
      console.error("Fetch applications error:", err);
      setError("Failed to load your applications");
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

  const getStatusBadge = (status) => {
    const badges = {
      submitted: {
        bg: "bg-blue-500/20",
        text: "text-blue-400",
        icon: Clock,
        label: "Pending Review",
      },
      review: {
        bg: "bg-yellow-500/20",
        text: "text-yellow-400",
        icon: FileText,
        label: "Under Review",
      },
      approved: {
        bg: "bg-green-500/20",
        text: "text-green-400",
        icon: CheckCircle,
        label: "Approved",
      },
      "application-rejected": {
        bg: "bg-red-500/20",
        text: "text-red-400",
        icon: XCircle,
        label: "Rejected",
      },
      withdrawn: {
        bg: "bg-gray-500/20",
        text: "text-gray-400",
        icon: XCircle,
        label: "Withdrawn",
      },
    };

    return badges[status] || badges.submitted;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleViewApplication = (app) => {
    navigate(`/applications-owner/application/${app._id}`);
  };

  const rejectedStatuses = ["rejected"];
  const filteredApplications = applications.filter((app) => {
    if (app.status === "rejected") return false;

    if (filterStatus === "all") return true;
    return app.status === filterStatus;
  });

  if (loading) {
    return (
      <FullPageLoader
        title="Loading Your Applications..."
        subtitle="Fetching your adoption applications"
      />
    );
  }

  if (error)
    return <FullPageError message={error} onRetry={fetchApplications} />;

  return (
    <div className="min-h-screen bg-[#1e202c] flex">
      <Navbar onLogout={handleLogout} />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                My Applications
              </h1>
              <p className="text-sm text-[#bfc0d1]">
                Track the status of your adoption applications
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/applications-owner/archived")}
                className="flex items-center gap-2 rounded-xl bg-[#31323e] border border-[#60519b]/20 px-4 py-2 text-sm font-semibold text-[#bfc0d1] transition-all hover:bg-[#3a3b47] hover:border-[#60519b]/40"
              >
                <FileText size={16} />
                Archived
              </button>
              <NotificationBell />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
            {[
              { value: "all", label: "All" },
              { value: "submitted", label: "Pending" },
              { value: "review", label: "Under Review" },
              { value: "approved", label: "Approved" },
              { value: "application-rejected", label: "Application Rejected" },
              { value: "video-verification-reject", label: "Video Rejected" },
              { value: "final-reject", label: "Final Rejected" },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterStatus(filter.value)}
                className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                  filterStatus === filter.value
                    ? "bg-[#60519b] text-white shadow-lg"
                    : "bg-[#31323e] text-[#bfc0d1] hover:bg-[#3a3b47]"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Applications List */}
          {filteredApplications.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-[#60519b]/20 bg-[#31323e]">
              <FileText size={48} className="mx-auto mb-4 text-[#60519b]" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No Applications Found
              </h3>
              <p className="text-sm text-[#bfc0d1] mb-6">
                {filterStatus === "all"
                  ? "You haven't submitted any applications yet"
                  : `No ${filterStatus} applications`}
              </p>
              <button
                onClick={() => navigate("/adopt-pet")}
                className="inline-flex items-center gap-2 rounded-xl bg-[#60519b] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#7d6ab8] hover:shadow-lg active:scale-95"
              >
                <Heart size={16} />
                Find a Pet to Adopt
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredApplications.map((app) => {
                const pet = app.petId;
                const statusBadge = getStatusBadge(app.status);
                const StatusIcon = statusBadge.icon;
                const displayImage = pet.coverImage || pet.images?.[0] || "";

                return (
                  <div
                    key={app._id}
                    className="rounded-2xl border border-[#60519b]/20 bg-[#31323e] p-6 transition-all hover:border-[#60519b]/40"
                  >
                    <div className="flex items-start gap-6">
                      {/* Pet Image */}
                      <div className="h-24 w-24 rounded-xl overflow-hidden bg-[#1e202c] shrink-0">
                        {displayImage ? (
                          <img
                            src={displayImage}
                            alt={pet.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Heart size={32} className="text-[#60519b]" />
                          </div>
                        )}
                      </div>

                      {/* Application Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-white mb-1">
                              {pet.name}
                            </h3>
                            <p className="text-sm text-[#bfc0d1]">
                              {pet.species} • {pet.breed}
                            </p>
                          </div>

                          <div
                            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 ${statusBadge.bg}`}
                          >
                            <StatusIcon
                              size={16}
                              className={statusBadge.text}
                            />
                            <span
                              className={`text-xs font-semibold ${statusBadge.text}`}
                            >
                              {statusBadge.label}
                            </span>
                          </div>
                        </div>

                        {/* Rejection Reason */}
                        {app.status === "application-rejected" &&
                          app.rejectionReason && (
                            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                              <div className="flex items-start gap-2">
                                <AlertCircle
                                  size={16}
                                  className="mt-0.5 shrink-0 text-red-400"
                                />
                                <div>
                                  <p className="mb-1 text-xs font-semibold text-red-400">
                                    Rejection Reason
                                  </p>
                                  <p className="text-sm leading-relaxed text-red-300">
                                    {app.rejectionReason}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                        {/* Application Details */}
                        <div className="flex items-center gap-6 text-xs text-[#bfc0d1]/60 mb-4">
                          <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            <span>
                              Applied{" "}
                              {formatDate(app.submittedAt || app.createdAt)}
                            </span>
                          </div>
                          {app.reviewedAt && (
                            <div className="flex items-center gap-1">
                              <Clock size={12} />
                              <span>Updated {formatDate(app.reviewedAt)}</span>
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
                        <div>
                          <button
                            onClick={() => handleViewApplication(app)}
                            className="flex items-center gap-2 rounded-lg bg-[#60519b]/20 px-4 py-2 text-sm font-semibold text-[#60519b] transition-all hover:bg-[#60519b]/30 active:scale-95"
                          >
                            <Eye size={16} />
                            View Details
                          </button>
                        </div>
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

export default OwnerMyApplications;
