"use client";

import React from "react";
import { Company, Level } from "@/types";

export interface LevelMatrixProps {
  companies: Array<Company & { levels: Level[] }>;
}

const STAGE_DETAILS: Record<string, { stage: string; experience: string; description: string }> = {
  Entry: {
    stage: "Associate / Junior IC",
    experience: "0 - 2 Years",
    description: "New university graduates or engineers launching their industry career.",
  },
  Mid: {
    stage: "Independent Contributor (IC)",
    experience: "2 - 5 Years",
    description: "Autonomously executes tasks, scopes minor features, and builds systems.",
  },
  Senior: {
    stage: "Senior IC / Tech Lead",
    experience: "5 - 9 Years",
    description: "Designs system architectures, guides team delivery, and mentors peers.",
  },
  Staff: {
    stage: "Staff IC / Manager",
    experience: "9 - 13 Years",
    description: "Directs technical strategy for multiple teams or leads product segments.",
  },
  Principal: {
    stage: "Principal IC / Director",
    experience: "13 - 15 Years",
    description: "Shapes organizational initiatives, guides executive planning, and drives tech standards.",
  },
  "Director+": {
    stage: "Distinguished / VP",
    experience: "15+ Years",
    description: "Responsible for major org strategies, research standards, or engineering divisions.",
  },
};

export const LevelMatrix: React.FC<LevelMatrixProps> = ({ companies }) => {
  const equivalentLevels = ["Entry", "Mid", "Senior", "Staff", "Principal", "Director+"];

  // Sort companies to have a predictable column order
  const targetOrder = [
    "Google",
    "Meta",
    "Amazon",
    "Microsoft",
    "Apple",
    "Netflix",
    "Uber",
    "Airbnb",
    "Adobe",
    "Salesforce",
  ];
  const sortedCompanies = [...companies].sort((a, b) => {
    const idxA = targetOrder.indexOf(a.name);
    const idxB = targetOrder.indexOf(b.name);
    if (idxA === -1 && idxB === -1) return a.name.localeCompare(b.name);
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  });

  return (
    <div className="w-full bg-card/60 backdrop-blur-md border border-border rounded-2xl shadow-xl p-6 overflow-hidden transition-all duration-300">
      <div className="mb-6 border-b border-border pb-4">
        <h2 className="text-xl font-bold text-foreground font-display">Global Level Equivalency Matrix</h2>
        <p className="text-muted text-xs mt-1 font-semibold">
          Directly map internal level codes across the top technology companies against global standardized career grades.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="border-b border-border bg-card/30 text-[10px] font-bold text-muted uppercase tracking-widest">
              <th className="py-4 px-4 w-52">Standardized Grade</th>
              <th className="py-4 px-4 w-64">Career Stage & YOE</th>
              {sortedCompanies.map((comp) => (
                <th key={comp.id} className="py-4 px-3 text-center">
                  {comp.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {equivalentLevels.map((equiv) => {
              const stageInfo = STAGE_DETAILS[equiv] || { stage: "N/A", experience: "N/A", description: "" };

              return (
                <tr key={equiv} className="hover:bg-card-hover/20 transition-colors duration-150">
                  {/* Standardized Level label */}
                  <td className="py-5 px-4 align-top">
                    <span className="inline-block text-xs bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full font-black tracking-wide font-display">
                      {equiv}
                    </span>
                  </td>

                  {/* Career Stage details */}
                  <td className="py-5 px-4">
                    <div className="text-sm font-bold text-foreground font-display">{stageInfo.stage}</div>
                    <div className="text-xs text-muted font-bold mt-0.5">{stageInfo.experience}</div>
                    <div className="text-[10px] text-muted leading-relaxed mt-1 max-w-[240px] font-medium">
                      {stageInfo.description}
                    </div>
                  </td>

                  {/* Company Level cells */}
                  {sortedCompanies.map((comp) => {
                    const matchedLevels = comp.levels.filter((lvl) => lvl.equivalentLevel === equiv);

                    return (
                      <td key={comp.id} className="py-5 px-3 text-center">
                        {matchedLevels.length === 0 ? (
                          <span className="text-xs text-muted/30 italic font-mono">-</span>
                        ) : (
                          <div className="flex flex-col items-center gap-1.5">
                            {matchedLevels.map((lvl) => {
                              const isDisclosed = lvl.mappingType === "disclosed";
                              return (
                                <div
                                  key={lvl.id}
                                  className={`w-20 py-2 px-2.5 rounded-xl border text-xs font-extrabold shadow-sm transition-all duration-200 hover:scale-105 ${
                                    isDisclosed
                                      ? "bg-card border-border hover:border-primary/40 text-foreground"
                                      : "bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10 hover:border-amber-500/40 text-amber-600 dark:text-amber-400"
                                  }`}
                                  title={
                                    isDisclosed
                                      ? `${comp.name} ${lvl.levelCode} is a disclosed level.`
                                      : `${comp.name} ${lvl.levelCode} is inferred with ${Math.round(
                                          lvl.confidenceScore * 100
                                        )}% confidence.`
                                  }
                                >
                                  <div className="font-display font-bold tracking-tight">{lvl.levelCode}</div>
                                  {!isDisclosed && (
                                    <div className="text-[8px] font-bold text-amber-500 font-mono mt-0.5">
                                      Est ({Math.round(lvl.confidenceScore * 100)}%)
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
