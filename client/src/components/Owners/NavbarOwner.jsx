import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Heart,
  PlusCircle,
  MessageSquare,
  MapPin,
  Sparkles,
  Calendar,
  BarChart3,
  LogOut,
  Menu,
  X,
  FileText,
  PawPrint,
  Settings,
} from "lucide-react";

const Navbar = ({ onLogout }) => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mobileOpen]);

  const navigationSections = [
    {
      title: "Dashboard",
      links: [
        {
          path: "/owner-dashboard",
          icon: BarChart3,
          label: "Overview",
        },
      ],
    },
    {
      title: "Primary Actions",
      links: [
        {
          path: "/adopt-pet",
          icon: Heart,
          label: "Adopt a Pet",
        },
        {
          path: "#",
          icon: PlusCircle,
          label: "Add a Pet",
        },
        {
          path: "/applications-owner",
          icon: FileText,
          label: "My Applications",
        },
      ],
    },
    {
      title: "Community & Help",
      links: [
        {
          path: "/owner-chat",
          icon: MessageSquare,
          label: "Shelter Chats",
        },
        {
          path: "/street-area",
          icon: MapPin,
          label: "Street Area",
        },
        {
          path: "/ai-help",
          icon: Sparkles,
          label: "AI-Based Help",
        },
      ],
    },
    {
      title: "Management",
      links: [
        {
          path: "/owner-meetings",
          icon: Calendar,
          label: "My Meetings",
        },
        {
          path: "/stats",
          icon: BarChart3,
          label: "Stats",
        },
      ],
    },
    {
      title: "Preferences",
      links: [
        {
          path: "/owner-update-profile",

          icon: Settings,
          label: "Settings",
        },
      ],
    },
  ];

  const isCurrentRoute = (path) => location.pathname === path;

  return (
    <>
      <button
        onClick={() => setMobileOpen((prev) => !prev)}
        className={`
          fixed top-5 z-50 rounded-xl p-2.5
          bg-[#31323e] text-[#bfc0d1]
          shadow-lg shadow-black/20
          transition-all duration-300 ease-out
          hover:bg-[#60519b] hover:shadow-[#60519b]/30
          active:scale-95 lg:hidden
          ${mobileOpen ? "left-[268px]" : "left-5"}
        `}
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40
          flex min-h-screen w-72 flex-col
          border-r border-[#60519b]/20
          bg-linear-to-b from-[#31323e] to-[#1e202c]
          shadow-2xl shadow-black/40
          transition-transform duration-300 ease-in-out
          lg:sticky lg:top-0 lg:w-64
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="border-b border-[#60519b]/20 px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[#60519b] blur-xl opacity-40" />
              <div className="relative rounded-xl bg-linear-to-br from-[#60519b] to-[#7d6ab8] p-2.5 shadow-lg shadow-[#60519b]/30">
                <PawPrint size={24} className="text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white leading-none tracking-tight">
                WhisperTails
              </h1>
              <p className="mt-0.5 text-xs font-medium text-[#bfc0d1]/60">
                Owner Portal
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          {navigationSections.map((section, sectionIndex) => (
            <div key={section.title} className={sectionIndex > 0 ? "mt-8" : ""}>
              <div className="mb-3 px-3">
                <p className="select-none text-[11px] font-bold uppercase tracking-widest text-[#bfc0d1]/50">
                  {section.title}
                </p>
              </div>

              <div className="space-y-1.5">
                {section.links.map((link) => {
                  const Icon = link.icon;
                  const active = isCurrentRoute(link.path);

                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileOpen(false)}
                      className={`
                        group relative flex items-center gap-3.5
                        overflow-hidden rounded-xl px-3.5 py-3
                        transition-all duration-300 ease-out
                        ${
                          active
                            ? "bg-linear-to-r from-[#60519b] to-[#7d6ab8] text-white shadow-lg shadow-[#60519b]/30 scale-[1.02]"
                            : sectionIndex === 0
                            ? "text-[#bfc0d1] hover:bg-[#60519b]/15 hover:text-white hover:shadow-md hover:shadow-[#60519b]/10 hover:scale-[1.02]"
                            : "text-[#bfc0d1]/80 hover:bg-[#31323e] hover:text-white hover:shadow-sm hover:scale-[1.01]"
                        }
                      `}
                    >
                      {!active && (
                        <div className="absolute inset-0 bg-linear-to-r from-[#60519b]/0 via-[#60519b]/5 to-[#60519b]/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      )}

                      <Icon
                        size={19}
                        strokeWidth={active ? 2.5 : 2}
                        className={`
                          relative z-10 shrink-0
                          transition-all duration-300 ease-out
                          ${active ? "scale-110" : "group-hover:scale-110"}
                          ${
                            sectionIndex === 0 && !active
                              ? "text-[#60519b] group-hover:text-white"
                              : ""
                          }
                        `}
                      />

                      <span
                        className={`
                          relative z-10 text-sm leading-none
                          ${
                            sectionIndex === 0 ? "font-semibold" : "font-medium"
                          }
                          ${active ? "tracking-wide" : "tracking-normal"}
                        `}
                      >
                        {link.label}
                      </span>

                      {active && (
                        <div className="absolute right-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-l-full bg-white/40" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-[#60519b]/20 px-4 py-4">
          <button
            onClick={onLogout}
            className="
              group relative flex w-full items-center gap-3.5
              overflow-hidden rounded-xl px-3.5 py-3
              text-[#bfc0d1]
              transition-all duration-300 ease-out
              hover:bg-red-500/15 hover:text-red-400
              hover:shadow-md hover:shadow-red-500/10
              hover:scale-[1.02]
            "
          >
            <div className="absolute inset-0 bg-linear-to-r from-red-500/0 via-red-500/10 to-red-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <LogOut
              size={19}
              strokeWidth={2}
              className="relative z-10 shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
            />
            <span className="relative z-10 text-sm font-semibold tracking-wide">
              Logout
            </span>
          </button>
        </div>

        <div className="relative h-1 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-[#60519b] to-transparent animate-pulse" />
        </div>
      </aside>
    </>
  );
};

export default Navbar;
