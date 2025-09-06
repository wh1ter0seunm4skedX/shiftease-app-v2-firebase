import React, { useMemo, useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  Cog6ToothIcon,
  PlusIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";

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
  const name =
    (userData?.fullName || t("user")) || "";
  const jerusalemHour = Number(
    new Intl.DateTimeFormat("en-IL", {
      hour: "numeric",
      hour12: false,
      timeZone: "Asia/Jerusalem",
    }).format(new Date())
  );

  let base;
  if (jerusalemHour < 6) {
    base = `${t("greeting_night")}`; // 0–6
  } else if (jerusalemHour < 12) {
    base = `${t("greeting_morning")}`; // 6–12
  } else if (jerusalemHour < 18) {
    base = `${t("greeting_afternoon")}`; // 12–18
  } else {
    base = `${t("greeting_evening")}`; // 18–24
  }

  const wave = "👋";
  return `${base}, ${name} ${wave}`;
}, [user, userData, t]);



  return (
    <nav className="bg-white shadow-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="sr-only">{t("dashboard")}</span>
              <svg
                className="h-8 w-8 text-purple-600"
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
              <h1 className="ml-2 text-xl font-bold text-gray-800">
                {greeting}
              </h1>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle menu"
            >
              {!isMobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Desktop menu */}
          <div
            className={`hidden sm:flex sm:items-center ${"sm:space-x-reverse sm:space-x-6"}`}
          >
            {isAdmin && (
              <div
                className={`flex items-center ${"space-x-reverse space-x-4"}`}
              >
                <button
                  onClick={onAddEvent}
                  className={`flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${"rtl:space-x-reverse"}`}
                >
                  <span className="mx-1">{t("add_event")}</span>
                  <PlusIcon className="h-5 w-5 ml-1" aria-hidden="true" />
                </button>
                <button
                  onClick={onOpenArchive}
                  className={`flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md
              text-white bg-slate-600 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500
              ${"rtl:space-x-reverse"}`}
                >
                  <span className="mx-1">{t("events_archive")}</span>
                  <ArchiveBoxIcon className="h-5 w-5 ml-1" aria-hidden="true" />
                </button>

                <button
                  onClick={onOpenAdminPanel}
                  className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-slate-900 text-amber-300 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400"
                  aria-label={t("system_admin_panel")}
                  title={t("system_admin_panel")}
                >
                  <Cog6ToothIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            )}

            {/* User badge (no name) + Sign out */}
            <div className={`flex items-center ${"space-x-reverse space-x-4"}`}>
              <div className="flex items-center">
                {userData?.profilePicture ? (
                  <img
                    src={userData.profilePicture}
                    alt="Profile"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <svg
                      className="h-4 w-4 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
                <span className="ml-2 text-xs font-medium text-purple-800 bg-purple-100 rounded-full px-2 py-0.5">
                  {isAdmin ? t("admin") : t("user")}
                </span>
              </div>

              <button
                onClick={onLogout}
                className={`inline-flex items-center justify-center w-full sm:w-auto px-4 py-3 border border-gray-200 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 ${"rtl:space-x-reverse"}`}
              >
                <>
                  {t("sign_out")}
                  <svg
                    className="h-4 w-4 ml-2 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div
            id="mobile-menu"
            className="sm:hidden bg-white border-b border-gray-200 pb-3 pt-2"
          >
            <div className="px-4 space-y-3">
              <div
                className={`flex items-center ${"space-x-reverse"} space-x-3 py-2`}
              >
                {userData?.profilePicture ? (
                  <img
                    src={userData.profilePicture}
                    alt="Profile"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <svg
                      className="h-4 w-4 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs">
                  {isAdmin ? t("admin") : t("user")}
                </span>
              </div>

              <div
                className={`border-t border-gray-200 pt-3 px-4 ${"space-y-4"}`}
              >
                <div className="grid grid-cols-1 gap-3">
                  {isAdmin && (
                    <div className="flex flex-col space-y-3">
                      <button
                        onClick={() => {
                          onAddEvent();
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200 ${"rtl:space-x-reverse"}`}
                      >
                        <>
                          {t("add_event")}
                          <svg
                            className="h-4 w-4 ml-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                        </>
                      </button>
                      <button
                        onClick={() => {
                          onOpenArchive();
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium
              text-white bg-slate-600 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500
              transition-colors duration-200 ${"rtl:space-x-reverse"}`}
                      >
                        <>
                          <span className="mx-2">{t("events_archive")}</span>
                          <svg
                            className="h-5 w-5 ml-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                            />
                          </svg>
                        </>
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      onLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-center  px-4 py-3 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 ${"rtl:space-x-reverse"}`}
                  >
                    <>
                      {t("sign_out")}
                      <svg
                        className="h-4 w-4 ml-2 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                    </>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Header;
