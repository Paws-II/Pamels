import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  PlusCircle,
  Heart,
  Store,
  MessageCircle,
  FileText,
  Stethoscope,
  CalendarCheck,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  Route,
} from "lucide-react";

const NavbarShelter = ({ onLogout }) => {
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
      links: [{ path: "/shelter-dashboard", icon: Shield, label: "Overview" }],
    },
    {
      title: "Quick Actions",
      links: [
        { path: "/add-pet", icon: PlusCircle, label: "Add Pet" },
        { path: "/add-store", icon: Store, label: "Add Store" },
      ],
    },
    {
      title: "Pet Management",
      links: [
        { path: "/my-pets", icon: Heart, label: "My Pets" },
        {
          path: "/applications-shelter",
          icon: FileText,
          label: "Applications",
        },
        {
          path: "/application-journey-shelter",
          icon: Route,
          label: "Application Journey",
        },
        { path: "/checkup", icon: Stethoscope, label: "Checkup" },
      ],
    },
    {
      title: "Communication",
      links: [
        {
          path: "/shelter-chat",
          icon: MessageCircle,
          label: "Chat Room",
        },
        {
          path: "/schedule-meeting-shelter",
          icon: CalendarCheck,
          label: "Schedule Meeting",
        },
      ],
    },
    {
      title: "Analytics & Settings",
      links: [
        { path: "/stats", icon: TrendingUp, label: "Stats" },
        { path: "/shelter-update-profile", icon: Settings, label: "Settings" },
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
          hover:bg-[#4a5568] hover:shadow-[#4a5568]/30
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
          border-r border-[#4a5568]/20
          bg-[#31323e]
          shadow-2xl shadow-black/40
          transition-transform duration-300 ease-in-out
          lg:sticky lg:top-0 lg:w-64
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="border-b border-[#4a5568]/20 px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[#4a5568] blur-xl opacity-40" />
              <div className="relative rounded-xl bg-[#4a5568] p-2.5 shadow-lg shadow-[#4a5568]/30">
                <Shield size={24} className="text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white leading-none tracking-tight">
                WhisperTails
              </h1>
              <p className="mt-0.5 text-xs font-medium text-[#bfc0d1]/60">
                Shelter Portal
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
                            ? "bg-[#4a5568] text-white shadow-lg shadow-[#4a5568]/30 scale-[1.02]"
                            : sectionIndex === 0
                            ? "text-[#bfc0d1] hover:bg-[#4a5568]/15 hover:text-white hover:shadow-md hover:shadow-[#4a5568]/10 hover:scale-[1.02]"
                            : "text-[#bfc0d1]/80 hover:bg-[#3a3b47] hover:text-white hover:shadow-sm hover:scale-[1.01]"
                        }
                      `}
                    >
                      {!active && (
                        <>
                          <div className="absolute inset-0 bg-[#4a5568]/0 transition-all duration-300 group-hover:bg-[#4a5568]/5" />
                          <div className="absolute left-0 top-1/2 h-0 w-0 -translate-y-1/2 rounded-full bg-[#4a5568]/30 blur-xl transition-all duration-300 group-hover:h-full group-hover:w-full" />
                        </>
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
                              ? "text-[#4a5568] group-hover:text-white"
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

        <div className="border-t border-[#4a5568]/20 px-4 py-4">
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
            <div className="absolute inset-0 bg-red-500/0 transition-all duration-300 group-hover:bg-red-500/10" />

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
          <div className="absolute inset-0 bg-[#4a5568] opacity-50" />
        </div>
      </aside>
    </>
  );
};

export default NavbarShelter;
