import React, { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setMessage({ type: "error", text: "Please fill in all fields" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/login`,
        {
          email: formData.email,
          password: formData.password,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setMessage({
          type: "success",
          text: "Login successful! Redirecting...",
        });

        setTimeout(() => {
          if (response.data.user.role === "owner") {
            window.location.href = "/owner-dashboard";
          } else if (response.data.user.role === "shelter") {
            window.location.href = "/shelter-dashboard";
          } else {
            window.location.href = "/dashboard";
          }
        }, 1500);
      }
    } catch (error) {
      console.error("Login error:", error);

      const errorMessage = error.response?.data?.message || "Login failed";
      setMessage({ type: "error", text: errorMessage });

      if (error.response?.data?.requiresVerification) {
        setTimeout(() => {
          window.location.href = `/owner-signup?email=${formData.email}`;
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center min-h-screen bg-gray-800">
      <div
        className="
          w-full max-w-md p-6 rounded-xl shadow-lg
          bg-gray-800/80 border border-gray-700
        "
      >
        <h2 className="mb-6 text-3xl font-semibold text-center text-blue-400">
          Login
        </h2>

        <button
          type="button"
          onClick={() => {
            window.location.href = `${API_URL}/api/auth/google/login`;
          }}
          className="w-full py-2 mb-5 rounded-lg font-medium
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
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center my-4">
          <div className="grow h-px bg-gray-700" />
          <span className="px-3 text-sm text-gray-400">or</span>
          <div className="grow h-px bg-gray-700" />
        </div>

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

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 text-sm text-gray-300">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-2 rounded-lg bg-gray-900 text-gray-200 border border-gray-700 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-gray-300">Password</label>
              <button
                type="button"
                className="text-xs text-blue-400 hover:underline"
                onClick={() => (window.location.href = "/forgot-password")}
              >
                Forgot Password?
              </button>
            </div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-2 rounded-lg bg-gray-900 text-gray-200 border border-gray-700 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 mt-4 font-semibold rounded-lg text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-400">
          Don't have an account?{" "}
          <a href="/signupOwner" className="text-blue-400 hover:underline">
            Sign up as Owner
          </a>
          {" or "}
          <a href="/signupShelter" className="text-blue-400 hover:underline">
            Sign up as Shelter
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
