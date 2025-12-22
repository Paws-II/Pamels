import React from "react";
import { ArrowRight } from "lucide-react";

const HeroNarrative = ({ titleRef }) => {
  const heroStats = [
    { number: "2,500+", title: "Pets Adopted" },
    { number: "98%", title: "Success Rate" },
    { number: "500+", title: "Verified Trainers" },
  ];

  return (
    <div className="space-y-10">
      <style>
        {`
.jp-title {
  position: absolute;
  top: 100%;
  left: 16rem;
  transform: translateY(-0.95em);

  font-family: 'Noto Serif JP','Cormorant Garamond',serif;
  font-weight: 900;
  font-size: clamp(1.4rem, 2vw, 1.8rem);
  letter-spacing: 0.32em;

  background: linear-gradient(
    90deg,
    rgba(255,255,255,1),
    rgba(255,255,255,0.6)
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;

  -webkit-text-stroke: 0.6px rgba(255,255,255,0.25);

  opacity: 0.95;
  white-space: nowrap;
  pointer-events: none;
}


`}
      </style>
      <div className="relative inline-block">
        <h1
          ref={titleRef}
          className="
      relative
      pb-6
      text-6xl md:text-7xl lg:text-8xl
      leading-[1.05]
      bg-clip-text text-transparent
      drop-shadow-[0_6px_24px_rgba(0,0,0,0.35)]
    "
          style={{
            fontFamily: "'Allura','Pacifico',cursive",
            fontWeight: 600,
            letterSpacing: "-0.015em",
            WebkitTextStroke: "0.6px rgba(255,255,255,0.12)",
            textShadow: "0 10px 28px rgba(0,0,0,0.35)",
          }}
        >
          WhisperTails
        </h1>

        <span className="jp-title ">ウィスパーテイル</span>
      </div>

      <div
        className="pl-1 text-2xl md:text-3xl text-white/85"
        style={{
          fontFamily: "'Cormorant Garamond','Georgia',serif",
          fontStyle: "italic",
          letterSpacing: "0.02em",
        }}
      >
        Where quiet hearts find a home
      </div>

      <div className="flex flex-wrap gap-4 pt-4">
        <button
          className="
            group relative flex items-center gap-2
            rounded-full px-8 py-4
            bg-white text-slate-900
            transition-all duration-300
            hover:scale-[1.03]
            hover:shadow-[0_10px_40px_rgba(255,255,255,0.25)]
            active:scale-[0.98]
            overflow-hidden
          "
          style={{ fontFamily: "'Inter',sans-serif" }}
        >
          <span className="relative z-10">Browse Pets</span>
          <ArrowRight
            size={18}
            className="relative z-10 transition-transform duration-300 group-hover:translate-x-1"
          />
          <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/25 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </button>

        <button
          className="
            rounded-full px-8 py-4
            border border-white/30
            text-white/85
            backdrop-blur-sm
            transition-all duration-300
            hover:bg-white/10
            hover:border-white/50
            hover:scale-[1.03]
            active:scale-[0.98]
          "
          style={{ fontFamily: "'Inter',sans-serif" }}
        >
          Get Started
        </button>
      </div>

      <div className="flex items-center gap-10 pt-8">
        {heroStats.map((stat, index) => (
          <React.Fragment key={stat.title}>
            <div>
              <div
                className="text-3xl text-white"
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                }}
              >
                {stat.number}
              </div>
              <div
                className="mt-1 text-xs tracking-widest text-white/60 uppercase"
                style={{ fontFamily: "'Inter',sans-serif" }}
              >
                {stat.title}
              </div>
            </div>

            {index !== heroStats.length - 1 && (
              <div className="w-px h-10 bg-linear-to-b from-transparent via-white/25 to-transparent" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default HeroNarrative;
