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
  Trash2,
} from "lucide-react";
import defaultAvatar from "../../assets/Owner/default-owner.png";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const ShelterApplicationJourney = () => {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [journeyData, setJourneyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({});
  const [password, setPassword] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [geoLocations, setGeoLocations] = useState([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
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
      const response = await axios.get(`${API_URL}/api/journey/submitted`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setApplications(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedApp(response.data.data[0]);
        }
      }
    } catch (error) {
      console.error("Fetch applications error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJourneyDetails = async (applicationId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/journey/${applicationId}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setJourneyData(response.data.data);
      }
    } catch (error) {
      console.error("Fetch journey error:", error);
    }
  };

  const handleUpdateStatus = async (step, action) => {
    if (!password) {
      alert("Please enter your password");
      return;
    }

    if (action === "reject" && !rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    setActionLoading(true);
    try {
      const endpoint =
        step.id === 2
          ? `/api/journey/${selectedApp._id}/video-verification`
          : `/api/journey/${selectedApp._id}/final-approval`;

      const response = await axios.post(
        `${API_URL}${endpoint}`,
        {
          status: action,
          password,
          rejectionReason: action === "reject" ? rejectionReason : undefined,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setShowDialog(false);
        setPassword("");
        setRejectionReason("");
        fetchApplications();
        fetchJourneyDetails(selectedApp._id);
        alert("Status updated successfully");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const openDialog = (step, action) => {
    setDialogConfig({ step, action });
    setShowDialog(true);
  };

  const handlePhotoUpload = async () => {
    if (photoFiles.length !== 2) {
      alert("Please select exactly 2 photos");
      return;
    }

    if (geoLocations.length !== 2) {
      alert("Geo-location data missing. Please enable location access.");
      return;
    }

    setUploadingPhotos(true);
    try {
      const formData = new FormData();
      photoFiles.forEach((file) => {
        formData.append("sitePhotos", file);
      });
      formData.append("geoLocations", JSON.stringify(geoLocations));

      const response = await axios.post(
        `${API_URL}/api/journey/${selectedApp._id}/upload-site-photos`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.success) {
        alert("Photos uploaded successfully!");
        setPhotoFiles([]);
        setGeoLocations([]);
        fetchJourneyDetails(selectedApp._id);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Photo upload failed");
    } finally {
      setUploadingPhotos(false);
    }
  };

  const capturePhotoWithLocation = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newFiles = [...photoFiles];
          const newLocations = [...geoLocations];

          newFiles[index] = file;
          newLocations[index] = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          setPhotoFiles(newFiles);
          setGeoLocations(newLocations);
          alert(`Photo ${index + 1} captured with location!`);
        },
        (error) => {
          alert("Please enable location access to upload photos");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser");
    }
  };

  const handleDeleteApplication = async () => {
    if (deleteConfirmText !== "yes delete it") {
      alert('Please type exactly: "yes delete it"');
      return;
    }

    try {
      const response = await axios.delete(
        `${API_URL}/api/shelter/applications/${selectedApp._id}/delete`,
        { withCredentials: true }
      );

      if (response.data.success) {
        alert("Application archived successfully");
        setShowDeleteDialog(false);
        setDeleteConfirmText("");
        fetchApplications();
        setSelectedApp(null);
        setJourneyData(null);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to archive application");
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
        color: "bg-yellow-500/20 text-yellow-400",
        label: "Submitted",
      },
      review: { color: "bg-blue-500/20 text-blue-400", label: "In Review" },
      "video-verification-scheduled": {
        color: "bg-purple-500/20 text-purple-400",
        label: "Meeting Scheduled",
      },
      "video-verification-passed": {
        color: "bg-green-500/20 text-green-400",
        label: "Verified",
      },
      approved: { color: "bg-green-500/20 text-green-400", label: "Approved" },
      "application-rejected": {
        color: "bg-red-500/20 text-red-400",
        label: "Rejected (Application)",
      },
      "video-verification-reject": {
        color: "bg-red-500/20 text-red-400",
        label: "Rejected (Video)",
      },
      "final-reject": {
        color: "bg-red-500/20 text-red-400",
        label: "Rejected (Final)",
      },
    };

    return (
      statusConfig[status] || {
        color: "bg-gray-500/20 text-gray-400",
        label: status,
      }
    );
  };

  const filteredApplications = applications.filter((app) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      app.ownerProfile?.name?.toLowerCase().includes(searchLower) ||
      app.ownerId?.email?.toLowerCase().includes(searchLower) ||
      app.petId?.name?.toLowerCase().includes(searchLower)
    );
  });

  const canDelete =
    journeyData?.application &&
    [
      "application-rejected",
      "video-verification-reject",
      "final-reject",
    ].includes(journeyData.application.status);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1e202c] flex items-center justify-center">
        <p className="text-white text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1e202c] flex">
      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 border-r border-[#4a5568]/20 bg-[#31323e] overflow-y-auto">
          <div className="p-6">
            <button
              onClick={() => navigate("/applications-shelter")}
              className="mb-4 flex items-center gap-2 text-[#bfc0d1] hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">Back to Applications</span>
            </button>

            <h2 className="text-xl font-bold text-white mb-4">
              Active Applications
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
              {filteredApplications.map((app) => (
                <button
                  key={app._id}
                  onClick={() => setSelectedApp(app)}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    selectedApp?._id === app._id
                      ? "bg-[#4a5568] shadow-lg"
                      : "bg-[#1e202c]/50 hover:bg-[#1e202c]"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={app.ownerProfile?.avatar || defaultAvatar}
                      alt="Owner"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {app.ownerProfile?.name || "Unknown Owner"}
                      </p>
                      <p className="text-xs text-[#bfc0d1]/60 truncate">
                        {app.ownerId?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {app.petId?.coverImage && (
                      <img
                        src={app.petId.coverImage}
                        alt="Pet"
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                    )}
                    <p className="text-sm text-[#bfc0d1]">
                      {app.petId?.name || "Unknown Pet"}
                    </p>
                  </div>

                  <span
                    className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                      getApplicationStatusBadge(app.status).color
                    }`}
                  >
                    {getApplicationStatusBadge(app.status).label}
                  </span>
                </button>
              ))}

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
              <div className="mb-8 flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Application Journey
                  </h1>
                  <p className="text-[#bfc0d1]">
                    Track the progress of {journeyData.ownerProfile?.name}'s
                    application for {journeyData.application.petId?.name}
                  </p>
                </div>
                {canDelete && (
                  <button
                    onClick={() => setShowDeleteDialog(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                  >
                    <Trash2 size={18} />
                    <span className="font-medium">Archive</span>
                  </button>
                )}
              </div>

              {journeyData.isRejected && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                  <p className="text-sm font-semibold text-red-400 mb-1">
                    Application Rejected
                  </p>
                  <p className="text-sm text-[#bfc0d1]">
                    <strong>Reason:</strong>{" "}
                    {journeyData.application.rejectionReason ||
                      "No reason provided"}
                  </p>
                </div>
              )}

              <div className="mb-8 p-4 rounded-xl bg-[#31323e] border border-[#4a5568]/20">
                <h3 className="text-sm font-semibold text-white mb-3">
                  Status Legend
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { color: "grey", label: "Not Reached", icon: Circle },
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
                        )} flex items-center justify-center`}
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

                  return (
                    <div key={step.id} className="relative">
                      <div className="flex gap-6">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-12 h-12 rounded-full ${getStepColor(
                              step.status
                            )} flex items-center justify-center shadow-lg ${
                              isStepRejected ? "ring-2 ring-red-500/50" : ""
                            }`}
                          >
                            {getStepIcon(step.status)}
                          </div>
                          {index < journeyData.journeySteps.length - 1 && (
                            <div
                              className={`w-1 h-16 my-2 ${
                                isStepRejected
                                  ? "bg-red-500/30"
                                  : "bg-[#4a5568]/30"
                              }`}
                            />
                          )}
                        </div>

                        <div className="flex-1 pb-8">
                          <div
                            className={`rounded-xl border p-6 ${
                              isStepRejected
                                ? "bg-red-500/5 border-red-500/30"
                                : "bg-[#31323e] border-[#4a5568]/20"
                            }`}
                          >
                            <h3 className="text-lg font-bold text-white mb-2">
                              {step.label}
                            </h3>

                            <p className="text-sm text-[#bfc0d1] mb-4">
                              {step.description}
                            </p>

                            {step.id === 3 &&
                              step.requiresPhotos &&
                              step.status === "yellow" && (
                                <div>
                                  {!journeyData.application.siteVisitPhotos
                                    ?.photo1?.url ? (
                                    <div className="mb-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                                      <p className="text-sm font-semibold text-blue-400 mb-3">
                                        Upload 2 Geo-Tagged Site Visit Photos
                                      </p>

                                      <div className="space-y-3">
                                        <div>
                                          <label className="block text-sm text-[#bfc0d1] mb-2">
                                            Photo 1 {photoFiles[0] && "✓"}
                                          </label>
                                          <input
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            onChange={(e) =>
                                              capturePhotoWithLocation(e, 0)
                                            }
                                            className="w-full px-3 py-2 rounded-lg bg-[#1e202c] border border-[#4a5568]/30 text-white text-sm"
                                          />
                                        </div>

                                        <div>
                                          <label className="block text-sm text-[#bfc0d1] mb-2">
                                            Photo 2 {photoFiles[1] && "✓"}
                                          </label>
                                          <input
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            onChange={(e) =>
                                              capturePhotoWithLocation(e, 1)
                                            }
                                            className="w-full px-3 py-2 rounded-lg bg-[#1e202c] border border-[#4a5568]/30 text-white text-sm"
                                          />
                                        </div>

                                        <button
                                          onClick={handlePhotoUpload}
                                          disabled={
                                            photoFiles.length !== 2 ||
                                            uploadingPhotos
                                          }
                                          className="w-full px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          {uploadingPhotos
                                            ? "Uploading..."
                                            : "Upload Photos"}
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="mb-4 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                                      <p className="text-sm font-semibold text-green-400 mb-3">
                                        Site Visit Photos Uploaded
                                      </p>

                                      <div className="grid grid-cols-2 gap-3">
                                        <div>
                                          <img
                                            src={
                                              journeyData.application
                                                .siteVisitPhotos.photo1.url
                                            }
                                            alt="Site Photo 1"
                                            className="w-full h-32 object-cover rounded-lg"
                                          />
                                          <p className="text-xs text-[#bfc0d1] mt-1">
                                            {journeyData.application.siteVisitPhotos.photo1.geoLocation.latitude.toFixed(
                                              4
                                            )}
                                            ,{" "}
                                            {journeyData.application.siteVisitPhotos.photo1.geoLocation.longitude.toFixed(
                                              4
                                            )}
                                          </p>
                                        </div>

                                        <div>
                                          <img
                                            src={
                                              journeyData.application
                                                .siteVisitPhotos.photo2.url
                                            }
                                            alt="Site Photo 2"
                                            className="w-full h-32 object-cover rounded-lg"
                                          />
                                          <p className="text-xs text-[#bfc0d1] mt-1">
                                            {journeyData.application.siteVisitPhotos.photo2.geoLocation.latitude.toFixed(
                                              4
                                            )}
                                            ,{" "}
                                            {journeyData.application.siteVisitPhotos.photo2.geoLocation.longitude.toFixed(
                                              4
                                            )}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                            {step.canUpdate && step.status === "yellow" && (
                              <div className="flex gap-3">
                                <button
                                  onClick={() => openDialog(step, "approve")}
                                  className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all font-medium"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => openDialog(step, "reject")}
                                  className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all font-medium"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-[#bfc0d1]/60">Loading journey data...</p>
            </div>
          )}
        </div>
      </div>

      {showDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#31323e] rounded-2xl shadow-2xl max-w-md w-full border border-[#4a5568]/20 p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              {dialogConfig.action === "approve"
                ? "Approve Step"
                : "Reject Step"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#bfc0d1] mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-[#1e202c] border border-[#4a5568]/30 text-white focus:outline-none focus:border-[#4a5568]"
                  placeholder="Enter your password"
                />
              </div>

              {dialogConfig.action === "reject" && (
                <div>
                  <label className="block text-sm font-medium text-[#bfc0d1] mb-2">
                    Rejection Reason *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-[#1e202c] border border-[#4a5568]/30 text-white focus:outline-none focus:border-[#4a5568] min-h-[100px]"
                    placeholder="Please provide a detailed reason..."
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDialog(false);
                  setPassword("");
                  setRejectionReason("");
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleUpdateStatus(dialogConfig.step, dialogConfig.action)
                }
                className={`flex-1 px-4 py-2 rounded-lg text-white transition-all ${
                  dialogConfig.action === "approve"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                }`}
                disabled={actionLoading}
              >
                {actionLoading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#31323e] rounded-2xl shadow-2xl max-w-md w-full border border-[#4a5568]/20 p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Archive Application
            </h3>

            <p className="text-sm text-[#bfc0d1] mb-4">
              This will permanently archive the rejected application. Type{" "}
              <strong>"yes delete it"</strong> to confirm.
            </p>

            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-[#1e202c] border border-[#4a5568]/30 text-white focus:outline-none focus:border-[#4a5568] mb-4"
              placeholder='Type "yes delete it"'
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeleteConfirmText("");
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteApplication}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all"
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShelterApplicationJourney;
