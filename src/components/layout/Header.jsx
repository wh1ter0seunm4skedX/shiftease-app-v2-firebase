import React, { useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useLanguage } from "../../contexts/LanguageContext";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
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
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.02, y: -1 }}
    whileTap={{ scale: 0.98, y: 0 }}
    transition={{ type: "spring", stiffness: 400, damping: 25 }}
    className={`flex h-10 items-center justify-center rounded-lg border px-4 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white ${className}`}
  >
    {children}
  </motion.button>
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const [mobileMenuParent] = useAutoAnimate();
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
      <motion.nav
        initial={prefersReducedMotion ? false : { opacity: 0, y: -8 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 text-gray-900 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 shadow-[0_10px_30px_-10px_rgba(139,92,246,0.25)]"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo and Greeting */}
            <div className="flex items-center">
              <div className="flex flex-shrink-0 items-center">
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
                <h1 className="ms-3 text-lg font-bold text-gray-800">
                  {greeting}
                </h1>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
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
                    className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 focus:ring-emerald-400"
                  >
                    <span>{t("add_event")}</span>
                    <PlusIcon className="ms-2 h-5 w-5" aria-hidden="true" />
                  </HeaderButton>
                  <HeaderButton
                    onClick={onOpenArchive}
                    className="border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-400"
                  >
                    <span>{t("events_archive")}</span>
                    <ArchiveBoxIcon className="ms-2 h-5 w-5" aria-hidden="true" />
                  </HeaderButton>
                </div>
              )}

            {/* User dropdown */}
            <DropdownMenu.Root open={userMenuOpen} onOpenChange={setUserMenuOpen}>
              <DropdownMenu.Trigger asChild>
                <button
                  className="group relative flex cursor-pointer items-center focus:outline-none"
                  aria-label={t("user")}
                >
                  <motion.span
                    whileHover={prefersReducedMotion ? {} : { scale: 1.08 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white shadow"
                    style={{ backgroundColor: userData?.avatarColor || "#7c3aed" }}
                  >
                    {getInitials()}
                  </motion.span>
                  {isAdmin ? (
                    <span className="ms-2 chip-admin">{t("admin")}</span>
                  ) : (
                    <span className="ms-2 chip-user">{t("user")}</span>
                  )}
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  side="bottom"
                  align="end"
                  sideOffset={8}
                  className="dropdown-surface data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
                >
                  {isAdmin ? (
                    <>
                      <DropdownMenu.Item
                        onSelect={() => {
                          setUserMenuOpen(false);
                          setTimeout(() => onOpenAdminPanel(), 0);
                        }}
                        className="dropdown-item"
                      >
                        <Cog6ToothIcon className="me-2 h-5 w-5 text-amber-600" />
                        {t("system_admin_panel")}
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator className="my-1 h-px bg-gray-200" />
                      <DropdownMenu.Item
                        onSelect={() => {
                          setUserMenuOpen(false);
                          setTimeout(() => onLogout(), 0);
                        }}
                        className="dropdown-item dropdown-danger"
                      >
                        <ArrowRightOnRectangleIcon className="me-2 h-5 w-5" />
                        {t("sign_out")}
                      </DropdownMenu.Item>
                    </>
                  ) : (
                    <>
                      <DropdownMenu.Label className="px-2 py-1.5 text-xs tracking-wide text-gray-500">
                        {t("dropdown_user_welcome")}
                      </DropdownMenu.Label>
                      <DropdownMenu.Separator className="my-1 h-px bg-gray-200" />
                      <DropdownMenu.Item
                        onSelect={() => {
                          setUserMenuOpen(false);
                          setTimeout(() => onLogout(), 0);
                        }}
                        className="dropdown-item dropdown-danger"
                      >
                        <ArrowRightOnRectangleIcon className="me-2 h-5 w-5" />
                        {t("sign_out")}
                      </DropdownMenu.Item>
                    </>
                  )}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence initial={false}>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            className="sm:hidden bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-md"
            initial={prefersReducedMotion ? false : { opacity: 0, y: -8 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <div
              ref={mobileMenuParent}
              className="space-y-4 px-2 pb-4 pt-2 animate-in fade-in slide-in-from-top-1"
            >
              <div className="flex items-center space-x-3 space-x-reverse border-b border-gray-700 pb-4">
                 <motion.span
                  initial={prefersReducedMotion ? false : { scale: 0.9, opacity: 0 }}
                  animate={prefersReducedMotion ? {} : { scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
                  style={{
                    backgroundColor: userData?.avatarColor || "#7c3aed",
                  }}
                >
                  {getInitials()}
                </motion.span>
                {isAdmin ? (
                  <span className="chip-admin">{t("admin")}</span>
                ) : (
                  <span className="chip-user">{t("user")}</span>
                )}
              </div>

              {isAdmin && (
                <div className="flex flex-col space-y-3">
                  <HeaderButton
                    onClick={() => { onAddEvent(); setIsMobileMenuOpen(false); }}
                    className="w-full border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 focus:ring-emerald-400"
                  >
                    <span>{t("add_event")}</span>
                    <PlusIcon className="ms-2 h-5 w-5" />
                  </HeaderButton>
                  <HeaderButton
                    onClick={() => { onOpenArchive(); setIsMobileMenuOpen(false); }}
                    className="w-full border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-400"
                  >
                    <span>{t("events_archive")}</span>
                    <ArchiveBoxIcon className="ms-2 h-5 w-5" />
                  </HeaderButton>
                </div>
              )}
              
              <HeaderButton
                onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
                className="w-full border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 focus:ring-rose-400"
              >
                <span>{t("sign_out")}</span>
                <ArrowRightOnRectangleIcon className="ms-2 h-5 w-5" />
              </HeaderButton>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}

export default Header;
