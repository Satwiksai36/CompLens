"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Moon, Database, LogIn, LogOut, ChevronDown } from "lucide-react";
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

  const navLinks = [
    { name: "Dashboard", href: "/" },
    { name: "Companies", href: "/companies" },
    { name: "Roles", href: "/roles" },
    { name: "Levels", href: "/levels" },
    { name: "Compare", href: "/compare" },
    { name: "Insights", href: "/insights" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-white/90 dark:bg-card/80 backdrop-blur-lg transition-colors duration-300 shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group select-none">
            {/* Logo Icon Mark — stylized lens/chart */}
            <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-500 shadow-md shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-all duration-300 group-hover:scale-105 shrink-0">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Rising bar chart icon */}
                <rect x="1" y="11" width="3" height="6" rx="1" fill="white" fillOpacity="0.7"/>
                <rect x="6" y="7" width="3" height="10" rx="1" fill="white" fillOpacity="0.85"/>
                <rect x="11" y="4" width="3" height="13" rx="1" fill="white"/>
                {/* Trend line */}
                <path d="M2.5 10.5L7.5 6.5L12.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.6"/>
                {/* Small dot at top */}
                <circle cx="14.5" cy="3" r="1.5" fill="#a5b4fc"/>
              </svg>
            </div>
            {/* Wordmark */}
            <div className="flex items-baseline gap-0">
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none">Comp</span>
              <span className="text-xl font-black tracking-tight text-indigo-600 dark:text-indigo-400 leading-none">Lens</span>
            </div>
          </Link>
          {/* Desktop Nav links */}
          <nav className="hidden md:flex items-center gap-8 h-16">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative text-sm font-semibold tracking-wide transition-all py-1.5 ${
                    isActive
                      ? "text-foreground font-bold"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-[-18px] left-0 right-0 h-[2.5px] bg-gradient-to-r from-primary to-accent rounded-full shadow-[0_0_12px_rgba(99,102,241,0.6)] animate-fadeIn" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-4">
          {/* Theme Toggler */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-border bg-card text-muted hover:text-foreground hover:bg-card-hover hover:border-primary/20 cursor-pointer transition-all duration-300 hover:scale-105"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700 dark:text-slate-300" />}
          </button>

          {/* User Section */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 p-1.5 pl-2.5 pr-2 rounded-full border border-border hover:border-primary/30 hover:bg-card-hover cursor-pointer transition-all duration-200"
              >
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-xs font-black">
                  {getInitials()}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-muted" />
              </button>

              {showDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowDropdown(false)} 
                  />
                  <div className="absolute right-0 mt-2.5 w-56 glass-card rounded-xl border border-border p-2 shadow-2xl z-50 animate-fadeIn">
                    <div className="px-3 py-2 border-b border-border/60">
                      <p className="text-[10px] text-muted font-semibold uppercase tracking-wider">Signed in as</p>
                      <p className="text-xs font-bold text-foreground truncate mt-0.5">{user.name || user.email}</p>
                      <p className="text-[9px] text-muted truncate">{user.email}</p>
                    </div>

                    <div className="py-1.5 space-y-0.5">
                      {user.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-muted hover:text-foreground rounded-lg hover:bg-card-hover transition-colors"
                        >
                          <Database className="w-3.5 h-3.5 text-primary" />
                          Admin Console
                        </Link>
                      )}
                      
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors text-left cursor-pointer"
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
            <button
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary-hover shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </button>
          )}
        </div>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </header>
  );
}
