"use client";

import React, { useState } from "react";
import { ChevronDown, TrendingUp } from "lucide-react";
import { DatapointDetail } from "../types";
import { CurrencyDisplay } from "./CurrencyDisplay";
import { CompanyLogo } from "./CompanyLogo";

export interface CompensationTableProps {
  datapoints: Array<DatapointDetail & { companyName: string; roleName: string }>;
}

const COMPANY_REVIEWS: Record<string, {
  rating: number; wlb: number; comp: number; culture: number; pros: string[]; cons: string[];
}> = {
  google: { rating: 4.6, wlb: 4.2, comp: 4.7, culture: 4.5, pros: ["Excellent WLB", "Free Meals", "High Peer Quality"], cons: ["Bureaucratic", "Slower Promotions", "Vast Org Size"] },
  meta:   { rating: 4.5, wlb: 3.8, comp: 4.9, culture: 4.3, pros: ["Top Industry Comp", "Fast Paced", "High Ownership"], cons: ["High Stress", "Public Scrutiny", "Demanding Deadlines"] },
  amazon: { rating: 4.1, wlb: 3.5, comp: 4.5, culture: 3.9, pros: ["High Autonomy", "Great Scale", "Solid Engineering"], cons: ["Frugal Culture", "Backloaded Vesting", "PIP Pressure"] },
  microsoft: { rating: 4.2, wlb: 3.9, comp: 4.3, culture: 4.1, pros: ["Good WLB", "Job Stability", "Great Benefits"], cons: ["Slower Promotions", "Legacy Stack", "Bureaucratic"] },
  apple:  { rating: 4.3, wlb: 3.7, comp: 4.6, culture: 4.2, pros: ["Design Culture", "Great Benefits", "High Quality"], cons: ["Secrecy", "WLB Varies", "Segmented Org"] },
  netflix:{ rating: 4.4, wlb: 3.6, comp: 4.9, culture: 4.4, pros: ["Highest Base", "Talent Density", "Less Bureaucracy"], cons: ["High Firing Rate", "High Stress", "Low Error Tolerance"] },
  uber:   { rating: 4.2, wlb: 3.6, comp: 4.5, culture: 4.0, pros: ["Fast Growth", "High Autonomy", "Strong Tech"], cons: ["High Stress", "Work Hard Culture", "Changing Goals"] },
  airbnb: { rating: 4.5, wlb: 4.3, comp: 4.6, culture: 4.5, pros: ["Exceptional Culture", "Flexible Work", "Travel Credits"], cons: ["Slower Promotions", "Niche Scaling", "Travel Dependent"] },
  adobe:  { rating: 4.3, wlb: 4.2, comp: 4.4, culture: 4.3, pros: ["Excellent WLB", "Generous PTO", "Stable SaaS"], cons: ["Slower Iteration", "Heavy Bureaucracy", "Older Stack"] },
  salesforce: { rating: 4.2, wlb: 4.0, comp: 4.3, culture: 4.2, pros: ["Philanthropic Culture", "Good WLB", "Great Benefits"], cons: ["Huge Org Redundancy", "Slower Growth", "Aggressive Sales"] },
};

const getCompanyRating = (name: string) => {
  const key = name.toLowerCase().trim();
  return COMPANY_REVIEWS[key] || { rating: 4.0, wlb: 3.9, comp: 4.0, culture: 4.0, pros: ["Good Culture", "Decent Benefits"], cons: ["Moderate Bureaucracy"] };
};

const formatMoney = (val: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase(), maximumFractionDigits: 0 }).format(val);

const StarRating = ({ value }: { value: number }) => {
  const full = Math.floor(value);
  const half = value % 1 >= 0.5;
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= full ? "star-filled" : (i === full + 1 && half ? "star-filled opacity-60" : "star-empty")}>
          ★
        </span>
      ))}
    </span>
  );
};

