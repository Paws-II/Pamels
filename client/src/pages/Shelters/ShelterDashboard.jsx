import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const ShelterDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/shelter/profile`, {
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Shelter Dashboard</h1>

      <div
        style={{ marginTop: "20px", border: "1px solid #ccc", padding: "15px" }}
      >
        <h2>Profile Information</h2>

        {profile.avatar && (
          <div>
            <img
              src={profile.avatar}
              alt="Profile"
              style={{ width: "100px", height: "100px", borderRadius: "50%" }}
            />
          </div>
        )}

        <p>
          <strong>Name:</strong> {profile.name}
        </p>
        <p>
          <strong>Email:</strong> {profile.email}
        </p>
        <p>
          <strong>Role:</strong> {profile.role}
        </p>
        <p>
          <strong>Login Mode:</strong> {profile.mode}
        </p>

        {profile.mode === "google" && profile.tempPassword && (
          <div
            style={{
              marginTop: "15px",
              padding: "10px",
              backgroundColor: "#fff3cd",
              border: "1px solid #ffc107",
            }}
          >
            <p>
              <strong>Temporary Password (for manual login):</strong>
            </p>
            <p style={{ fontFamily: "monospace", fontSize: "16px" }}>
              {profile.tempPassword}
            </p>
            <p style={{ fontSize: "12px", color: "#666" }}>
              You can use this password to log in manually with your email.
            </p>
          </div>
        )}

        <p>
          <strong>Phone:</strong> {profile.phone || "Not set"}
        </p>
        <p>
          <strong>Address:</strong> {profile.address || "Not set"}
        </p>
        <p>
          <strong>Specialization:</strong> {profile.specialization}
        </p>
        <p>
          <strong>Experience:</strong> {profile.experience} years
        </p>
        <p>
          <strong>Bio:</strong> {profile.bio}
        </p>
      </div>

      <button
        onClick={handleLogout}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#dc3545",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default ShelterDashboard;
