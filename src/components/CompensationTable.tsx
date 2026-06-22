"use client";

import React, { useState } from "react";
import { ChevronDown, Check, TrendingUp } from "lucide-react";
import { DatapointDetail } from "../types";
import { CurrencyDisplay } from "./CurrencyDisplay";
import { CompanyLogo } from "./CompanyLogo";

export interface CompensationTableProps {
  datapoints: Array<DatapointDetail & { companyName: string; roleName: string }>;
}

// Static employer ratings (AmbitionBox reviews & sentiments data)
const COMPANY_REVIEWS: Record<string, {
  rating: number;
  wlb: number;
  comp: number;
  culture: number;
  pros: string[];
  cons: string[];
}> = {
  google: {
    rating: 4.6,
    wlb: 4.2,
    comp: 4.7,
    culture: 4.5,
    pros: ["Excellent WLB", "Free Gourmet Meals", "High Quality Peer Group"],
    cons: ["Bureaucratic Process", "Slower Promotions", "Vast Organization Size"]
  },
  meta: {
    rating: 4.5,
    wlb: 3.8,
    comp: 4.9,
    culture: 4.3,
    pros: ["Top Industry Comp", "Fast-Paced Innovation", "High Ownership"],
    cons: ["High Intensity Stress", "Public Scrutiny", "Demanding Deadlines"]
  },
  amazon: {
    rating: 4.1,
    wlb: 3.5,
    comp: 4.5,
    culture: 3.9,
    pros: ["High Autonomy", "Great Scale & Impact", "Solid Engineering Practices"],
    cons: ["Frugal Culture", "Vesting Backloaded (5/15/40/40)", "PIP Culture Pressure"]
  },
  microsoft: {
    rating: 4.2,
    wlb: 3.9,
    comp: 4.3,
    culture: 4.1,
    pros: ["Good WLB", "Very Stable Job", "Excellent Benefits"],
    cons: ["Slower Promotions", "Legacy Stack In Areas", "Bureaucratic"]
  },
  apple: {
    rating: 4.3,
    wlb: 3.7,
    comp: 4.6,
    culture: 4.2,
    pros: ["Stunning Design Culture", "Excellent Benefits", "High Quality Hardware"],
    cons: ["Secrecy Restrictions", "WLB Varies Heavily", "Highly Segmented Org"]
  },
  netflix: {
    rating: 4.4,
    wlb: 3.6,
    comp: 4.9,
    culture: 4.4,
    pros: ["Highest Cash Base", "Stunning Talent Density", "Fewer Bureaucracy Layers"],
    cons: ["High Firing Rate", "High Stress Culture", "Low Toleration of Mistakes"]
  },
  uber: {
    rating: 4.2,
    wlb: 3.6,
    comp: 4.5,
    culture: 4.0,
    pros: ["Fast Paced Growth", "Very High Autonomy", "Strong Tech Standards"],
    cons: ["High Intensity Stress", "Work Hard Culture", "Fast Changing Goals"]
  },
  airbnb: {
    rating: 4.5,
    wlb: 4.3,
    comp: 4.6,
    culture: 4.5,
    pros: ["Exceptional Design & Culture", "Flexible Work Options", "Generous Travel Credits"],
    cons: ["Slower Promotion Path", "Niche Scaling", "Relies heavily on travel demand"]
  },
  adobe: {
    rating: 4.3,
    wlb: 4.2,
    comp: 4.4,
    culture: 4.3,
    pros: ["Excellent WLB", "Generous Time Off", "Stable SaaS Business"],
    cons: ["Slower Tech Iteration", "Heavy Bureaucracy", "Older Tech Stack Areas"]
  },
  salesforce: {
    rating: 4.2,
    wlb: 4.0,
    comp: 4.3,
    culture: 4.2,
    pros: ["Philanthropic Culture", "Good WLB & Support", "Great Benefits Packages"],
    cons: ["Huge Scale Redundancy", "Slower Career Growth", "Aggressive Sales Targets"]
  }
};

const getCompanyRatingInfo = (companyName: string) => {
  const key = companyName.toLowerCase().trim();
  if (COMPANY_REVIEWS[key]) return COMPANY_REVIEWS[key];
  return {
    rating: 4.0,
    wlb: 3.9,
    comp: 4.0,
    culture: 4.0,
    pros: ["Good Work Culture", "Decent Benefits"],
    cons: ["Moderate Bureaucracy"]
  };
};

