"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Moon, Database } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(false);

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
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/80 backdrop-blur-lg transition-colors duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl font-black tracking-tight font-display bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
              Comp<span className="text-foreground dark:text-white font-semibold">Lens</span>
            </span>
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
          <Link
            href="/admin"
            className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-lg border transition-all duration-300 ${
              pathname === "/admin"
                ? "bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                : "border-border text-muted hover:text-foreground hover:bg-card-hover hover:border-primary/30"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Admin
          </Link>

          {/* Theme Toggler */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-border bg-card text-muted hover:text-foreground hover:bg-card-hover hover:border-primary/20 cursor-pointer transition-all duration-300 hover:scale-105"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700 dark:text-slate-300" />}
          </button>
        </div>
      </div>
    </header>
  );
}
