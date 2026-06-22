"use client";

import React from "react";
import { Company, Level, Role, Location } from "@/types";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { CompensationTable } from "@/components/CompensationTable";
import { CompanyLogo } from "@/components/CompanyLogo";
import { TrendingUp, PieChart as LucidePieChart, Award, ThumbsUp, ThumbsDown } from "lucide-react";

export interface CompanyProfileClientProps {
  company: Company & { levels: Level[] };
  roleDistribution: Array<{ name: string; count: number }>;
  levelHierarchy: Array<{ code: string; equiv: string; medianPay: number; count: number }>;
  records: Array<any>;
}

const COLORS = ["#4f46e5", "#06b6d4", "#f59e0b", "#10b981", "#ec4899", "#8b5cf6"];

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
    cons: ["Secrecy Restrictions", "WLB Heavy Variations", "Highly Segmented Org"]
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

export default function CompanyProfileClient({
  company,
  roleDistribution,
  levelHierarchy,
  records,
}: CompanyProfileClientProps) {
  const ratingInfo = getCompanyRatingInfo(company.name);

  // Convert raw records back to page table data structure
  const tableData = records.map((r) => ({
    id: r.id,
    companyName: company.name,
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

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getCompanyLogoClass = (name: string) => {
    return `logo-${name.toLowerCase().trim()}`;
  };

  // Render AmbitionBox reviews stars
  const stars: React.ReactNode[] = [];
  const fullStars = Math.floor(ratingInfo.rating);
  const hasHalfStar = (ratingInfo.rating % 1) >= 0.5;
  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(<span key={i} className="star-filled text-lg">★</span>);
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push(<span key={i} className="star-filled text-lg" style={{ opacity: 0.75 }}>★</span>);
    } else {
      stars.push(<span key={i} className="star-empty text-lg">★</span>);
    }
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Profile Header */}
      <div className="bg-card/60 backdrop-blur-md border border-border rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <CompanyLogo name={company.name} size={64} className="shrink-0" />
          <div>
            <h1 className="text-3xl font-extrabold text-foreground font-display tracking-tight">{company.name}</h1>
            <span className="text-sm text-muted font-semibold block mt-0.5">{company.industry} Profile</span>
          </div>
        </div>

        {/* AmbitionBox Stars rating box */}
        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-2 shrink-0 md:w-80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted uppercase tracking-widest">AmbitionBox Rating</span>
            <div className="flex gap-0.5">{stars}</div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-lg font-black text-foreground font-display">{ratingInfo.rating} / 5</span>
            <span className="text-[10px] text-muted font-bold">sentiments score</span>
          </div>
          <div className="flex flex-col gap-1 border-t border-border pt-2 text-[10px] text-muted font-semibold">
            <div className="flex justify-between">
              <span>Salary & Benefits:</span>
              <span className="text-foreground font-black">{ratingInfo.comp.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span>Work-Life Balance:</span>
              <span className="text-foreground font-black">{ratingInfo.wlb.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span>Culture:</span>
              <span className="text-foreground font-black">{ratingInfo.culture.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of pros/cons (AmbitionBox insight widgets) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pros card */}
        <div className="bg-card/60 backdrop-blur-md border border-border rounded-2xl p-6 shadow-xl">
          <h3 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mb-4 uppercase tracking-wider font-display">
            <ThumbsUp className="w-4 h-4" /> Pros & Positive Sentiments
          </h3>
          <ul className="space-y-2 text-xs font-semibold text-foreground/80">
            {ratingInfo.pros.map((p, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-500 shrink-0">✓</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* Cons card */}
        <div className="bg-card/60 backdrop-blur-md border border-border rounded-2xl p-6 shadow-xl">
          <h3 className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5 mb-4 uppercase tracking-wider font-display">
            <ThumbsDown className="w-4 h-4" /> Cons & Organization Challenges
          </h3>
          <ul className="space-y-2 text-xs font-semibold text-foreground/80">
            {ratingInfo.cons.map((c, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-red-500 shrink-0">✗</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Visualizations row (Recharts) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Level hierarchy compensation ranges */}
        <div className="bg-card/60 backdrop-blur-md border border-border rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4 border-b border-border pb-3">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground font-display">Level Hierarchy Compensation (Median USD equivalent)</h3>
          </div>
          <div className="h-60 w-full">
            {levelHierarchy.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-muted italic">
                No compensation level data available yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={levelHierarchy} margin={{ top: 10, bottom: 5 }}>
                  <XAxis dataKey="code" tick={{ fontSize: 10 }} stroke="var(--color-muted)" />
                  <YAxis
                    tickFormatter={(val) => `$${Math.round(val / 1000)}k`}
                    tick={{ fontSize: 10 }}
                    stroke="var(--color-muted)"
                  />
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(Number(val || 0)), "Median Pay"]}
                    contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
                    labelStyle={{ color: "var(--foreground)", fontWeight: 700 }}
                  />
                  <Bar dataKey="medianPay" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Role Distribution pie chart */}
        <div className="bg-card/60 backdrop-blur-md border border-border rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4 border-b border-border pb-3">
            <LucidePieChart className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-bold text-foreground font-display">Submissions Distribution by Role Type</h3>
          </div>
          <div className="h-60 w-full flex flex-col sm:flex-row items-center justify-between">
            {roleDistribution.length === 0 ? (
              <div className="h-full w-full flex items-center justify-center text-xs text-muted italic">
                No submissions data available yet.
              </div>
            ) : (
              <>
                <div className="h-full w-full sm:w-1/2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={roleDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="count"
                      >
                        {roleDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
                        formatter={(val: any) => [val, "Submissions"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full sm:w-1/2 space-y-1 text-xs font-semibold text-foreground/80 px-4">
                  {roleDistribution.map((entry, index) => (
                    <div key={entry.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="truncate max-w-[120px]">{entry.name}</span>
                      </div>
                      <span className="font-mono text-muted">{entry.count}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Compensation records table list */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-muted uppercase tracking-wider px-2">
          Verified Compensation Records ({tableData.length} records)
        </h3>
        <CompensationTable datapoints={tableData} />
      </div>

    </div>
  );
}
