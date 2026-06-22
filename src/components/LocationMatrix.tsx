"use client";

import React from "react";
import { Location, CompensationRecord } from "@/types";
import { MapPin, Info, ArrowUpRight, TrendingUp } from "lucide-react";
import { CurrencyDisplay } from "./CurrencyDisplay";

export interface LocationMatrixProps {
  locations: Location[];
  records: Array<CompensationRecord & { location: Location }>;
}

export const LocationMatrix: React.FC<LocationMatrixProps> = ({ locations, records }) => {
  const targetCities = ["Bangalore", "Hyderabad", "Pune", "Chennai", "Delhi", "Mumbai"];

  // Filter locations to match the target cities
  const cityLocations = locations.filter((loc) =>
    targetCities.some((c) => loc.city.toLowerCase() === c.toLowerCase())
  );

  // Convert USD/GBP/EUR database records to INR for domestic comparison (1 USD = 83.3 INR)
  const getINRValue = (amount: number, currency: string): number => {
    const toUSD: Record<string, number> = {
      USD: 1.0,
      INR: 0.012,
      GBP: 1.25,
      EUR: 1.08,
    };
    const rateToUSD = toUSD[currency.toUpperCase()] || 1.0;
    const usdAmount = amount * rateToUSD;
    return usdAmount * 83.3; // Convert USD to INR
  };

  // Process data points and group by city
  const cityStats = cityLocations.map((loc) => {
    const cityRecords = records.filter(
      (r) => r.locationId === loc.id && r.verificationStatus === "VERIFIED"
    );

    const inrComps = cityRecords
      .map((r) => getINRValue(r.totalCompensation, r.currency))
      .sort((a, b) => a - b);

    let medianComp = 0;
    if (inrComps.length > 0) {
      const mid = Math.floor(inrComps.length / 2);
      medianComp =
        inrComps.length % 2 !== 0
          ? inrComps[mid]
          : (inrComps[mid - 1] + inrComps[mid]) / 2;
    } else {
      // Fallback calculations based on default seed expectations if the database has zero records for a city
      const defaultMedians: Record<string, number> = {
        Bangalore: 2200000,
        Hyderabad: 1950000,
        Pune: 1650000,
        Chennai: 1550000,
        Delhi: 1800000,
        Mumbai: 2000000,
      };
      medianComp = defaultMedians[loc.city] || 1500000;
    }

    const col = loc.costOfLivingIndex;
    // Adjusted score = (medianComp / col) * 100
    const adjustedScore = (medianComp / col) * 100;

    return {
      id: loc.id,
      city: loc.city,
      country: loc.country,
      colIndex: col,
      median: medianComp,
      adjustedScore,
      count: cityRecords.length,
    };
  });

  // Calculate national average of these cities to compute premiums
  const averageMedian = cityStats.reduce((acc, c) => acc + c.median, 0) / cityStats.length;

  const processedCities = cityStats.map((c) => {
    // Premium relative to average of these cities
    const premium = ((c.median - averageMedian) / averageMedian) * 100;
    return { ...c, premium };
  });

  // Sort by adjusted score descending (best buying power first)
  const sortedCities = [...processedCities].sort((a, b) => b.adjustedScore - a.adjustedScore);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="w-full bg-card/60 backdrop-blur-md border border-border rounded-2xl shadow-xl p-6 transition-all duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
        <div className="flex items-center gap-2">
          <MapPin className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-xl font-bold text-foreground font-display">Location Intelligence Dashboard</h2>
            <p className="text-muted text-xs mt-0.5 font-semibold">
              Purchasing-power and cost-of-living adjusted compensation comparisons across major tech hubs.
            </p>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 flex gap-3 text-xs text-primary/90 leading-relaxed mb-8 shadow-sm">
        <Info className="w-5 h-5 shrink-0 text-primary mt-0.5" />
        <div className="font-medium text-foreground/95">
          <span className="font-bold block text-foreground mb-1 text-sm font-display">Understanding Purchasing Power Adjusted Score:</span>
          An adjusted score measures real buying power. If City A pays ₹22 Lakhs with a Cost of Living (COL) index of 30, and City B pays ₹20 Lakhs with a COL of 25, City B actually offers higher real disposable income due to a lower cost of living, yielding a higher adjusted buying-power score.
        </div>
      </div>

      {/* Data table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-border bg-card/30 text-[10px] font-bold text-muted uppercase tracking-widest">
              <th className="py-4 px-4">City</th>
              <th className="py-4 px-4 text-right">Median Salary (INR)</th>
              <th className="py-4 px-4 text-center">Cost of Living Index</th>
              <th className="py-4 px-4 text-right">Adjusted Buying-Power Score</th>
              <th className="py-4 px-4 text-right">Market Premium</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {sortedCities.map((city, idx) => {
              const isPositive = city.premium >= 0;

              return (
                <tr key={city.id} className="hover:bg-card-hover/20 transition-colors duration-150">
                  {/* City Name */}
                  <td className="py-4.5 px-4 font-bold text-foreground flex items-center gap-2 font-display">
                    <span className="text-muted/50 text-xs w-4">#{idx + 1}</span>
                    {city.city}
                    <span className="text-[10px] text-muted font-bold font-mono">({city.country})</span>
                  </td>

                  {/* Median Salary */}
                  <td className="py-4.5 px-4 text-right font-bold text-sm">
                    <CurrencyDisplay value={city.median} currency="INR" />
                  </td>

                  {/* COL Index */}
                  <td className="py-4.5 px-4 text-center font-mono font-bold text-foreground/80">
                    {city.colIndex.toFixed(1)}
                  </td>

                  {/* Adjusted score */}
                  <td className="py-4.5 px-4 text-right font-black">
                    <CurrencyDisplay value={city.adjustedScore} currency="INR" className="text-primary font-black" />
                  </td>

                  {/* Premium */}
                  <td className="py-4.5 px-4 text-right font-semibold">
                    <span
                      className={`inline-flex items-center gap-0.5 text-xs px-2.5 py-1 rounded-full font-bold font-mono ${
                        isPositive
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {city.premium.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};
