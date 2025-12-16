import React from "react";
import { useNavigate } from "react-router-dom";

const DemoButtons = () => {
  const navigate = useNavigate();

  return (
    <div className="flex gap-4">
      <button
        type="button"
        className="
          px-5 py-2.5 
          bg-gray-800 text-white 
          border border-gray-700
          rounded-md 
          hover:bg-gray-700 
          transition
        "
        onClick={() => navigate("/login")}
      >
        Login
      </button>

      <button
        type="button"
        className="
          px-5 py-2.5
          bg-gray-900 text-cyan-400
          border border-gray-700
          rounded-md
          hover:bg-gray-800
          transition
        "
        onClick={() => navigate("/signupShelter")}
      >
        Sign Up (T)
      </button>

      <button
        type="button"
        className="
          px-5 py-2.5
          bg-gray-900 text-cyan-400
          border border-gray-700
          rounded-md
          hover:bg-gray-800
          transition
        "
        onClick={() => navigate("/signupOwner")}
      >
        Sign Up (O)
      </button>
    </div>
  );
};

export default DemoButtons;
