"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Moon, Database, LogIn, LogOut, ChevronDown, Search } from "lucide-react";
import { getCurrentUserAction, signOutAction } from "../actions/auth.actions";
import AuthModal from "./AuthModal";

export default function Header() {
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string; name: string | null; role: string } | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      const currentUser = await getCurrentUserAction();
      setUser(currentUser);
    }
    fetchUser();
  }, []);

  const handleSignOut = async () => {
    const res = await signOutAction();
    if (res.success) {
      setUser(null);
      setShowDropdown(false);
      window.location.reload();
    }
  };

  const getInitials = () => {
    if (!user) return "";
    if (user.name) {
      return user.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
    }
    return user.email.substring(0, 2).toUpperCase();
  };

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDarkMode(true);
    }
  };

  // Primary nav links (top bar)
  const primaryLinks = [
    { name: "Dashboard", href: "/" },
    { name: "Companies", href: "/companies" },
    { name: "Insights", href: "/insights" },
  ];

  // Sub-nav links (second tier, like levels.fyi)
  const subNavLinks = [
    { name: "Salaries", href: "/" },
    { name: "Companies", href: "/companies" },
    { name: "Roles", href: "/roles" },
    { name: "Levels", href: "/levels" },
    { name: "Compare", href: "/compare" },
    { name: "Insights", href: "/insights" },
  ];

  return (
    <>
      {/* ── Primary Nav Bar ── */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-white dark:bg-card transition-colors duration-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <div className="mx-auto flex h-[52px] max-w-[1200px] items-center px-4 sm:px-6" style={{ gap: "1rem" }}>

          {/* Brand Logo — levels.fyi style */}
          <Link href="/" className="flex items-center gap-2 select-none shrink-0 group" style={{ minWidth: "120px" }}>
            <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-linear-to-br from-[#0060b9] to-[#19a672] shadow-sm group-hover:shadow-md transition-shadow duration-200 shrink-0">
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="11" width="3" height="6" rx="1" fill="white" fillOpacity="0.7"/>
                <rect x="6" y="7" width="3" height="10" rx="1" fill="white" fillOpacity="0.85"/>
                <rect x="11" y="4" width="3" height="13" rx="1" fill="white"/>
                <path d="M2.5 10.5L7.5 6.5L12.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.6"/>
                <circle cx="14.5" cy="3" r="1.5" fill="#a5f3c4"/>
              </svg>
            </div>
            <div className="flex items-baseline">
              <span className="text-lg font-black tracking-tight text-foreground leading-none">Comp</span>
              <span className="text-lg font-black tracking-tight text-primary leading-none">Lens</span>
            </div>
          </Link>

          {/* Search bar — omnisearch style */}
          <div className="flex-1 hidden md:flex items-center mx-4 max-w-xs relative">
            <Search className="absolute left-3 w-3.5 h-3.5 text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search companies, roles..."
              className="w-full h-9 pl-8 pr-3 text-sm bg-[#f0f0f1] dark:bg-[#1a1a1e] border-0 rounded-lg text-foreground placeholder-muted outline-none focus:bg-white dark:focus:bg-card focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              style={{ fontFamily: "var(--font-sans)" }}
            />
          </div>

          {/* Spacer */}
          <div className="flex-1 hidden md:block" />

          {/* Right-side controls */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-[#f0f0f1] dark:hover:bg-[#1a1a1e] cursor-pointer transition-colors duration-150"
              aria-label="Toggle theme"
            >
              {darkMode
                ? <Sun className="w-4 h-4 text-amber-400" />
                : <Moon className="w-4 h-4" />}
            </button>

            {/* Auth section */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-1.5 pl-2 pr-2 py-1.5 rounded-full border border-border hover:border-primary/30 hover:bg-[#f6f8fc] dark:hover:bg-(--card-hover) cursor-pointer transition-all duration-150"
                >
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-linear-to-r from-[#0060b9] to-[#19a672] text-white text-[10px] font-black">
                    {getInitials()}
                  </div>
                  <ChevronDown className="w-3 h-3 text-muted" />
                </button>

                {showDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                    <div className="absolute right-0 mt-2 w-52 glass-card rounded-xl p-2 shadow-xl z-50 animate-fadeIn border border-border">
                      <div className="px-3 py-2 border-b border-border/60 mb-1">
                        <p className="text-[10px] text-muted font-semibold uppercase tracking-wider">Signed in as</p>
                        <p className="text-xs font-bold text-foreground truncate mt-0.5">{user.name || user.email}</p>
                        <p className="text-[10px] text-muted truncate">{user.email}</p>
                      </div>
                      <div className="space-y-0.5">
                        {user.role === "ADMIN" && (
                          <Link
                            href="/admin"
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted hover:text-foreground rounded-lg hover:bg-(--card-hover) transition-colors"
                          >
                            <Database className="w-3.5 h-3.5 text-primary" />
                            Admin Console
                          </Link>
                        )}
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-500 hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="text-xs font-bold text-foreground hover:text-primary px-3 py-2 rounded-lg hover:bg-[#f0f0f1] dark:hover:bg-[#1a1a1e] transition-colors cursor-pointer"
                >
                  Log in
                </button>
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="btn-primary text-sm flex items-center gap-1.5 py-2 px-4 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Secondary Sub-Nav ── */}
      <div className="subnav sticky top-[52px] z-30">
        <div className="mx-auto max-w-[1200px] px-2 sm:px-6">
          <nav className="flex items-center overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {subNavLinks.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`subnav-link ${isActive ? "active" : ""}`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
