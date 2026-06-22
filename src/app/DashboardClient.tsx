"use client";

import React, { useState, useTransition } from "react";
import { Company, Role, Location, Level, CompensationRecord } from "@prisma/client";
import { FilterHero, FilterState } from "@/components/FilterHero";
import { CompensationTable } from "@/components/CompensationTable";
import { LevelMatrix } from "@/components/LevelMatrix";
import { ComparisonWorkspace } from "@/components/ComparisonWorkspace";
import { LocationMatrix } from "@/components/LocationMatrix";
import { submitCompensation } from "@/actions/compensation.actions";
import { DollarSign, Landmark, Briefcase, MapPin, Send, AlertCircle, CheckCircle2, Lock, ArrowRight } from "lucide-react";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import AuthModal from "@/components/AuthModal";

export interface DashboardClientProps {
  initialCompanies: Array<Company & { levels: Level[] }>;
  initialRoles: Role[];
  initialLocations: Location[];
  initialRecords: Array<CompensationRecord & { company: Company; role: Role; level: Level; location: Location }>;
  initialLevels: Level[];
  currentUser: { id: string; email: string; name: string | null; role: string } | null;
}

export default function DashboardClient({
  initialCompanies,
  initialRoles,
  initialLocations,
  initialRecords,
  initialLevels,
  currentUser,
}: DashboardClientProps) {
  // Navigation Tabs: explore | levels | compare | location | submit
  const [activeTab, setActiveTab] = useState<"explore" | "levels" | "compare" | "location" | "submit">("explore");
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Filter States (Explore Tab)
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: "",
    locationId: "",
    experienceLevel: "",
    equivalentLevel: "",
    locationTier: "",
  });

  // Submission Form State
  const [subCompId, setSubCompId] = useState(initialCompanies[0]?.id || "");
  const [subRoleId, setSubRoleId] = useState(initialRoles[0]?.id || "");
  const [subLocId, setSubLocId] = useState(initialLocations[0]?.id || "");
  const [subYoe, setSubYoe] = useState("");
  const [subBase, setSubBase] = useState("");
  const [subStock, setSubStock] = useState("");
  const [subBonus, setSubBonus] = useState("");
  const [subJoining, setSubJoining] = useState("");
  const [subCurrency, setSubCurrency] = useState("USD");
  const [subLevelId, setSubLevelId] = useState(""); // For disclosed path
  const [subDesignation, setSubDesignation] = useState(""); // For estimated path
  const [isPending, startTransition] = useTransition();

  const [formStatus, setFormStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Helper to convert to USD
  const getUSDValue = (amount: number, currency: string): number => {
    const toUSD: Record<string, number> = {
      USD: 1.0,
      INR: 0.012,
      GBP: 1.25,
      EUR: 1.08,
    };
    return amount * (toUSD[currency.toUpperCase()] || 1.0);
  };

  // 1. Calculate Dashboard Summary Statistics
  const verifiedRecords = initialRecords.filter((r) => r.verificationStatus === "VERIFIED");
  const totalCompanies = initialCompanies.length;
  const totalRoles = initialRoles.length;

  // Unified Median pay calculation
  const allUSDComps = verifiedRecords.map((r) => getUSDValue(r.totalCompensation, r.currency)).sort((a, b) => a - b);
  let averageComp = 0;
  if (allUSDComps.length > 0) {
    const mid = Math.floor(allUSDComps.length / 2);
    averageComp = allUSDComps.length % 2 !== 0 ? allUSDComps[mid] : (allUSDComps[mid - 1] + allUSDComps[mid]) / 2;
  }

  // Highest paying company
  const companyPayMap: Record<string, number[]> = {};
  verifiedRecords.forEach((r) => {
    if (!companyPayMap[r.company.name]) companyPayMap[r.company.name] = [];
    companyPayMap[r.company.name].push(getUSDValue(r.totalCompensation, r.currency));
  });

  let highestPayingCompany = "N/A";
  let highestPayingMedian = 0;

  Object.entries(companyPayMap).forEach(([compName, comps]) => {
    comps.sort((a, b) => a - b);
    const mid = Math.floor(comps.length / 2);
    const median = comps.length % 2 !== 0 ? comps[mid] : (comps[mid - 1] + comps[mid]) / 2;
    if (median > highestPayingMedian) {
      highestPayingMedian = median;
      highestPayingCompany = compName;
    }
  });

  // Top 5 paying companies calculation
  const companyMedianPay = Object.entries(companyPayMap).map(([name, comps]) => {
    comps.sort((a, b) => a - b);
    const mid = Math.floor(comps.length / 2);
    const median = comps.length % 2 !== 0 ? comps[mid] : (comps[mid - 1] + comps[mid]) / 2;
    const compRecord = initialCompanies.find(c => c.name === name);
    return { name, median, logo: compRecord?.logo || 'logo-default' };
  }).sort((a, b) => b.median - a.median).slice(0, 5);

  // Top 5 paying roles calculation
  const rolePayMap: Record<string, number[]> = {};
  verifiedRecords.forEach((r) => {
    if (!rolePayMap[r.role.roleName]) rolePayMap[r.role.roleName] = [];
    rolePayMap[r.role.roleName].push(getUSDValue(r.totalCompensation, r.currency));
  });
  const roleMedianPay = Object.entries(rolePayMap).map(([name, comps]) => {
    comps.sort((a, b) => a - b);
    const mid = Math.floor(comps.length / 2);
    const median = comps.length % 2 !== 0 ? comps[mid] : (comps[mid - 1] + comps[mid]) / 2;
    return { name, median };
  }).sort((a, b) => b.median - a.median).slice(0, 5);

  // 2. Filter Compensation Records Dynamically
  const filteredRecords = verifiedRecords.filter((rec) => {
    // A. Search query matching
    const query = filters.searchQuery.toLowerCase();
    const matchesSearch =
      query === "" ||
      rec.company.name.toLowerCase().includes(query) ||
      rec.role.roleName.toLowerCase().includes(query) ||
      rec.level.levelCode.toLowerCase().includes(query) ||
      rec.level.equivalentLevel.toLowerCase().includes(query);

    // B. Location ID matching
    const matchesLoc = filters.locationId === "" || rec.locationId === filters.locationId;

    // C. Experience Band matching
    let matchesExp = true;
    if (filters.experienceLevel) {
      const yoe = rec.yearsExperience;
      if (filters.experienceLevel === "0-2 Years") matchesExp = yoe <= 2;
      else if (filters.experienceLevel === "2-5 Years") matchesExp = yoe > 2 && yoe <= 5;
      else if (filters.experienceLevel === "5-9 Years") matchesExp = yoe > 5 && yoe <= 9;
      else if (filters.experienceLevel === "9-13 Years") matchesExp = yoe > 9 && yoe <= 13;
      else if (filters.experienceLevel === "13-15 Years") matchesExp = yoe > 13 && yoe <= 15;
      else if (filters.experienceLevel === "15+ Years") matchesExp = yoe > 15;
    }

    // D. Equivalent Level matching
    const matchesLevel = filters.equivalentLevel === "" || rec.level.equivalentLevel === filters.equivalentLevel;

    // E. Location Tier matching
    let matchesTier = true;
    if (filters.locationTier) {
      const col = rec.location.costOfLivingIndex;
      if (filters.locationTier === "Tier 1") matchesTier = col >= 90.0;
      else if (filters.locationTier === "Tier 2") matchesTier = col >= 40.0 && col < 90.0;
      else if (filters.locationTier === "Tier 3") matchesTier = col < 40.0;
    }

    return matchesSearch && matchesLoc && matchesExp && matchesLevel && matchesTier;
  });

  // Map to table structure format
  const tableData = filteredRecords.map((r) => ({
    id: r.id,
    companyName: r.company.name,
    roleName: r.role.roleName,
    levelCode: r.level.levelCode,
    equivalentLevel: r.level.equivalentLevel,
    yearsExperience: r.yearsExperience,
    baseSalary: r.baseSalary,
    stockGrant: r.stockGrant,
    bonus: r.bonus,
    joiningBonus: r.joiningBonus,
    totalCompensation: r.totalCompensation,
    currency: r.currency,
    mappingType: r.level.mappingType,
    confidenceScore: r.level.confidenceScore,
    submittedAt: r.submittedAt.toISOString(),
    locationCity: r.location.city,
    locationCountry: r.location.country,
  }));

  // Find if selected company has a disclosed framework
  const selectedComp = initialCompanies.find((c) => c.id === subCompId);
  const isDisclosed = selectedComp?.levels.some((l) => l.mappingType === "disclosed") ?? false;
  const disclosedLevels = selectedComp?.levels.filter((l) => l.mappingType === "disclosed") || [];

  // Update default subLevelId on company toggle
  React.useEffect(() => {
    if (disclosedLevels.length > 0) {
      setSubLevelId(disclosedLevels[0].id);
    } else {
      setSubLevelId("");
    }
  }, [subCompId]);

  // Form submission handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus(null);

    const base = parseFloat(subBase || "0");
    const stock = parseFloat(subStock || "0");
    const bonus = parseFloat(subBonus || "0");
    const joining = parseFloat(subJoining || "0");
    const yoe = parseInt(subYoe || "0");

    if (isNaN(base) || base <= 0) {
      setFormStatus({ type: "error", message: "Base salary must be a positive number." });
      return;
    }
    if (isNaN(yoe) || yoe < 0) {
      setFormStatus({ type: "error", message: "Years of experience must be a non-negative integer." });
      return;
    }

    startTransition(async () => {
      const res = await submitCompensation({
        companyId: subCompId,
        roleId: subRoleId,
        locationId: subLocId,
        yearsExperience: yoe,
        baseSalary: base,
        stockGrant: stock,
        bonus,
        joiningBonus: joining,
        currency: subCurrency,
        levelId: isDisclosed ? subLevelId : undefined,
        designation: !isDisclosed ? subDesignation : undefined,
      });

      if (res.success) {
        setFormStatus({
          type: "success",
          message: "Thank you! Your compensation has been submitted for verification.",
        });
        setSubBase("");
        setSubStock("");
        setSubBonus("");
        setSubJoining("");
        setSubYoe("");
        setSubDesignation("");
      } else {
        setFormStatus({ type: "error", message: res.error || "Failed to submit." });
      }
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Dashboard summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Companies card */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Companies</span>
            <Landmark className="w-5 h-5 text-primary" />
          </div>
          <div className="text-2xl font-black text-foreground">{totalCompanies}</div>
          <div className="text-[10px] text-muted font-medium mt-1">Seeded corporate tech networks</div>
        </div>

        {/* Roles card */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Roles</span>
            <Briefcase className="w-5 h-5 text-accent" />
          </div>
          <div className="text-2xl font-black text-foreground">{totalRoles}</div>
          <div className="text-[10px] text-muted font-medium mt-1">Spans SE, PM, Data Science and Design</div>
        </div>

        {/* Average comp card */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Global Median Pay</span>
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-foreground">
            <CurrencyDisplay value={averageComp} currency="USD" className="text-2xl" />
          </div>
          <div className="text-[10px] text-muted font-medium mt-1">USD equivalent normalized annually</div>
        </div>

        {/* Highest paying company card */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Top Paying Employer</span>
            <MapPin className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-lg font-black text-foreground truncate">{highestPayingCompany}</div>
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            <CurrencyDisplay value={highestPayingMedian} currency="USD" className="text-xs font-bold text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

      </div>

      {/* Hero explore buttons */}
      <div className="flex justify-center mt-2 mb-4">
        <div className="tab-navigator shadow-xl">
          <button
            onClick={() => setActiveTab("explore")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer transition-all duration-300 ${
              activeTab === "explore"
                ? "bg-primary text-white shadow-[0_4px_12px_rgba(99,102,241,0.35)] scale-105"
                : "text-muted hover:text-foreground hover:bg-card-hover/40"
            }`}
          >
            Explore
          </button>
          <button
            onClick={() => setActiveTab("levels")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer transition-all duration-300 ${
              activeTab === "levels"
                ? "bg-primary text-white shadow-[0_4px_12px_rgba(99,102,241,0.35)] scale-105"
                : "text-muted hover:text-foreground hover:bg-card-hover/40"
            }`}
          >
            Compare Levels
          </button>
          <button
            onClick={() => setActiveTab("compare")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer transition-all duration-300 ${
              activeTab === "compare"
                ? "bg-primary text-white shadow-[0_4px_12px_rgba(99,102,241,0.35)] scale-105"
                : "text-muted hover:text-foreground hover:bg-card-hover/40"
            }`}
          >
            Compare Companies
          </button>
          <button
            onClick={() => setActiveTab("location")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer transition-all duration-300 ${
              activeTab === "location"
                ? "bg-primary text-white shadow-[0_4px_12px_rgba(99,102,241,0.35)] scale-105"
                : "text-muted hover:text-foreground hover:bg-card-hover/40"
            }`}
          >
            Location Hub
          </button>
          <button
            onClick={() => setActiveTab("submit")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer transition-all duration-300 ${
              activeTab === "submit"
                ? "bg-primary text-white shadow-[0_4px_12px_rgba(99,102,241,0.35)] scale-105"
                : "text-muted hover:text-foreground hover:bg-card-hover/40"
            }`}
          >
            Submit Salary
          </button>
        </div>
      </div>

      {/* 2. Main Tab Views */}
      <div className="w-full">
        {activeTab === "explore" && (
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
            {/* Left Column (70%) */}
            <div className="lg:col-span-7 space-y-6 animate-fadeIn">
              <FilterHero
                locations={initialLocations}
                companies={initialCompanies}
                roles={initialRoles}
                onFilterChange={(next) => setFilters(next)}
              />
              <div className="flex justify-between items-center px-2">
                <span className="text-xs font-bold text-muted uppercase tracking-wider">
                  Verified Salaries ({tableData.length} records matching)
                </span>
              </div>
              <CompensationTable datapoints={tableData} />
            </div>

            {/* Right Sidebar Section (30%) */}
            <div className="lg:col-span-3 space-y-6">
              {/* Top Paying Companies */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-lg">
                <h3 className="text-xs font-black uppercase tracking-wider text-foreground mb-4 flex items-center gap-2">
                  <span className="text-amber-500 text-base">★</span>
                  Top Paying Companies
                </h3>
                <div className="space-y-3">
                  {companyMedianPay.map((item) => (
                    <div 
                      key={item.name} 
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-card-hover/40 transition-colors border border-transparent hover:border-border/30"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-xs text-white shrink-0 ${item.logo}`}>
                          {item.name[0]}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-foreground">{item.name}</p>
                          <p className="text-[10px] text-muted">Median Annual Pay</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <CurrencyDisplay 
                          value={item.median} 
                          currency="USD" 
                          className="text-xs font-black text-emerald-500 dark:text-emerald-400" 
                        />
                        <p className="text-[9px] text-muted">USD Eq.</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Paying Roles */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-lg">
                <h3 className="text-xs font-black uppercase tracking-wider text-foreground mb-4 flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-primary" />
                  Top Paying Roles
                </h3>
                <div className="space-y-3">
                  {roleMedianPay.map((item) => (
                    <div 
                      key={item.name} 
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-card-hover/40 transition-colors border border-transparent hover:border-border/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <Briefcase className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground truncate max-w-[130px]">{item.name}</p>
                          <p className="text-[10px] text-muted">Role Category</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <CurrencyDisplay 
                          value={item.median} 
                          currency="USD" 
                          className="text-xs font-black text-emerald-500 dark:text-emerald-400" 
                        />
                        <p className="text-[9px] text-muted">USD Eq.</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progression Equivalent Matrix */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-lg">
                <h3 className="text-xs font-black uppercase tracking-wider text-foreground mb-3 flex items-center gap-2">
                  <Landmark className="w-3.5 h-3.5 text-cyan-500" />
                  Grade Matrix
                </h3>
                <p className="text-[10px] text-muted mb-4 leading-relaxed">
                  Equivalent levels cross-mapping for standard Software Engineering bands.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[10px]">
                    <thead>
                      <tr className="border-b border-border/80 text-muted uppercase font-bold tracking-wider">
                        <th className="py-1.5 pb-2 font-bold">Equiv</th>
                        <th className="py-1.5 pb-2 font-bold">Google</th>
                        <th className="py-1.5 pb-2 font-bold">Meta</th>
                        <th className="py-1.5 pb-2 font-bold">MSFT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-semibold text-foreground">
                      <tr className="hover:bg-card-hover/20">
                        <td className="py-2 text-muted">Entry</td>
                        <td className="py-2 text-indigo-400">L3</td>
                        <td className="py-2 text-emerald-400">E3</td>
                        <td className="py-2 text-amber-400">59</td>
                      </tr>
                      <tr className="hover:bg-card-hover/20">
                        <td className="py-2 text-muted">Mid</td>
                        <td className="py-2 text-indigo-400">L4</td>
                        <td className="py-2 text-emerald-400">E4</td>
                        <td className="py-2 text-amber-400">61</td>
                      </tr>
                      <tr className="hover:bg-card-hover/20">
                        <td className="py-2 text-muted">Senior</td>
                        <td className="py-2 text-indigo-400">L5</td>
                        <td className="py-2 text-emerald-400">E5</td>
                        <td className="py-2 text-amber-400">63</td>
                      </tr>
                      <tr className="hover:bg-card-hover/20">
                        <td className="py-2 text-muted">Staff</td>
                        <td className="py-2 text-indigo-400">L6</td>
                        <td className="py-2 text-emerald-400">E6</td>
                        <td className="py-2 text-amber-400">65</td>
                      </tr>
                      <tr className="hover:bg-card-hover/20">
                        <td className="py-2 text-muted">Principal</td>
                        <td className="py-2 text-indigo-400">L7</td>
                        <td className="py-2 text-emerald-400">E7</td>
                        <td className="py-2 text-amber-400">67</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "levels" && <LevelMatrix companies={initialCompanies} />}

        {activeTab === "compare" && (
          <ComparisonWorkspace
            companies={initialCompanies}
            roles={initialRoles}
            locations={initialLocations}
          />
        )}

        {activeTab === "location" && (
          <LocationMatrix locations={initialLocations} records={verifiedRecords} />
        )}

        {activeTab === "submit" && (
          !currentUser ? (
            <div className="max-w-xl mx-auto bg-card border border-border rounded-2xl shadow-xl p-8 text-center animate-fadeIn">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-black text-foreground mb-2">Authentication Required</h2>
              <p className="text-muted text-xs max-w-sm mx-auto mb-6 leading-relaxed">
                To guarantee the accuracy and integrity of our compensation dataset, only verified registered users can submit salaries. Your submissions are kept strictly anonymous.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-xs mx-auto">
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-2.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_12px_rgba(99,102,241,0.2)]"
                >
                  Sign In / Sign Up
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-xl mx-auto bg-card border border-border rounded-2xl shadow-xl p-6 animate-fadeIn">
              <div className="mb-6 border-b border-border pb-4">
                <h2 className="text-lg font-bold text-foreground">Submit Compensation Record</h2>
                <p className="text-muted text-xs mt-0.5">
                  Contribute anonymized verified salary data. Levels-equivalency will be resolved dynamically.
                </p>
              </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Alert notices */}
              {formStatus && (
                <div
                  className={`p-3 rounded-lg border flex items-start gap-2.5 text-xs font-medium ${
                    formStatus.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                      : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                  }`}
                >
                  {formStatus.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <span>{formStatus.message}</span>
                </div>
              )}

              {/* Company Selector */}
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Company</label>
                <select
                  className="bg-card border border-border text-sm font-semibold rounded-lg p-2.5 outline-none cursor-pointer text-foreground"
                  value={subCompId}
                  onChange={(e) => setSubCompId(e.target.value)}
                >
                  {initialCompanies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Roles */}
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Role Type</label>
                <select
                  className="bg-card border border-border text-sm font-semibold rounded-lg p-2.5 outline-none cursor-pointer text-foreground"
                  value={subRoleId}
                  onChange={(e) => setSubRoleId(e.target.value)}
                >
                  {initialRoles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.roleName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Conditional level code vs designation text */}
              {isDisclosed ? (
                <div className="flex flex-col animate-fadeIn">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">
                    Internal Disclosed Level
                  </label>
                  <select
                    className="bg-card border border-border text-sm font-semibold rounded-lg p-2.5 outline-none cursor-pointer text-foreground"
                    value={subLevelId}
                    onChange={(e) => setSubLevelId(e.target.value)}
                  >
                    {disclosedLevels.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.levelCode} ({l.equivalentLevel})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex flex-col animate-fadeIn">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">
                    Job Designation Title
                  </label>
                  <input
                    type="text"
                    required
                    className="bg-card border border-border text-sm rounded-lg p-2.5 outline-none text-foreground placeholder-muted/80"
                    placeholder="e.g. Technology Lead, Senior Associate"
                    value={subDesignation}
                    onChange={(e) => setSubDesignation(e.target.value)}
                  />
                  <span className="text-[10px] text-amber-500 font-semibold mt-1">
                    ⚠️ System will automatically estimate grade mapping with confidence metrics.
                  </span>
                </div>
              )}

              {/* Location */}
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Location</label>
                <select
                  className="bg-card border border-border text-sm font-semibold rounded-lg p-2.5 outline-none cursor-pointer text-foreground"
                  value={subLocId}
                  onChange={(e) => setSubLocId(e.target.value)}
                >
                  {initialLocations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.city}, {loc.country}
                    </option>
                  ))}
                </select>
              </div>

              {/* Currency */}
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Currency</label>
                <select
                  className="bg-card border border-border text-sm font-semibold rounded-lg p-2.5 outline-none cursor-pointer text-foreground"
                  value={subCurrency}
                  onChange={(e) => setSubCurrency(e.target.value)}
                >
                  <option value="USD">USD - United States Dollar</option>
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>

              {/* Experience and Base */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Years Experience</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="bg-card border border-border text-sm rounded-lg p-2.5 outline-none text-foreground"
                    value={subYoe}
                    onChange={(e) => setSubYoe(e.target.value)}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Base Salary / yr</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="bg-card border border-border text-sm rounded-lg p-2.5 outline-none text-foreground"
                    value={subBase}
                    onChange={(e) => setSubBase(e.target.value)}
                  />
                </div>
              </div>

              {/* Stock and Bonus */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col col-span-1">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">
                    Total Stock (4yr)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="bg-card border border-border text-sm rounded-lg p-2.5 outline-none text-foreground"
                    placeholder="Total grant"
                    value={subStock}
                    onChange={(e) => setSubStock(e.target.value)}
                  />
                </div>
                <div className="flex flex-col col-span-1">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">
                    Annual Bonus
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="bg-card border border-border text-sm rounded-lg p-2.5 outline-none text-foreground"
                    placeholder="Per year"
                    value={subBonus}
                    onChange={(e) => setSubBonus(e.target.value)}
                  />
                </div>
                <div className="flex flex-col col-span-1">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">
                    Sign-on / Joining
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="bg-card border border-border text-sm rounded-lg p-2.5 outline-none text-foreground"
                    placeholder="One-time"
                    value={subJoining}
                    onChange={(e) => setSubJoining(e.target.value)}
                  />
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/95 text-white font-bold text-sm uppercase tracking-wider p-3 rounded-lg cursor-pointer disabled:opacity-50 transition-colors mt-6"
              >
                <Send className="w-4 h-4" />
                {isPending ? "Submitting..." : "Submit Compensation"}
              </button>
            </form>
          </div>
          )
        )}
      </div>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
