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

const RejectedApplicationDetail = () => {
  const navigate = useNavigate();
  const { applicationId } = useParams();

  const [application, setApplication] = useState(null);
  const [pet, setPet] = useState(null);
  const [shelter, setShelter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRejectedApplication();
  }, [applicationId]);

  const fetchRejectedApplication = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        `${API_URL}/api/owner/adoption/archived/${applicationId}`,
        { withCredentials: true }
      );

      if (!res.data?.success || !res.data?.data?.application) {
        setError("Archived application not found");
        return;
      }

      const { application, shelterProfile } = res.data.data;
      const petData =
        typeof application.petId === "object" ? application.petId : null;

      setApplication(application);
      setPet(petData || null);
      setShelter(shelterProfile || null);
    } catch (err) {
      console.error("Fetch archived application error:", err);

      if (err.response?.status === 404) {
        setError("Archived application not found");
      } else {
        setError("Failed to load archived application details");
      }
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
    return <FullPageError message={error} onRetry={fetchRejectedApplication} />;

  if (!application || !pet) {
    return <FullPageError message="Application not found or already removed" />;
  }

  const isRejected = [
    "rejected",
    "application-reject",
    "video-verification-reject",
    "final-reject",
  ].includes(application?.status);
  const displayImage = pet.coverImage || pet.images?.[0] || "";

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
            {isRejected ? (
              <>
                <div className="flex items-end gap-10">
                  <h1 className="text-3xl font-bold text-white tracking-tight">
                    Application Rejected
                  </h1>

                  <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-400 capitalize">
                    {application.status}
                  </span>
                </div>

                <p className="mt-2 text-sm text-[#bfc0d1]">
                  Your application was reviewed but not approved
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-white tracking-tight">
                    Application Details
                  </h1>

                  <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-400 capitalize">
                    {application.status}
                  </span>
                </div>

                <p className="mt-2 text-sm text-[#bfc0d1]">
                  View the details of your adoption application
                </p>
              </>
            )}
          </div>

          {/* Rejection Notice */}
          {isRejected && (
            <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-red-500/20 p-3">
                  <AlertCircle size={24} className="text-red-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-red-400 mb-2">
                    Application Not Approved
                  </h2>
                  <p className="text-sm text-red-300 mb-4 leading-relaxed">
                    {application.status === "rejected"
                      ? "Unfortunately, the shelter was unable to approve your application at this time. Here's the reason provided:"
                      : "Your application has been rejected. Here's the reason:"}
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

          {/* Pet Information */}
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

          {/* Shelter Information */}
          {shelter && (
            <div className="mb-6 rounded-2xl border border-[#60519b]/20 bg-[#31323e] p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Home size={20} className="text-[#60519b]" />
                Shelter Contact Information
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                {shelter.name && (
                  <div className="flex items-start gap-3">
                    <Home size={18} className="mt-0.5 text-[#60519b]" />
                    <div>
                      <p className="mb-1 text-xs text-[#bfc0d1]/60">
                        Shelter Name
                      </p>
                      <p className="text-sm text-white font-medium">
                        {shelter.name}
                      </p>
                    </div>
                  </div>
                )}

                {shelter.email && (
                  <div className="flex items-start gap-3">
                    <Mail size={18} className="mt-0.5 text-[#60519b]" />
                    <div>
                      <p className="mb-1 text-xs text-[#bfc0d1]/60">Email</p>
                      <p className="text-sm text-white font-medium">
                        {shelter.email}
                      </p>
                    </div>
                  </div>
                )}

                {shelter.phone && (
                  <div className="flex items-start gap-3">
                    <Phone size={18} className="mt-0.5 text-[#60519b]" />
                    <div>
                      <p className="mb-1 text-xs text-[#bfc0d1]/60">Phone</p>
                      <p className="text-sm text-white font-medium">
                        {shelter.phone}
                      </p>
                    </div>
                  </div>
                )}

                {shelter.address && (
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="mt-0.5 text-[#60519b]" />
                    <div>
                      <p className="mb-1 text-xs text-[#bfc0d1]/60">Address</p>
                      <p className="text-sm text-white font-medium">
                        {shelter.address}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 rounded-lg bg-[#60519b]/10 border border-[#60519b]/20 p-4">
                <p className="text-sm text-[#bfc0d1] leading-relaxed">
                  If you have questions about this decision or would like to
                  discuss your application, please feel free to contact the
                  shelter using the information above.
                </p>
              </div>
            </div>
          )}

          {/* Application Timeline */}
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

              {application.reviewedAt && (
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

          {/* Next Steps */}
          <div className="rounded-2xl border border-[#60519b]/20 bg-[#31323e] p-6">
            <h2 className="text-lg font-bold text-white mb-4">What's Next?</h2>

            <div className="space-y-4">
              <p className="text-sm text-[#bfc0d1] leading-relaxed">
                While this application wasn't successful, there are still many
                wonderful pets looking for homes:
              </p>

              <ul className="space-y-2 text-sm text-[#bfc0d1]">
                <li className="flex items-start gap-2">
                  <span className="text-[#60519b] mt-1">•</span>
                  <span>
                    You can browse other available pets that might be a better
                    match
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#60519b] mt-1">•</span>
                  <span>
                    Contact the shelter to understand what changes might improve
                    future applications
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#60519b] mt-1">•</span>
                  <span>
                    Consider applying for a different pet that better suits your
                    situation
                  </span>
                </li>
              </ul>

              <button
                onClick={() => navigate("/adopt-pet")}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#60519b] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#7d6ab8] hover:shadow-lg active:scale-95"
              >
                <Heart size={16} />
                Find Another Pet to Adopt
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RejectedApplicationDetail;
