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
} from "lucide-react";
import Navbar from "../../components/Owners/NavbarOwner";
import NotificationBell from "../../Common/NotificationBell";
import FullPageLoader from "../../Common/FullPageLoader";
import FullPageError from "../../Common/FullPageError";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const OwnerArchivedApplicationDetail = () => {
  const navigate = useNavigate();
  const { applicationId } = useParams();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchArchivedApplication();
  }, [applicationId]);

  const fetchArchivedApplication = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(`${API_URL}/api/owner/adoption/archived`, {
        withCredentials: true,
      });

      if (!res.data?.success) {
        setError("Failed to load archived application");
        return;
      }

      const app = res.data.data.find((a) => a._id === applicationId);

      if (!app) {
        setError("Archived application not found");
        return;
      }

      setApplication(app);
    } catch (err) {
      console.error("Fetch archived application error:", err);
      setError("Failed to load archived application details");
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
    return <FullPageError message={error} onRetry={fetchArchivedApplication} />;

  if (!application) {
    return <FullPageError message="Application not found" />;
  }

  const pet = application.petId;
  const displayImage = pet.coverImage || pet.images?.[0] || "";

  return (
    <div className="min-h-screen bg-[#1e202c] flex">
      <Navbar onLogout={handleLogout} />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl p-4 md:p-6 lg:p-8">
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => navigate("/applications-owner/archived")}
              className="flex items-center gap-2 text-[#bfc0d1] hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back to Archived</span>
            </button>
            <NotificationBell />
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Archived Application
              </h1>
              <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-400">
                Archived
              </span>
            </div>
            <p className="text-sm text-[#bfc0d1]">
              This application has been archived
            </p>
          </div>

          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-red-500/20 p-3">
                <AlertCircle size={24} className="text-red-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-red-400 mb-2">
                  Application Rejected & Archived
                </h2>
                <p className="text-sm text-red-300 mb-4 leading-relaxed">
                  This application was not approved. Here's the reason:
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
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#60519b]/20 bg-[#31323e] p-6">
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

              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-red-400" />
                <div>
                  <p className="text-sm text-white font-medium">
                    Application Archived
                  </p>
                  <p className="text-xs text-[#bfc0d1]/60">
                    {formatDate(application.rejectedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OwnerArchivedApplicationDetail;