const getCompanyLogoClass = (name: string) => {
  const clean = name.toLowerCase().trim();
  if (["google", "meta", "amazon", "microsoft", "apple", "netflix", "uber", "airbnb", "adobe", "salesforce"].includes(clean)) {
    return `logo-${clean}`;
  }
  return "logo-default";
};

export const CompensationTable: React.FC<CompensationTableProps> = ({ datapoints }) => {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const formatMoney = (val: number, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="w-full bg-card/60 backdrop-blur-md border border-border rounded-2xl overflow-hidden shadow-xl transition-all duration-300">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-card/30">
              <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-muted">Company / Role</th>
              <th className="py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-muted">Level (Equivalent)</th>
              <th className="py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-muted">Location</th>
              <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-muted text-right">Total Compensation</th>
              <th className="py-4 px-6 w-12 text-center text-muted"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {datapoints.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-muted font-medium italic">
                  No verified compensation records match your search criteria.
                </td>
              </tr>
            ) : (
              datapoints.map((dp) => {
                const isExpanded = !!expandedRows[dp.id];

                // Annualized equity = stockGrant / 4 (assumed standard 4 year vesting schedule)
                const annualStock = dp.stockGrant / 4;
                const annualBonus = dp.bonus;
                const totalCalculated = dp.baseSalary + annualStock + annualBonus;

                const basePct = totalCalculated > 0 ? (dp.baseSalary / totalCalculated) * 100 : 0;
                const stockPct = totalCalculated > 0 ? (annualStock / totalCalculated) * 100 : 0;
                const bonusPct = totalCalculated > 0 ? (annualBonus / totalCalculated) * 100 : 0;

                return (
                  <React.Fragment key={dp.id}>
                    {/* Primary Row */}
                    <tr
                      onClick={() => toggleRow(dp.id)}
                      className="hover:bg-card-hover/40 transition-colors duration-150 cursor-pointer"
                    >
                      <td className="py-4.5 px-6">
                        <div className="flex items-center gap-3">
                          <CompanyLogo name={dp.companyName} size={40} />
                          <div>
                            <div className="font-bold text-foreground flex items-center gap-2 text-sm md:text-base font-display">
                              {dp.companyName}
                              {dp.mappingType === "disclosed" ? (
                                <span className="text-[9px] bg-indigo-500/10 text-primary dark:text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20 font-extrabold uppercase tracking-wider">
                                  Ladder
                                </span>
                              ) : (
                                <span
                                  className="text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20 font-extrabold uppercase tracking-wider"
                                  title={`Heuristic Inference (${Math.round(dp.confidenceScore * 100)}% confidence)`}
                                >
                                  Est ({Math.round(dp.confidenceScore * 100)}%)
                                </span>
                              )}
                            </div>
                            <div className="text-xs font-semibold text-muted mt-0.5">
                              {dp.roleName} • <span className="text-slate-500 dark:text-zinc-400">{dp.yearsExperience} yrs exp</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4.5 px-4">
                        <div className="text-foreground font-bold text-sm font-display">{dp.levelCode}</div>
                        <div className="text-xs text-primary font-bold">{dp.equivalentLevel}</div>
                      </td>

                      <td className="py-4.5 px-4 text-foreground/80">
                        <div className="text-sm font-semibold">{dp.locationCity}</div>
                        <div className="text-xs text-muted font-medium mt-0.5">{dp.locationCountry}</div>
                      </td>

                      <td className="py-4.5 px-6 text-right">
                        <div className="text-emerald-600 dark:text-emerald-400 text-sm md:text-base font-black font-display">
                          <CurrencyDisplay value={dp.totalCompensation} currency={dp.currency} className="text-emerald-600 dark:text-emerald-400 font-black" />
                        </div>
                        <div className="text-[10px] text-muted font-semibold mt-0.5">
                          {formatMoney(dp.baseSalary, dp.currency)} base | {formatMoney(annualStock, dp.currency)} stock | {formatMoney(annualBonus, dp.currency)} bonus
                        </div>
                      </td>

                      <td className="py-4.5 px-6 text-center">
                        <button
                          type="button"
                          className="text-muted hover:text-foreground transition-colors p-1"
                        >
                          <ChevronDown
                            className={`w-4 h-4 transform transition-transform duration-200 ${
                              isExpanded ? "rotate-180 text-primary" : ""
                            }`}
                          />
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Accordion details */}
                    {isExpanded && (() => {
                      const ratingInfo = getCompanyRatingInfo(dp.companyName);
                      const stars: React.ReactNode[] = [];
                      const fullStars = Math.floor(ratingInfo.rating);
                      const hasHalfStar = (ratingInfo.rating % 1) >= 0.5;

                      for (let i = 1; i <= 5; i++) {
                        if (i <= fullStars) {
                          stars.push(<span key={i} className="star-filled">★</span>);
                        } else if (i === fullStars + 1 && hasHalfStar) {
                          stars.push(<span key={i} className="star-filled" style={{ opacity: 0.75 }}>★</span>);
                        } else {
                          stars.push(<span key={i} className="star-empty">★</span>);
                        }
                      }

                      return (
                        <tr className="bg-muted/10">
                          <td colSpan={5} className="border-t border-border px-6 py-5">
                            <div className="flex flex-col gap-5 max-w-4xl">
                              
                              {/* Horizontal Breakdown and values */}
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                {/* Segmented progress bar */}
                                <div className="flex-1">
                                  <div className="flex justify-between text-xs text-muted font-semibold mb-2">
                                    <span>Annualized Compensation Composition</span>
                                    <div className="flex gap-4">
                                      <span className="flex items-center gap-1">
                                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                                        Base ({Math.round(basePct)}%)
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                                        Stock ({Math.round(stockPct)}%)
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                        Bonus ({Math.round(bonusPct)}%)
                                      </span>
                                    </div>
                                  </div>

                                  {/* Bar container */}
                                  <div className="w-full h-3 bg-muted border border-border rounded-full overflow-hidden flex">
                                    <div
                                      className="h-full bg-blue-500 transition-all duration-300"
                                      style={{ width: `${basePct}%` }}
                                      title={`Base Salary: ${formatMoney(dp.baseSalary, dp.currency)}`}
                                    />
                                    <div
                                      className="h-full bg-purple-500 transition-all duration-300"
                                      style={{ width: `${stockPct}%` }}
                                      title={`Stock/yr: ${formatMoney(annualStock, dp.currency)}`}
                                    />
                                    <div
                                      className="h-full bg-amber-500 transition-all duration-300"
                                      style={{ width: `${bonusPct}%` }}
                                      title={`Bonus/yr: ${formatMoney(annualBonus, dp.currency)}`}
                                    />
                                  </div>
                                </div>

                                {/* Raw components grid */}
                                <div className="grid grid-cols-3 gap-3 md:w-80 shrink-0 text-center">
                                  <div className="bg-card p-2 border border-border rounded-lg shadow-sm">
                                    <div className="text-[10px] font-bold text-muted uppercase tracking-wide">Base</div>
                                    <div className="font-mono font-bold text-foreground mt-1 text-xs">
                                      <CurrencyDisplay value={dp.baseSalary} currency={dp.currency} />
                                    </div>
                                  </div>
                                  <div className="bg-card p-2 border border-border rounded-lg shadow-sm">
                                    <div className="text-[10px] font-bold text-muted uppercase tracking-wide">Stock / yr</div>
                                    <div className="font-mono font-bold text-foreground mt-1 text-xs">
                                      <CurrencyDisplay value={annualStock} currency={dp.currency} />
                                    </div>
                                  </div>
                                  <div className="bg-card p-2 border border-border rounded-lg shadow-sm">
                                    <div className="text-[10px] font-bold text-muted uppercase tracking-wide">Bonus / yr</div>
                                    <div className="font-mono font-bold text-foreground mt-1 text-xs">
                                      <CurrencyDisplay value={annualBonus} currency={dp.currency} />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* AmbitionBox review section */}
                              <div className="border-t border-border pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex flex-wrap items-center gap-3">
                                  <span className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1">
                                    <TrendingUp className="w-3.5 h-3.5 text-primary" />
                                    Employer Rating:
                                  </span>
                                  <div className="flex gap-0.5">{stars}</div>
                                  <span className="text-xs font-black text-foreground">{ratingInfo.rating} / 5</span>
                                  <span className="text-[10px] text-muted">(AmbitionBox aggregates)</span>
                                </div>

                                <div className="flex flex-wrap gap-1.5">
                                  {ratingInfo.pros.slice(0, 2).map((p, idx) => (
                                    <span key={`pro-${idx}`} className="company-badge-tag pro">✓ {p}</span>
                                  ))}
                                  {ratingInfo.cons.slice(0, 1).map((c, idx) => (
                                    <span key={`con-${idx}`} className="company-badge-tag con">✗ {c}</span>
                                  ))}
                                </div>
                              </div>

                            </div>
                          </td>
                        </tr>
                      );
                    })()}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
