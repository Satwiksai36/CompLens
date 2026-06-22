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
    <div className="data-table">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] bg-[#f9fafb] dark:bg-[#111113] border-b border-[var(--border)]">
                Company / Role
              </th>
              <th className="py-3 px-3 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] bg-[#f9fafb] dark:bg-[#111113] border-b border-[var(--border)] hidden md:table-cell">
                Level
              </th>
              <th className="py-3 px-3 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] bg-[#f9fafb] dark:bg-[#111113] border-b border-[var(--border)] hidden lg:table-cell">
                Location
              </th>
              <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] bg-[#f9fafb] dark:bg-[#111113] border-b border-[var(--border)] text-right">
                Total Comp
              </th>
              <th className="py-3 px-3 w-10 bg-[#f9fafb] dark:bg-[#111113] border-b border-[var(--border)]" />
            </tr>
          </thead>
          <tbody>
            {datapoints.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-[var(--primary-faded)] flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-[var(--primary)]" />
                    </div>
                    <p className="text-sm font-semibold text-[var(--muted)]">No salary records match your search</p>
                    <p className="text-xs text-[var(--muted)]">Try adjusting your filters or clearing the search</p>
                  </div>
                </td>
              </tr>
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
                  <React.Fragment key={dp.id}>
                    {/* Main Row */}
                    <tr
                      onClick={() => toggleRow(dp.id)}
                      className="cursor-pointer transition-colors duration-100 border-b border-[var(--border-light)] last:border-0 hover:bg-[#f6f8fc] dark:hover:bg-[var(--card-hover)]"
                    >
                      {/* Company / Role */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <CompanyLogo name={dp.companyName} size={36} className="shrink-0" />
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-sm text-[var(--foreground)]">{dp.companyName}</span>
                              {dp.mappingType === "disclosed" ? (
                                <span className="level-badge disclosed">Disclosed</span>
                              ) : (
                                <span className="level-badge estimated" title={`${Math.round(dp.confidenceScore * 100)}% confidence`}>
                                  ~{Math.round(dp.confidenceScore * 100)}%
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-[var(--muted)] mt-0.5 font-medium">
                              {dp.roleName}
                              <span className="mx-1 opacity-40">·</span>
                              <span>{dp.yearsExperience} yrs exp</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Level */}
                      <td className="py-3.5 px-3 hidden md:table-cell">
                        <div className="font-bold text-sm text-[var(--foreground)]">{dp.levelCode}</div>
                        <div className="text-xs text-[var(--primary)] font-semibold">{dp.equivalentLevel}</div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-3 hidden lg:table-cell">
                        <div className="text-sm font-semibold text-[var(--foreground-secondary)]">{dp.locationCity}</div>
                        <div className="text-xs text-[var(--muted)]">{dp.locationCountry}</div>
                      </td>

                      {/* Total Comp */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-black text-sm text-[var(--accent)]">
                          <CurrencyDisplay value={dp.totalCompensation} currency={dp.currency} className="font-black text-[var(--accent)]" />
                        </div>
                        <div className="text-[10px] text-[var(--muted)] mt-0.5 font-medium whitespace-nowrap hidden sm:block">
                          {formatMoney(dp.baseSalary, dp.currency)} +{" "}
                          {formatMoney(annualStock, dp.currency)} +{" "}
                          {formatMoney(annualBonus, dp.currency)}
                        </div>
                      </td>

                      {/* Expand chevron */}
                      <td className="py-3.5 px-3 text-center">
                        <ChevronDown
                          className={`w-4 h-4 text-[var(--muted)] transition-transform duration-200 ${isExpanded ? "rotate-180 text-[var(--primary)]" : ""}`}
                        />
                      </td>
                    </tr>

                    {/* Expanded Details Row */}
                    {isExpanded && (
                      <tr className="bg-[#f9fafb] dark:bg-[#111113] border-b border-[var(--border-light)]">
                        <td colSpan={5} className="px-4 py-4">
                          <div className="max-w-3xl flex flex-col gap-4">

                            {/* Compensation Breakdown Bar */}
                            <div>
                              <div className="flex flex-wrap gap-x-5 gap-y-1 text-[10px] font-bold text-[var(--muted)] mb-2">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--primary)] inline-block" />
                                  Base {Math.round(basePct)}% — {formatMoney(dp.baseSalary, dp.currency)}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] inline-block" />
                                  Stock/yr {Math.round(stockPct)}% — {formatMoney(annualStock, dp.currency)}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                                  Bonus {Math.round(bonusPct)}% — {formatMoney(annualBonus, dp.currency)}
                                </span>
                              </div>
                              <div className="comp-bar">
                                <div className="h-full bg-[var(--primary)] transition-all duration-300" style={{ width: `${basePct}%` }} title={`Base: ${formatMoney(dp.baseSalary, dp.currency)}`} />
                                <div className="h-full bg-[var(--accent)] transition-all duration-300" style={{ width: `${stockPct}%` }} title={`Stock/yr: ${formatMoney(annualStock, dp.currency)}`} />
                                <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${bonusPct}%` }} title={`Bonus: ${formatMoney(annualBonus, dp.currency)}`} />
                              </div>
                            </div>

                            {/* Employer Ratings + Tags */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border-light)]">
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wide flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3 text-[var(--primary)]" />
                                  Employer Rating
                                </span>
                                <StarRating value={rating.rating} />
                                <span className="text-xs font-black text-[var(--foreground)]">{rating.rating}/5</span>
                                <span className="text-[10px] text-[var(--muted)]">(AmbitionBox)</span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {rating.pros.slice(0, 2).map((p, i) => (
                                  <span key={i} className="company-badge-tag pro">✓ {p}</span>
                                ))}
                                {rating.cons.slice(0, 1).map((c, i) => (
                                  <span key={i} className="company-badge-tag con">✗ {c}</span>
                                ))}
                              </div>
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
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
