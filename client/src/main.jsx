import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SocketProvider } from "../contexts/SocketContext.jsx";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";

import Login from "./pages/auth/Login.jsx";
import SignupShelter from "./pages/auth/SignupShelter.jsx";
import SignupOwner from "./pages/auth/SignupOwner.jsx";
import OwnerDashboard from "./pages/Owners/OwnerDashboard.jsx";
import ShelterDashboard from "./pages/Shelters/ShelterDashboard.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import Signup from "./pages/auth/Signup.jsx";
import OwnerUpdateProfile from "./pages/Owners/OwnerUpdateProfile.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SocketProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signupShelter" element={<SignupShelter />} />
          <Route path="/signupOwner" element={<SignupOwner />} />
          <Route path="/owner-dashboard" element={<OwnerDashboard />} />
          <Route path="/shelter-dashboard" element={<ShelterDashboard />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/owner-update-profile"
            element={<OwnerUpdateProfile />}
          />
        </Routes>
      </BrowserRouter>
    </SocketProvider>
  </StrictMode>
);
