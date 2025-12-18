import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Activity,
  Award,
  Bell,
  Calendar,
  CheckCircle,
  ClipboardList,
  Edit,
  Heart,
  Mail,
  MapPin,
  Phone,
  TrendingUp,
  User,
  Users,
} from "lucide-react";

import Navbar from "../../components/Owners/Navbar";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const OwnerDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/owner/profile`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setProfile(response.data.profile);
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
      setError("Failed to load profile");
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

  const ownerData = {
    name: profile?.name || "Owner",
    email: profile?.email || "owner@example.com",
    role: profile?.role || "owner",
    mode: profile?.mode || "manual",
    phone: profile?.phone || "Not set",
    address: profile?.address || "Not set",
    bio: profile?.bio || "No bio available",
    avatar:
      profile?.avatar && profile.avatar !== "something(url)"
        ? profile.avatar
        : null,
    tempPassword:
      profile?.mode === "google" && profile?.tempPassword
        ? profile.tempPassword
        : null,
  };

  const stats = [
    {
      icon: Heart,
      label: "Pets Listed",
      value: "3",
      color: "from-pink-500 to-rose-600",
    },
    {
      icon: ClipboardList,
      label: "Active Requests",
      value: "7",
      color: "from-blue-500 to-cyan-600",
    },
    {
      icon: CheckCircle,
      label: "Approved Adoptions",
      value: "12",
      color: "from-green-500 to-emerald-600",
    },
    {
      icon: Users,
      label: "Connected Trainers",
      value: "4",
      color: "from-purple-500 to-violet-600",
    },
  ];

  const recentActivities = [
    {
      action: "New adoption request received",
      pet: "Max (Golden Retriever)",
      time: "2 hours ago",
    },
    {
      action: "Adoption approved",
      pet: "Luna (Persian Cat)",
      time: "5 hours ago",
    },
    {
      action: "Trainer session scheduled",
      pet: "Buddy (Labrador)",
      time: "1 day ago",
    },
    {
      action: "Pet profile updated",
      pet: "Charlie (Beagle)",
      time: "2 days ago",
    },
  ];

  const notifications = [
    {
      message: "Your pet listing for Max has 3 new inquiries",
      urgent: true,
    },
    {
      message: "Upcoming trainer session tomorrow at 3 PM",
      urgent: false,
    },
    {
      message: "Monthly donation receipt is ready",
      urgent: false,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1e202c] flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#60519b]/30 border-t-[#60519b] rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Heart size={24} className="text-[#60519b] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1e202c] flex items-center justify-center p-4">
        <div className="max-w-md rounded-2xl border border-red-500/30 bg-red-500/10 p-8">
          <h2 className="mb-2 text-xl font-bold text-red-400">Error</h2>
          <p className="text-[#bfc0d1]">{error}</p>
          <button
            onClick={fetchProfile}
            className="mt-4 rounded-lg bg-red-500/20 px-4 py-2 text-red-400 transition-colors hover:bg-red-500/30"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1e202c] flex">
      <Navbar onLogout={handleLogout} />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
          <div className="mb-8">
            <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-[#60519b] via-[#7d6ab8] to-[#60519b] p-6 md:p-8">
              <div className="absolute inset-0 animate-pulse bg-linear-to-r from-transparent via-white/5 to-transparent" />
              <div className="relative z-10">
                <h1 className="mb-2 text-2xl font-bold text-white md:text-3xl lg:text-4xl">
                  Welcome back, {ownerData.name}! 👋
                </h1>
                <p className="text-sm text-white/80 md:text-base">
                  Manage your pets, track adoptions, and connect with trainers
                </p>
              </div>
              <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            </div>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;

              return (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-2xl border border-[#60519b]/20 bg-[#31323e] p-6 transition-all duration-300 hover:border-[#60519b]/50"
                >
                  <div
                    className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-10"
                    style={{
                      background: `linear-gradient(135deg, ${stat.color})`,
                    }}
                  />

                  <div className="relative z-10">
                    <div
                      className={`mb-4 inline-flex rounded-xl bg-linear-to-br ${stat.color} p-3 shadow-lg`}
                    >
                      <Icon size={24} className="text-white" />
                    </div>
                    <p className="mb-1 text-sm text-[#bfc0d1]">{stat.label}</p>
                    <p className="text-3xl font-bold text-white">
                      {stat.value}
                    </p>
                  </div>

                  <div className="absolute -right-10 -top-10 h-20 w-20 rounded-full bg-linear-to-br from-[#60519b]/10 to-transparent" />
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-[#60519b]/20 bg-[#31323e] p-6 backdrop-blur-sm">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-linear-to-br from-[#60519b] to-[#7d6ab8] p-2">
                      <Activity size={20} className="text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">
                      Recent Activities
                    </h2>
                  </div>
                  <TrendingUp size={20} className="text-[#60519b]" />
                </div>

                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div
                      key={index}
                      className="group flex items-start gap-4 rounded-xl border border-[#60519b]/10 bg-[#1e202c]/50 p-4 transition-all duration-300 hover:border-[#60519b]/30 hover:bg-[#1e202c]"
                    >
                      <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#60519b] transition-shadow group-hover:shadow-[0_0_10px_rgba(96,81,155,0.6)]" />
                      <div className="min-w-0 flex-1">
                        <p className="mb-1 font-medium text-white">
                          {activity.action}
                        </p>
                        <p className="mb-1 text-sm text-[#bfc0d1]">
                          {activity.pet}
                        </p>
                        <p className="flex items-center gap-1 text-xs text-[#bfc0d1]/60">
                          <Calendar size={12} />
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4 md:space-y-6">
              <div className="rounded-2xl border border-[#60519b]/20 bg-linear-to-br from-[#31323e] to-[#1e202c] p-6 backdrop-blur-sm">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">Profile</h2>
                  <button className="rounded-lg p-2 transition-colors hover:bg-[#60519b]/20">
                    <Edit size={18} className="text-[#bfc0d1]" />
                  </button>
                </div>

                <div className="mb-6 flex flex-col items-center">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 rounded-full bg-linear-to-br from-[#60519b] to-[#7d6ab8] blur-lg opacity-50" />
                    <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-[#31323e] bg-linear-to-br from-[#60519b] to-[#7d6ab8]">
                      {ownerData.avatar ? (
                        <img
                          src={ownerData.avatar}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User size={40} className="text-white" />
                      )}
                    </div>
                  </div>

                  <h3 className="mb-2 text-xl font-bold text-white">
                    {ownerData.name}
                  </h3>
                  <span className="rounded-full border border-[#60519b]/30 bg-[#60519b]/20 px-3 py-1 text-xs font-medium uppercase text-[#60519b]">
                    {ownerData.role}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 text-sm">
                    <Mail
                      size={16}
                      className="mt-0.5 shrink-0 text-[#60519b]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="mb-1 text-xs text-[#bfc0d1]/60">Email</p>
                      <p className="break-all text-[#bfc0d1]">
                        {ownerData.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-sm">
                    <Phone
                      size={16}
                      className="mt-0.5 shrink-0 text-[#60519b]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="mb-1 text-xs text-[#bfc0d1]/60">Phone</p>
                      <p className="text-[#bfc0d1]">{ownerData.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-sm">
                    <MapPin
                      size={16}
                      className="mt-0.5 shrink-0 text-[#60519b]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="mb-1 text-xs text-[#bfc0d1]/60">Address</p>
                      <p className="text-[#bfc0d1]">{ownerData.address}</p>
                    </div>
                  </div>

                  {ownerData.bio && (
                    <div className="border-t border-[#60519b]/20 pt-4">
                      <p className="mb-2 text-xs text-[#bfc0d1]/60">Bio</p>
                      <p className="text-sm leading-relaxed text-[#bfc0d1]">
                        {ownerData.bio}
                      </p>
                    </div>
                  )}
                </div>

                {ownerData.tempPassword && (
                  <div className="mt-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
                    <div className="mb-2 flex items-start gap-2">
                      <Bell
                        size={16}
                        className="mt-0.5 shrink-0 text-yellow-500"
                      />
                      <div>
                        <p className="mb-1 text-sm font-semibold text-yellow-500">
                          Temporary Password
                        </p>
                        <p className="mb-3 text-xs text-[#bfc0d1]">
                          Use this password for manual login with your email
                        </p>
                      </div>
                    </div>
                    <code className="block overflow-x-auto rounded-lg bg-[#1e202c] px-3 py-2 font-mono text-sm text-[#bfc0d1]">
                      {ownerData.tempPassword}
                    </code>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-[#60519b]/20 bg-[#31323e] p-6 backdrop-blur-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-lg bg-linear-to-br from-[#60519b] to-[#7d6ab8] p-2">
                    <Bell size={18} className="text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-white">
                    Notifications
                  </h2>
                </div>

                <div className="space-y-3">
                  {notifications.map((notif, index) => (
                    <div
                      key={index}
                      className={`rounded-xl border p-4 transition-all duration-300 hover:scale-[1.02] ${
                        notif.urgent
                          ? "border-red-500/30 bg-red-500/10"
                          : "border-[#60519b]/10 bg-[#1e202c]/50"
                      }`}
                    >
                      <p
                        className={`text-sm leading-relaxed ${
                          notif.urgent ? "text-red-300" : "text-[#bfc0d1]"
                        }`}
                      >
                        {notif.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-linear-to-br from-[#60519b] to-[#7d6ab8] p-6">
                <h2 className="mb-4 flex items-center gap-2 font-bold text-white">
                  <Award size={20} />
                  Quick Actions
                </h2>
                <div className="space-y-2">
                  <button className="w-full rounded-lg bg-white/20 px-4 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-white/30">
                    Add New Pet
                  </button>
                  <button className="w-full rounded-lg bg-white/20 px-4 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-white/30">
                    Find Trainer
                  </button>
                  <button className="w-full rounded-lg bg-white/20 px-4 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-white/30">
                    View Resources
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OwnerDashboard;
