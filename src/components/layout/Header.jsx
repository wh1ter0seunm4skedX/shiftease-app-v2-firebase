import React, { useMemo, useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { displayName, getUserInitials } from "../../utils/user";
import {
  Cog6ToothIcon,
  PlusIcon,
  ArchiveBoxIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

// A simple container for buttons to reduce repetition
const HeaderButton = ({ onClick, children, className = "" }) => (
  <button
    onClick={onClick}
    className={`flex h-10 items-center justify-center rounded-lg border px-4 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${className}`}
  >
    {children}
  </button>
);

function Header({
  user,
  userData,
  isAdmin,
  onAddEvent,
  onOpenArchive,
  onOpenAdminPanel,
  onLogout,
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  const greeting = useMemo(() => {
    const name = displayName(userData, user?.email) || t("user");
    const jerusalemHour = Number(
      new Intl.DateTimeFormat("en-IL", {
        hour: "numeric",
        hour12: false,
        timeZone: "Asia/Jerusalem",
      }).format(new Date())
    );

    let base;
    if (jerusalemHour < 6) {
      base = t("greeting_night"); // 0–6
    } else if (jerusalemHour < 12) {
      base = t("greeting_morning"); // 6–12
    } else if (jerusalemHour < 18) {
      base = t("greeting_afternoon"); // 12–18
    } else {
      base = t("greeting_evening"); // 18–24
    }

    return `${base}, ${name} 👋`;
  }, [user, userData, t]);

  const getInitials = () => getUserInitials(userData, user?.email);

  return (
    <>
      {/* For the animated gradient to work, you might need to add this to your global CSS or tailwind.config.js */}
      <style>
        {`
          @keyframes gradient-animation {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-gradient {
            background-size: 200% 200%;
            animation: gradient-animation 10s ease infinite;
          }
        `}
      </style>
      <nav className="animate-gradient border-b border-gray-700/50 bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo and Greeting */}
            <div className="flex items-center">
              <div className="flex flex-shrink-0 items-center">
                <span className="sr-only">{t("dashboard")}</span>
                <svg
                  className="h-8 w-8 text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <h1 className="ms-3 text-lg font-bold text-gray-200">
                  {greeting}
                </h1>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                aria-controls="mobile-menu"
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>

            {/* Desktop menu */}
            <div className="hidden sm:flex sm:items-center sm:space-x-4 sm:space-x-reverse">
              {isAdmin && (
                <div className="flex items-center space-x-3 space-x-reverse">
                  <HeaderButton
                    onClick={onAddEvent}
                    className="border-green-500/50 bg-green-500/10 text-green-300 hover:bg-green-500/20 hover:text-green-200 focus:ring-green-400"
                  >
                    <span>{t("add_event")}</span>
                    <PlusIcon className="ms-2 h-5 w-5" aria-hidden="true" />
                  </HeaderButton>
                  <HeaderButton
                    onClick={onOpenArchive}
                    className="border-slate-500/50 bg-slate-500/10 text-slate-300 hover:bg-slate-500/20 hover:text-slate-200 focus:ring-slate-400"
                  >
                    <span>{t("events_archive")}</span>
                    <ArchiveBoxIcon className="ms-2 h-5 w-5" aria-hidden="true" />
                  </HeaderButton>
                  <button
                    onClick={onOpenAdminPanel}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/10 text-amber-300 transition-colors hover:bg-amber-400/20 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-gray-900"
                    aria-label={t("system_admin_panel")}
                    title={t("system_admin_panel")}
                  >
                    <Cog6ToothIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
              )}

              {/* User badge + Sign out */}
              <div className="flex items-center space-x-3 space-x-reverse">
                 <div className="group relative flex cursor-pointer items-center">
                   <span
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white transition-transform group-hover:scale-110"
                    style={{
                      backgroundColor: userData?.avatarColor || "#7c3aed",
                    }}
                  >
                    {getInitials()}
                  </span>
                  <span className="ms-2 rounded-full bg-purple-500/20 px-2.5 py-1 text-xs font-medium text-purple-300">
                    {isAdmin ? t("admin") : t("user")}
                  </span>
                 </div>

                <HeaderButton
                  onClick={onLogout}
                  className="border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:border-red-500 hover:text-red-300 focus:ring-red-400"
                >
                  <span>{t("sign_out")}</span>
                  <ArrowRightOnRectangleIcon
                    className="ms-2 h-5 w-5"
                    aria-hidden="true"
                  />
                </HeaderButton>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div id="mobile-menu" className="sm:hidden">
            <div className="space-y-4 px-2 pb-4 pt-2">
              <div className="flex items-center space-x-3 space-x-reverse border-b border-gray-700 pb-4">
                 <span
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
                  style={{
                    backgroundColor: userData?.avatarColor || "#7c3aed",
                  }}
                >
                  {getInitials()}
                </span>
                <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-300">
                  {isAdmin ? t("admin") : t("user")}
                </span>
              </div>

              {isAdmin && (
                <div className="flex flex-col space-y-3">
                  <HeaderButton
                    onClick={() => { onAddEvent(); setIsMobileMenuOpen(false); }}
                    className="w-full border-green-500/50 bg-green-500/10 text-green-300 hover:bg-green-500/20 hover:text-green-200 focus:ring-green-400"
                  >
                    <span>{t("add_event")}</span>
                    <PlusIcon className="ms-2 h-5 w-5" />
                  </HeaderButton>
                  <HeaderButton
                    onClick={() => { onOpenArchive(); setIsMobileMenuOpen(false); }}
                    className="w-full border-slate-500/50 bg-slate-500/10 text-slate-300 hover:bg-slate-500/20 hover:text-slate-200 focus:ring-slate-400"
                  >
                    <span>{t("events_archive")}</span>
                    <ArchiveBoxIcon className="ms-2 h-5 w-5" />
                  </HeaderButton>
                </div>
              )}
              
              <HeaderButton
                onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
                className="w-full border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 focus:ring-red-400"
              >
                <span>{t("sign_out")}</span>
                <ArrowRightOnRectangleIcon className="ms-2 h-5 w-5" />
              </HeaderButton>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

export default Header;