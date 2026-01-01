import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  CheckCircle,
  Circle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Clock,
  Calendar,
  MapPin,
} from "lucide-react";
import Navbar from "../../components/Owners/NavbarOwner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const OwnerApplicationJourney = () => {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [journeyData, setJourneyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    if (selectedApp) {
      fetchJourneyDetails(selectedApp._id);
    }
  }, [selectedApp]);

  const fetchApplications = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/journey/owner-applications`,
        { withCredentials: true }
      );

      if (response?.data?.success) {
        const apps = response.data.data || [];
        setApplications(apps);
        setSelectedApp(apps.length > 0 ? apps[0] : null);
      }
    } catch (error) {
      if (error.response?.status === 403) {
        setTimeout(fetchApplications, 300);
        return;
      }
      console.error(
        "Fetch applications error:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchJourneyDetails = async (applicationId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/journey/owner/${applicationId}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setJourneyData(response.data.data);
      }
    } catch (error) {
      console.error("Fetch journey error:", error);
    }
  };

  const getStepColor = (status) => {
    const colors = {
      grey: "bg-gray-500",
      yellow: "bg-yellow-500",
      green: "bg-green-500",
      red: "bg-red-500",
    };
    return colors[status] || colors.grey;
  };

  const getStepIcon = (status) => {
    const icons = {
      grey: Circle,
      yellow: AlertCircle,
      green: CheckCircle,
      red: XCircle,
    };
    const Icon = icons[status] || Circle;
    return <Icon size={24} className="text-white" />;
  };

  const getApplicationStatusBadge = (status) => {
    const statusConfig = {
      submitted: {
        color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        label: "Submitted",
      },
      review: {
        color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        label: "Under Review",
      },
      "video-verification-scheduled": {
        color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
        label: "Video Meeting Scheduled",
      },
      "video-verification-passed": {
        color: "bg-green-500/20 text-green-400 border-green-500/30",
        label: "Video Verified",
      },
      approved: {
        color: "bg-green-600/20 text-green-300 border-green-600/30",
        label: "✓ Approved",
      },
      "application-rejected": {
        color: "bg-red-500/20 text-red-400 border-red-500/30",
        label: "Application Rejected",
      },
      "video-verification-reject": {
        color: "bg-red-500/20 text-red-400 border-red-500/30",
        label: "Video Verification Failed",
      },
      "final-reject": {
        color: "bg-red-500/20 text-red-400 border-red-500/30",
        label: "Final Rejection",
      },
      rejected: {
        color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
        label: "Archived",
      },
      withdrawn: {
        color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
        label: "Withdrawn",
      },
    };

    return (
      statusConfig[status] || {
        color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
        label: status,
      }
    );
  };

  const getStepMessage = (step, application, meetingDetails) => {
    const status = application.status;

    if (step.id === 1) {
      if (status === "submitted") {
        return "Your application has been submitted and is awaiting review.";
      }
      if (status === "review") {
        return "Your application is currently under review by the shelter.";
      }
      if (status === "application-rejected") {
        return `Application rejected: ${
          application.rejectionReason || "No reason provided"
        }`;
      }
      if (
        [
          "video-verification-scheduled",
          "video-verification-passed",
          "approved",
        ].includes(status)
      ) {
        return "Your application has been reviewed and approved to proceed.";
      }
    }

    if (step.id === 2) {
      if (!meetingDetails) {
        return "Video verification has not been scheduled yet.";
      }
      if (status === "video-verification-scheduled") {
        return "Your video verification meeting has been scheduled.";
      }
      if (status === "video-verification-passed") {
        return "You have successfully passed video verification!";
      }
      if (status === "video-verification-reject") {
        return `Video verification failed: ${
          application.rejectionReason || "No reason provided"
        }`;
      }
      if (status === "approved") {
        return "Video verification was completed successfully.";
      }
    }

    if (step.id === 3) {
      if (status === "video-verification-passed") {
        return "On-site visit is in progress. Photos will be uploaded by the shelter.";
      }
      if (status === "approved") {
        return "🎉 Congratulations! Your adoption has been approved. This pet is now officially yours!";
      }
      if (status === "final-reject") {
        return `Final rejection: ${
          application.rejectionReason || "No reason provided"
        }`;
      }
      return "On-site visit has not started yet.";
    }

    return step.description;
  };

  const filteredApplications = applications.filter((app) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      app.petId?.name?.toLowerCase().includes(searchLower) ||
      app.applicationData?.fullName?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1e202c] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1e202c] flex">
      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 border-r border-[#4a5568]/20 bg-[#31323e] overflow-y-auto">
          <div className="p-6">
            <button
              onClick={() => navigate("/applications-owner")}
              className="mb-4 flex items-center gap-2 text-[#bfc0d1] hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">Back to Applications</span>
            </button>

            <h2 className="text-xl font-bold text-white mb-4">
              My Applications
            </h2>

            <div className="relative mb-4">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#bfc0d1]/60"
              />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#1e202c] border border-[#4a5568]/30 text-white placeholder-[#bfc0d1]/60 focus:outline-none focus:border-[#4a5568]"
              />
            </div>

            <div className="space-y-2">
              {filteredApplications.map((app) => {
                const badge = getApplicationStatusBadge(app.status);
                return (
                  <button
                    key={app._id}
                    onClick={() => setSelectedApp(app)}
                    className={`w-full p-4 rounded-xl text-left transition-all ${
                      selectedApp?._id === app._id
                        ? "bg-[#4a5568] shadow-lg ring-2 ring-[#4a5568]"
                        : "bg-[#1e202c]/50 hover:bg-[#1e202c]"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {console.log(
                        "PET COVER IMAGE DEBUG →",
                        app.petId?.coverImage
                      )}

                      {app.petId?.coverImage && (
                        <img
                          src={app.petId.coverImage}
                          alt="Pet"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {app.petId?.name || "Unknown Pet"}
                        </p>
                        <p className="text-xs text-[#bfc0d1]/60">
                          {app.petId?.species} • {app.petId?.breed}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium border ${badge.color}`}
                    >
                      {badge.label}
                    </span>
                  </button>
                );
              })}

              {filteredApplications.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-[#bfc0d1]/60">
                    No applications found
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {!selectedApp ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-[#bfc0d1]/60">
                Select an application to view journey
              </p>
            </div>
          ) : journeyData ? (
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                  Application Journey
                </h1>
                <p className="text-[#bfc0d1]">
                  Track the progress of your application for{" "}
                  <span className="font-semibold text-white">
                    {journeyData.application.petId?.name}
                  </span>
                </p>
              </div>

              {journeyData.isRejected && (
                <div className="mb-6 p-5 rounded-xl bg-red-500/10 border border-red-500/30">
                  <div className="flex items-start gap-3">
                    <XCircle
                      size={24}
                      className="text-red-400 mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <p className="text-base font-semibold text-red-400 mb-2">
                        Application Rejected
                      </p>
                      <p className="text-sm text-[#bfc0d1] leading-relaxed">
                        <strong className="text-white">Reason:</strong>{" "}
                        {journeyData.application.rejectionReason ||
                          "No specific reason was provided by the shelter."}
                      </p>
                      <p className="text-xs text-[#bfc0d1]/70 mt-3">
                        We understand this may be disappointing. Please feel
                        free to explore other pets available for adoption.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {journeyData.application.status === "approved" && (
                <div className="mb-6 p-5 rounded-xl bg-green-500/10 border border-green-500/30">
                  <div className="flex items-start gap-3">
                    <CheckCircle
                      size={24}
                      className="text-green-400 mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <p className="text-base font-semibold text-green-400 mb-2">
                        🎉 Adoption Approved!
                      </p>
                      <p className="text-sm text-[#bfc0d1] leading-relaxed">
                        Congratulations! Your adoption of{" "}
                        <strong className="text-white">
                          {journeyData.application.petId?.name}
                        </strong>{" "}
                        has been officially approved. This pet is now part of
                        your family!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-8 p-5 rounded-xl bg-[#31323e] border border-[#4a5568]/20">
                <h3 className="text-sm font-semibold text-white mb-4">
                  Journey Status Legend
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { color: "grey", label: "Not Started", icon: Circle },
                    {
                      color: "yellow",
                      label: "In Progress",
                      icon: AlertCircle,
                    },
                    { color: "green", label: "Completed", icon: CheckCircle },
                    { color: "red", label: "Rejected", icon: XCircle },
                  ].map((item) => (
                    <div key={item.color} className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-full ${getStepColor(
                          item.color
                        )} flex items-center justify-center shadow-md`}
                      >
                        <item.icon size={16} className="text-white" />
                      </div>
                      <span className="text-sm text-[#bfc0d1]">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                {journeyData.journeySteps.map((step, index) => {
                  const isStepRejected = step.status === "red";
                  const isStepCompleted = step.status === "green";
                  const isStepActive = step.status === "yellow";

                  return (
                    <div key={step.id} className="relative">
                      <div className="flex gap-6">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-12 h-12 rounded-full ${getStepColor(
                              step.status
                            )} flex items-center justify-center shadow-lg transition-all ${
                              isStepActive
                                ? "ring-4 ring-yellow-500/30 animate-pulse"
                                : ""
                            } ${
                              isStepRejected ? "ring-4 ring-red-500/30" : ""
                            } ${
                              isStepCompleted ? "ring-4 ring-green-500/20" : ""
                            }`}
                          >
                            {getStepIcon(step.status)}
                          </div>
                          {index < journeyData.journeySteps.length - 1 && (
                            <div
                              className={`w-1 h-20 my-2 ${
                                isStepRejected
                                  ? "bg-red-500/30"
                                  : isStepCompleted
                                  ? "bg-green-500/30"
                                  : "bg-[#4a5568]/30"
                              }`}
                            />
                          )}
                        </div>

                        <div className="flex-1 pb-8">
                          <div
                            className={`rounded-xl border p-6 transition-all ${
                              isStepRejected
                                ? "bg-red-500/5 border-red-500/30"
                                : isStepActive
                                ? "bg-yellow-500/5 border-yellow-500/30"
                                : isStepCompleted
                                ? "bg-green-500/5 border-green-500/30"
                                : "bg-[#31323e] border-[#4a5568]/20"
                            }`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="text-lg font-bold text-white">
                                {step.label}
                              </h3>
                            </div>

                            <p className="text-sm text-[#bfc0d1] leading-relaxed mb-4">
                              {getStepMessage(
                                step,
                                journeyData.application,
                                journeyData.meetingDetails
                              )}
                            </p>

                            {step.id === 2 && journeyData.meetingDetails && (
                              <div className="mt-4 p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                                <p className="text-sm font-semibold text-purple-400 mb-3 flex items-center gap-2">
                                  <Calendar size={16} />
                                  Video Meeting Details
                                </p>
                                <div className="space-y-2 text-sm text-[#bfc0d1]">
                                  {journeyData.meetingDetails.scheduledDate && (
                                    <div className="flex items-center gap-2">
                                      <Clock
                                        size={14}
                                        className="text-purple-400"
                                      />
                                      <span>
                                        {new Date(
                                          journeyData.meetingDetails.scheduledDate
                                        ).toLocaleString("en-US", {
                                          dateStyle: "medium",
                                          timeStyle: "short",
                                        })}
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`px-2 py-1 rounded text-xs font-medium ${
                                        journeyData.meetingDetails.status ===
                                        "completed"
                                          ? "bg-green-500/20 text-green-400"
                                          : "bg-blue-500/20 text-blue-400"
                                      }`}
                                    >
                                      {journeyData.meetingDetails.status ===
                                      "completed"
                                        ? "Completed"
                                        : "Scheduled"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {step.id === 3 &&
                              journeyData.application.siteVisitPhotos?.photo1
                                ?.url && (
                                <div className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                                  <p className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                                    <MapPin size={16} />
                                    Site Visit Photos Uploaded
                                  </p>
                                  <div className="grid grid-cols-2 gap-4">
                                    {[
                                      journeyData.application.siteVisitPhotos
                                        .photo1,
                                      journeyData.application.siteVisitPhotos
                                        .photo2,
                                    ].map((photo, idx) => (
                                      <div key={idx} className="space-y-2">
                                        <img
                                          src={photo.url}
                                          alt={`Site Photo ${idx + 1}`}
                                          className="w-full h-40 object-cover rounded-lg border border-green-500/20"
                                        />
                                        {photo.geoLocation?.latitude && (
                                          <p className="text-xs text-[#bfc0d1]/70">
                                            📍{" "}
                                            {photo.geoLocation.latitude.toFixed(
                                              4
                                            )}
                                            ,{" "}
                                            {photo.geoLocation.longitude.toFixed(
                                              4
                                            )}
                                          </p>
                                        )}
                                        {photo.uploadedAt && (
                                          <p className="text-xs text-[#bfc0d1]/70">
                                            Uploaded:{" "}
                                            {new Date(
                                              photo.uploadedAt
                                            ).toLocaleDateString()}
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 p-6 rounded-xl bg-[#31323e] border border-[#4a5568]/20">
                <h3 className="text-lg font-bold text-white mb-4">
                  Application Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[#bfc0d1]/60 mb-1">Submitted</p>
                    <p className="text-white">
                      {new Date(
                        journeyData.application.submittedAt ||
                          journeyData.application.createdAt
                      ).toLocaleDateString("en-US", {
                        dateStyle: "medium",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#bfc0d1]/60 mb-1">Current Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
                        getApplicationStatusBadge(
                          journeyData.application.status
                        ).color
                      }`}
                    >
                      {
                        getApplicationStatusBadge(
                          journeyData.application.status
                        ).label
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-[#bfc0d1]/60">Loading journey details...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerApplicationJourney;