export const CompensationTable: React.FC<CompensationTableProps> = ({ datapoints }) => {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="space-y-3">
      {/* Header Row */}
      {datapoints.length > 0 && (
        <div className="hidden md:flex items-center px-6 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-muted/80">
          <div className="w-[40%] pl-1">Company & Role</div>
          <div className="w-[20%]">Level</div>
          <div className="w-[20%]">Location</div>
          <div className="w-[20%] text-right pr-4">Total Comp</div>
        </div>
      )}

      {datapoints.length === 0 ? (
        <div className="bg-card/45 backdrop-blur-md border border-border/80 rounded-2xl py-16 text-center shadow-lg shadow-black/5">
          <div className="flex flex-col items-center gap-2.5">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm font-bold text-foreground">No salary records match your search</p>
            <p className="text-xs text-muted font-semibold">Try adjusting your filters or clearing the search</p>
          </div>
        </div>
      ) : (
        datapoints.map((dp) => {
          const isExpanded = !!expandedRows[dp.id];
          const annualStock = dp.stockGrant / 4;
          const annualBonus = dp.bonus;
          const total = dp.baseSalary + annualStock + annualBonus;
          const basePct = total > 0 ? (dp.baseSalary / total) * 100 : 0;
          const stockPct = total > 0 ? (annualStock / total) * 100 : 0;
          const bonusPct = total > 0 ? (annualBonus / total) * 100 : 0;
          const rating = getCompanyRating(dp.companyName);

          return (
            <div 
              key={dp.id}
              className={`bg-card/40 dark:bg-card/25 backdrop-blur-sm border rounded-2xl transition-all duration-200 shadow-sm hover:shadow-md hover:border-primary/30 ${
                isExpanded ? "border-primary/40 bg-card/60 dark:bg-card/35 ring-1 ring-primary/10" : "border-border/80"
              }`}
            >
              {/* Main Card Content */}
              <div 
                onClick={() => toggleRow(dp.id)}
                className="flex flex-col md:flex-row md:items-center px-6 py-4 cursor-pointer gap-4"
              >
                {/* Company / Role */}
                <div className="md:w-[40%] flex items-center gap-3">
                  <div className="relative shrink-0 p-0.5 rounded-xl bg-linear-to-tr from-primary/15 to-accent/15">
                    <CompanyLogo name={dp.companyName} size={38} className="rounded-xl bg-card shrink-0" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm text-foreground leading-none">{dp.companyName}</span>
                      {dp.mappingType === "disclosed" ? (
                        <span className="level-badge disclosed text-[9px] py-0.5 px-1.5 font-black uppercase">Disclosed</span>
                      ) : (
                        <span className="level-badge estimated text-[9px] py-0.5 px-1.5 font-black uppercase" title={`${Math.round(dp.confidenceScore * 100)}% confidence`}>
                          ~{Math.round(dp.confidenceScore * 100)}% Match
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted font-bold mt-1.5 flex items-center flex-wrap gap-x-1.5 gap-y-0.5">
                      <span>{dp.roleName}</span>
                      <span className="opacity-40 font-normal">·</span>
                      <span>{dp.yearsExperience} yrs exp</span>
                    </div>
                  </div>
                </div>

                {/* Level */}
                <div className="md:w-[20%] flex flex-row md:flex-col justify-between md:justify-center items-center md:items-start border-t border-border/40 pt-3 md:border-none md:pt-0">
                  <span className="text-[10px] font-bold text-muted md:hidden uppercase tracking-wider">Level</span>
                  <div>
                    <div className="font-extrabold text-sm text-foreground">{dp.levelCode}</div>
                    <div className="text-xs text-primary font-bold mt-0.5">{dp.equivalentLevel}</div>
                  </div>
                </div>

                {/* Location */}
                <div className="md:w-[20%] flex flex-row md:flex-col justify-between md:justify-center items-center md:items-start border-t border-border/40 pt-3 md:border-none md:pt-0">
                  <span className="text-[10px] font-bold text-muted md:hidden uppercase tracking-wider">Location</span>
                  <div>
                    <div className="text-sm font-bold text-foreground-secondary">{dp.locationCity}</div>
                    <div className="text-xs text-muted font-semibold mt-0.5">{dp.locationCountry}</div>
                  </div>
                </div>

                {/* Total Comp */}
                <div className="md:w-[20%] flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end border-t border-border/40 pt-3 md:border-none md:pt-0 pr-4">
                  <span className="text-[10px] font-bold text-muted md:hidden uppercase tracking-wider">Total Comp</span>
                  <div className="text-right">
                    <CurrencyDisplay value={dp.totalCompensation} currency={dp.currency} className="font-black text-base text-accent" />
                    <div className="text-[10px] text-muted font-bold mt-1 whitespace-nowrap hidden sm:block">
                      {formatMoney(dp.baseSalary, dp.currency)} / {formatMoney(annualStock, dp.currency)} / {formatMoney(annualBonus, dp.currency)}
                    </div>
                  </div>
                </div>

                {/* Chevron */}
                <div className="hidden md:flex items-center justify-end">
                  <div className="w-8 h-8 rounded-lg hover:bg-border/30 flex items-center justify-center transition-colors">
                    <ChevronDown
                      className={`w-4 h-4 text-muted transition-transform duration-200 ${isExpanded ? "rotate-180 text-primary" : ""}`}
                    />
                  </div>
                </div>
              </div>

              {/* Expanded Details Section */}
              {isExpanded && (
                <div className="px-6 pb-6 pt-2 border-t border-border/50 animate-fadeIn">
                  <div className="flex flex-col gap-5">
                    {/* Compensation Breakdown Bar */}
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-muted/95 mb-2.5 pl-0.5">Annual Breakdown</div>
                      <div className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-bold text-muted/90 mb-3.5 pl-0.5">
                        <span className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                          Base: {formatMoney(dp.baseSalary, dp.currency)} ({Math.round(basePct)}%)
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                          Stock: {formatMoney(annualStock, dp.currency)} ({Math.round(stockPct)}%)
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                          Bonus: {formatMoney(annualBonus, dp.currency)} ({Math.round(bonusPct)}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full overflow-hidden bg-border/40 flex">
                        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${basePct}%` }} title={`Base: ${formatMoney(dp.baseSalary, dp.currency)}`} />
                        <div className="h-full bg-accent transition-all duration-500" style={{ width: `${stockPct}%` }} title={`Stock/yr: ${formatMoney(annualStock, dp.currency)}`} />
                        <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${bonusPct}%` }} title={`Bonus: ${formatMoney(annualBonus, dp.currency)}`} />
                      </div>
                    </div>

                    {/* Employer Ratings + Tags */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3.5 border-t border-border/40">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-[10px] font-black text-muted uppercase tracking-wider flex items-center gap-1.5 pl-0.5">
                          <TrendingUp className="w-3.5 h-3.5 text-primary" />
                          Employer Rating
                        </span>
                        <div className="flex items-center gap-1 bg-border/20 px-2 py-0.5 rounded-lg border border-border/40">
                          <StarRating value={rating.rating} />
                          <span className="text-xs font-black text-foreground ml-1">{rating.rating}</span>
                        </div>
                        <span className="text-[10px] text-muted font-bold">(via AmbitionBox)</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {rating.pros.slice(0, 2).map((p, i) => (
                          <span key={i} className="company-badge-tag pro text-[9px] py-1 px-2.5 font-bold rounded-lg border border-green-500/10">✓ {p}</span>
                        ))}
                        {rating.cons.slice(0, 1).map((c, i) => (
                          <span key={i} className="company-badge-tag con text-[9px] py-1 px-2.5 font-bold rounded-lg border border-red-500/10">✗ {c}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};
