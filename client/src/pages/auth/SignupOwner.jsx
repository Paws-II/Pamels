import React, { useState } from "react";
import axios from "axios";
import OTPForm from "./OTPForm";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const OwnerSignup = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });

  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleEmailCheck = async () => {
    if (!formData.email) {
      setMessage({ type: "error", text: "Please enter an email" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const { data } = await axios.post(
        `${API_URL}/api/auth/owner/check-email`,
        { email: formData.email },
        { withCredentials: true }
      );

      if (data.success) {
        setIsEmailVerified(true);
        setMessage({ type: "success", text: "Email is available!" });
      } else {
        setIsEmailVerified(false);
        setMessage({ type: "error", text: data.message });
      }
    } catch (err) {
      console.error("Email check error:", err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to check email",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!agreedToTerms) {
      setMessage({ type: "error", text: "Please agree to Terms & Conditions" });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const { data } = await axios.post(
        `${API_URL}/api/auth/owner/signup`,
        {
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        },
        { withCredentials: true }
      );

      if (data.success) {
        setIsOTPSent(true);
        setMessage({ type: "success", text: data.message });
      }
    } catch (err) {
      console.error("Signup error:", err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Signup failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!formData.otp || formData.otp.length !== 6) {
      setMessage({ type: "error", text: "Please enter a valid 6-digit OTP" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const { data } = await axios.post(
        `${API_URL}/api/auth/owner/verify-otp`,
        { email: formData.email, otp: formData.otp },
        { withCredentials: true }
      );

      if (data.success) {
        setMessage({ type: "success", text: "Email verified! Redirecting..." });
        localStorage.setItem("token", data.token);
        setTimeout(() => (window.location.href = "/owner-dashboard"), 1500);
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "OTP verification failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const { data } = await axios.post(
        `${API_URL}/api/auth/owner/resend-otp`,
        { email: formData.email },
        { withCredentials: true }
      );

      if (data.success) {
        setMessage({ type: "success", text: "New OTP sent to your email!" });
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to resend OTP",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex justify-center min-h-screen bg-gray-800">
      <div
        className="
          w-full max-w-md p-6 rounded-xl
          bg-gray-800/80 border border-gray-700
          shadow-l
        "
      >
        <button
          type="button"
          onClick={() => {
            window.location.href = `${API_URL}/api/auth/google/owner`;
          }}
          className="w-full py-2 mb-4 rounded-lg font-medium
          flex items-center justify-center gap-2
           bg-white text-gray-800
           border border-gray-300 hover:bg-gray-50 transition"
        >
          <span
            className="w-5 h-5 rounded-full bg-white
            flex items-center justify-center
            text-xs font-bold text-gray-800"
          >
            G
          </span>

          <span>Sign up with Google</span>
        </button>

        <div className="flex items-center my-4">
          <div className="grow h-px bg-gray-700" />
          <span className="px-3 text-sm text-gray-400">or</span>
          <div className="grow h-px bg-gray-700" />
        </div>

        <h2 className="mb-6 text-3xl font-semibold text-center text-blue-400">
          {isOTPSent ? "Verify Your Email" : "Signup for Owners"}
        </h2>

        {message.text && (
          <div
            className={
              message.type === "error"
                ? "mb-4 p-3 rounded-lg text-sm bg-red-900/30 text-red-400 border border-red-500"
                : "mb-4 p-3 rounded-lg text-sm bg-green-900/30 text-green-400 border border-green-500"
            }
          >
            {message.text}
          </div>
        )}

        {!isOTPSent ? (
          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block mb-1 text-sm text-gray-300">Email</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-gray-200 focus:outline-none focus:border-blue-500"
                  disabled={isEmailVerified}
                  required
                />
                {!isEmailVerified && (
                  <button
                    type="button"
                    onClick={handleEmailCheck}
                    disabled={loading}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "..." : "Check"}
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm text-gray-300">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password (min 8 chars)"
                className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-gray-200 focus:outline-none focus:border-blue-500"
                disabled={!isEmailVerified}
                required
                minLength={8}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm text-gray-300">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Re-enter password"
                className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-gray-200 focus:outline-none focus:border-blue-500"
                disabled={!isEmailVerified}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4"
                disabled={!isEmailVerified}
              />
              <p className="text-sm text-gray-300">
                I agree to the{" "}
                <span className="text-blue-400 cursor-pointer">
                  Terms & Conditions
                </span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !isEmailVerified}
              className="w-full py-2 mt-4 font-semibold rounded-lg text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Processing..." : "Sign Up"}
            </button>
          </form>
        ) : (
          <OTPForm
            formData={formData}
            loading={loading}
            handleInputChange={handleInputChange}
            handleVerifyOTP={handleVerifyOTP}
            handleResendOTP={handleResendOTP}
          />
        )}

        <p className="mt-4 text-sm text-center text-gray-400">
          Already have an account?{" "}
          <a href="/login" className="text-blue-400 hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
};

export default OwnerSignup;
