"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Moon, Database, LogIn, LogOut, ChevronDown, Search } from "lucide-react";
import { getCurrentUserAction, signOutAction } from "../actions/auth.actions";
import AuthModal from "./AuthModal";

export default function Header() {
  const pathname = usePathname();
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

  // Force light mode theme
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }, []);

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
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-white/75 backdrop-blur-lg transition-all duration-200">
        <div className="mx-auto flex h-[58px] max-w-[1200px] items-center px-4 sm:px-6" style={{ gap: "1.5rem" }}>

          {/* Brand Logo — premium SaaS style */}
          <Link href="/" className="flex items-center gap-2.5 select-none shrink-0 group">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/15 group-hover:shadow-primary/25 transition-all duration-300 shrink-0">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="11" width="3" height="6" rx="1" fill="white" fillOpacity="0.7"/>
                <rect x="6" y="7" width="3" height="10" rx="1" fill="white" fillOpacity="0.85"/>
                <rect x="11" y="4" width="3" height="13" rx="1" fill="white"/>
                <path d="M2.5 10.5L7.5 6.5L12.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.6"/>
                <circle cx="14.5" cy="3" r="1.5" fill="#a5f3c4"/>
              </svg>
            </div>
            <div className="flex items-baseline">
              <span className="text-xl font-extrabold tracking-tight text-foreground leading-none">Comp</span>
              <span className="text-xl font-extrabold tracking-tight text-primary leading-none">Lens</span>
            </div>
          </Link>
          {/* Right-side controls */}
          <div className="flex items-center gap-3 ml-auto">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl border border-border/80 hover:border-primary/30 hover:bg-slate-50 cursor-pointer transition-all duration-150 shadow-sm"
                >
                  <div className="flex items-center justify-center w-6.5 h-6.5 rounded-lg bg-linear-to-r from-primary to-accent text-white text-[10px] font-black shadow-inner">
                    {getInitials()}
                  </div>
                  <ChevronDown className="w-3 h-3 text-muted" />
                </button>

                {showDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                    <div className="absolute right-0 mt-2.5 w-52 glass-card rounded-2xl p-2 shadow-xl z-50 animate-fadeIn border border-border">
                      <div className="px-3 py-2.5 border-b border-border/60 mb-1.5">
                        <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Signed in as</p>
                        <p className="text-xs font-bold text-foreground truncate mt-0.5">{user.name || user.email}</p>
                        <p className="text-[10px] text-muted truncate mt-0.5">{user.email}</p>
                      </div>
                      <div className="space-y-0.5">
                        {user.role === "ADMIN" && (
                          <Link
                            href="/admin"
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted hover:text-foreground rounded-lg hover:bg-slate-100 transition-colors"
                          >
                            <Database className="w-3.5 h-3.5 text-primary" />
                            Admin Console
                          </Link>
                        )}
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-red-500 hover:text-red-400 rounded-lg hover:bg-red-50 transition-colors text-left cursor-pointer"
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
                className="btn-primary text-xs flex items-center gap-1.5 py-2 px-4 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign Up
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Secondary Sub-Nav ── */}
      <div className="border-b border-border/30 bg-white/50 backdrop-blur-md sticky top-[58px] z-30 transition-all duration-200">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <nav className="flex items-center gap-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {subNavLinks.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative py-3.5 px-3 text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? "text-primary font-extrabold" 
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-t-full bg-primary" />
                  )}
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
