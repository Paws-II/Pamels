import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FileText,
  Eye,
  Calendar,
  Heart,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import Navbar from "../../components/Owners/NavbarOwner";
import NotificationBell from "../../Common/NotificationBell";
import FullPageLoader from "../../Common/FullPageLoader";
import FullPageError from "../../Common/FullPageError";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const OwnerArchivedApplications = () => {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchArchivedApplications();
  }, []);

  const fetchArchivedApplications = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/owner/adoption/archived`, {
        withCredentials: true,
      });

      if (res.data.success) {
        setApplications(res.data.data);
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
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleViewApplication = (app) => {
    navigate(`/applications-owner/archived/${app._id}`);
  };

  if (loading) {
    return (
      <FullPageLoader
        title="Loading Archived Applications..."
        subtitle="Fetching your archived applications"
      />
    );
  }

  if (error)
    return (
      <FullPageError message={error} onRetry={fetchArchivedApplications} />
    );

  return (
    <div className="min-h-screen bg-[#1e202c] flex">
      <Navbar onLogout={handleLogout} />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
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
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
              Archived Applications
            </h1>
            <p className="text-sm text-[#bfc0d1]">
              View your rejected and archived adoption applications
            </p>
          </div>

          {applications.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-[#60519b]/20 bg-[#31323e]">
              <FileText size={48} className="mx-auto mb-4 text-[#60519b]" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No Archived Applications
              </h3>
              <p className="text-sm text-[#bfc0d1] mb-6">
                You don't have any archived applications yet
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {applications.map((app) => {
                const pet = app.petId;
                const displayImage = pet.coverImage || pet.images?.[0] || "";

                return (
                  <div
                    key={app._id}
                    className="rounded-2xl border border-red-500/20 bg-[#31323e] p-6 transition-all hover:border-red-500/40"
                  >
                    <div className="flex items-start gap-6">
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

                          <div className="flex items-center gap-2 rounded-lg px-3 py-1.5 bg-red-500/20">
                            <AlertCircle size={16} className="text-red-400" />
                            <span className="text-xs font-semibold text-red-400">
                              Archived
                            </span>
                          </div>
                        </div>

                        {app.rejectionReason && (
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

                        <div className="flex items-center gap-6 text-xs text-[#bfc0d1]/60 mb-4">
                          <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            <span>Rejected {formatDate(app.rejectedAt)}</span>
                          </div>
                        </div>

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
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OwnerArchivedApplications;
