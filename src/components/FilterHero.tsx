"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, ChevronDown, Check, X } from "lucide-react";

export interface FilterState {
  searchQuery: string;
  locationId: string;
  experienceLevel: string;
  equivalentLevel: string;
  locationTier: string;
}

export interface FilterHeroProps {
  onFilterChange: (filters: FilterState) => void;
  locations: Array<{ id: string; city: string; country: string }>;
  companies: Array<{ id: string; name: string }>;
  roles: Array<{ id: string; roleName: string }>;
  initialFilters?: Partial<FilterState>;
}

export const FilterHero: React.FC<FilterHeroProps> = ({
  onFilterChange,
  locations,
  companies,
  roles,
  initialFilters,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialFilters?.searchQuery || "");
  const [selectedLocationId, setSelectedLocationId] = useState(initialFilters?.locationId || "");
  const [experienceLevel, setExperienceLevel] = useState(initialFilters?.experienceLevel || "");
  const [equivalentLevel, setEquivalentLevel] = useState(initialFilters?.equivalentLevel || "");
  const [locationTier, setLocationTier] = useState(initialFilters?.locationTier || "");

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<"experience" | "level" | "tier" | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getSuggestions = () => {
    if (!searchQuery.trim()) {
      return [
        ...companies.slice(0, 3).map((c) => ({ id: c.id, name: c.name, type: "company" })),
        ...roles.slice(0, 3).map((r) => ({ id: r.id, name: r.roleName, type: "role" })),
      ];
    }
    const query = searchQuery.toLowerCase();
    const suggestions: Array<{ id: string; name: string; type: string }> = [];
    companies.forEach((c) => {
      if (c.name.toLowerCase().includes(query))
        suggestions.push({ id: c.id, name: c.name, type: "company" });
    });
    roles.forEach((r) => {
      if (r.roleName.toLowerCase().includes(query))
        suggestions.push({ id: r.id, name: r.roleName, type: "role" });
    });
    locations.forEach((loc) => {
      const fullName = `${loc.city}, ${loc.country}`.toLowerCase();
      if (fullName.includes(query))
        suggestions.push({ id: loc.id, name: `${loc.city}, ${loc.country}`, type: "location" });
    });
    return suggestions.slice(0, 8);
  };

  const suggestions = getSuggestions();

  const propagateFilters = (updates: Partial<FilterState>) => {
    onFilterChange({
      searchQuery: updates.searchQuery !== undefined ? updates.searchQuery : searchQuery,
      locationId: updates.locationId !== undefined ? updates.locationId : selectedLocationId,
      experienceLevel: updates.experienceLevel !== undefined ? updates.experienceLevel : experienceLevel,
      equivalentLevel: updates.equivalentLevel !== undefined ? updates.equivalentLevel : equivalentLevel,
      locationTier: updates.locationTier !== undefined ? updates.locationTier : locationTier,
    });
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    propagateFilters({ searchQuery: val });
  };

  const handleLocationChange = (val: string) => {
    setSelectedLocationId(val);
    propagateFilters({ locationId: val });
  };

  const handleExpSelect = (val: string) => {
    setExperienceLevel(val);
    propagateFilters({ experienceLevel: val });
    setActiveDropdown(null);
  };

  const handleLevelSelect = (val: string) => {
    setEquivalentLevel(val);
    propagateFilters({ equivalentLevel: val });
    setActiveDropdown(null);
  };

  const handleTierSelect = (val: string) => {
    setLocationTier(val);
    propagateFilters({ locationTier: val });
    setActiveDropdown(null);
  };

  const handleSuggestionClick = (item: { id: string; name: string; type: string }) => {
    if (item.type === "company" || item.type === "role") {
      setSearchQuery(item.name);
      propagateFilters({ searchQuery: item.name });
    } else if (item.type === "location") {
      setSelectedLocationId(item.id);
      setSearchQuery("");
      propagateFilters({ searchQuery: "", locationId: item.id });
    }
    setShowSuggestions(false);
  };

  const handleQuickSearch = (name: string) => {
    setSearchQuery(name);
    propagateFilters({ searchQuery: name });
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSelectedLocationId("");
    setExperienceLevel("");
    setEquivalentLevel("");
    setLocationTier("");
    propagateFilters({ searchQuery: "", locationId: "", experienceLevel: "", equivalentLevel: "", locationTier: "" });
  };

  const hasActiveFilters = searchQuery || selectedLocationId || experienceLevel || equivalentLevel || locationTier;

  return (
    <div ref={containerRef} className="w-full">
      {/* ── Hero / Search Section ── */}
      <div className="hero-section">
        <div className="main-container">
          {/* Headline */}
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 text-foreground" style={{ letterSpacing: "-0.02em" }}>
              Real Salary Data,{" "}
              <span className="text-primary">No Guesswork</span>
            </h1>
            <p className="text-sm md:text-base text-muted max-w-xl mx-auto" style={{ fontWeight: 500 }}>
              Search verified compensation data across top tech companies. Know your worth.
            </p>
          </div>

          {/* ── Unified Search Bar ── */}
          <div className="max-w-3xl mx-auto">
            <div
              className="search-input-wrapper flex flex-col md:flex-row items-stretch rounded-xl p-1.5 gap-1.5 shadow-sm"
              style={{ border: "1.5px solid var(--border)" }}
            >
              {/* Search field */}
              <div className="flex-1 flex items-center px-3 gap-2.5 relative">
                <Search className="w-4 h-4 text-primary shrink-0" />
                <input
                  type="text"
                  className="w-full bg-transparent text-foreground outline-none text-sm placeholder-muted py-2.5 font-semibold"
                  placeholder='Search company, role, or title — e.g. "Google Software Engineer"'
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                />
                {searchQuery && (
                  <button onClick={() => handleSearchChange("")} className="text-muted hover:text-foreground cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <ul className="autocomplete-suggestions-list">
                    {!searchQuery && (
                      <li className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                        Trending
                      </li>
                    )}
                    {suggestions.map((item) => (
                      <li
                        key={`${item.type}-${item.id}`}
                        className="autocomplete-suggestion-item"
                        onClick={() => handleSuggestionClick(item)}
                      >
                        <span className="suggestion-title">{item.name}</span>
                        <span className="suggestion-type">{item.type}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Divider */}
              <div className="hidden md:block w-px bg-border self-stretch my-1" />

              {/* Location Selector */}
              <div className="flex items-center px-3 gap-2.5 md:w-56 relative">
                <MapPin className="w-4 h-4 text-accent shrink-0" />
                <select
                  className="w-full bg-transparent text-foreground outline-none text-sm cursor-pointer py-2.5 pr-6 appearance-none font-semibold"
                  value={selectedLocationId}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  style={{ WebkitAppearance: "none" }}
                >
                  <option value="" className="bg-white dark:bg-card">All Locations</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id} className="bg-white dark:bg-card">
                      {loc.city}, {loc.country}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-muted absolute right-3 pointer-events-none" />
              </div>
            </div>

            {/* ── Quick Filters Row ── */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {/* Experience Pill */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === "experience" ? null : "experience")}
                  className={`filter-pill ${experienceLevel ? "active" : ""}`}
                >
                  {experienceLevel ? `Exp: ${experienceLevel}` : "Experience"}
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>
                {activeDropdown === "experience" && (
                  <div className="absolute left-0 mt-1.5 w-52 bg-white dark:bg-card border border-border rounded-xl shadow-xl z-50 p-1.5 animate-fadeIn">
                    <button type="button" onClick={() => handleExpSelect("")} className="w-full text-left px-3 py-2 text-xs text-muted hover:text-foreground hover:bg-(--card-hover) rounded-lg flex justify-between items-center font-semibold">
                      <span>All Experience</span>
                      {experienceLevel === "" && <Check className="w-3.5 h-3.5 text-primary" />}
                    </button>
                    {["0-2 Years", "2-5 Years", "5-9 Years", "9-13 Years", "13-15 Years", "15+ Years"].map((band) => (
                      <button key={band} type="button" onClick={() => handleExpSelect(band)} className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-(--card-hover) rounded-lg flex justify-between items-center font-semibold">
                        <span>{band}</span>
                        {experienceLevel === band && <Check className="w-3.5 h-3.5 text-primary" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Equivalent Level Pill */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === "level" ? null : "level")}
                  className={`filter-pill ${equivalentLevel ? "active" : ""}`}
                >
                  {equivalentLevel ? `Level: ${equivalentLevel}` : "Level"}
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>
                {activeDropdown === "level" && (
                  <div className="absolute left-0 mt-1.5 w-48 bg-white dark:bg-card border border-border rounded-xl shadow-xl z-50 p-1.5 animate-fadeIn">
                    <button type="button" onClick={() => handleLevelSelect("")} className="w-full text-left px-3 py-2 text-xs text-muted hover:text-foreground hover:bg-(--card-hover) rounded-lg flex justify-between items-center font-semibold">
                      <span>All Levels</span>
                      {equivalentLevel === "" && <Check className="w-3.5 h-3.5 text-primary" />}
                    </button>
                    {["Entry", "Mid", "Senior", "Staff", "Principal", "Director+"].map((lvl) => (
                      <button key={lvl} type="button" onClick={() => handleLevelSelect(lvl)} className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-(--card-hover) rounded-lg flex justify-between items-center font-semibold">
                        <span>{lvl}</span>
                        {equivalentLevel === lvl && <Check className="w-3.5 h-3.5 text-primary" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Location Tier Pill */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === "tier" ? null : "tier")}
                  className={`filter-pill ${locationTier ? "active" : ""}`}
                >
                  {locationTier ? `Tier: ${locationTier}` : "Location Tier"}
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>
                {activeDropdown === "tier" && (
                  <div className="absolute left-0 mt-1.5 w-56 bg-white dark:bg-card border border-border rounded-xl shadow-xl z-50 p-1.5 animate-fadeIn">
                    {[
                      { val: "", label: "All Tiers" },
                      { val: "Tier 1", label: "Tier 1 — US High COL (SF, NY)" },
                      { val: "Tier 2", label: "Tier 2 — US Mid / UK / EU" },
                      { val: "Tier 3", label: "Tier 3 — Offshore / India" },
                    ].map(({ val, label }) => (
                      <button key={val} type="button" onClick={() => handleTierSelect(val)} className={`w-full text-left px-3 py-2 text-xs hover:bg-(--card-hover) rounded-lg flex justify-between items-center font-semibold ${val === "" ? "text-muted" : "text-foreground"}`}>
                        <span>{label}</span>
                        {locationTier === val && <Check className="w-3.5 h-3.5 text-primary" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Clear all filters */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="filter-pill text-red-500 border-red-200 hover:bg-red-50 hover:border-red-400 dark:border-red-900 dark:hover:bg-red-950/20"
                >
                  <X className="w-3 h-3" />
                  Clear
                </button>
              )}

              {/* Spacer + popular quick-links */}
              <div className="hidden lg:flex items-center gap-1.5 ml-auto">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Quick:</span>
                {["Software Engineer", "Google", "Meta", "Amazon"].map((name) => (
                  <button
                    key={name}
                    onClick={() => handleQuickSearch(name)}
                    className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
