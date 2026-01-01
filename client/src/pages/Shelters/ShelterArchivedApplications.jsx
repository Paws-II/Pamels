import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Heart,
  User,
  Calendar,
  AlertCircle,
  FileText,
  Eye,
} from "lucide-react";
import NavbarShelter from "../../components/Shelters/NavbarShelter";
import NotificationBell from "../../Common/NotificationBell";
import FullPageLoader from "../../Common/FullPageLoader";
import FullPageError from "../../Common/FullPageError";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const ShelterArchivedApplications = () => {
  const navigate = useNavigate();
  const [archivedApplications, setArchivedApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchArchivedApplications();
  }, []);

  const fetchArchivedApplications = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_URL}/api/shelter/applications/archived`,
        {
          withCredentials: true,
        }
      );

      if (res.data.success) {
        setArchivedApplications(res.data.data);
      }
    } catch (err) {
      console.error("Fetch archived applications error:", err);
      setError("Failed to load archived applications");
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <FullPageLoader
        title="Loading Archived Applications..."
        subtitle="Fetching archived records"
      />
    );
  }

  if (error)
    return (
      <FullPageError message={error} onRetry={fetchArchivedApplications} />
    );

  return (
    <div className="min-h-screen bg-[#1e202c] flex">
      <NavbarShelter onLogout={handleLogout} />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl p-4 md:p-6 lg:p-8">
          {/* Header */}
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
              Archived Applications
            </h1>
            <p className="text-sm text-[#bfc0d1]">
              View all rejected and archived adoption applications
            </p>
          </div>

          {archivedApplications.length === 0 ? (
            <div className="rounded-2xl border border-[#4a5568]/20 bg-[#31323e] p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#4a5568]/20">
                <FileText size={28} className="text-[#bfc0d1]" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">
                No Archived Applications
              </h3>
              <p className="text-sm text-[#bfc0d1]">
                Archived applications will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {archivedApplications.map((app) => {
                const displayImage =
                  app.petId?.coverImage || app.petId?.images?.[0] || "";

                return (
                  <div
                    key={app._id}
                    className="group rounded-2xl border border-[#4a5568]/20 bg-[#31323e] p-6 transition-all hover:border-[#4a5568]/40 hover:shadow-lg"
                  >
                    <div className="flex items-start gap-6">
                      {/* Pet Image */}
                      <div className="h-24 w-24 flex-shrink-0 rounded-xl overflow-hidden bg-[#1e202c]">
                        {displayImage ? (
                          <img
                            src={displayImage}
                            alt={app.petId?.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Heart size={32} className="text-[#4a5568]" />
                          </div>
                        )}
                      </div>

                      {/* Application Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-white mb-1">
                              {app.petId?.name || "Unknown Pet"}
                            </h3>
                            <p className="text-sm text-[#bfc0d1]">
                              {app.petId?.species} • {app.petId?.breed}
                            </p>
                          </div>
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-400">
                            <AlertCircle size={14} />
                            Archived
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <User size={16} className="text-[#4a5568]" />
                            <span className="text-[#bfc0d1]">
                              {app.applicationData?.fullName || "Unknown"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar size={16} className="text-[#4a5568]" />
                            <span className="text-[#bfc0d1]">
                              Rejected: {formatDate(app.rejectedAt)}
                            </span>
                          </div>
                        </div>

                        {app.rejectionReason && (
                          <div className="mb-4 rounded-lg bg-[#1e202c]/50 p-3">
                            <p className="text-xs text-[#bfc0d1]/60 mb-1">
                              Rejection Reason
                            </p>
                            <p className="text-sm text-white">
                              {app.rejectionReason}
                            </p>
                          </div>
                        )}

                        <button
                          onClick={() =>
                            navigate(`/shelter/applications-shelter/${app._id}`)
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-[#4a5568]/30 bg-[#1e202c]/50 px-4 py-2 text-sm font-semibold text-[#bfc0d1] transition-all hover:bg-[#1e202c] hover:text-white active:scale-95"
                        >
                          <Eye size={16} />
                          View Details
                        </button>
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

export default ShelterArchivedApplications;
