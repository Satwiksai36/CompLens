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
      <div className="hero-section pb-8 pt-10">
        <div className="main-container">
          {/* Headline */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3 text-foreground" style={{ letterSpacing: "-0.03em" }}>
              Real Salary Data,{" "}
              <span className="text-gradient-primary">No Guesswork</span>
            </h1>
            <p className="text-sm md:text-base text-muted max-w-xl mx-auto font-medium">
              Explore and compare verified compensation records across top-tier engineering organizations.
            </p>
          </div>

          {/* ── Unified Search Bar ── */}
          <div className="max-w-3xl mx-auto">
            <div
              className="flex flex-col md:flex-row items-stretch rounded-2xl p-2 gap-2 bg-card/60 dark:bg-card/40 backdrop-blur-md border border-border/80 shadow-lg shadow-black/5 hover:border-border transition-all duration-200 focus-within:border-primary/80 focus-within:ring-4 focus-within:ring-primary/10 focus-within:shadow-xl focus-within:shadow-primary/5"
            >
              {/* Search field */}
              <div className="flex-1 flex items-center px-3 gap-2.5 relative">
                <Search className="w-4.5 h-4.5 text-primary shrink-0 opacity-80" />
                <input
                  type="text"
                  className="w-full bg-transparent text-foreground outline-none text-sm placeholder-muted py-2.5 font-semibold border-none focus:ring-0 focus:outline-none"
                  placeholder='Search company, role, or title — e.g. "Google Software Engineer"'
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                />
                {searchQuery && (
                  <button 
                    onClick={() => handleSearchChange("")} 
                    className="text-muted hover:text-foreground cursor-pointer p-1 hover:bg-border/50 rounded-lg transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <ul className="autocomplete-suggestions-list mt-2 border border-border/80 bg-card/95 dark:bg-card/90 backdrop-blur-xl shadow-2xl animate-fadeIn">
                    {!searchQuery && (
                      <li className="px-3.5 py-2 text-[10px] font-black uppercase tracking-wider text-muted/80 border-b border-border/40 mb-1">
                        Trending Searches
                      </li>
                    )}
                    {suggestions.map((item) => (
                      <li
                        key={`${item.type}-${item.id}`}
                        className="autocomplete-suggestion-item mx-1 py-2 px-3 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors flex items-center justify-between"
                        onClick={() => handleSuggestionClick(item)}
                      >
                        <span className="suggestion-title font-bold text-sm">{item.name}</span>
                        <span className="suggestion-type text-[9px] font-extrabold tracking-wider uppercase bg-border/50 text-muted px-2 py-0.5 rounded-md">
                          {item.type}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Divider */}
              <div className="hidden md:block w-px bg-border/80 self-stretch my-1.5" />

              {/* Location Selector */}
              <div className="flex items-center px-3 gap-2.5 md:w-56 relative">
                <MapPin className="w-4.5 h-4.5 text-accent shrink-0 opacity-80" />
                <select
                  className="w-full bg-transparent text-foreground outline-none text-sm cursor-pointer py-2.5 pr-8 appearance-none font-bold border-none focus:ring-0 focus:outline-none"
                  value={selectedLocationId}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  style={{ WebkitAppearance: "none" }}
                >
                  <option value="" className="bg-card text-foreground">All Locations</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id} className="bg-card text-foreground">
                      {loc.city}, {loc.country}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-muted absolute right-3 pointer-events-none opacity-60" />
              </div>
            </div>

            {/* ── Quick Filters Row ── */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              {/* Experience Pill */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === "experience" ? null : "experience")}
                  className={`filter-pill flex items-center gap-1.5 py-1.5 px-3 border border-border bg-card/40 hover:bg-card/80 transition-all rounded-full ${
                    experienceLevel ? "active text-primary border-primary/45 bg-primary/5" : ""
                  }`}
                >
                  <span className="font-bold text-xs">
                    {experienceLevel ? `Exp: ${experienceLevel}` : "Experience"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </button>
                {activeDropdown === "experience" && (
                  <div className="absolute left-0 mt-2 w-52 bg-card/95 dark:bg-card/90 backdrop-blur-xl border border-border/80 rounded-xl shadow-2xl z-50 p-1.5 animate-fadeIn">
                    <button 
                      type="button" 
                      onClick={() => handleExpSelect("")} 
                      className="w-full text-left px-3 py-2.5 text-xs text-muted hover:text-foreground hover:bg-card-hover rounded-lg flex justify-between items-center font-bold transition-colors"
                    >
                      <span>All Experience</span>
                      {experienceLevel === "" && <Check className="w-3.5 h-3.5 text-primary" />}
                    </button>
                    {["0-2 Years", "2-5 Years", "5-9 Years", "9-13 Years", "13-15 Years", "15+ Years"].map((band) => (
                      <button 
                        key={band} 
                        type="button" 
                        onClick={() => handleExpSelect(band)} 
                        className="w-full text-left px-3 py-2.5 text-xs text-foreground hover:bg-card-hover rounded-lg flex justify-between items-center font-bold transition-colors"
                      >
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
                  className={`filter-pill flex items-center gap-1.5 py-1.5 px-3 border border-border bg-card/40 hover:bg-card/80 transition-all rounded-full ${
                    equivalentLevel ? "active text-primary border-primary/45 bg-primary/5" : ""
                  }`}
                >
                  <span className="font-bold text-xs">
                    {equivalentLevel ? `Level: ${equivalentLevel}` : "Level"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </button>
                {activeDropdown === "level" && (
                  <div className="absolute left-0 mt-2 w-48 bg-card/95 dark:bg-card/90 backdrop-blur-xl border border-border/80 rounded-xl shadow-2xl z-50 p-1.5 animate-fadeIn">
                    <button 
                      type="button" 
                      onClick={() => handleLevelSelect("")} 
                      className="w-full text-left px-3 py-2.5 text-xs text-muted hover:text-foreground hover:bg-card-hover rounded-lg flex justify-between items-center font-bold transition-colors"
                    >
                      <span>All Levels</span>
                      {equivalentLevel === "" && <Check className="w-3.5 h-3.5 text-primary" />}
                    </button>
                    {["Entry", "Mid", "Senior", "Staff", "Principal", "Director+"].map((lvl) => (
                      <button 
                        key={lvl} 
                        type="button" 
                        onClick={() => handleLevelSelect(lvl)} 
                        className="w-full text-left px-3 py-2.5 text-xs text-foreground hover:bg-card-hover rounded-lg flex justify-between items-center font-bold transition-colors"
                      >
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
                  className={`filter-pill flex items-center gap-1.5 py-1.5 px-3 border border-border bg-card/40 hover:bg-card/80 transition-all rounded-full ${
                    locationTier ? "active text-primary border-primary/45 bg-primary/5" : ""
                  }`}
                >
                  <span className="font-bold text-xs">
                    {locationTier ? `Tier: ${locationTier}` : "Location Tier"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </button>
                {activeDropdown === "tier" && (
                  <div className="absolute left-0 mt-2 w-56 bg-card/95 dark:bg-card/90 backdrop-blur-xl border border-border/80 rounded-xl shadow-2xl z-50 p-1.5 animate-fadeIn">
                    {[
                      { val: "", label: "All Tiers" },
                      { val: "Tier 1", label: "Tier 1 — US High COL (SF, NY)" },
                      { val: "Tier 2", label: "Tier 2 — US Mid / UK / EU" },
                      { val: "Tier 3", label: "Tier 3 — Offshore / India" },
                    ].map(({ val, label }) => (
                      <button 
                        key={val} 
                        type="button" 
                        onClick={() => handleTierSelect(val)} 
                        className={`w-full text-left px-3 py-2.5 text-xs hover:bg-card-hover rounded-lg flex justify-between items-center font-bold transition-colors ${
                          val === "" ? "text-muted" : "text-foreground"
                        }`}
                      >
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
                  className="filter-pill flex items-center gap-1.5 py-1.5 px-3 rounded-full border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors font-bold text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear Filters
                </button>
              )}

              {/* Spacer + popular quick-links */}
              <div className="hidden lg:flex items-center gap-2 ml-auto text-xs font-bold text-muted">
                <span className="uppercase tracking-wider text-[10px] opacity-60">Trending:</span>
                {["Software Engineer", "Google", "Meta", "Amazon"].map((name) => (
                  <button
                    key={name}
                    onClick={() => handleQuickSearch(name)}
                    className="text-xs font-bold text-primary/80 hover:text-primary transition-colors cursor-pointer"
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
