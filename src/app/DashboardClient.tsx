"use client";

import React, { useState, useTransition } from "react";
import { Company, Role, Location, Level, CompensationRecord } from "@/types";
import { FilterHero, FilterState } from "@/components/FilterHero";
import { CompensationTable } from "@/components/CompensationTable";
import { LevelMatrix } from "@/components/LevelMatrix";
import { ComparisonWorkspace } from "@/components/ComparisonWorkspace";
import { LocationMatrix } from "@/components/LocationMatrix";
import { submitCompensation } from "@/actions/compensation.actions";
import { DollarSign, Landmark, Briefcase, MapPin, Send, AlertCircle, CheckCircle2, Lock, ArrowRight, TrendingUp, BarChart2 } from "lucide-react";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import AuthModal from "@/components/AuthModal";
import { CompanyLogo } from "@/components/CompanyLogo";

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
  const [activeTab, setActiveTab] = useState<"explore" | "levels" | "compare" | "location" | "submit">("explore");
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: "",
    locationId: "",
    experienceLevel: "",
    equivalentLevel: "",
    locationTier: "",
  });

  // Submission state
  const [subCompId, setSubCompId] = useState(initialCompanies[0]?.id || "");
  const [subRoleId, setSubRoleId] = useState(initialRoles[0]?.id || "");
  const [subLocId, setSubLocId] = useState(initialLocations[0]?.id || "");
  const [subYoe, setSubYoe] = useState("");
  const [subBase, setSubBase] = useState("");
  const [subStock, setSubStock] = useState("");
  const [subBonus, setSubBonus] = useState("");
  const [subJoining, setSubJoining] = useState("");
  const [subCurrency, setSubCurrency] = useState("USD");
  const [subLevelId, setSubLevelId] = useState("");
  const [subDesignation, setSubDesignation] = useState("");
  const [isPending, startTransition] = useTransition();
  const [formStatus, setFormStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const getUSDValue = (amount: number, currency: string): number => {
    const toUSD: Record<string, number> = { USD: 1.0, INR: 0.012, GBP: 1.25, EUR: 1.08 };
    return amount * (toUSD[currency.toUpperCase()] || 1.0);
  };

  // Summary stats
  const verifiedRecords = initialRecords.filter((r) => r.verificationStatus === "VERIFIED");
  const totalCompanies = initialCompanies.length;
  const totalRoles = initialRoles.length;

  const allUSDComps = verifiedRecords.map((r) => getUSDValue(r.totalCompensation, r.currency)).sort((a, b) => a - b);
  let medianComp = 0;
  if (allUSDComps.length > 0) {
    const mid = Math.floor(allUSDComps.length / 2);
    medianComp = allUSDComps.length % 2 !== 0 ? allUSDComps[mid] : (allUSDComps[mid - 1] + allUSDComps[mid]) / 2;
  }

  // Top paying companies
  const companyPayMap: Record<string, number[]> = {};
  verifiedRecords.forEach((r) => {
    if (!companyPayMap[r.company.name]) companyPayMap[r.company.name] = [];
    companyPayMap[r.company.name].push(getUSDValue(r.totalCompensation, r.currency));
  });

  const companyMedianPay = Object.entries(companyPayMap).map(([name, comps]) => {
    comps.sort((a, b) => a - b);
    const mid = Math.floor(comps.length / 2);
    const median = comps.length % 2 !== 0 ? comps[mid] : (comps[mid - 1] + comps[mid]) / 2;
    const compRecord = initialCompanies.find(c => c.name === name);
    return { name, median, logo: compRecord?.logo || "logo-default" };
  }).sort((a, b) => b.median - a.median).slice(0, 5);

  let highestPayingCompany = companyMedianPay[0]?.name || "N/A";
  let highestPayingMedian = companyMedianPay[0]?.median || 0;

  // Top paying roles
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

  // Filter records
  const filteredRecords = verifiedRecords.filter((rec) => {
    const query = filters.searchQuery.toLowerCase();
    const matchesSearch =
      query === "" ||
      rec.company.name.toLowerCase().includes(query) ||
      rec.role.roleName.toLowerCase().includes(query) ||
      rec.level.levelCode.toLowerCase().includes(query) ||
      rec.level.equivalentLevel.toLowerCase().includes(query);
    const matchesLoc = filters.locationId === "" || rec.locationId === filters.locationId;
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
    const matchesLevel = filters.equivalentLevel === "" || rec.level.equivalentLevel === filters.equivalentLevel;
    let matchesTier = true;
    if (filters.locationTier) {
      const col = rec.location.costOfLivingIndex;
      if (filters.locationTier === "Tier 1") matchesTier = col >= 90.0;
      else if (filters.locationTier === "Tier 2") matchesTier = col >= 40.0 && col < 90.0;
      else if (filters.locationTier === "Tier 3") matchesTier = col < 40.0;
    }
    return matchesSearch && matchesLoc && matchesExp && matchesLevel && matchesTier;
  });

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

  const selectedComp = initialCompanies.find((c) => c.id === subCompId);
  const isDisclosed = selectedComp?.levels.some((l: { mappingType: string }) => l.mappingType === "disclosed") ?? false;
  const disclosedLevels = selectedComp?.levels.filter((l: { mappingType: string }) => l.mappingType === "disclosed") || [];

  React.useEffect(() => {
    if (disclosedLevels.length > 0) setSubLevelId(disclosedLevels[0].id);
    else setSubLevelId("");
  }, [subCompId]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus(null);
    const base = parseFloat(subBase || "0");
    const stock = parseFloat(subStock || "0");
    const bonus = parseFloat(subBonus || "0");
    const joining = parseFloat(subJoining || "0");
    const yoe = parseInt(subYoe || "0");
    if (isNaN(base) || base <= 0) { setFormStatus({ type: "error", message: "Base salary must be a positive number." }); return; }
    if (isNaN(yoe) || yoe < 0) { setFormStatus({ type: "error", message: "Years of experience must be a non-negative integer." }); return; }
    startTransition(async () => {
      const res = await submitCompensation({
        companyId: subCompId, roleId: subRoleId, locationId: subLocId,
        yearsExperience: yoe, baseSalary: base, stockGrant: stock, bonus, joiningBonus: joining,
        currency: subCurrency, levelId: isDisclosed ? subLevelId : undefined,
        designation: !isDisclosed ? subDesignation : undefined,
      });
      if (res.success) {
        setFormStatus({ type: "success", message: "Thank you! Your compensation has been submitted for verification." });
        setSubBase(""); setSubStock(""); setSubBonus(""); setSubJoining(""); setSubYoe(""); setSubDesignation("");
      } else {
        setFormStatus({ type: "error", message: res.error || "Failed to submit." });
      }
    });
  };

  const tabItems = [
    { id: "explore", label: "Explore" },
    { id: "levels", label: "Compare Levels" },
    { id: "compare", label: "Companies" },
    { id: "location", label: "Locations" },
    { id: "submit", label: "Add Salary" },
  ] as const;

  return (
    <div className="page-home pb-16">
      {/* ── Hero / Search ── */}
      <FilterHero
        locations={initialLocations}
        companies={initialCompanies}
        roles={initialRoles}
        onFilterChange={(next) => setFilters(next)}
      />

      {/* ── Main Content Area ── */}
      <div className="main-container py-4">

        {/* ── Stats Bar ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card/45 backdrop-blur-md border border-border/80 rounded-2xl p-4 flex items-center gap-4 hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Landmark className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-black text-foreground tracking-tight leading-none mb-1">{totalCompanies}</div>
              <div className="text-[10px] font-bold text-muted uppercase tracking-wider">Companies</div>
            </div>
          </div>
          <div className="bg-card/45 backdrop-blur-md border border-border/80 rounded-2xl p-4 flex items-center gap-4 hover:border-accent/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5 text-accent" />
            </div>
            <div>
              <div className="text-2xl font-black text-foreground tracking-tight leading-none mb-1">{totalRoles}</div>
              <div className="text-[10px] font-bold text-muted uppercase tracking-wider">Roles</div>
            </div>
          </div>
          <div className="bg-card/45 backdrop-blur-md border border-border/80 rounded-2xl p-4 flex items-center gap-4 hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <BarChart2 className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <div className="text-2xl font-black text-foreground tracking-tight leading-none mb-1">{verifiedRecords.length}</div>
              <div className="text-[10px] font-bold text-muted uppercase tracking-wider">Salary Reports</div>
            </div>
          </div>
          <div className="bg-card/45 backdrop-blur-md border border-border/80 rounded-2xl p-4 flex items-center gap-4 hover:border-accent/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5 text-accent" />
            </div>
            <div>
              <CurrencyDisplay value={medianComp} currency="USD" className="text-2xl font-black text-accent tracking-tight leading-none mb-1" />
              <div className="text-[10px] font-bold text-muted uppercase tracking-wider">Median TC</div>
            </div>
          </div>
        </div>

        {/* ── Tab Bar ── */}
        <div className="flex items-center gap-1 mb-6 border-b border-border/70 overflow-x-auto pb-px" style={{ scrollbarWidth: "none" }}>
          {tabItems.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-5 py-3 text-sm font-bold whitespace-nowrap cursor-pointer transition-all duration-200 border-b-2 -mb-px ${
                activeTab === id
                  ? "text-primary border-primary"
                  : "text-muted border-transparent hover:text-foreground hover:border-border/60"
              }`}
            >
              {label}
            </button>
          ))}
          {/* Add Salary button on right */}
          {currentUser && activeTab !== "submit" && (
            <button
              onClick={() => setActiveTab("submit")}
              className="ml-auto flex items-center gap-1.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover px-4 py-2 rounded-xl cursor-pointer shadow-md shadow-primary/15 transition-all duration-200 hover:-translate-y-0.5"
            >
              <Send className="w-3.5 h-3.5" />
              Add Salary
            </button>
          )}
        </div>

        {/* ── Tab Content ── */}
        <div className="animate-fadeIn" key={activeTab}>
          {activeTab === "explore" && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_310px] gap-8">
              {/* Left: Data Table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-foreground/90">
                    {tableData.length === verifiedRecords.length
                      ? `${tableData.length} Verified Salary Reports`
                      : `${tableData.length} matching results (of ${verifiedRecords.length})`}
                  </span>
                  <span className="text-xs text-muted/70 font-semibold hidden md:block">Click a row to expand details</span>
                </div>
                <CompensationTable datapoints={tableData} />
              </div>

              {/* Right: Sidebar widgets */}
              <div className="space-y-6">
                {/* Top Paying Companies */}
                <div className="bg-card/45 backdrop-blur-md border border-border/80 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-xs font-black uppercase tracking-wider text-foreground mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Top Paying Companies
                  </h3>
                  <div className="space-y-3.5">
                    {companyMedianPay.length > 0 ? companyMedianPay.map((item, idx) => {
                      const percentage = highestPayingMedian > 0 ? (item.median / highestPayingMedian) * 100 : 0;
                      return (
                        <div key={item.name} className="group flex flex-col gap-1.5 p-2 rounded-xl hover:bg-card-hover/60 transition-colors cursor-pointer">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-muted w-4 shrink-0">#{idx + 1}</span>
                            <div className="relative shrink-0 p-0.5 rounded-full bg-linear-to-tr from-primary/30 to-accent/30 group-hover:from-primary/60 group-hover:to-accent/60 transition-all">
                              <CompanyLogo name={item.name} size={28} className="rounded-full bg-card shrink-0" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">{item.name}</p>
                            </div>
                            <CurrencyDisplay value={item.median} currency="USD" className="text-xs font-black text-accent shrink-0" />
                          </div>
                          {/* Relative Pay Progress Bar */}
                          <div className="w-full bg-border/40 rounded-full h-1.5 pl-7">
                            <div className="w-full bg-border/40 rounded-full h-full overflow-hidden">
                              <div 
                                className="bg-linear-to-r from-primary to-accent h-full rounded-full transition-all duration-500" 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    }) : (
                      <p className="text-xs text-muted text-center py-4">No data available yet</p>
                    )}
                  </div>
                </div>

                {/* Top Paying Roles */}
                <div className="bg-card/45 backdrop-blur-md border border-border/80 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-xs font-black uppercase tracking-wider text-foreground mb-4 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-primary" />
                    Top Paying Roles
                  </h3>
                  <div className="space-y-3.5">
                    {roleMedianPay.length > 0 ? roleMedianPay.map((item, idx) => {
                      const highestRoleMedian = roleMedianPay[0]?.median || 0;
                      const percentage = highestRoleMedian > 0 ? (item.median / highestRoleMedian) * 100 : 0;
                      return (
                        <div key={item.name} className="group flex flex-col gap-1.5 p-2 rounded-xl hover:bg-card-hover/60 transition-colors cursor-pointer">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-muted w-4 shrink-0">#{idx + 1}</span>
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-all">
                              <Briefcase className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">{item.name}</p>
                            </div>
                            <CurrencyDisplay value={item.median} currency="USD" className="text-xs font-black text-accent shrink-0" />
                          </div>
                          {/* Relative Pay Progress Bar */}
                          <div className="w-full bg-border/40 rounded-full h-1.5 pl-7">
                            <div className="w-full bg-border/40 rounded-full h-full overflow-hidden">
                              <div 
                                className="bg-linear-to-r from-primary to-accent h-full rounded-full transition-all duration-500" 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    }) : (
                      <p className="text-xs text-muted text-center py-4">No data available yet</p>
                    )}
                  </div>
                </div>

                {/* Level Grade Matrix */}
                <div className="bg-card/45 backdrop-blur-md border border-border/80 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-xs font-black uppercase tracking-wider text-foreground mb-1 flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-primary" />
                    Grade Equivalency
                  </h3>
                  <p className="text-[10px] text-muted font-semibold mb-4">SE level cross-mapping across major tech companies</p>
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="border-b border-border/80">
                        <th className="pb-2 font-bold text-muted text-[10px] uppercase tracking-wide">Band</th>
                        <th className="pb-2 font-bold text-muted text-[10px] uppercase tracking-wide">Google</th>
                        <th className="pb-2 font-bold text-muted text-[10px] uppercase tracking-wide">Meta</th>
                        <th className="pb-2 font-bold text-muted text-[10px] uppercase tracking-wide">MSFT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light">
                      {[
                        { band: "Entry", g: "L3", m: "E3", ms: "59" },
                        { band: "Mid", g: "L4", m: "E4", ms: "61" },
                        { band: "Senior", g: "L5", m: "E5", ms: "63" },
                        { band: "Staff", g: "L6", m: "E6", ms: "65" },
                        { band: "Principal", g: "L7", m: "E7", ms: "67" },
                      ].map((row) => (
                        <tr key={row.band} className="hover:bg-card-hover/50 transition-colors">
                          <td className="py-2.5 text-muted font-bold">{row.band}</td>
                          <td className="py-2.5 text-primary font-bold">{row.g}</td>
                          <td className="py-2.5 text-accent font-bold">{row.m}</td>
                          <td className="py-2.5 text-amber-500 font-bold">{row.ms}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Submit CTA */}
                {!currentUser && (
                  <div className="bg-gradient-to-br from-primary/10 to-accent/5 backdrop-blur-md border border-primary/20 rounded-2xl p-6 text-center shadow-lg shadow-primary/5">
                    <h4 className="text-sm font-black text-foreground mb-1.5">Know your worth?</h4>
                    <p className="text-xs text-muted font-semibold mb-4 leading-relaxed">Share your salary anonymously and help the developer community make better career decisions.</p>
                    <button
                      onClick={() => setIsAuthOpen(true)}
                      className="btn-primary text-xs py-2.5 px-4 w-full flex items-center justify-center gap-1.5 shadow-md shadow-primary/15 transition-all duration-200 hover:-translate-y-0.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Add Your Salary
                    </button>
                  </div>
                )}
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
              <div className="max-w-lg mx-auto bg-card/45 backdrop-blur-md border border-border/80 rounded-2xl p-8 text-center animate-fadeIn shadow-lg">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-lg font-black text-foreground mb-2">Sign in to Submit</h2>
                <p className="text-sm text-muted max-w-sm mx-auto mb-6 font-medium leading-relaxed">
                  Only verified registered users can submit salaries to maintain data quality. Your submissions are 100% anonymous.
                </p>
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="btn-primary flex items-center justify-center gap-2 mx-auto px-6 py-3 shadow-md shadow-primary/15 transition-all duration-200 hover:-translate-y-0.5"
                >
                  Sign In / Sign Up
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="max-w-lg mx-auto bg-card/45 backdrop-blur-md border border-border/85 rounded-2xl p-6 animate-fadeIn shadow-lg">
                <div className="mb-6 pb-4 border-b border-border/80">
                  <h2 className="text-base font-black text-foreground">Add Salary Data</h2>
                  <p className="text-xs text-muted mt-1 font-medium">Your submission is anonymized. Levels are auto-mapped for non-disclosed frameworks.</p>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-5">
                  {formStatus && (
                    <div className={`p-4 rounded-xl border flex items-start gap-2.5 text-xs font-bold ${
                      formStatus.type === "success"
                        ? "bg-accent/10 border-accent/20 text-accent"
                        : "bg-red-500/10 border-red-500/20 text-red-500"
                    }`}>
                      {formStatus.type === "success"
                        ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                        : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                      <span>{formStatus.message}</span>
                    </div>
                  )}

                  {/* Fields Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "Company", node: (
                        <select className="form-select w-full bg-card/60 dark:bg-card/40 border border-border rounded-xl px-3 py-2 text-sm font-semibold outline-none focus:border-primary transition-all cursor-pointer" value={subCompId} onChange={(e) => setSubCompId(e.target.value)}>
                          {initialCompanies.map((c) => <option key={c.id} value={c.id} className="bg-card text-foreground">{c.name}</option>)}
                        </select>
                      )},
                      { label: "Role Type", node: (
                        <select className="form-select w-full bg-card/60 dark:bg-card/40 border border-border rounded-xl px-3 py-2 text-sm font-semibold outline-none focus:border-primary transition-all cursor-pointer" value={subRoleId} onChange={(e) => setSubRoleId(e.target.value)}>
                          {initialRoles.map((r) => <option key={r.id} value={r.id} className="bg-card text-foreground">{r.roleName}</option>)}
                        </select>
                      )},
                      { label: "Location", node: (
                        <select className="form-select w-full bg-card/60 dark:bg-card/40 border border-border rounded-xl px-3 py-2 text-sm font-semibold outline-none focus:border-primary transition-all cursor-pointer" value={subLocId} onChange={(e) => setSubLocId(e.target.value)}>
                          {initialLocations.map((loc) => <option key={loc.id} value={loc.id} className="bg-card text-foreground">{loc.city}, {loc.country}</option>)}
                        </select>
                      )},
                      { label: "Currency", node: (
                        <select className="form-select w-full bg-card/60 dark:bg-card/40 border border-border rounded-xl px-3 py-2 text-sm font-semibold outline-none focus:border-primary transition-all cursor-pointer" value={subCurrency} onChange={(e) => setSubCurrency(e.target.value)}>
                          <option value="USD" className="bg-card text-foreground">USD — US Dollar</option>
                          <option value="INR" className="bg-card text-foreground">INR — Indian Rupee</option>
                          <option value="GBP" className="bg-card text-foreground">GBP — British Pound</option>
                          <option value="EUR" className="bg-card text-foreground">EUR — Euro</option>
                        </select>
                      )},
                    ].map(({ label, node }) => (
                      <div key={label} className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-muted uppercase tracking-wider pl-1">{label}</label>
                        {node}
                      </div>
                    ))}
                  </div>

                  {/* Level / Designation */}
                  {isDisclosed ? (
                    <div className="flex flex-col gap-1.5 animate-fadeIn">
                      <label className="text-[10px] font-black text-muted uppercase tracking-wider pl-1">Internal Level</label>
                      <select className="form-select w-full bg-card/60 dark:bg-card/40 border border-border rounded-xl px-3 py-2 text-sm font-semibold outline-none focus:border-primary transition-all cursor-pointer" value={subLevelId} onChange={(e) => setSubLevelId(e.target.value)}>
                        {disclosedLevels.map((l: { id: string; levelCode: string; equivalentLevel: string }) => (
                          <option key={l.id} value={l.id} className="bg-card text-foreground">{l.levelCode} ({l.equivalentLevel})</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5 animate-fadeIn">
                      <label className="text-[10px] font-black text-muted uppercase tracking-wider pl-1">Job Title / Designation</label>
                      <input
                        type="text"
                        required
                        className="form-input w-full bg-card/60 dark:bg-card/40 border border-border rounded-xl px-3.5 py-2 text-sm font-semibold outline-none focus:border-primary transition-all"
                        placeholder="e.g. Senior Software Engineer, Technology Lead"
                        value={subDesignation}
                        onChange={(e) => setSubDesignation(e.target.value)}
                      />
                      <span className="text-[10px] text-amber-500 font-bold pl-1 mt-0.5">Auto-estimated grade mapping will be applied.</span>
                    </div>
                  )}

                  {/* YOE + Base */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-muted uppercase tracking-wider pl-1">Years Exp.</label>
                      <input type="number" min="0" required className="form-input w-full bg-card/60 dark:bg-card/40 border border-border rounded-xl px-3.5 py-2 text-sm font-semibold outline-none focus:border-primary transition-all" value={subYoe} onChange={(e) => setSubYoe(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-muted uppercase tracking-wider pl-1">Base Salary / yr</label>
                      <input type="number" min="1" required className="form-input w-full bg-card/60 dark:bg-card/40 border border-border rounded-xl px-3.5 py-2 text-sm font-semibold outline-none focus:border-primary transition-all" value={subBase} onChange={(e) => setSubBase(e.target.value)} />
                    </div>
                  </div>

                  {/* Stock + Bonus + Joining */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Stock (4yr)", val: subStock, set: setSubStock, ph: "Total grant" },
                      { label: "Annual Bonus", val: subBonus, set: setSubBonus, ph: "Per year" },
                      { label: "Sign-on", val: subJoining, set: setSubJoining, ph: "One-time" },
                    ].map(({ label, val, set, ph }) => (
                      <div key={label} className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-muted uppercase tracking-wider pl-1">{label}</label>
                        <input type="number" min="0" className="form-input w-full bg-card/60 dark:bg-card/40 border border-border rounded-xl px-3 py-2 text-sm font-semibold outline-none focus:border-primary transition-all" placeholder={ph} value={val} onChange={(e) => set(e.target.value)} />
                      </div>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-sm disabled:opacity-50 cursor-pointer mt-4 shadow-md shadow-primary/15 transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <Send className="w-4 h-4" />
                    {isPending ? "Submitting..." : "Submit Anonymously"}
                  </button>
                </form>
              </div>
            )
          )}
        </div>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
