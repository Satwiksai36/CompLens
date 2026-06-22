"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, ChevronDown, Check } from "lucide-react";

export interface FilterState {
  searchQuery: string;
  locationId: string;
  experienceLevel: string; // "0-2 Years", "2-5 Years", etc.
  equivalentLevel: string;  // "Entry", "Mid", "Senior", "Staff", "Principal", "Director+"
  locationTier: string;     // "Tier 1", "Tier 2", "Tier 3"
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
  // State variables for inputs
  const [searchQuery, setSearchQuery] = useState(initialFilters?.searchQuery || "");
  const [selectedLocationId, setSelectedLocationId] = useState(initialFilters?.locationId || "");
  const [experienceLevel, setExperienceLevel] = useState(initialFilters?.experienceLevel || "");
  const [equivalentLevel, setEquivalentLevel] = useState(initialFilters?.equivalentLevel || "");
  const [locationTier, setLocationTier] = useState(initialFilters?.locationTier || "");
  
  // Suggestion list dropdown open states
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<"experience" | "level" | "tier" | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside clicks
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

  // Compute autocomplete suggestions dynamically
  const getSuggestions = () => {
    if (!searchQuery.trim()) {
      // Default trending list when search bar is clicked but empty
      return [
        ...companies.slice(0, 3).map((c) => ({ id: c.id, name: c.name, type: "company" })),
        ...roles.slice(0, 2).map((r) => ({ id: r.id, name: r.roleName, type: "role" })),
      ];
    }

    const query = searchQuery.toLowerCase();
    const suggestions: Array<{ id: string; name: string; type: string }> = [];

    // Filter matching companies
    companies.forEach((c) => {
      if (c.name.toLowerCase().includes(query)) {
        suggestions.push({ id: c.id, name: c.name, type: "company" });
      }
    });

    // Filter matching roles
    roles.forEach((r) => {
      if (r.roleName.toLowerCase().includes(query)) {
        suggestions.push({ id: r.id, name: r.roleName, type: "role" });
      }
    });

    // Filter matching locations
    locations.forEach((loc) => {
      const fullLocName = `${loc.city}, ${loc.country}`.toLowerCase();
      if (fullLocName.includes(query)) {
        suggestions.push({ id: loc.id, name: `${loc.city}, ${loc.country}`, type: "location" });
      }
    });

    return suggestions.slice(0, 6);
  };

  const suggestions = getSuggestions();

