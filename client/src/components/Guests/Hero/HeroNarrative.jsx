import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";

const HeroNarrative = ({ titleRef }) => {
  const heroStats = [
    { number: "2,500+", title: "Pets Adopted" },
    { number: "98%", title: "Success Rate" },
    { number: "500+", title: "Verified Trainers" },
  ];

  return (
    <div className="space-y-8">
      <div className="inline-block">
        <div
          className="
            flex items-center space-x-2
            rounded-full
            px-4 py-2
            bg-white/10 backdrop-blur-sm
            border border-white/20
          "
        >
          <Sparkles size={20} className="text-white" />
          <span className="text-sm">Trusted by 10,000+ pet lovers</span>
        </div>
      </div>

      <h1 className="text-6xl md:text-7xl font-bold leading-tight">
        <span ref={titleRef} className="bg-clip-text text-transparent">
          Pamels
        </span>
      </h1>

      <p className="text-xl leading-relaxed text-white/90">
        A modern platform to adopt, care, and connect with pets — promoting
        responsible ownership and giving every animal a loving home.
      </p>

      <div className="flex flex-wrap gap-4">
        <button
          className="
            group
            flex items-center space-x-2
            rounded-full
            px-8 py-4
            font-semibold
            bg-white text-slate-900
            transition-all duration-300
            transform hover:scale-105
            hover:shadow-2xl hover:shadow-white/30
          "
        >
          <span>Browse Pets</span>
          <ArrowRight
            size={20}
            className="transition-transform group-hover:translate-x-1"
          />
        </button>

        <button
          className="
            rounded-full
            px-8 py-4
            font-semibold
            border-2 border-white/40
            transition-all duration-300
            transform hover:scale-105
            hover:bg-white/10
          "
        >
          Get Started
        </button>
      </div>

      <div className="flex items-center space-x-8 pt-4">
        {heroStats.map((stat, index) => (
          <React.Fragment key={stat.title}>
            <div>
              <div className="text-3xl font-bold text-white">{stat.number}</div>
              <div className="text-sm text-white/70">{stat.title}</div>
            </div>

            {index !== heroStats.length - 1 && (
              <div className="w-px h-12 bg-white/30" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default HeroNarrative;
