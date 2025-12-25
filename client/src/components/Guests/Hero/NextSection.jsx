import React from "react";

const NextSection = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-end px-6 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-700/20 via-transparent to-transparent"></div>

      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[300px] h-[200px] pointer-events-none z-10">
        {/* This creates the layering effect where cards appear to go behind */}
      </div>
    </div>
  );
};

export default NextSection;