  // Propagate state modifications to the parent view container
  const propagateFilters = (updates: Partial<FilterState>) => {
    const nextFilters: FilterState = {
      searchQuery: updates.searchQuery !== undefined ? updates.searchQuery : searchQuery,
      locationId: updates.locationId !== undefined ? updates.locationId : selectedLocationId,
      experienceLevel: updates.experienceLevel !== undefined ? updates.experienceLevel : experienceLevel,
      equivalentLevel: updates.equivalentLevel !== undefined ? updates.equivalentLevel : equivalentLevel,
      locationTier: updates.locationTier !== undefined ? updates.locationTier : locationTier,
    };
    onFilterChange(nextFilters);
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
      setSearchQuery(""); // Clear search query to pivot to location filtering
      propagateFilters({ searchQuery: "", locationId: item.id });
    }
    setShowSuggestions(false);
  };

  // Popular company quick links trigger
  const handlePopularCompanyClick = (name: string) => {
    setSearchQuery(name);
    propagateFilters({ searchQuery: name });
  };

  return (
    <div ref={containerRef} className="w-full max-w-5xl mx-auto mb-10 px-4">
      {/* Title Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 leading-tight font-display text-slate-900 dark:text-white">
          Search <span className="text-indigo-600 dark:text-indigo-400">Salaries</span> & <span className="text-indigo-600 dark:text-indigo-400">Job Levels</span>
        </h1>
        <p className="text-muted text-sm md:text-lg max-w-2xl mx-auto font-medium opacity-90 leading-relaxed">
          Get paid what you're worth. Explore & compare tech salaries, levels, benefits, & more.
        </p>
      </div>

      {/* Prominent Search Bar */}
      <div className="relative flex flex-col md:flex-row items-stretch bg-white dark:bg-card border border-border rounded-2xl p-2 shadow-xl gap-2 focus-within:border-primary/50 focus-within:shadow-[0_0_30px_rgba(99,102,241,0.12)] transition-all duration-300">
        
        {/* Search input field */}
        <div className="flex-1 relative flex items-center px-4 gap-3">
          <Search className="w-5 h-5 text-primary shrink-0" />
          <input
            type="text"
            className="w-full bg-transparent text-foreground outline-none text-base placeholder-muted/60 py-3.5 font-medium"
            placeholder="Search salaries, companies, or titles (e.g. Software Engineer, Google)..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="autocomplete-suggestions-list">
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

        {/* Vertical divider */}
        <div className="hidden md:block w-px bg-border self-stretch my-2.5" />

        {/* Location selector dropdown */}
        <div className="flex items-center px-4 gap-3 md:w-72 relative">
          <MapPin className="w-5 h-5 text-accent shrink-0" />
          <select
            className="w-full bg-transparent text-foreground outline-none text-base cursor-pointer py-3.5 pr-8 appearance-none font-semibold"
            value={selectedLocationId}
            onChange={(e) => handleLocationChange(e.target.value)}
          >
            <option value="" className="bg-card">All Locations</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id} className="bg-card">
                {loc.city}, {loc.country}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-muted absolute right-4 pointer-events-none" />
        </div>
      </div>

      {/* Popular Roles & Companies Quick-Links */}
      <div className="mt-6 space-y-3 flex flex-col items-center">
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted">
          <span className="font-bold tracking-wider uppercase text-[10px] mr-1 text-slate-400 dark:text-zinc-500">Popular Roles:</span>
          {["Software Engineer", "Product Manager", "Data Scientist", "ML Engineer", "Designer"].map((roleName) => (
            <button
              key={roleName}
              onClick={() => handlePopularCompanyClick(roleName)}
              className="px-3 py-1 rounded-full bg-card hover:bg-card-hover border border-border hover:border-primary/40 text-foreground/80 hover:text-foreground text-[11px] font-semibold cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-xs"
            >
              {roleName}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted">
          <span className="font-bold tracking-wider uppercase text-[10px] mr-1 text-slate-400 dark:text-zinc-500">Popular Brands:</span>
          {["Google", "Meta", "Amazon", "Microsoft", "Apple", "Netflix", "Uber", "Airbnb"].map((compName) => (
            <button
              key={compName}
              onClick={() => handlePopularCompanyClick(compName)}
              className="px-3 py-1 rounded-full bg-card hover:bg-card-hover border border-border hover:border-primary/40 text-foreground/80 hover:text-foreground text-[11px] font-semibold cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-xs"
            >
              {compName}
            </button>
          ))}
        </div>
      </div>

      {/* Pill-shaped Dropdown Filters row */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
        
        {/* Experience Level Pill */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setActiveDropdown(activeDropdown === "experience" ? null : "experience")}
            className={`px-4.5 py-2.5 rounded-full border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              experienceLevel
                ? "bg-primary/10 border-primary text-primary shadow-[0_0_12px_rgba(99,102,241,0.1)]"
                : "bg-card border-border text-muted hover:border-muted/50 hover:bg-card-hover"
            }`}
          >
            {experienceLevel ? `Experience: ${experienceLevel}` : "Experience Level"}
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {activeDropdown === "experience" && (
            <div className="absolute left-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-xl z-50 p-1">
              <button
                type="button"
                onClick={() => handleExpSelect("")}
                className="w-full text-left px-3 py-2 text-xs text-muted hover:text-foreground hover:bg-muted/10 rounded-lg flex justify-between items-center"
              >
                <span>All Experience Levels</span>
                {experienceLevel === "" && <Check className="w-3.5 h-3.5" />}
              </button>
              {["0-2 Years", "2-5 Years", "5-9 Years", "9-13 Years", "13-15 Years", "15+ Years"].map((band) => (
                <button
                  key={band}
                  type="button"
                  onClick={() => handleExpSelect(band)}
                  className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-muted/10 rounded-lg flex justify-between items-center"
                >
                  <span>{band}</span>
                  {experienceLevel === band && <Check className="w-3.5 h-3.5" />}
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
            className={`px-4.5 py-2.5 rounded-full border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              equivalentLevel
                ? "bg-primary/10 border-primary text-primary shadow-[0_0_12px_rgba(99,102,241,0.1)]"
                : "bg-card border-border text-muted hover:border-muted/50 hover:bg-card-hover"
            }`}
          >
            {equivalentLevel ? `Level: ${equivalentLevel}` : "Equivalent Level"}
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {activeDropdown === "level" && (
            <div className="absolute left-0 mt-2 w-56 bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-xl z-50 p-1">
              <button
                type="button"
                onClick={() => handleLevelSelect("")}
                className="w-full text-left px-3 py-2 text-xs text-muted hover:text-foreground hover:bg-card-hover rounded-lg flex justify-between items-center"
              >
                <span>All Levels</span>
                {equivalentLevel === "" && <Check className="w-3.5 h-3.5" />}
              </button>
              {["Entry", "Mid", "Senior", "Staff", "Principal", "Director+"].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => handleLevelSelect(lvl)}
                  className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-card-hover rounded-lg flex justify-between items-center"
                >
                  <span>{lvl}</span>
                  {equivalentLevel === lvl && <Check className="w-3.5 h-3.5" />}
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
            className={`px-4.5 py-2.5 rounded-full border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              locationTier
                ? "bg-primary/10 border-primary text-primary shadow-[0_0_12px_rgba(99,102,241,0.1)]"
                : "bg-card border-border text-muted hover:border-muted/50 hover:bg-card-hover"
            }`}
          >
            {locationTier ? `Tier: ${locationTier}` : "Location Tier"}
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {activeDropdown === "tier" && (
            <div className="absolute left-0 mt-2 w-56 bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-xl z-50 p-1">
              <button
                type="button"
                onClick={() => handleTierSelect("")}
                className="w-full text-left px-3 py-2 text-xs text-muted hover:text-foreground hover:bg-card-hover rounded-lg flex justify-between items-center"
              >
                <span>All Tiers</span>
                {locationTier === "" && <Check className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => handleTierSelect("Tier 1")}
                className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-card-hover rounded-lg flex justify-between items-center"
              >
                <span>Tier 1 (US High COL / SF, NY)</span>
                {locationTier === "Tier 1" && <Check className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => handleTierSelect("Tier 2")}
                className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-card-hover rounded-lg flex justify-between items-center"
              >
                <span>Tier 2 (US Mid / UK)</span>
                {locationTier === "Tier 2" && <Check className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => handleTierSelect("Tier 3")}
                className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-card-hover rounded-lg flex justify-between items-center"
              >
                <span>Tier 3 (Offshore / India)</span>
                {locationTier === "Tier 3" && <Check className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
