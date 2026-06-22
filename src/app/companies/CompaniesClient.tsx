"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, ChevronRight, Landmark } from "lucide-react";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import { CompanyLogo } from "@/components/CompanyLogo";

export interface CompanyCardInfo {
  id: string;
  name: string;
  logo: string | null;
  industry: string;
  medianCompensation: number;
  recordCount: number;
}

export interface CompaniesClientProps {
  companies: CompanyCardInfo[];
}

export default function CompaniesClient({ companies }: CompaniesClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.industry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (val: number) => {
    if (val === 0) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getCompanyLogoClass = (name: string) => {
    return `logo-${name.toLowerCase().trim()}`;
  };

  return (
    <div className="space-y-8">
      {/* Search Input bar */}
      <div className="relative max-w-md bg-card/60 backdrop-blur-md border border-border/85 rounded-2xl shadow-lg shadow-black/5 flex items-center px-4 py-1 focus-within:border-primary/80 focus-within:ring-4 focus-within:ring-primary/10 transition-all duration-200">
        <Search className="w-5 h-5 text-primary shrink-0 opacity-80" />
        <input
          type="text"
          className="w-full bg-transparent text-foreground outline-none text-sm placeholder-muted py-3 px-3 font-semibold border-none focus:ring-0 focus:outline-none"
          placeholder="Search by company name or industry..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-sm text-muted font-bold bg-card/40 border border-dashed border-border/80 rounded-2xl shadow-sm">
            No companies match your search term.
          </div>
        ) : (
          filtered.map((c) => (
            <Link
              key={c.id}
              href={`/companies/${c.id}`}
              className="bg-card/45 backdrop-blur-md border border-border/80 hover:border-primary/45 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all duration-300 hover:-translate-y-0.5 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative shrink-0 p-0.5 rounded-xl bg-linear-to-tr from-primary/15 to-accent/15 group-hover:from-primary/30 group-hover:to-accent/30 transition-colors">
                    <CompanyLogo name={c.name} size={48} className="rounded-xl bg-card shrink-0" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-foreground group-hover:text-primary transition-colors leading-none mb-1">
                      {c.name}
                    </h3>
                    <span className="text-xs text-muted font-semibold block">{c.industry}</span>
                  </div>
                </div>

                <div className="border-t border-border/60 pt-4 mt-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-muted block text-[10px] uppercase font-bold tracking-wider mb-1">Median Salary</span>
                    <CurrencyDisplay value={c.medianCompensation > 0 ? c.medianCompensation : null} currency="USD" className="font-black text-sm text-accent" />
                  </div>
                  <div className="text-right">
                    <span className="text-muted block text-[10px] uppercase font-bold tracking-wider mb-1">Submissions</span>
                    <span className="font-bold text-foreground font-mono text-xs">{c.recordCount} entries</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end text-xs font-black uppercase tracking-wider text-primary mt-5 group-hover:translate-x-1 transition-transform">
                View Profile
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
