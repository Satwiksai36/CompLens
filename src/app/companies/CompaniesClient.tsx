"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, ChevronRight, Landmark } from "lucide-react";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";

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
    <div className="space-y-6">
      {/* Search Input bar */}
      <div className="relative max-w-md bg-card border border-border rounded-xl shadow-sm flex items-center px-3 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
        <Search className="w-5 h-5 text-muted shrink-0" />
        <input
          type="text"
          className="w-full bg-transparent text-foreground outline-none text-sm placeholder-muted/80 py-3.5 px-2"
          placeholder="Search by company name or industry..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-sm text-muted italic border border-dashed border-border rounded-xl">
            No companies match your search term.
          </div>
        ) : (
          filtered.map((c) => (
            <Link
              key={c.id}
              href={`/companies/${c.id}`}
              className="bg-card border border-border hover:border-primary/50 rounded-xl p-5 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`company-logo-badge ${getCompanyLogoClass(c.name)} w-12 h-12 text-lg shadow-sm shrink-0`}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-foreground group-hover:text-primary transition-colors">
                      {c.name}
                    </h3>
                    <span className="text-xs text-muted block">{c.industry}</span>
                  </div>
                </div>

                <div className="border-t border-border pt-3 mt-2 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-muted block text-[10px] uppercase font-bold tracking-wider">Median Salary</span>
                    <CurrencyDisplay value={c.medianCompensation > 0 ? c.medianCompensation : null} currency="USD" />
                  </div>
                  <div className="text-right">
                    <span className="text-muted block text-[10px] uppercase font-bold tracking-wider">Submissions</span>
                    <span className="font-mono text-foreground font-semibold">{c.recordCount} entries</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end text-xs font-bold uppercase tracking-wider text-primary mt-4 group-hover:translate-x-1 transition-transform">
                View Profile
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
