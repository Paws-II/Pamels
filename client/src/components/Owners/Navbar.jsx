import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BookOpen,
  ClipboardList,
  DollarSign,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  PawPrint,
  Settings,
  Users,
  X,
} from "lucide-react";

const Navbar = ({ onLogout }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMobileMenuOpen]);

  const navItems = [
    { path: "/owner-dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/owner-pets", icon: Heart, label: "My Pets" },
    {
      path: "/owner-requests",
      icon: ClipboardList,
      label: "Adoption Requests",
    },
    { path: "/owner-trainers", icon: Users, label: "Trainers" },
    { path: "/owner-donations", icon: DollarSign, label: "Donations" },
    { path: "/owner-resources", icon: BookOpen, label: "Resources" },
    { path: "/owner-settings", icon: Settings, label: "Settings" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <button
        onClick={() => setIsMobileMenuOpen((open) => !open)}
        className={`
          fixed top-4 z-60 rounded-lg p-2
          bg-[#31323e] text-[#bfc0d1]
          transition-all duration-300 hover:bg-[#60519b]
          lg:hidden
          ${isMobileMenuOpen ? "left-[260px]" : "left-4"}
        `}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40
          flex min-h-screen w-64 flex-col
          border-r border-[#60519b]/20
          bg-linear-to-b from-[#31323e] to-[#1e202c]
          transition-transform duration-300 ease-in-out
          lg:sticky lg:top-0
          ${
            isMobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        <div className="border-b border-[#60519b]/20 p-6">
          <div className="group flex cursor-pointer items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[#60519b] opacity-50 blur-lg transition-opacity group-hover:opacity-75" />
              <div className="relative rounded-xl bg-linear-to-br from-[#60519b] to-[#7d6ab8] p-2">
                <PawPrint size={24} className="text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">WhisperTails</h1>
              <p className="text-xs text-[#bfc0d1]">Owner Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  group relative flex items-center gap-3
                  overflow-hidden rounded-lg px-4 py-3
                  transition-all duration-300
                  ${
                    active
                      ? "bg-linear-to-r from-[#60519b] to-[#7d6ab8] text-white shadow-lg shadow-[#60519b]/30"
                      : "text-[#bfc0d1] hover:bg-[#31323e] hover:text-white"
                  }
                `}
              >
                {active && (
                  <div className="absolute inset-0 animate-pulse bg-linear-to-r from-[#60519b]/20 to-transparent" />
                )}

                <Icon
                  size={20}
                  className={`relative z-10 ${
                    active ? "drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" : ""
                  }`}
                />
                <span className="relative z-10 font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#60519b]/20 p-4">
          <button
            onClick={onLogout}
            className="
              group flex w-full items-center gap-3
              rounded-lg px-4 py-3
              text-[#bfc0d1]
              transition-all duration-300
              hover:bg-red-500/10 hover:text-red-400
            "
          >
            <LogOut
              size={20}
              className="transition-transform group-hover:rotate-12"
            />
            <span className="font-medium">Logout</span>
          </button>
        </div>

        <div className="h-1 bg-linear-to-r from-transparent via-[#60519b] to-transparent" />
      </aside>
    </>
  );
};

export default Navbar;
