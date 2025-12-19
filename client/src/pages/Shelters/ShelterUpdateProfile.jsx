import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Award,
  TrendingUp,
  Users,
  Camera,
  Save,
  Shield,
  Eye,
  EyeOff,
  Lock,
  CheckCircle,
  Loader,
  AlertCircle,
} from "lucide-react";
import NavbarShelter from "../../components/Shelters/NavbarShelter";
import FullPageLoader from "../../Common/FullPageLoader";
import FullPageError from "../../Common/FullPageError";
import ShelterToast from "../../Common/ShelterToast";
import { useSocket } from "../../../hooks/useSocket";
import defaultAvatar from "../../assets/Shelter/default-shelter.png";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const ShelterUpdateProfile = () => {
  const { emit, on } = useSocket();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");

  const [securityForm, setSecurityForm] = useState({
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false,
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    bio: "",
    specialization: "",
    experience: 0,
    capacity: 0,
  });

  const [profileMode, setProfileMode] = useState("manual");
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [tempPassword, setTempPassword] = useState(null);

  useEffect(() => {
    fetchProfile();

    // Listen for real-time updates
    const unsubProfile = on("profile:updated", (data) => {
      setProfile(data.profile);
      showToast("success", "Profile Updated", "Changes synced in real-time");
    });

    const unsubAvatar = on("avatar:updated", (data) => {
      setProfile((prev) => ({ ...prev, avatar: data.avatar }));
      showToast("success", "Avatar Updated", "Profile picture updated");
    });
    const unsubPassword = on("password:changed", (data) => {
      setPasswordChanged(true);
      setTempPassword(null);
      showToast("success", "Password Changed", data.message);
    });

    return () => {
      unsubProfile();
      unsubAvatar();
      unsubPassword();
    };
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${API_URL}/api/auth/shelter/profile`, {
        withCredentials: true,
      });

      if (response.data.success) {
        const profileData = response.data.profile;
        setProfile(profileData);
        setFormData({
          name: profileData.name || "",
          phone: profileData.phone || "",
          address: profileData.address || "",
          bio: profileData.bio || "",
          specialization: profileData.specialization || "",
          experience: profileData.experience || 0,
          capacity: profileData.capacity || 0,
        });

        setProfileMode(profileData.mode || "manual");
        setPasswordChanged(profileData.passwordChanged || false);
        setTempPassword(profileData.tempPassword || null);
      }
    } catch (err) {
      console.error("Fetch profile error:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "experience" || name === "capacity" ? Number(value) : value,
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast("error", "File Too Large", "Avatar must be under 2MB");
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);

      const response = await axios.put(
        `${API_URL}/api/shelter/profile/avatar`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.success) {
        setProfile((prev) => ({ ...prev, avatar: response.data.avatar }));
        setAvatarFile(null);
        setAvatarPreview(null);
        showToast(
          "success",
          "Avatar Updated",
          "Profile picture updated successfully"
        );
        emit("profile:avatar:updated", { avatar: response.data.avatar });
      }
    } catch (err) {
      console.error("Avatar upload error:", err);
      showToast(
        "error",
        "Upload Failed",
        err.response?.data?.message || "Failed to update avatar"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await axios.put(
        `${API_URL}/api/shelter/profile`,
        formData,
        { withCredentials: true }
      );

      if (response.data.success) {
        setProfile(response.data.profile);
        showToast(
          "success",
          "Profile Updated",
          "Your shelter profile has been updated"
        );
        emit("profile:updated", { profile: response.data.profile });
      }
    } catch (err) {
      console.error("Update profile error:", err);
      showToast(
        "error",
        "Update Failed",
        err.response?.data?.message || "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRequestOTP = async () => {
    try {
      setSendingOtp(true);
      const response = await axios.post(
        `${API_URL}/api/shelter/security/request-otp`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        setOtpSent(true);
        showToast("success", "OTP Sent", "Check your email for the OTP code");
      }
    } catch (error) {
      console.error("Request OTP error:", error);
      showToast(
        "error",
        "Error",
        error.response?.data?.message || "Failed to send OTP"
      );
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!securityForm.otp) {
      showToast("error", "Error", "Please enter the OTP");
      return;
    }

    try {
      setVerifyingOtp(true);
      const response = await axios.post(
        `${API_URL}/api/shelter/security/verify-otp`,
        { otp: securityForm.otp },
        { withCredentials: true }
      );

      if (response.data.success) {
        setOtpVerified(true);
        showToast(
          "success",
          "OTP Verified",
          "You can now change your password"
        );
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      showToast(
        "error",
        "Error",
        error.response?.data?.message || "Invalid OTP"
      );
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleChangePassword = async () => {
    if (!securityForm.newPassword || !securityForm.confirmPassword) {
      showToast("error", "Error", "All fields are required");
      return;
    }

    if (securityForm.newPassword !== securityForm.confirmPassword) {
      showToast("error", "Error", "Passwords do not match");
      return;
    }

    if (securityForm.newPassword.length < 8) {
      showToast("error", "Error", "Password must be at least 8 characters");
      return;
    }

    try {
      setSaving(true);
      const response = await axios.post(
        `${API_URL}/api/shelter/security/change-password`,
        {
          otp: securityForm.otp,
          newPassword: securityForm.newPassword,
          confirmPassword: securityForm.confirmPassword,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setSecurityForm({ otp: "", newPassword: "", confirmPassword: "" });
        setOtpSent(false);
        setOtpVerified(false);
        setTempPassword(null);
        setPasswordChanged(true);
        showToast("success", "Success", "Password changed successfully");
      }
    } catch (error) {
      console.error("Change password error:", error);
      showToast(
        "error",
        "Error",
        error.response?.data?.message || "Failed to change password"
      );
    } finally {
      setSaving(false);
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
  };

  if (loading) {
    return (
      <FullPageLoader
        title="Loading Profile…"
        subtitle="Fetching your shelter information"
      />
    );
  }

  if (error) return <FullPageError message={error} onRetry={fetchProfile} />;

  const currentAvatar =
    avatarPreview ||
    (profile?.avatar && profile.avatar !== "url" && profile.avatar.trim() !== ""
      ? profile.avatar
      : defaultAvatar);

  return (
    <div className="min-h-screen bg-[#1e202c] flex">
      <NavbarShelter onLogout={handleLogout} />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl p-4 md:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-lg bg-[#4a5568] p-2">
                <Shield size={24} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">Update Profile</h1>
            </div>
            <p className="text-[#bfc0d1]/80">
              Manage your shelter information and settings
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-8 flex justify-center">
            <div className="flex gap-2 rounded-xl bg-[#31323e] p-2 shadow-xl shadow-black/20">
              <button
                onClick={() => setActiveTab("personal")}
                className={`px-8 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 ${
                  activeTab === "personal"
                    ? "bg-[#4a5568] text-white shadow-lg shadow-[#4a5568]/40 scale-105"
                    : "text-[#bfc0d1] hover:bg-[#3a3b47] hover:text-white hover:scale-105"
                }`}
              >
                Personal Details
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`px-8 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 ${
                  activeTab === "security"
                    ? "bg-[#4a5568] text-white shadow-lg shadow-[#4a5568]/40 scale-105"
                    : "text-[#bfc0d1] hover:bg-[#3a3b47] hover:text-white hover:scale-105"
                }`}
              >
                Security
              </button>
            </div>
          </div>

          {activeTab === "personal" && (
            <div className="space-y-6">
              {/* Avatar Section */}
              <div className="mb-8 rounded-2xl border border-[#4a5568]/20 bg-[#31323e] p-6">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
                  <Camera size={20} />
                  Profile Picture
                </h2>

                <div className="flex flex-col items-center gap-4 sm:flex-row">
                  <div className="relative">
                    <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-[#4a5568]">
                      <img
                        src={currentAvatar}
                        alt="Shelter avatar"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <input
                      type="file"
                      id="avatar"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="avatar"
                      className="mb-2 inline-block cursor-pointer rounded-lg bg-[#4a5568] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#5a6678]"
                    >
                      Choose File
                    </label>
                    <p className="text-xs text-[#bfc0d1]/60">
                      Max size: 2MB. Formats: JPG, PNG, GIF, WEBP
                    </p>

                    {avatarFile && (
                      <button
                        onClick={handleAvatarUpload}
                        disabled={saving}
                        className="mt-3 flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                      >
                        <Save size={16} />
                        {saving ? "Uploading..." : "Upload Avatar"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="rounded-2xl border border-[#4a5568]/20 bg-[#31323e] p-6">
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
                    <User size={20} />
                    Basic Information
                  </h2>

                  <div className="space-y-4">
                    {/* Email (Read-only) */}
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#bfc0d1]">
                        <Mail size={16} />
                        Email
                        <span className="rounded bg-[#4a5568]/30 px-2 py-0.5 text-xs text-[#bfc0d1]/60">
                          Read-only
                        </span>
                      </label>
                      <input
                        type="email"
                        value={profile?.email || ""}
                        disabled
                        className="w-full rounded-lg border border-[#4a5568]/20 bg-[#1e202c]/50 px-4 py-2.5 text-[#bfc0d1]/50 cursor-not-allowed"
                      />
                    </div>

                    {/* Name */}
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#bfc0d1]">
                        <Shield size={16} />
                        Shelter Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter shelter name"
                        className="w-full rounded-lg border border-[#4a5568]/20 bg-[#1e202c] px-4 py-2.5 text-white placeholder-[#bfc0d1]/40 focus:border-[#4a5568] focus:outline-none"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#bfc0d1]">
                        <Phone size={16} />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter phone number"
                        className="w-full rounded-lg border border-[#4a5568]/20 bg-[#1e202c] px-4 py-2.5 text-white placeholder-[#bfc0d1]/40 focus:border-[#4a5568] focus:outline-none"
                      />
                    </div>

                    {/* Address */}
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#bfc0d1]">
                        <MapPin size={16} />
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter shelter address"
                        className="w-full rounded-lg border border-[#4a5568]/20 bg-[#1e202c] px-4 py-2.5 text-white placeholder-[#bfc0d1]/40 focus:border-[#4a5568] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Details */}
                <div className="rounded-2xl border border-[#4a5568]/20 bg-[#31323e] p-6">
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
                    <Award size={20} />
                    Professional Details
                  </h2>

                  <div className="space-y-4">
                    {/* Specialization */}
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#bfc0d1]">
                        <Award size={16} />
                        Specialization
                      </label>
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        placeholder="e.g., Dogs, Cats, Exotic Animals"
                        className="w-full rounded-lg border border-[#4a5568]/20 bg-[#1e202c] px-4 py-2.5 text-white placeholder-[#bfc0d1]/40 focus:border-[#4a5568] focus:outline-none"
                      />
                    </div>

                    {/* Experience */}
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#bfc0d1]">
                        <TrendingUp size={16} />
                        Experience (Years)
                      </label>
                      <input
                        type="number"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        min="0"
                        placeholder="Years of experience"
                        className="w-full rounded-lg border border-[#4a5568]/20 bg-[#1e202c] px-4 py-2.5 text-white placeholder-[#bfc0d1]/40 focus:border-[#4a5568] focus:outline-none"
                      />
                    </div>

                    {/* Capacity */}
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#bfc0d1]">
                        <Users size={16} />
                        Shelter Capacity
                      </label>
                      <input
                        type="number"
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleChange}
                        min="0"
                        placeholder="Maximum capacity"
                        className="w-full rounded-lg border border-[#4a5568]/20 bg-[#1e202c] px-4 py-2.5 text-white placeholder-[#bfc0d1]/40 focus:border-[#4a5568] focus:outline-none"
                      />
                      <p className="mt-1 text-xs text-[#bfc0d1]/60">
                        Current: {profile?.currentPets || 0} /{" "}
                        {formData.capacity}
                      </p>
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#bfc0d1]">
                        <FileText size={16} />
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Tell us about your shelter..."
                        className="w-full rounded-lg border border-[#4a5568]/20 bg-[#1e202c] px-4 py-2.5 text-white placeholder-[#bfc0d1]/40 focus:border-[#4a5568] focus:outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="rounded-lg border border-[#4a5568]/20 bg-[#31323e] px-6 py-2.5 text-sm font-semibold text-[#bfc0d1] transition-colors hover:bg-[#3a3b47]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 rounded-lg bg-[#4a5568] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#5a6678] disabled:opacity-50"
                  >
                    <Save size={16} />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              {/* Google Login Warning */}
              {profileMode === "google" && !passwordChanged && tempPassword && (
                <div className="rounded-xl border border-red-500/30 bg-linear-to-r from-red-500/15 via-red-500/10 to-transparent p-6">
                  <div className="flex gap-4">
                    <AlertCircle
                      size={24}
                      className="mt-1 text-red-400 shrink-0"
                    />
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-red-400 mb-2">
                        Temporary Password Active
                      </h4>
                      <p className="text-sm text-[#bfc0d1] leading-relaxed mb-3">
                        You're currently using a temporary password since you
                        signed in with Google. Please set a permanent password
                        for better security.
                      </p>
                      <div className="flex flex-wrap gap-3 items-center">
                        <div className="rounded-lg bg-red-500/20 px-3 py-2 font-mono text-sm text-red-300">
                          {tempPassword}
                        </div>
                        <span className="text-xs text-[#bfc0d1]/60">
                          Use this to login manually
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Change Password Section */}
              <div className="rounded-2xl border border-[#4a5568]/20 bg-[#31323e] p-6 md:p-8">
                <h2 className="mb-6 text-xl font-bold text-white flex items-center gap-3">
                  <Lock size={24} className="text-[#4a5568]" />
                  Change Password
                </h2>

                <div className="space-y-6">
                  {!otpSent && (
                    <div>
                      <p className="mb-4 text-sm text-[#bfc0d1]">
                        To change your password, we'll send an OTP to your
                        registered email
                      </p>
                      <button
                        onClick={handleRequestOTP}
                        disabled={sendingOtp}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#4a5568] text-white text-sm font-semibold tracking-wide hover:bg-[#5a6678] hover:shadow-lg hover:shadow-[#4a5568]/30 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sendingOtp ? (
                          <>
                            <Loader size={18} className="animate-spin" />
                            Sending OTP...
                          </>
                        ) : (
                          "Request OTP"
                        )}
                      </button>
                    </div>
                  )}

                  {/* Step 2: Verify OTP */}
                  {otpSent && !otpVerified && (
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#bfc0d1]">
                        Enter OTP
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={securityForm.otp}
                          onChange={(e) =>
                            setSecurityForm((prev) => ({
                              ...prev,
                              otp: e.target.value,
                            }))
                          }
                          className="flex-1 rounded-xl border border-[#4a5568]/20 bg-[#1e202c] px-4 py-3 text-white placeholder:text-[#bfc0d1]/40 focus:border-[#4a5568] focus:outline-none focus:ring-2 focus:ring-[#4a5568]/20"
                          placeholder="Enter 6-digit OTP"
                          maxLength={6}
                        />
                        <button
                          onClick={handleVerifyOTP}
                          disabled={verifyingOtp || !securityForm.otp}
                          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#4a5568] text-white text-sm font-semibold tracking-wide hover:bg-[#5a6678] hover:shadow-lg hover:shadow-[#4a5568]/30 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {verifyingOtp ? (
                            <>
                              <Loader size={18} className="animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            "Verify OTP"
                          )}
                        </button>
                      </div>
                      <button
                        onClick={handleRequestOTP}
                        disabled={sendingOtp}
                        className="mt-2 text-xs text-[#4a5568] hover:text-[#5a6678] transition-colors"
                      >
                        Resend OTP
                      </button>
                    </div>
                  )}

                  {/* Step 3: Change Password */}
                  {otpVerified && (
                    <>
                      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-500/20 border border-green-500/30">
                        <CheckCircle size={20} className="text-green-400" />
                        <span className="text-sm text-green-400 font-medium">
                          OTP Verified Successfully
                        </span>
                      </div>

                      <div className="grid gap-6 sm:grid-cols-2">
                        {/* New Password */}
                        <div>
                          <label className="mb-2 block text-sm font-medium text-[#bfc0d1]">
                            New Password
                          </label>
                          <div className="relative">
                            <Lock
                              size={18}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a5568]"
                            />
                            <input
                              type={showPassword.new ? "text" : "password"}
                              value={securityForm.newPassword}
                              onChange={(e) =>
                                setSecurityForm((prev) => ({
                                  ...prev,
                                  newPassword: e.target.value,
                                }))
                              }
                              className="w-full rounded-xl border border-[#4a5568]/20 bg-[#1e202c] pl-10 pr-12 py-3 text-white placeholder:text-[#bfc0d1]/40 focus:border-[#4a5568] focus:outline-none focus:ring-2 focus:ring-[#4a5568]/20"
                              placeholder="Enter new password"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowPassword((prev) => ({
                                  ...prev,
                                  new: !prev.new,
                                }))
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#bfc0d1]/60 hover:text-[#bfc0d1] transition-colors"
                            >
                              {showPassword.new ? (
                                <EyeOff size={18} />
                              ) : (
                                <Eye size={18} />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                          <label className="mb-2 block text-sm font-medium text-[#bfc0d1]">
                            Confirm Password
                          </label>
                          <div className="relative">
                            <Lock
                              size={18}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a5568]"
                            />
                            <input
                              type={showPassword.confirm ? "text" : "password"}
                              value={securityForm.confirmPassword}
                              onChange={(e) =>
                                setSecurityForm((prev) => ({
                                  ...prev,
                                  confirmPassword: e.target.value,
                                }))
                              }
                              className="w-full rounded-xl border border-[#4a5568]/20 bg-[#1e202c] pl-10 pr-12 py-3 text-white placeholder:text-[#bfc0d1]/40 focus:border-[#4a5568] focus:outline-none focus:ring-2 focus:ring-[#4a5568]/20"
                              placeholder="Confirm new password"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowPassword((prev) => ({
                                  ...prev,
                                  confirm: !prev.confirm,
                                }))
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#bfc0d1]/60 hover:text-[#bfc0d1] transition-colors"
                            >
                              {showPassword.confirm ? (
                                <EyeOff size={18} />
                              ) : (
                                <Eye size={18} />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={handleChangePassword}
                          disabled={
                            saving ||
                            !securityForm.newPassword ||
                            !securityForm.confirmPassword
                          }
                          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#4a5568] text-white text-sm font-semibold tracking-wide hover:bg-[#5a6678] hover:shadow-lg hover:shadow-[#4a5568]/30 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? (
                            <>
                              <Loader size={18} className="animate-spin" />
                              Changing Password...
                            </>
                          ) : (
                            <>
                              <Shield size={18} />
                              Change Password
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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

export default ShelterUpdateProfile;
