import React, { useEffect, useState } from "react";

const Demo = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-[220vh] bg-[radial-gradient(circle_at_top,#60519b_0%,#31323e_45%,#1e202c_100%)] text-[#e8e6f2]">
      {/* Hero */}
      <section
        className="h-screen flex flex-col justify-center px-[10vw]"
        style={{
          transform: `translateY(${scrollY * 0.15}px)`,
          opacity: 1 - scrollY / 600,
        }}
      >
        <h1 className="text-[clamp(3rem,6vw,6rem)] font-bold tracking-tight">
          Scroll Demo
        </h1>
        <p className="mt-3 text-lg text-[#bfc0d1]">Testing motion & depth</p>
      </section>

      {/* Spacer */}
      <div className="h-[80vh]" />

      {/* Card */}
      <section
        className="mx-auto w-[min(90%,520px)] rounded-2xl p-12 shadow-[0_30px_80px_rgba(0,0,0,0.45)]
                   bg-gradient-to-b from-[#60519b] to-[#31323e]"
        style={{
          transform: `translateY(${Math.max(0, 300 - scrollY) * 0.2}px)`,
        }}
      >
        <h2 className="text-2xl font-semibold mb-2">Scroll Section</h2>
        <p className="text-[#d1d2e8] leading-relaxed">
          This block reacts to scroll position to help test parallax, spacing,
          and visual weight.
        </p>
      </section>

      <div className="h-[80vh]" />
    </div>
  );
};

export default Demo;

const PawIcon = ({ size = 24, color = "#fff", className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <ellipse cx="12" cy="16" rx="4" ry="5" />
    <ellipse cx="7" cy="10" rx="2.5" ry="3.5" />
    <ellipse cx="17" cy="10" rx="2.5" ry="3.5" />
    <ellipse cx="5" cy="15" rx="2" ry="3" />
    <ellipse cx="19" cy="15" rx="2" ry="3" />
  </svg>
);

const Navbar = ({
  isScrolled,
  mobileMenuOpen,
  setMobileMenuOpen,
  currentSlideIndex = 0,
}) => {
  const navbarLinks = [
    { text: "Home", link: "#home" },
    { text: "Browse Pets", link: "#browse" },
    { text: "Blog", link: "#blog" },
    { text: "Donate", link: "#donate" },
    { text: "Resources", link: "#resources" },
  ];

  const colorThemes = [
    { accent: "#ffb07c", glow: "rgba(255, 176, 124, 0.3)" },
    { accent: "#a067ff", glow: "rgba(160, 103, 255, 0.3)" },
    { accent: "#89d6ff", glow: "rgba(137, 214, 255, 0.3)" },
    { accent: "#ff86a0", glow: "rgba(255, 134, 160, 0.3)" },
    { accent: "#7cffb2", glow: "rgba(124, 255, 178, 0.3)" },
  ];

  const [lockedTheme, setLockedTheme] = useState(null);
  const [hoveredLink, setHoveredLink] = useState(null);

  useEffect(() => {
    if (isScrolled && !lockedTheme) {
      setLockedTheme(colorThemes[currentSlideIndex % colorThemes.length]);
    } else if (!isScrolled) {
      setLockedTheme(null);
    }
  }, [isScrolled]);

  const currentTheme =
    lockedTheme || colorThemes[currentSlideIndex % colorThemes.length];

  const handleNavigate = (path) => {
    setMobileMenuOpen(false);
    console.log("Navigate to:", path);
  };

  return (
    <nav
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-700 ease-out ${
        isScrolled ? "w-[95%] max-w-6xl" : "w-[95%] max-w-7xl"
      }`}
    >
      <div
        className={`transition-all duration-700 ${
          isScrolled ? "rounded-full" : "rounded-3xl"
        }`}
        style={{
          background: isScrolled ? "rgba(15, 23, 42, 0.85)" : "transparent",
          backdropFilter: isScrolled ? "blur(20px)" : "none",
          border: isScrolled ? `1px solid ${currentTheme.accent}30` : "none",
          boxShadow: isScrolled
            ? `0 8px 32px ${currentTheme.glow}, 0 0 80px rgba(0,0,0,0.4)`
            : "none",
        }}
      >
        <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div
              onClick={() => handleNavigate("/")}
              className="flex items-center gap-3 cursor-pointer group"
            >
              {/* Paw Prints Animation */}
              <div className="relative flex items-center gap-1">
                <PawIcon
                  size={isScrolled ? 20 : 24}
                  color={currentTheme.accent}
                  className={`transition-all duration-500 ${
                    !isScrolled
                      ? "animate-[paw-step-1_2s_ease-in-out_infinite]"
                      : ""
                  }`}
                  style={{
                    filter: `drop-shadow(0 0 8px ${currentTheme.glow})`,
                  }}
                />
                <PawIcon
                  size={isScrolled ? 20 : 24}
                  color={currentTheme.accent}
                  className={`transition-all duration-500 ${
                    !isScrolled
                      ? "animate-[paw-step-2_2s_ease-in-out_infinite]"
                      : ""
                  }`}
                  style={{
                    filter: `drop-shadow(0 0 8px ${currentTheme.glow})`,
                  }}
                />
              </div>

              {/* Logo Text */}
              <span
                className={`font-bold tracking-tight transition-all duration-500 ${
                  isScrolled ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"
                }`}
                style={{
                  fontFamily: "'Righteous', 'Bungee', cursive",
                  background: `linear-gradient(135deg, ${currentTheme.accent}, white, ${currentTheme.accent})`,
                  backgroundSize: "200% 100%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter: `drop-shadow(0 0 20px ${currentTheme.glow})`,
                  animation: "gradient-shift 3s ease infinite",
                }}
              >
                WT
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2">
              {navbarLinks.map((item, index) => (
                <button
                  key={item.link}
                  onClick={() => handleNavigate(item.link)}
                  onMouseEnter={() => setHoveredLink(index)}
                  onMouseLeave={() => setHoveredLink(null)}
                  className="relative px-5 py-2.5 text-[#bfc0d1] hover:text-white transition-all duration-300 group"
                  style={{
                    fontFamily: "'Space Grotesk', 'Outfit', sans-serif",
                    fontWeight: 500,
                    fontSize: "0.95rem",
                    letterSpacing: "0.02em",
                  }}
                >
                  <span className="relative z-10">{item.text}</span>

                  {/* Hover Background */}
                  <div
                    className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                      hoveredLink === index
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-95"
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${currentTheme.accent}20, ${currentTheme.accent}35)`,
                      boxShadow: `0 0 20px ${currentTheme.glow}`,
                    }}
                  />

                  {/* Bottom Border Animation */}
                  <div
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 transition-all duration-300 ${
                      hoveredLink === index
                        ? "w-3/4 opacity-100"
                        : "w-0 opacity-0"
                    }`}
                    style={{
                      background: `linear-gradient(90deg, transparent, ${currentTheme.accent}, transparent)`,
                      boxShadow: `0 0 10px ${currentTheme.accent}`,
                    }}
                  />
                </button>
              ))}
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={() => handleNavigate("/login")}
                className="relative px-6 py-2.5 rounded-full font-medium text-white transition-all duration-300 overflow-hidden group"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  border: `2px solid ${currentTheme.accent}50`,
                }}
              >
                <span className="relative z-10">Login</span>
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-0 group-hover:scale-100"
                  style={{
                    background: `radial-gradient(circle at center, ${currentTheme.accent}30, transparent 70%)`,
                  }}
                />
              </button>

              <button
                onClick={() => handleNavigate("/signup")}
                className="relative px-6 py-2.5 rounded-full font-semibold transition-all duration-300 overflow-hidden group"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  background: `linear-gradient(135deg, ${currentTheme.accent}, white)`,
                  color: "#0f172a",
                  boxShadow: `0 4px 20px ${currentTheme.glow}`,
                }}
              >
                <span className="relative z-10">Sign Up</span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2.5 text-[#bfc0d1] hover:text-white transition-all duration-300 rounded-xl"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: mobileMenuOpen
                  ? `linear-gradient(135deg, ${currentTheme.accent}25, ${currentTheme.accent}40)`
                  : "transparent",
                boxShadow: mobileMenuOpen
                  ? `0 0 20px ${currentTheme.glow}`
                  : "none",
              }}
            >
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div
              className="lg:hidden mt-4 pb-4 space-y-2 rounded-2xl p-4 animate-in slide-in-from-top duration-300"
              style={{
                background: `linear-gradient(135deg, ${currentTheme.accent}15, rgba(15, 23, 42, 0.95))`,
                backdropFilter: "blur(20px)",
                border: `1px solid ${currentTheme.accent}30`,
                boxShadow: `0 10px 40px ${currentTheme.glow}`,
              }}
            >
              {navbarLinks.map((item) => (
                <button
                  key={item.link}
                  onClick={() => handleNavigate(item.link)}
                  className="block w-full text-left px-4 py-3 text-[#bfc0d1] hover:text-white transition-all duration-300 rounded-xl font-medium"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${currentTheme.accent}20, ${currentTheme.accent}35)`;
                    e.currentTarget.style.boxShadow = `0 0 20px ${currentTheme.glow}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {item.text}
                </button>
              ))}

              <div
                className="flex flex-col gap-3 pt-4 border-t"
                style={{ borderColor: `${currentTheme.accent}30` }}
              >
                <button
                  onClick={() => handleNavigate("/login")}
                  className="px-6 py-3 rounded-full font-medium text-white transition-all duration-300"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    border: `2px solid ${currentTheme.accent}50`,
                    background: `linear-gradient(135deg, ${currentTheme.accent}15, transparent)`,
                  }}
                >
                  Login
                </button>

                <button
                  onClick={() => handleNavigate("/signup")}
                  className="px-6 py-3 rounded-full font-semibold transition-all duration-300"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    background: `linear-gradient(135deg, ${currentTheme.accent}, white)`,
                    color: "#0f172a",
                    boxShadow: `0 4px 20px ${currentTheme.glow}`,
                  }}
                >
                  Sign Up
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes paw-step-1 {
          0%,
          100% {
            opacity: 0.3;
            transform: translateY(0) scale(0.9);
          }
          25% {
            opacity: 1;
            transform: translateY(-4px) scale(1);
          }
          50% {
            opacity: 0.3;
            transform: translateY(0) scale(0.9);
          }
        }

        @keyframes paw-step-2 {
          0%,
          100% {
            opacity: 0.3;
            transform: translateY(0) scale(0.9);
          }
          50% {
            opacity: 0.3;
            transform: translateY(0) scale(0.9);
          }
          75% {
            opacity: 1;
            transform: translateY(-4px) scale(1);
          }
        }

        @keyframes gradient-shift {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </nav>
  );
};
