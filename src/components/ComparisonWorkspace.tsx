"use client";

import React, { useState, useEffect } from "react";
import { Company, Role, Location } from "@prisma/client";
import { getComparison } from "../actions/compensation.actions";
import { CompanyCompSummary, DatapointDetail } from "../types";
import { Scale, ArrowRight, ArrowUpRight, TrendingDown, HelpCircle } from "lucide-react";
import { CurrencyDisplay } from "./CurrencyDisplay";

export interface ComparisonWorkspaceProps {
  companies: Company[];
  roles: Role[];
  locations: Location[];
}

export const ComparisonWorkspace: React.FC<ComparisonWorkspaceProps> = ({
  companies,
  roles,
  locations,
}) => {
  // Select state
  const [compAId, setCompAId] = useState(companies[0]?.id || "");
  const [compBId, setCompBId] = useState(companies[1]?.id || "");
  const [roleId, setRoleId] = useState(roles[0]?.id || "");
  const [equivGrade, setEquivGrade] = useState("Senior"); // Default to Senior
  const [locationId, setLocationId] = useState(""); // Default to All Locations
  const [adjustForCol, setAdjustForCol] = useState(false);

  // Fetch results state
  const [loading, setLoading] = useState(false);
  const [summaryA, setSummaryA] = useState<CompanyCompSummary | null>(null);
  const [summaryB, setSummaryB] = useState<CompanyCompSummary | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!compAId || !compBId || !roleId || !equivGrade) return;
      setLoading(true);
      try {
        const results = await getComparison({
          equivalentLevel: equivGrade,
          roleId,
          locationId: locationId || undefined,
          adjustForCol,
        });

        // Extract summaries for selected Company A and Company B
        const summaryAData = results.find((r) => r.companyId === compAId) || null;
        const summaryBData = results.find((r) => r.companyId === compBId) || null;

        setSummaryA(summaryAData);
        setSummaryB(summaryBData);
      } catch (err) {
        console.error("Failed to load comparisons:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [compAId, compBId, roleId, equivGrade, locationId, adjustForCol]);

  const formatCurrency = (val: number | null | undefined) => {
    if (val === null || val === undefined) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getCompanyLogoClass = (name: string) => {
    return `logo-${name.toLowerCase().trim()}`;
  };

  // Compute breakdown stats for a summary
  const getBreakdowns = (summary: CompanyCompSummary | null) => {
    if (!summary || summary.count === 0) return { base: 0, stock: 0, bonus: 0, joining: 0, total: 0 };
    
    // Average raw components across matching datapoints
    const points = summary.datapoints;
    const base = points.reduce((acc, p) => acc + p.baseSalary, 0) / points.length;
    const stock = points.reduce((acc, p) => acc + p.stockGrant, 0) / points.length;
    const bonus = points.reduce((acc, p) => acc + p.bonus, 0) / points.length;
    const joining = points.reduce((acc, p) => acc + p.joiningBonus, 0) / points.length;
    const total = summary.median || (summary.average || 0); // prefer median if available

    return { base, stock, bonus, joining, total };
  };

  const statsA = getBreakdowns(summaryA);
  const statsB = getBreakdowns(summaryB);

  // Winner logic
  const hasDataA = (summaryA && summaryA.count > 0);
  const hasDataB = (summaryB && summaryB.count > 0);

  let diffPct = 0;
  let winner: "A" | "B" | null = null;

  if (hasDataA && hasDataB) {
    if (statsA.total > statsB.total) {
      winner = "A";
      diffPct = ((statsA.total - statsB.total) / statsB.total) * 100;
    } else if (statsB.total > statsA.total) {
      winner = "B";
      diffPct = ((statsB.total - statsA.total) / statsA.total) * 100;
    }
  }

  return (
    <div className="w-full bg-card border border-border rounded-xl shadow-lg p-6 max-w-5xl mx-auto transition-colors duration-300">
      
      {/* Title */}
      <div className="flex items-center gap-2 mb-8 border-b border-border pb-4">
        <Scale className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-xl font-bold text-foreground">Side-by-Side Compensation Comparer</h2>
          <p className="text-muted text-xs mt-0.5">
            Compare compensation structure, base pay, bonus ratios, and equity offerings between two companies.
          </p>
        </div>
      </div>

      {/* Selectors grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-8 bg-muted/20 p-4 border border-border rounded-xl">
        {/* Company A */}
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Company A</label>
          <select
            className="w-full bg-card border border-border rounded-lg text-sm font-semibold p-2.5 outline-none cursor-pointer text-foreground"
            value={compAId}
            onChange={(e) => setCompAId(e.target.value)}
          >
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Company B */}
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Company B</label>
          <select
            className="w-full bg-card border border-border rounded-lg text-sm font-semibold p-2.5 outline-none cursor-pointer text-foreground"
            value={compBId}
            onChange={(e) => setCompBId(e.target.value)}
          >
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Role */}
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Role Type</label>
          <select
            className="w-full bg-card border border-border rounded-lg text-sm font-semibold p-2.5 outline-none cursor-pointer text-foreground"
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.roleName}
              </option>
            ))}
          </select>
        </div>

        {/* Level equivalent grade */}
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Equivalent Grade</label>
          <select
            className="w-full bg-card border border-border rounded-lg text-sm font-semibold p-2.5 outline-none cursor-pointer text-foreground"
            value={equivGrade}
            onChange={(e) => setEquivGrade(e.target.value)}
          >
            {["Entry", "Mid", "Senior", "Staff", "Principal", "Director+"].map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Location selector */}
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Location Filter</label>
          <select
            className="w-full bg-card border border-border rounded-lg text-sm font-semibold p-2.5 outline-none cursor-pointer text-foreground"
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
          >
            <option value="">All Locations (Global)</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.city}, {loc.country}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cost of Living adjustment toggle checkbox */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground/80">
          <input
            type="checkbox"
            className="w-4 h-4 text-primary bg-card border-border rounded cursor-pointer"
            checked={adjustForCol}
            onChange={(e) => setAdjustForCol(e.target.checked)}
          />
          Normalize for Cost of Living (COL Index Adjusted to San Francisco Baseline)
        </label>
        {loading && <span className="text-xs font-semibold text-primary animate-pulse">Calculating metrics...</span>}
      </div>

      {/* Main comparative workspace */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        
        {/* Company A Card */}
        <div
          className={`border rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all ${
            winner === "A"
              ? "border-primary bg-primary/[0.01]"
              : "border-border bg-card"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`company-logo-badge ${getCompanyLogoClass(companies.find(c => c.id === compAId)?.name || "")} w-12 h-12 text-lg shadow`}>
                  {(companies.find(c => c.id === compAId)?.name || "A").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-foreground">
                    {companies.find((c) => c.id === compAId)?.name}
                  </h3>
                  <span className="text-xs text-muted">
                    {companies.find((c) => c.id === compAId)?.industry}
                  </span>
                </div>
              </div>
              {winner === "A" && (
                <span className="bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1">
                  Winner (+{diffPct.toFixed(1)}%)
                </span>
              )}
            </div>

            {hasDataA ? (
              <div className="space-y-4">
                <div className="border-b border-border pb-3">
                  <span className="text-xs text-muted font-semibold block">Total Compensation (USD Equivalent/yr)</span>
                  <span className="text-3xl font-black text-foreground">
                    <CurrencyDisplay value={statsA.total} currency="USD" className="text-3xl" />
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-foreground/80">
                  <div>
                    <span className="text-muted block text-[10px] uppercase font-bold tracking-wider">Base Salary</span>
                    <CurrencyDisplay value={statsA.base} currency="USD" />
                  </div>
                  <div>
                    <span className="text-muted block text-[10px] uppercase font-bold tracking-wider">Stock Grant / yr</span>
                    <CurrencyDisplay value={statsA.stock / 4} currency="USD" />
                  </div>
                  <div>
                    <span className="text-muted block text-[10px] uppercase font-bold tracking-wider">Bonus / yr</span>
                    <CurrencyDisplay value={statsA.bonus} currency="USD" />
                  </div>
                  <div>
                    <span className="text-muted block text-[10px] uppercase font-bold tracking-wider">Joining Bonus</span>
                    <CurrencyDisplay value={statsA.joining} currency="USD" />
                  </div>
                </div>

                {/* Micro chart stacked composition bar */}
                <div className="pt-4">
                  <div className="w-full h-2 bg-muted border border-border rounded-full overflow-hidden flex">
                    <div className="h-full bg-blue-500" style={{ width: `${(statsA.base / (statsA.base + (statsA.stock / 4) + statsA.bonus)) * 100}%` }} />
                    <div className="h-full bg-purple-500" style={{ width: `${((statsA.stock / 4) / (statsA.base + (statsA.stock / 4) + statsA.bonus)) * 100}%` }} />
                    <div className="h-full bg-amber-500" style={{ width: `${(statsA.bonus / (statsA.base + (statsA.stock / 4) + statsA.bonus)) * 100}%` }} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-muted italic border border-dashed border-border rounded-xl">
                No verified records found for this cohort.
              </div>
            )}
          </div>

          <div className="text-[10px] text-muted font-medium mt-6 border-t border-border pt-3">
            Cohort sample size: {summaryA?.count || 0} entries
          </div>
        </div>

        {/* Company B Card */}
        <div
          className={`border rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all ${
            winner === "B"
              ? "border-primary bg-primary/[0.01]"
              : "border-border bg-card"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`company-logo-badge ${getCompanyLogoClass(companies.find(c => c.id === compBId)?.name || "")} w-12 h-12 text-lg shadow`}>
                  {(companies.find(c => c.id === compBId)?.name || "B").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-foreground">
                    {companies.find((c) => c.id === compBId)?.name}
                  </h3>
                  <span className="text-xs text-muted">
                    {companies.find((c) => c.id === compBId)?.industry}
                  </span>
                </div>
              </div>
              {winner === "B" && (
                <span className="bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1">
                  Winner (+{diffPct.toFixed(1)}%)
                </span>
              )}
            </div>

            {hasDataB ? (
              <div className="space-y-4">
                <div className="border-b border-border pb-3">
                  <span className="text-xs text-muted font-semibold block">Total Compensation (USD Equivalent/yr)</span>
                  <span className="text-3xl font-black text-foreground">
                    <CurrencyDisplay value={statsB.total} currency="USD" className="text-3xl" />
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-foreground/80">
                  <div>
                    <span className="text-muted block text-[10px] uppercase font-bold tracking-wider">Base Salary</span>
                    <CurrencyDisplay value={statsB.base} currency="USD" />
                  </div>
                  <div>
                    <span className="text-muted block text-[10px] uppercase font-bold tracking-wider">Stock Grant / yr</span>
                    <CurrencyDisplay value={statsB.stock / 4} currency="USD" />
                  </div>
                  <div>
                    <span className="text-muted block text-[10px] uppercase font-bold tracking-wider">Bonus / yr</span>
                    <CurrencyDisplay value={statsB.bonus} currency="USD" />
                  </div>
                  <div>
                    <span className="text-muted block text-[10px] uppercase font-bold tracking-wider">Joining Bonus</span>
                    <CurrencyDisplay value={statsB.joining} currency="USD" />
                  </div>
                </div>

                {/* Micro chart stacked composition bar */}
                <div className="pt-4">
                  <div className="w-full h-2 bg-muted border border-border rounded-full overflow-hidden flex">
                    <div className="h-full bg-blue-500" style={{ width: `${(statsB.base / (statsB.base + (statsB.stock / 4) + statsB.bonus)) * 100}%` }} />
                    <div className="h-full bg-purple-500" style={{ width: `${((statsB.stock / 4) / (statsB.base + (statsB.stock / 4) + statsB.bonus)) * 100}%` }} />
                    <div className="h-full bg-amber-500" style={{ width: `${(statsB.bonus / (statsB.base + (statsB.stock / 4) + statsB.bonus)) * 100}%` }} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-muted italic border border-dashed border-border rounded-xl">
                No verified records found for this cohort.
              </div>
            )}
          </div>

          <div className="text-[10px] text-muted font-medium mt-6 border-t border-border pt-3">
            Cohort sample size: {summaryB?.count || 0} entries
          </div>
        </div>

      </div>

    </div>
  );
};
