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
import ShelterUpdateProfile from "./pages/Shelters/ShelterUpdateProfile.jsx";
import ShelterPetAdd from "./pages/Shelters/ShelterPetAdd.jsx";
import ShelterPetView from "./pages/Shelters/ShelterPetView.jsx";
import PetDetailsPage from "./pages/Shelters/PetDetailsPage.jsx";
import OwnerAdoptPet from "./pages/Owners/OwnerAdoptPet.jsx";
import ShelterApplications from "./pages/Shelters/ShelterApplications.jsx";
import ShelterApplicationDetail from "./pages/Shelters/ShelterApplicationDetail.jsx";
import OwnerMyApplications from "./pages/Owners/OwnerMyApplications.jsx";
import RejectedApplicationDetail from "./pages/Owners/RejectedApplicationDetail.jsx";
import OwnerChatRoom from "./pages/Owners/OwnerChatRoom.jsx";
import ShelterChatRoom from "./pages/Shelters/ShelterChatRoom.jsx";
import ShelterMeetings from "./pages/Shelters/ShelterMeetings.jsx";
import OwnerMeetings from "./pages/Owners/OwnerMeetings.jsx";
import ShelterApplicationJourney from "./pages/Shelters/ShelterApplicationJourney.jsx";
import OwnerApplicationJourney from "./pages/Owners/OwnerApplicationJourney.jsx";
import OwnerApplicationDetail from "./pages/Owners/OwnerApplicationDetail.jsx";
import OwnerArchivedApplications from "./pages/Owners/OwnerArchivedApplications.jsx";
import OwnerArchivedApplicationDetail from "./pages/Owners/OwnerArchivedApplicationDetail.jsx";
import ShelterArchivedApplications from "./pages/Shelters/ShelterArchivedApplications.jsx";

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

          <Route
            path="/shelter-update-profile"
            element={<ShelterUpdateProfile />}
          />

          <Route path="/add-pet" element={<ShelterPetAdd />} />
          <Route path="/my-pets" element={<ShelterPetView />} />
          <Route path="/shelter/pets/:petId" element={<PetDetailsPage />} />
          <Route path="/adopt-pet" element={<OwnerAdoptPet />} />

          <Route
            path="/applications-shelter"
            element={<ShelterApplications />}
          />
          <Route
            path="/shelter/applications-shelter/:applicationId"
            element={<ShelterApplicationDetail />}
          />
          <Route path="/applications-owner" element={<OwnerMyApplications />} />
          <Route
            path="/applications-owner/rejected/:applicationId"
            element={<RejectedApplicationDetail />}
          />

          <Route path="/owner-chat" element={<OwnerChatRoom />} />
          <Route path="/shelter-chat" element={<ShelterChatRoom />} />
          <Route
            path="/schedule-meeting-shelter"
            element={<ShelterMeetings />}
          />

          <Route path="/owner-meetings" element={<OwnerMeetings />} />

          <Route
            path="/application-journey-shelter"
            element={<ShelterApplicationJourney />}
          />
          <Route
            path="/application-journey-owner/:applicationId"
            element={<OwnerApplicationJourney />}
          />

          <Route
            path="/applications-owner/application/:applicationId"
            element={<OwnerApplicationDetail />}
          />

          <Route path="/applications-owner" element={<OwnerMyApplications />} />

          <Route
            path="/applications-owner/archived"
            element={<OwnerArchivedApplications />}
          />

          <Route
            path="/applications-owner/archived/:applicationId"
            element={<OwnerArchivedApplicationDetail />}
          />

          <Route
            path="/applications-shelter/archived"
            element={<ShelterArchivedApplications />}
          />
        </Routes>
      </BrowserRouter>
    </SocketProvider>
  </StrictMode>
);
