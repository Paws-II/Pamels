import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save,
  Shield,
  Eye,
  EyeOff,
  Lock,
  AlertCircle,
  CheckCircle,
  Loader,
} from "lucide-react";
import Navbar from "../../components/Owners/NavbarOwner";
import OwnerToast from "../../Common/OwnerToast";
import FullPageLoader from "../../Common/FullPageLoader";
import { useNotificationSocket } from "../../../hooks/useSocket";
import defaultAvatar from "../../assets/Owner/default-owner.png";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const OwnerUpdateProfile = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Personal Details State
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
    avatar: "",
    role: "",
    mode: "",
    tempPassword: null,
    passwordChanged: false,
  });

  const [originalProfile, setOriginalProfile] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Security State
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

  const { onNewNotification } = useNotificationSocket();

  useEffect(() => {
    fetchProfile();

    const cleanup = onNewNotification((notification) => {
      setToast({
        type: notification.type || "notify",
        title: notification.title || "Notification",
        message: notification.message || "You have a new notification",
      });
    });

    return cleanup;
  }, [onNewNotification]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/owner/profile`, {
        withCredentials: true,
      });

      if (response.data.success) {
        const profileData = {
          name: response.data.profile.name || "",
          email: response.data.profile.email || "",
          phone: response.data.profile.phone || "",
          address: response.data.profile.address || "",
          bio: response.data.profile.bio || "",
          avatar:
            response.data.profile.avatar &&
            response.data.profile.avatar !== "something(url)"
              ? response.data.profile.avatar
              : defaultAvatar,
          role: response.data.profile.role || "",
          mode: response.data.profile.mode || "manual",
          tempPassword: response.data.profile.tempPassword || null,
          passwordChanged: response.data.profile.passwordChanged || false,
        };
        setProfile(profileData);
        setOriginalProfile(profileData);
      }
    } catch (error) {
      console.error("Fetch profile error:", error);
      setToast({
        type: "error",
        title: "Error",
        message: "Failed to load profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      setToast({
        type: "error",
        title: "Invalid File",
        message: "Only JPG, JPEG, PNG, GIF, and WEBP are allowed",
      });
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setToast({
        type: "error",
        title: "File Too Large",
        message: "Avatar must be less than 2MB",
      });
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append("avatar", avatarFile);

      const response = await axios.put(
        `${API_URL}/api/owner/profile/avatar`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setProfile((prev) => ({ ...prev, avatar: response.data.avatar }));
        setOriginalProfile((prev) => ({
          ...prev,
          avatar: response.data.avatar,
        }));
        setAvatarFile(null);
        setAvatarPreview(null);
        setToast({
          type: "success",
          title: "Success",
          message: "Avatar updated successfully",
        });
      }
    } catch (error) {
      console.error("Avatar upload error:", error);
      setToast({
        type: "error",
        title: "Error",
        message: error.response?.data?.message || "Failed to update avatar",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCancelAvatarChange = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      const updateData = {
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
        bio: profile.bio,
      };

      const response = await axios.put(
        `${API_URL}/api/owner/profile`,
        updateData,
        { withCredentials: true }
      );

      if (response.data.success) {
        setOriginalProfile(profile);
        setToast({
          type: "success",
          title: "Success",
          message: "Profile updated successfully",
        });
      }
    } catch (error) {
      console.error("Update profile error:", error);
      setToast({
        type: "error",
        title: "Error",
        message: error.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRequestOTP = async () => {
    try {
      setSendingOtp(true);
      const response = await axios.post(
        `${API_URL}/api/owner/security/request-otp`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        setOtpSent(true);
        setToast({
          type: "success",
          title: "OTP Sent",
          message: "Check your email for the OTP code",
        });
      }
    } catch (error) {
      console.error("Request OTP error:", error);
      setToast({
        type: "error",
        title: "Error",
        message: error.response?.data?.message || "Failed to send OTP",
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!securityForm.otp) {
      setToast({
        type: "error",
        title: "Error",
        message: "Please enter the OTP",
      });
      return;
    }

    try {
      setVerifyingOtp(true);
      const response = await axios.post(
        `${API_URL}/api/owner/security/verify-otp`,
        { otp: securityForm.otp },
        { withCredentials: true }
      );

      if (response.data.success) {
        setOtpVerified(true);
        setToast({
          type: "success",
          title: "OTP Verified",
          message: "You can now change your password",
        });
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      setToast({
        type: "error",
        title: "Error",
        message: error.response?.data?.message || "Invalid OTP",
      });
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleChangePassword = async () => {
    if (!securityForm.newPassword || !securityForm.confirmPassword) {
      setToast({
        type: "error",
        title: "Error",
        message: "All fields are required",
      });
      return;
    }

    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setToast({
        type: "error",
        title: "Error",
        message: "Passwords do not match",
      });
      return;
    }

    if (securityForm.newPassword.length < 8) {
      setToast({
        type: "error",
        title: "Error",
        message: "Password must be at least 8 characters",
      });
      return;
    }

    try {
      setSaving(true);
      const response = await axios.post(
        `${API_URL}/api/owner/security/change-password`,
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
        setProfile((prev) => ({
          ...prev,
          tempPassword: null,
          passwordChanged: true,
        }));
        setToast({
          type: "success",
          title: "Success",
          message: "Password changed successfully",
        });
      }
    } catch (error) {
      console.error("Change password error:", error);
      setToast({
        type: "error",
        title: "Error",
        message: error.response?.data?.message || "Failed to change password",
      });
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

  const isProfileChanged = () => {
    return (
      profile.name !== originalProfile.name ||
      profile.phone !== originalProfile.phone ||
      profile.address !== originalProfile.address ||
      profile.bio !== originalProfile.bio
    );
  };

  if (loading) {
    return (
      <FullPageLoader
        title="Loading Profile…"
        subtitle="Fetching your information"
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#1e202c] flex">
      <Navbar onLogout={handleLogout} />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl p-4 md:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#60519b] via-[#7d6ab8] to-[#60519b] p-8 md:p-10 shadow-2xl shadow-[#60519b]/20">
              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/5 to-transparent" />
              <div className="relative z-10">
                <h1 className="mb-3 text-3xl font-bold text-white md:text-4xl tracking-tight">
                  Update Profile
                </h1>
                <p className="text-base font-medium text-white/90 md:text-lg">
                  Manage your personal information and security settings
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-8 flex justify-center">
            <div className="flex gap-2 rounded-xl bg-[#31323e] p-2 shadow-xl shadow-black/20">
              <button
                onClick={() => setActiveTab("personal")}
                className={`px-8 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 ${
                  activeTab === "personal"
                    ? "bg-gradient-to-r from-[#60519b] to-[#7d6ab8] text-white shadow-lg shadow-[#60519b]/40 scale-105"
                    : "text-[#bfc0d1] hover:bg-[#3a3b47] hover:text-white hover:scale-105"
                }`}
              >
                Personal Details
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`px-8 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 ${
                  activeTab === "security"
                    ? "bg-gradient-to-r from-[#60519b] to-[#7d6ab8] text-white shadow-lg shadow-[#60519b]/40 scale-105"
                    : "text-[#bfc0d1] hover:bg-[#3a3b47] hover:text-white hover:scale-105"
                }`}
              >
                Security
              </button>
            </div>
          </div>

          {/* Personal Details Tab */}
          {activeTab === "personal" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Avatar Section */}
              <div className="rounded-2xl border border-[#60519b]/20 bg-[#31323e] p-6 md:p-8">
                <h2 className="mb-6 text-xl font-bold text-white">
                  Profile Picture
                </h2>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#60519b] to-[#7d6ab8] blur-lg opacity-50" />
                    <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-[#31323e] bg-gradient-to-br from-[#60519b] to-[#7d6ab8]">
                      <img
                        src={avatarPreview || profile.avatar}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div>
                      <label
                        htmlFor="avatar-upload"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#60519b]/20 text-[#60519b] text-sm font-semibold tracking-wide hover:bg-[#60519b]/30 hover:scale-105 transition-all duration-300 cursor-pointer"
                      >
                        <Camera size={18} />
                        Choose New Picture
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </div>

                    {avatarFile && (
                      <div className="flex gap-2">
                        <button
                          onClick={handleAvatarUpload}
                          disabled={uploadingAvatar}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#60519b] to-[#7d6ab8] text-white text-sm font-semibold tracking-wide hover:shadow-lg hover:shadow-[#60519b]/30 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {uploadingAvatar ? (
                            <>
                              <Loader size={18} className="animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Save size={18} />
                              Save Avatar
                            </>
                          )}
                        </button>
                        <button
                          onClick={handleCancelAvatarChange}
                          disabled={uploadingAvatar}
                          className="px-5 py-2.5 rounded-xl bg-red-500/20 text-red-400 text-sm font-semibold tracking-wide hover:bg-red-500/30 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    <p className="text-xs text-[#bfc0d1]/60">
                      JPG, JPEG, PNG, GIF, or WEBP. Max size: 2MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Profile Form */}
              <div className="rounded-2xl border border-[#60519b]/20 bg-[#31323e] p-6 md:p-8">
                <h2 className="mb-6 text-xl font-bold text-white">
                  Personal Information
                </h2>

                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Name */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#bfc0d1]">
                      Full Name
                    </label>
                    <div className="relative">
                      <User
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#60519b]"
                      />
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className="w-full rounded-xl border border-[#60519b]/20 bg-[#1e202c] pl-10 pr-4 py-3 text-white placeholder:text-[#bfc0d1]/40 focus:border-[#60519b] focus:outline-none focus:ring-2 focus:ring-[#60519b]/20"
                        placeholder="Enter your name"
                      />
                    </div>
                  </div>

                  {/* Email (Read-only) */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#bfc0d1]">
                      Email Address
                    </label>
                    <div className="relative group">
                      <Mail
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#bfc0d1]/50"
                      />
                      <input
                        type="email"
                        value={profile.email}
                        readOnly
                        className="w-full rounded-xl border border-[#60519b]/20 bg-[#1e202c]/50 pl-10 pr-4 py-3 text-[#bfc0d1]/60 cursor-not-allowed"
                      />
                      <div className="absolute left-0 -top-12 bg-[#1e202c] border border-[#60519b]/20 rounded-lg px-3 py-2 text-xs text-[#bfc0d1] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Email cannot be updated
                      </div>
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#bfc0d1]">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#60519b]"
                      />
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        className="w-full rounded-xl border border-[#60519b]/20 bg-[#1e202c] pl-10 pr-4 py-3 text-white placeholder:text-[#bfc0d1]/40 focus:border-[#60519b] focus:outline-none focus:ring-2 focus:ring-[#60519b]/20"
                        placeholder="Enter your phone"
                      />
                    </div>
                  </div>

                  {/* Role (Read-only) */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#bfc0d1]">
                      Role
                    </label>
                    <div className="relative group">
                      <Shield
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#bfc0d1]/50"
                      />
                      <input
                        type="text"
                        value={profile.role}
                        readOnly
                        className="w-full rounded-xl border border-[#60519b]/20 bg-[#1e202c]/50 pl-10 pr-4 py-3 text-[#bfc0d1]/60 cursor-not-allowed capitalize"
                      />
                      <div className="absolute left-0 -top-12 bg-[#1e202c] border border-[#60519b]/20 rounded-lg px-3 py-2 text-xs text-[#bfc0d1] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Role cannot be changed
                      </div>
                    </div>
                  </div>

                  {/* Address - Full Width */}
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-[#bfc0d1]">
                      Address
                    </label>
                    <div className="relative">
                      <MapPin
                        size={18}
                        className="absolute left-3 top-3 text-[#60519b]"
                      />
                      <textarea
                        value={profile.address}
                        onChange={(e) =>
                          handleInputChange("address", e.target.value)
                        }
                        rows={3}
                        className="w-full rounded-xl border border-[#60519b]/20 bg-[#1e202c] pl-10 pr-4 py-3 text-white placeholder:text-[#bfc0d1]/40 focus:border-[#60519b] focus:outline-none focus:ring-2 focus:ring-[#60519b]/20 resize-none"
                        placeholder="Enter your address"
                      />
                    </div>
                  </div>

                  {/* Bio - Full Width */}
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-[#bfc0d1]">
                      Bio
                    </label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      rows={4}
                      className="w-full rounded-xl border border-[#60519b]/20 bg-[#1e202c] px-4 py-3 text-white placeholder:text-[#bfc0d1]/40 focus:border-[#60519b] focus:outline-none focus:ring-2 focus:ring-[#60519b]/20 resize-none"
                      placeholder="Tell us about yourself"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    disabled={!isProfileChanged() || saving}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#60519b] to-[#7d6ab8] text-white text-sm font-semibold tracking-wide hover:shadow-lg hover:shadow-[#60519b]/30 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {saving ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Google Login Warning */}
              {profile.mode === "google" &&
                !profile.passwordChanged &&
                profile.tempPassword && (
                  <div className="rounded-xl border border-red-500/30 bg-gradient-to-r from-red-500/15 via-red-500/10 to-transparent p-6">
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
                            {profile.tempPassword}
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
              <div className="rounded-2xl border border-[#60519b]/20 bg-[#31323e] p-6 md:p-8">
                <h2 className="mb-6 text-xl font-bold text-white flex items-center gap-3">
                  <Lock size={24} className="text-[#60519b]" />
                  Change Password
                </h2>

                <div className="space-y-6">
                  {/* Step 1: Request OTP */}
                  {!otpSent && (
                    <div>
                      <p className="mb-4 text-sm text-[#bfc0d1]">
                        To change your password, we'll send an OTP to your
                        registered email
                      </p>
                      <button
                        onClick={handleRequestOTP}
                        disabled={sendingOtp}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#60519b] to-[#7d6ab8] text-white text-sm font-semibold tracking-wide hover:shadow-lg hover:shadow-[#60519b]/30 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
                          className="flex-1 rounded-xl border border-[#60519b]/20 bg-[#1e202c] px-4 py-3 text-white placeholder:text-[#bfc0d1]/40 focus:border-[#60519b] focus:outline-none focus:ring-2 focus:ring-[#60519b]/20"
                          placeholder="Enter 6-digit OTP"
                          maxLength={6}
                        />
                        <button
                          onClick={handleVerifyOTP}
                          disabled={verifyingOtp || !securityForm.otp}
                          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#60519b] to-[#7d6ab8] text-white text-sm font-semibold tracking-wide hover:shadow-lg hover:shadow-[#60519b]/30 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className="mt-2 text-xs text-[#60519b] hover:text-[#7d6ab8] transition-colors"
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
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#60519b]"
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
                              className="w-full rounded-xl border border-[#60519b]/20 bg-[#1e202c] pl-10 pr-12 py-3 text-white placeholder:text-[#bfc0d1]/40 focus:border-[#60519b] focus:outline-none focus:ring-2 focus:ring-[#60519b]/20"
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
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#60519b]"
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
                              className="w-full rounded-xl border border-[#60519b]/20 bg-[#1e202c] pl-10 pr-12 py-3 text-white placeholder:text-[#bfc0d1]/40 focus:border-[#60519b] focus:outline-none focus:ring-2 focus:ring-[#60519b]/20"
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
                          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#60519b] to-[#7d6ab8] text-white text-sm font-semibold tracking-wide hover:shadow-lg hover:shadow-[#60519b]/30 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default OwnerUpdateProfile;
