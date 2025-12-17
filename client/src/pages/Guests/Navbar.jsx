import React, { useEffect, useRef, useState } from "react";
import { Menu, PawPrint, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navbar = ({
  isScrolled,
  mobileMenuOpen,
  setMobileMenuOpen,
  currentSlideIndex = 0,
}) => {
  const links = [
    { text: "Home", link: "#home" },
    { text: "Browse Pets", link: "#browse" },
    { text: "Blog", link: "#blog" },
    { text: "Donate", link: "#donate" },
    { text: "Resources", link: "#resources" },
  ];

  const themes = [
    {
      accent: "#ffb07c",
      glow: "rgba(255, 176, 124, 0.3)",
      gradient: "linear-gradient(135deg, #ffd3b0, #ff9c63)",
    },
    {
      accent: "#a067ff",
      glow: "rgba(160, 103, 255, 0.3)",
      gradient: "linear-gradient(135deg, #c7a6ff, #a978ff)",
    },
    {
      accent: "#89d6ff",
      glow: "rgba(137, 214, 255, 0.3)",
      gradient: "linear-gradient(135deg, #bfe9ff, #7cc9f0)",
    },
    {
      accent: "#ff86a0",
      glow: "rgba(255, 134, 160, 0.3)",
      gradient: "linear-gradient(135deg, #ffc0cb, #ff7b96)",
    },
    {
      accent: "#7cffb2",
      glow: "rgba(124, 255, 178, 0.3)",
      gradient: "linear-gradient(135deg, #b8ffd8, #6dffb0)",
    },
  ];

  const [lockedTheme, setLockedTheme] = useState(null);
  const [currentTheme, setCurrentTheme] = useState(themes[0]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [pawStopped, setPawStopped] = useState(false);

  const navigate = useNavigate();

  const navbarRef = useRef(null);
  const logoTextRef = useRef(null);
  const paw1Ref = useRef(null);
  const paw2Ref = useRef(null);

  useEffect(() => {
    if (!lockedTheme) {
      setCurrentTheme(themes[currentSlideIndex % themes.length]);
    }
  }, [currentSlideIndex, lockedTheme]);

  useEffect(() => {
    if (isScrolled && !lockedTheme) {
      setLockedTheme(currentTheme);
    } else if (!isScrolled && lockedTheme) {
      setLockedTheme(null);
    }
  }, [isScrolled, lockedTheme, currentTheme]);

  const activeTheme = lockedTheme || currentTheme;

  const handleNavigate = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <nav
      ref={navbarRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-out ${
        isScrolled ? "py-3 sm:py-4" : "py-4 sm:py-6"
      }`}
    >
      <div
        className={`mx-auto max-w-7xl px-4 sm:px-6 transition-all duration-700 ${
          isScrolled
            ? "bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl"
            : "bg-transparent"
        }`}
        style={{
          borderRadius: isScrolled ? "9999px" : "0",
          boxShadow: isScrolled
            ? `0 10px 60px ${activeTheme.glow}, 0 0 100px rgba(0,0,0,0.8)`
            : "none",
        }}
      >
        <div className="flex items-center justify-between py-3">
          <div
            onClick={() => handleNavigate("/")}
            className="group flex cursor-pointer items-center gap-3"
          >
            <div className="relative flex items-center gap-1.5">
              <PawPrint
                ref={paw1Ref}
                size={22}
                className={`transition-all duration-700 ${
                  pawStopped ? "" : "animate-paw-1"
                }`}
                style={{
                  backgroundImage: activeTheme.gradient,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: `drop-shadow(0 0 12px ${activeTheme.glow})`,
                }}
              />
              <PawPrint
                ref={paw2Ref}
                size={22}
                className={`transition-all duration-700 ${
                  pawStopped ? "" : "animate-paw-2"
                }`}
                style={{
                  backgroundImage: activeTheme.gradient,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: `drop-shadow(0 0 12px ${activeTheme.glow})`,
                }}
              />
            </div>

            <span
              ref={logoTextRef}
              className="text-3xl font-black tracking-tight transition-all duration-700 sm:text-4xl"
              style={{
                fontFamily: "'Nunito', 'Fredoka', sans-serif",
                backgroundImage: activeTheme.gradient,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: `drop-shadow(0 0 20px ${activeTheme.glow})`,
                letterSpacing: "0.02em",
              }}
            >
              WT
            </span>
          </div>

          <div className="hidden items-center space-x-1 lg:flex">
            {links.map((item, index) => (
              <button
                key={item.link}
                onClick={() => handleNavigate(item.link)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="group relative px-5 py-2.5 text-white/70 transition-all duration-300 hover:text-white"
                style={{
                  fontFamily:
                    "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontWeight: 500,
                  fontSize: "0.9375rem",
                  letterSpacing: "0.01em",
                }}
              >
                <span className="relative z-10">{item.text}</span>

                <div
                  className={`absolute inset-0 rounded-lg transition-all duration-300 ${
                    hoveredIndex === index
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95"
                  }`}
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04))",
                    backdropFilter: "blur(8px)",
                  }}
                />

                <div
                  className={`absolute bottom-0 left-1/2 h-0.5 transition-all duration-400 ${
                    hoveredIndex === index
                      ? "w-4/5 opacity-100"
                      : "w-0 opacity-0"
                  }`}
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)",
                    transform: "translateX(-50%)",
                    boxShadow: "0 0 8px rgba(255, 255, 255, 0.4)",
                  }}
                />

                {hoveredIndex === index && (
                  <div
                    className="absolute inset-0 -z-10 rounded-lg transition-all duration-300"
                    style={{
                      background:
                        "radial-gradient(circle at center, rgba(255, 255, 255, 0.06), transparent 70%)",
                    }}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <button
              onClick={() => handleNavigate("/login")}
              className="group relative overflow-hidden rounded-full px-6 py-2.5 font-semibold text-white transition-all duration-700"
              style={{
                fontFamily:
                  "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: "0.9375rem",
                border: `2px solid ${activeTheme.accent}50`,
              }}
            >
              <span className="relative z-10">Login</span>

              <div
                className="absolute inset-0 opacity-0 transition-all duration-500 group-hover:opacity-100"
                style={{
                  background: `linear-gradient(135deg, ${activeTheme.accent}20, ${activeTheme.accent}35)`,
                }}
              />

              <div
                className="absolute inset-0 -z-10 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: activeTheme.accent }}
              />
            </button>

            <button
              onClick={() => handleNavigate("/signup")}
              className="group relative overflow-hidden rounded-full px-6 py-2.5 font-bold transition-all duration-700"
              style={{
                fontFamily:
                  "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: "0.9375rem",
                background: activeTheme.gradient,
                boxShadow: `0 4px 24px ${activeTheme.glow}`,
                color: "#0f1419",
              }}
            >
              <span className="relative z-10">Sign Up</span>

              <div
                className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                  transform: "translateX(-100%)",
                  animation: "shimmer 2s infinite",
                }}
              />
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl p-2.5 text-white/80 transition-all duration-700 hover:text-white lg:hidden"
            style={{
              background: mobileMenuOpen
                ? `linear-gradient(135deg, ${activeTheme.accent}25, ${activeTheme.accent}40)`
                : "transparent",
              border: mobileMenuOpen
                ? `1px solid ${activeTheme.accent}40`
                : "none",
            }}
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div
            className="mt-3 space-y-2 rounded-3xl p-4 pb-4 animate-in slide-in-from-top duration-300 lg:hidden"
            style={{
              background: `linear-gradient(135deg, ${activeTheme.accent}15, rgba(15, 20, 25, 0.98))`,
              backdropFilter: "blur(20px)",
              border: `1px solid ${activeTheme.accent}30`,
              boxShadow: `0 10px 40px ${activeTheme.glow}`,
            }}
          >
            {links.map((item) => (
              <button
                key={item.link}
                onClick={() => handleNavigate(item.link)}
                className="group relative block w-full overflow-hidden rounded-xl px-4 py-3 text-left font-medium text-white/80 transition-all duration-300 hover:text-white"
                style={{
                  fontFamily:
                    "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: "0.9375rem",
                }}
              >
                <span className="relative z-10">{item.text}</span>

                <div
                  className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: `linear-gradient(135deg, ${activeTheme.accent}20, ${activeTheme.accent}30)`,
                  }}
                />
              </button>
            ))}

            <div
              className="flex flex-col gap-3 pt-4 border-t"
              style={{ borderColor: `${activeTheme.accent}30` }}
            >
              <button
                onClick={() => handleNavigate("/login")}
                className="rounded-full px-6 py-3 font-semibold text-white transition-all duration-300"
                style={{
                  fontFamily:
                    "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: "0.9375rem",
                  border: `2px solid ${activeTheme.accent}50`,
                  background: `linear-gradient(135deg, ${activeTheme.accent}15, transparent)`,
                }}
              >
                Login
              </button>

              <button
                onClick={() => handleNavigate("/signup")}
                className="rounded-full px-6 py-3 font-bold transition-all duration-300"
                style={{
                  fontFamily:
                    "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: "0.9375rem",
                  background: activeTheme.gradient,
                  boxShadow: `0 4px 20px ${activeTheme.glow}`,
                  color: "#0f1419",
                }}
              >
                Sign Up
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes paw-print-1 {
          0%,
          100% {
            opacity: 0.7;
            transform: scale(0.95) translateY(0px);
          }
          50% {
            opacity: 1;
            transform: scale(1.05) translateY(-2px);
          }
        }

        @keyframes paw-print-2 {
          0%,
          100% {
            opacity: 0.7;
            transform: scale(0.95) translateY(0px);
          }
          50% {
            opacity: 1;
            transform: scale(1.05) translateY(-2px);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }

        .animate-paw-1 {
          animation: paw-print-1 2s ease-in-out infinite;
        }

        .animate-paw-2 {
          animation: paw-print-2 2s ease-in-out infinite 0.3s;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
