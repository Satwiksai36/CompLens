"use client";

import React, { useState, useTransition } from "react";
import { Company, Role, Location, Level, CompensationRecord } from "@prisma/client";
import {
  moderateSubmission,
  deleteRecord,
  createCompany,
  deleteCompany,
  createRole,
  deleteRole,
  createLevel,
  deleteLevel,
  createLocation,
  deleteLocation,
} from "@/actions/compensation.actions";
import { Check, X, Trash2, Plus, Building, Briefcase, MapPin, Award, ShieldAlert, CheckCircle2, AlertCircle } from "lucide-react";

export interface AdminClientProps {
  pendingRecords: Array<CompensationRecord & { company: Company; role: Role; level: Level; location: Location }>;
  companies: Company[];
  roles: Role[];
  locations: Location[];
  levels: Array<Level & { company: Company }>;
}

export default function AdminClient({
  pendingRecords,
  companies,
  roles,
  locations,
  levels,
}: AdminClientProps) {
  const [activeSubTab, setActiveSubTab] = useState<"queue" | "companies" | "roles" | "levels" | "locations">("queue");
  const [isPending, startTransition] = useTransition();
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Forms States
  // Company Form
  const [compName, setCompName] = useState("");
  const [compIndustry, setCompIndustry] = useState("");
  const [compLogo, setCompLogo] = useState("");

  // Role Form
  const [roleName, setRoleName] = useState("");
  const [roleCategory, setRoleCategory] = useState("Software Engineering");

  // Level Form
  const [lvlCompId, setLvlCompId] = useState(companies[0]?.id || "");
  const [lvlCode, setLvlCode] = useState("");
  const [lvlEquiv, setLvlEquiv] = useState("Entry");
  const [lvlDesc, setLvlDesc] = useState("");

  // Location Form
  const [locCity, setLocCity] = useState("");
  const [locCountry, setLocCountry] = useState("");
  const [locRegion, setLocRegion] = useState("APAC");
  const [locCol, setLocCol] = useState("100");

  const triggerStatus = (res: { success: boolean; error?: string }, successMsg: string) => {
    if (res.success) {
      setStatusMsg({ type: "success", text: successMsg });
      setTimeout(() => setStatusMsg(null), 3000);
    } else {
      setStatusMsg({ type: "error", text: res.error || "Operation failed." });
    }
  };

  // Submission Moderation
  const handleModerate = (id: string, status: "VERIFIED" | "REJECTED") => {
    startTransition(async () => {
      const res = await moderateSubmission(id, status);
      triggerStatus(res, `Submission has been successfully ${status.toLowerCase()}.`);
    });
  };

  const handleForceDelete = (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this compensation record?")) return;
    startTransition(async () => {
      const res = await deleteRecord(id);
      triggerStatus(res, "Compensation record deleted.");
    });
  };

  // Company Creation
  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName || !compIndustry) return;
    startTransition(async () => {
      const res = await createCompany({
        name: compName,
        industry: compIndustry,
        logo: compLogo,
      });
      triggerStatus(res, "Company created successfully.");
      if (res.success) {
        setCompName("");
        setCompIndustry("");
        setCompLogo("");
      }
    });
  };

  const handleDeleteCompany = (id: string) => {
    if (!confirm("Deleting this company will delete all associated levels. Proceed?")) return;
    startTransition(async () => {
      const res = await deleteCompany(id);
      triggerStatus(res, "Company deleted.");
    });
  };

  // Role Creation
  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName) return;
    startTransition(async () => {
      const res = await createRole({
        roleName,
        category: roleCategory,
      });
      triggerStatus(res, "Role category created.");
      if (res.success) setRoleName("");
    });
  };

  const handleDeleteRole = (id: string) => {
    if (!confirm("Delete this role category?")) return;
    startTransition(async () => {
      const res = await deleteRole(id);
      triggerStatus(res, "Role deleted.");
    });
  };

  // Level Creation
  const handleCreateLevel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lvlCode || !lvlCompId) return;
    startTransition(async () => {
      const res = await createLevel({
        companyId: lvlCompId,
        levelCode: lvlCode,
        equivalentLevel: lvlEquiv,
        description: lvlDesc,
      });
      triggerStatus(res, "Level mapping created.");
      if (res.success) {
        setLvlCode("");
        setLvlDesc("");
      }
    });
  };

  const handleDeleteLevel = (id: string) => {
    if (!confirm("Delete this level mapping?")) return;
    startTransition(async () => {
      const res = await deleteLevel(id);
      triggerStatus(res, "Level mapping deleted.");
    });
  };

  // Location Creation
  const handleCreateLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locCity || !locCountry) return;
    const colVal = parseFloat(locCol || "100");
    startTransition(async () => {
      const res = await createLocation({
        city: locCity,
        country: locCountry,
        region: locRegion,
        costOfLivingIndex: colVal,
      });
      triggerStatus(res, "Location hub indexed.");
      if (res.success) {
        setLocCity("");
        setLocCountry("");
        setLocCol("100");
      }
    });
  };

  const handleDeleteLocation = (id: string) => {
    if (!confirm("Delete this location hub?")) return;
    startTransition(async () => {
      const res = await deleteLocation(id);
      triggerStatus(res, "Location deleted.");
    });
  };

  const formatMoney = (val: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Admin Title */}
      <div className="border-b border-border pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            Admin Command Workspace
          </h1>
          <p className="text-muted text-sm mt-1">
            Moderate pending salary submissions and maintain database mappings of companies, roles, and locations.
          </p>
        </div>
        {isPending && <span className="text-xs text-primary font-bold animate-pulse">Syncing updates...</span>}
      </div>

      {/* Global Status Banner */}
      {statusMsg && (
        <div
          className={`p-3 rounded-lg border flex items-center gap-2.5 text-xs font-semibold ${
            statusMsg.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Tab controls */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveSubTab("queue")}
          className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
            activeSubTab === "queue"
              ? "bg-primary text-white"
              : "text-muted hover:text-foreground hover:bg-muted/10"
          }`}
        >
          Moderation Queue ({pendingRecords.length})
        </button>
        <button
          onClick={() => setActiveSubTab("companies")}
          className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
            activeSubTab === "companies"
              ? "bg-primary text-white"
              : "text-muted hover:text-foreground hover:bg-muted/10"
          }`}
        >
          Companies CRUD
        </button>
        <button
          onClick={() => setActiveSubTab("roles")}
          className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
            activeSubTab === "roles"
              ? "bg-primary text-white"
              : "text-muted hover:text-foreground hover:bg-muted/10"
          }`}
        >
          Roles CRUD
        </button>
        <button
          onClick={() => setActiveSubTab("levels")}
          className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
            activeSubTab === "levels"
              ? "bg-primary text-white"
              : "text-muted hover:text-foreground hover:bg-muted/10"
          }`}
        >
          Levels CRUD
        </button>
        <button
          onClick={() => setActiveSubTab("locations")}
          className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
            activeSubTab === "locations"
              ? "bg-primary text-white"
              : "text-muted hover:text-foreground hover:bg-muted/10"
          }`}
        >
          Locations CRUD
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {/* Panel A: Moderation Queue */}
        {activeSubTab === "queue" && (
          <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="text-base font-black text-foreground flex items-center gap-1.5 mb-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" /> Pending Verification Queue
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 font-bold uppercase tracking-wider text-muted">
                    <th className="py-3.5 px-3">Company / Role</th>
                    <th className="py-3.5 px-3">Level Code</th>
                    <th className="py-3.5 px-3">Location</th>
                    <th className="py-3.5 px-3 text-right">Base Salary</th>
                    <th className="py-3.5 px-3 text-right">Total Comp</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pendingRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted italic font-medium">
                        Verification queue is empty. No pending submissions.
                      </td>
                    </tr>
                  ) : (
                    pendingRecords.map((rec) => (
                      <tr key={rec.id} className="hover:bg-muted/5 font-semibold text-foreground/80">
                        <td className="py-3 px-3">
                          <div className="font-bold text-foreground">{rec.company.name}</div>
                          <div className="text-[10px] text-muted font-normal mt-0.5">{rec.role.roleName}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-foreground">{rec.level.levelCode}</div>
                          <div className="text-[10px] text-primary">{rec.level.equivalentLevel}</div>
                        </td>
                        <td className="py-3 px-3">{rec.location.city}</td>
                        <td className="py-3 px-3 text-right font-mono">
                          {formatMoney(rec.baseSalary, rec.currency)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {formatMoney(rec.totalCompensation, rec.currency)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleModerate(rec.id, "VERIFIED")}
                              className="p-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white cursor-pointer transition-colors"
                              title="Approve / Verify"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleModerate(rec.id, "REJECTED")}
                              className="p-1 rounded bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white cursor-pointer transition-colors"
                              title="Reject Submission"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleForceDelete(rec.id)}
                              className="p-1 rounded bg-muted text-muted hover:text-red-500 border border-border cursor-pointer transition-colors ml-2"
                              title="Force Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Panel B: Companies CRUD */}
        {activeSubTab === "companies" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* List */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm lg:col-span-2">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2 border-b border-border pb-3">
                <Building className="w-4 h-4 text-primary" /> Active Corporate Entities
              </h3>
              <div className="max-h-96 overflow-y-auto divide-y divide-border text-xs font-semibold">
                {companies.map((c) => (
                  <div key={c.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <div className="text-foreground font-bold">{c.name}</div>
                      <div className="text-[10px] text-muted font-normal mt-0.5">{c.industry}</div>
                    </div>
                    <button
                      onClick={() => handleDeleteCompany(c.id)}
                      className="text-muted hover:text-red-500 p-1 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {/* Form */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">
                Create Company
              </h3>
              <form onSubmit={handleCreateCompany} className="space-y-3.5">
                <div className="flex flex-col">
                  <label className="text-[9px] font-bold text-muted uppercase tracking-wider mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    className="bg-card border border-border text-xs rounded p-2 outline-none text-foreground"
                    value={compName}
                    onChange={(e) => setCompName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[9px] font-bold text-muted uppercase tracking-wider mb-1">Industry</label>
                  <input
                    type="text"
                    required
                    className="bg-card border border-border text-xs rounded p-2 outline-none text-foreground"
                    placeholder="e.g. Technology"
                    value={compIndustry}
                    onChange={(e) => setCompIndustry(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider p-2 rounded cursor-pointer transition-colors"
                >
                  Add Company
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Panel C: Roles CRUD */}
        {activeSubTab === "roles" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* List */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm lg:col-span-2">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2 border-b border-border pb-3">
                <Briefcase className="w-4 h-4 text-primary" /> System Role Profiles
              </h3>
              <div className="max-h-96 overflow-y-auto divide-y divide-border text-xs font-semibold">
                {roles.map((r) => (
                  <div key={r.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <div className="text-foreground font-bold">{r.roleName}</div>
                      <div className="text-[10px] text-muted font-normal mt-0.5">{r.category}</div>
                    </div>
                    <button
                      onClick={() => handleDeleteRole(r.id)}
                      className="text-muted hover:text-red-500 p-1 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {/* Form */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">
                Create Role Category
              </h3>
              <form onSubmit={handleCreateRole} className="space-y-3.5">
                <div className="flex flex-col">
                  <label className="text-[9px] font-bold text-muted uppercase tracking-wider mb-1">Role Name</label>
                  <input
                    type="text"
                    required
                    className="bg-card border border-border text-xs rounded p-2 outline-none text-foreground"
                    placeholder="e.g. ML Engineer"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[9px] font-bold text-muted uppercase tracking-wider mb-1">Category</label>
                  <select
                    className="bg-card border border-border text-xs font-bold rounded p-2 outline-none cursor-pointer text-foreground"
                    value={roleCategory}
                    onChange={(e) => setRoleCategory(e.target.value)}
                  >
                    {[
                      "Software Engineering",
                      "Product Management",
                      "Data Science",
                      "ML Engineering",
                      "DevOps",
                      "Security",
                      "Design",
                    ].map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider p-2 rounded cursor-pointer transition-colors"
                >
                  Add Role Category
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Panel D: Levels CRUD */}
        {activeSubTab === "levels" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* List */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm lg:col-span-2">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2 border-b border-border pb-3">
                <Award className="w-4 h-4 text-primary" /> Seeding Level Mappings
              </h3>
              <div className="max-h-96 overflow-y-auto divide-y divide-border text-xs font-semibold">
                {levels.map((l) => (
                  <div key={l.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <div className="text-foreground font-bold">
                        {l.company.name} — {l.levelCode}
                      </div>
                      <div className="text-[10px] text-primary mt-0.5">
                        Equivalent standard: {l.equivalentLevel} ({l.mappingType})
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteLevel(l.id)}
                      className="text-muted hover:text-red-500 p-1 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {/* Form */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">
                Create Level Map
              </h3>
              <form onSubmit={handleCreateLevel} className="space-y-3.5">
                <div className="flex flex-col">
                  <label className="text-[9px] font-bold text-muted uppercase tracking-wider mb-1">Company</label>
                  <select
                    className="bg-card border border-border text-xs font-bold rounded p-2 outline-none cursor-pointer text-foreground"
                    value={lvlCompId}
                    onChange={(e) => setLvlCompId(e.target.value)}
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-[9px] font-bold text-muted uppercase tracking-wider mb-1">Level Code</label>
                  <input
                    type="text"
                    required
                    className="bg-card border border-border text-xs rounded p-2 outline-none text-foreground"
                    placeholder="e.g. L4, E5"
                    value={lvlCode}
                    onChange={(e) => setLvlCode(e.target.value)}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[9px] font-bold text-muted uppercase tracking-wider mb-1">Equivalent Standard</label>
                  <select
                    className="bg-card border border-border text-xs font-bold rounded p-2 outline-none cursor-pointer text-foreground"
                    value={lvlEquiv}
                    onChange={(e) => setLvlEquiv(e.target.value)}
                  >
                    {["Entry", "Mid", "Senior", "Staff", "Principal", "Director+"].map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-[9px] font-bold text-muted uppercase tracking-wider mb-1">Description</label>
                  <textarea
                    className="bg-card border border-border text-xs rounded p-2 outline-none text-foreground"
                    rows={2}
                    value={lvlDesc}
                    onChange={(e) => setLvlDesc(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider p-2 rounded cursor-pointer transition-colors"
                >
                  Add Level Mapping
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Panel E: Locations CRUD */}
        {activeSubTab === "locations" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* List */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm lg:col-span-2">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2 border-b border-border pb-3">
                <MapPin className="w-4 h-4 text-primary" /> Active Location Hubs
              </h3>
              <div className="max-h-96 overflow-y-auto divide-y divide-border text-xs font-semibold">
                {locations.map((loc) => (
                  <div key={loc.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <div className="text-foreground font-bold">
                        {loc.city}, {loc.country}
                      </div>
                      <div className="text-[10px] text-muted font-normal mt-0.5">
                        COL Index: {loc.costOfLivingIndex.toFixed(1)} | Region: {loc.region || "APAC"}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteLocation(loc.id)}
                      className="text-muted hover:text-red-500 p-1 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {/* Form */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">
                Create Location Hub
              </h3>
              <form onSubmit={handleCreateLocation} className="space-y-3.5">
                <div className="flex flex-col">
                  <label className="text-[9px] font-bold text-muted uppercase tracking-wider mb-1">City</label>
                  <input
                    type="text"
                    required
                    className="bg-card border border-border text-xs rounded p-2 outline-none text-foreground"
                    placeholder="e.g. Pune"
                    value={locCity}
                    onChange={(e) => setLocCity(e.target.value)}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[9px] font-bold text-muted uppercase tracking-wider mb-1">Country</label>
                  <input
                    type="text"
                    required
                    className="bg-card border border-border text-xs rounded p-2 outline-none text-foreground"
                    placeholder="e.g. India"
                    value={locCountry}
                    onChange={(e) => setLocCountry(e.target.value)}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[9px] font-bold text-muted uppercase tracking-wider mb-1">Region</label>
                  <select
                    className="bg-card border border-border text-xs font-bold rounded p-2 outline-none cursor-pointer text-foreground"
                    value={locRegion}
                    onChange={(e) => setLocRegion(e.target.value)}
                  >
                    {["AMER", "EMEA", "APAC"].map((reg) => (
                      <option key={reg} value={reg}>
                        {reg}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-[9px] font-bold text-muted uppercase tracking-wider mb-1">
                    Cost of Living Index (SF=100)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="bg-card border border-border text-xs rounded p-2 outline-none text-foreground"
                    value={locCol}
                    onChange={(e) => setLocCol(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider p-2 rounded cursor-pointer transition-colors"
                >
                  Add Location
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
