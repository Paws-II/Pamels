import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Activity,
  AlertCircle,
  Bell,
  Calendar,
  Mail,
  MapPin,
  Package,
  Phone,
  User,
} from "lucide-react";

import Navbar from "../../components/Owners/NavbarOwner";
import FullPageLoader from "../../Common/FullPageLoader";
import defaultAvatar from "../../assets/Owner/default-owner.png";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const OwnerDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("profile");

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
      profile?.avatar &&
      profile.avatar !== "something(url)" &&
      profile.avatar.trim() !== ""
        ? profile.avatar
        : defaultAvatar,

    tempPassword:
      profile?.mode === "google" && profile?.tempPassword
        ? profile.tempPassword
        : null,
  };

  if (loading) {
    return (
      <FullPageLoader
        title="Loading Owner Dashboard…"
        subtitle="Fetching your pets, requests, and profile"
      />
    );
  }

  if (error) return <FullPageError message={error} onAction={fetchProfile} />;

  return (
    <div className="min-h-screen bg-[#1e202c] flex">
      <Navbar onLogout={handleLogout} />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
          <div className="mb-8">
            <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-[#60519b] via-[#7d6ab8] to-[#60519b] p-8 md:p-10 shadow-2xl shadow-[#60519b]/20 transition-shadow hover:shadow-[#60519b]/40">
              <div className="absolute inset-0 animate-pulse bg-linear-to-r from-transparent via-white/5 to-transparent" />
              <div className="relative z-10">
                <h1 className="mb-3 text-3xl font-bold text-white md:text-4xl lg:text-5xl tracking-tight leading-tight">
                  Welcome back, {ownerData.name}! 👋
                </h1>
                <p className="max-w-2xl text-base font-medium text-white/90 md:text-lg leading-relaxed">
                  Manage your pets, track adoptions, and connect with trainers
                </p>
              </div>
              <div className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-white/10 blur-3xl transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-3xl transition-transform duration-700 group-hover:scale-110" />
            </div>
          </div>

          <div className="mb-8 flex justify-center">
            <div className="flex gap-2 rounded-xl bg-[#31323e] p-2 shadow-xl shadow-black/20">
              {["profile", "pets", "store"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 ${
                    activeTab === tab
                      ? "bg-linear-to-r from-[#60519b] to-[#7d6ab8] text-white shadow-lg shadow-[#60519b]/40 scale-105"
                      : "text-[#bfc0d1] hover:bg-[#3a3b47] hover:text-white hover:scale-105"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="animate-fadeIn">
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-[#60519b]/20 bg-[#31323e] p-6 md:p-8">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                      Owner Control Center
                    </h2>
                    <button className="relative rounded-lg p-2 transition-colors hover:bg-[#60519b]/20">
                      <Bell size={20} className="text-[#bfc0d1]" />
                      <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-8 lg:flex-row items-start">
                    <div className="flex flex-1 min-w-0 flex-col gap-6 sm:flex-row">
                      <div className="shrink-0">
                        <div className="relative">
                          <div className="absolute inset-0 rounded-full bg-linear-to-br from-[#60519b] to-[#7d6ab8] blur-lg opacity-50" />
                          <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-[#31323e] bg-linear-to-br from-[#60519b] to-[#7d6ab8]">
                            {ownerData.avatar ? (
                              <img
                                src={ownerData.avatar}
                                alt="Profile"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <User size={48} className="text-white" />
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 space-y-4">
                        <div>
                          <h3 className="mb-2 text-2xl font-bold text-white">
                            {ownerData.name}
                          </h3>
                          <span className="inline-block rounded-full border border-[#60519b]/30 bg-[#60519b]/20 px-3 py-1 text-xs font-medium uppercase text-[#60519b]">
                            {ownerData.role}
                          </span>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="flex items-start gap-3">
                            <Mail size={18} className="mt-0.5 text-[#60519b]" />
                            <div>
                              <p className="mb-1 text-xs text-[#bfc0d1]/60">
                                Email
                              </p>
                              <p className="text-sm text-[#bfc0d1]">
                                {ownerData.email}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Phone
                              size={18}
                              className="mt-0.5 text-[#60519b]"
                            />
                            <div>
                              <p className="mb-1 text-xs text-[#bfc0d1]/60">
                                Phone
                              </p>
                              <p className="text-sm text-[#bfc0d1]">
                                {ownerData.phone}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 sm:col-span-2">
                            <MapPin
                              size={18}
                              className="mt-0.5 text-[#60519b]"
                            />
                            <div>
                              <p className="mb-1 text-xs text-[#bfc0d1]/60">
                                Address
                              </p>
                              <p className="text-sm text-[#bfc0d1]">
                                {ownerData.address}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
                          <Link
                            to="/owner-update-profile"
                            className="px-5 py-2.5 rounded-xl bg-[#60519b]/20 text-[#60519b] text-sm font-semibold tracking-wide hover:bg-[#60519b]/30 hover:scale-105 transition-all duration-300 active:scale-95"
                          >
                            Edit Profile
                          </Link>
                          <button className="px-5 py-2.5 rounded-xl bg-[#60519b]/20 text-[#60519b] text-sm font-semibold tracking-wide hover:bg-[#60519b]/30 hover:scale-105 transition-all duration-300 active:scale-95">
                            Change Password
                          </button>
                        </div>

                        {ownerData.tempPassword && (
                          <div className="mt-6 rounded-xl border border-red-500/30 bg-linear-to-r from-red-500/15 via-red-500/10 to-transparent p-5">
                            <div className="flex gap-4">
                              <AlertCircle
                                size={22}
                                className="mt-1 text-red-400"
                              />
                              <div className="flex-1">
                                <h4 className="text-sm font-semibold text-red-400">
                                  Temporary Password Active
                                </h4>
                                <p className="mt-1 text-sm text-[#bfc0d1] leading-relaxed">
                                  You’re currently using a{" "}
                                  <span className="font-medium text-red-400">
                                    temporary password
                                  </span>
                                  . Please update it as soon as possible.
                                </p>
                                <div className="mt-3 flex flex-wrap gap-3 items-center">
                                  <div className="rounded-lg bg-red-500/20 px-3 py-1 font-mono text-xs text-red-300">
                                    Temp Password: {ownerData.tempPassword}
                                  </div>
                                  <button className="rounded-lg bg-red-500 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-600">
                                    Change Password Now
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid w-full grid-cols-2 gap-4 lg:w-[320px]">
                      {[
                        ["34", "Pets Adopted"],
                        ["12", "Active Pets"],
                        ["5", "Meetings"],
                        ["8", "Requests"],
                      ].map(([value, label]) => (
                        <div
                          key={label}
                          className="group cursor-pointer rounded-xl border border-[#60519b]/20 bg-[#1e202c]/60 p-5 text-center transition-all duration-300 hover:border-[#60519b]/50 hover:bg-[#1e202c]/80 hover:shadow-lg hover:shadow-[#60519b]/20 hover:scale-105"
                        >
                          <p className="text-4xl font-bold text-white transition-transform group-hover:scale-110">
                            {value}
                          </p>
                          <p className="mt-2 text-xs font-medium uppercase tracking-wider text-[#bfc0d1]/80">
                            {label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-[#60519b]/20 bg-[#31323e] p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="rounded-lg bg-linear-to-br from-[#60519b] to-[#7d6ab8] p-2">
                        <Activity size={18} className="text-white" />
                      </div>
                      <h2 className="text-lg font-bold text-white">
                        News & Announcements
                      </h2>
                    </div>

                    <div className="max-h-80 space-y-3 overflow-y-auto">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="rounded-xl border border-[#60519b]/10 bg-[#1e202c]/50 p-4"
                        >
                          <div className="mb-2 h-4 w-3/4 rounded bg-[#60519b]/20" />
                          <div className="mb-1 h-3 w-full rounded bg-[#60519b]/10" />
                          <div className="h-3 w-2/3 rounded bg-[#60519b]/10" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#60519b]/20 bg-[#31323e] p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="rounded-lg bg-linear-to-br from-[#60519b] to-[#7d6ab8] p-2">
                        <Calendar size={18} className="text-white" />
                      </div>
                      <h2 className="text-lg font-bold text-white">
                        Account Activity
                      </h2>
                    </div>

                    <div className="max-h-80 space-y-3 overflow-y-auto">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="flex gap-3 rounded-xl border border-[#60519b]/10 bg-[#1e202c]/50 p-3"
                        >
                          <div className="mt-2 h-2 w-2 rounded-full bg-[#60519b]" />
                          <div className="flex-1">
                            <div className="mb-2 h-3 w-2/3 rounded bg-[#60519b]/20" />
                            <div className="h-2 w-1/3 rounded bg-[#60519b]/10" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#60519b]/20 bg-[#31323e] p-6">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-lg bg-linear-to-br from-[#60519b] to-[#7d6ab8] p-2">
                      <Calendar size={20} className="text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">
                      Shelter Meetings
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-[#60519b]/10 bg-[#1e202c]/50 p-5"
                      >
                        <div className="grid gap-4 sm:grid-cols-4">
                          {[
                            "Meeting Title",
                            "Shelter Name",
                            "Date",
                            "Status",
                          ].map((label) => (
                            <div key={label}>
                              <p className="mb-2 text-xs text-[#bfc0d1]/60">
                                {label}
                              </p>
                              <div className="h-4 rounded bg-[#60519b]/20" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "pets" && (
              <div className="space-y-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">My Pets</h2>
                  <button className="rounded-lg bg-linear-to-r from-[#60519b] to-[#7d6ab8] px-4 py-2 font-medium text-white transition-all hover:shadow-lg hover:shadow-[#60519b]/30">
                    Add New Pet
                  </button>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-[#60519b]/20 bg-[#31323e] p-6 transition-all hover:border-[#60519b]/40"
                    >
                      <div className="mb-4 aspect-square rounded-xl bg-[#1e202c]/50" />
                      <div className="mb-3 h-5 rounded bg-[#60519b]/20" />
                      <div className="mb-2 h-4 rounded bg-[#60519b]/10" />
                      <div className="h-4 w-2/3 rounded bg-[#60519b]/10" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "store" && (
              <div className="space-y-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Pet Store</h2>
                  <Package size={24} className="text-[#60519b]" />
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-[#60519b]/20 bg-[#31323e] p-5 transition-all hover:border-[#60519b]/40"
                    >
                      <div className="mb-4 aspect-square rounded-xl bg-[#1e202c]/50" />
                      <div className="mb-3 h-4 rounded bg-[#60519b]/20" />
                      <div className="mb-2 h-3 rounded bg-[#60519b]/10" />
                      <div className="mt-4 flex items-center justify-between">
                        <div className="h-5 w-16 rounded bg-[#60519b]/20" />
                        <button className="rounded-lg bg-[#60519b]/20 px-3 py-1 text-xs text-[#60519b] transition-colors hover:bg-[#60519b]/30">
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default OwnerDashboard;
