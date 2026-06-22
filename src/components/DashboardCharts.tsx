"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import { BarChart3, LineChart as LucideLineChart, PieChart as LucidePieChart, Compass } from "lucide-react";

export interface DashboardChartsProps {
  companyData: Array<{ name: string; medianPay: number }>;
  trendData: Array<{ yearsOfExperience: number; totalComp: number }>;
  roleData: Array<{ name: string; count: number }>;
  locationData: Array<{ name: string; adjustedScore: number }>;
}

const COLORS = ["#4f46e5", "#06b6d4", "#f59e0b", "#10b981", "#ec4899", "#8b5cf6", "#6366f1"];

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  companyData,
  trendData,
  roleData,
  locationData,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="w-full space-y-8">
      {/* Top row: Bar and Line charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Top paying companies bar chart */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm transition-all duration-300">
          <div className="flex items-center gap-2 mb-4 border-b border-border pb-3">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Top Paying Companies (Median USD equivalent)</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={companyData} margin={{ left: 10, right: 10, top: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="var(--color-muted)" />
                <YAxis
                  tickFormatter={(val) => `$${Math.round(val / 1000)}k`}
                  tick={{ fontSize: 10 }}
                  stroke="var(--color-muted)"
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val || 0)), "Median Comp"]}
                  contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
                  labelStyle={{ color: "var(--foreground)", fontWeight: 700 }}
                />
                <Bar dataKey="medianPay" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Experience trends line chart */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm transition-all duration-300">
          <div className="flex items-center gap-2 mb-4 border-b border-border pb-3">
            <LucideLineChart className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-bold text-foreground">Compensation vs. Experience Trend</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ left: 10, right: 10, top: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis
                  dataKey="yearsOfExperience"
                  label={{ value: "Years of Experience", position: "insideBottom", offset: -5, fontSize: 10, fill: "var(--color-muted)" }}
                  tick={{ fontSize: 10 }}
                  stroke="var(--color-muted)"
                />
                <YAxis
                  tickFormatter={(val) => `$${Math.round(val / 1000)}k`}
                  tick={{ fontSize: 10 }}
                  stroke="var(--color-muted)"
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val || 0)), "Avg Total Comp"]}
                  contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
                  labelStyle={{ color: "var(--foreground)", fontWeight: 700 }}
                />
                <Line
                  type="monotone"
                  dataKey="totalComp"
                  stroke="var(--color-accent)"
                  strokeWidth={3}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Bottom row: Pie and Area charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Role distribution pie chart */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm transition-all duration-300">
          <div className="flex items-center gap-2 mb-4 border-b border-border pb-3">
            <LucidePieChart className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-foreground">Submissions Distribution by Role Type</h3>
          </div>
          <div className="h-64 w-full flex flex-col sm:flex-row items-center justify-between">
            <div className="h-full w-full sm:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {roleData.map((entry, index) => (
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
            {/* Custom legends */}
            <div className="w-full sm:w-1/2 space-y-1.5 px-4 text-xs font-semibold text-foreground/80">
              {roleData.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="truncate max-w-[120px]">{entry.name}</span>
                  </div>
                  <span className="font-mono text-muted">{entry.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Location area chart */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm transition-all duration-300">
          <div className="flex items-center gap-2 mb-4 border-b border-border pb-3">
            <Compass className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-foreground">Location adjusted buying-power indices</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={locationData} margin={{ left: 10, right: 10, top: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="var(--color-muted)" />
                <YAxis
                  tickFormatter={(val) => `${Math.round(val / 1000)}k`}
                  tick={{ fontSize: 10 }}
                  stroke="var(--color-muted)"
                />
                <Tooltip
                  formatter={(val: any) => [`₹${Math.round(Number(val || 0) / 1000)}k`, "Purchasing Power Index"]}
                  contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
                  labelStyle={{ color: "var(--foreground)", fontWeight: 700 }}
                />
                <Area
                  type="monotone"
                  dataKey="adjustedScore"
                  stroke="var(--color-primary)"
                  fill="rgba(79, 70, 229, 0.2)"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
