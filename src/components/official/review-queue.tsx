"use client";

import React, { useState } from "react";
import { Search, ChevronDown, Eye, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn, getStatusLabel, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";

export function ReviewQueue() {
  const { applications, setSelectedApplication, setReviewDrawerOpen } = useAppStore();
  const [search, setSearch] = useState("");
  const [schemeFilter, setSchemeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = applications.filter((app) => {
    const matchSearch = app.application_no.toLowerCase().includes(search.toLowerCase()) || app.university_name.toLowerCase().includes(search.toLowerCase());
    const matchScheme = schemeFilter === "all" || app.scheme_id === schemeFilter;
    const matchStatus = statusFilter === "all" || app.status === statusFilter;
    return matchSearch && matchScheme && matchStatus;
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8B9AB5]" />
          <input
            placeholder="Search by app no. or university..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 h-8 text-xs rounded-lg border border-[#EAE6DD] dark:border-[#1e2a45] bg-[#F7F3EA] dark:bg-[#0B1220] text-[#1B2A4A] dark:text-white placeholder:text-[#8B9AB5] focus:outline-none focus:ring-1 focus:ring-[#E8A33D] px-3"
          />
        </div>
        <div className="relative">
          <select value={schemeFilter} onChange={(e) => setSchemeFilter(e.target.value)} aria-label="Filter by scheme" className="h-8 rounded-lg border border-[#EAE6DD] dark:border-[#1e2a45] bg-[#F7F3EA] dark:bg-[#0B1220] text-[#1B2A4A] dark:text-white px-2 pr-7 text-xs appearance-none focus:outline-none focus:ring-1 focus:ring-[#E8A33D]">
            <option value="all">All Schemes</option>
            <option value="NOS">NOS</option>
            <option value="NFST">NFST</option>
          </select>
          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-[#8B9AB5] pointer-events-none" />
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status" className="h-8 rounded-lg border border-[#EAE6DD] dark:border-[#1e2a45] bg-[#F7F3EA] dark:bg-[#0B1220] text-[#1B2A4A] dark:text-white px-2 pr-7 text-xs appearance-none focus:outline-none focus:ring-1 focus:ring-[#E8A33D]">
            <option value="all">All Status</option>
            <option value="submitted">Submitted</option>
            <option value="ai_verified">AI Verified</option>
            <option value="deficiency_flagged">Deficiency</option>
            <option value="official_approved">Approved</option>
          </select>
          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-[#8B9AB5] pointer-events-none" />
        </div>
      </div>

      <div className="rounded-xl bg-[#FFFDF8] dark:bg-[#131D34] overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-[#F7F3EA] dark:bg-[#0B1220]/60">
              <th className="py-4 px-6 md:px-8 font-semibold text-sm text-[#4B5A7A] dark:text-slate-400">Applicant</th>
              <th className="py-4 px-4 font-semibold text-sm text-[#4B5A7A] dark:text-slate-400">Scheme</th>
              <th className="py-4 px-4 font-semibold text-sm text-[#4B5A7A] dark:text-slate-400">Status</th>
              <th className="py-4 px-4 font-semibold text-sm text-[#4B5A7A] dark:text-slate-400">AI Score</th>
              <th className="py-4 px-4 font-semibold text-sm text-[#4B5A7A] dark:text-slate-400">Issues</th>
              <th className="py-4 px-4 font-semibold text-sm text-[#4B5A7A] dark:text-slate-400">Income</th>
              <th className="py-4 px-6 text-right font-semibold text-sm text-[#4B5A7A] dark:text-slate-400">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAE6DD] dark:divide-[#1e2a45]">
            {filtered.map((app, idx) => {
              const docs = useAppStore.getState().documents.filter((d) => d.application_id === app.id);
              const flagCount = docs.filter((d) => !d.is_valid).length;
              
              // Generate a deterministic gradient based on index/id for visual variety
              const gradients = [
                "from-[#B89F3A] to-[#4A6753]",
                "from-[#4A6753] to-[#253961]",
                "from-[#E8A33D] to-[#C1502E]",
                "from-[#3F6B4F] to-[#1B2A4A]"
              ];
              const gradient = gradients[idx % gradients.length];

              return (
                <tr key={app.id} className="hover:bg-[#F7F3EA]/50 dark:hover:bg-[#1e2a45]/30 transition-colors">
                  <td className="py-5 px-6 md:px-8">
                    <div className="flex items-center gap-4">
                      <div className={cn("h-11 w-11 rounded-full bg-gradient-to-br flex-shrink-0 shadow-inner", gradient)} />
                      <div>
                        <div className="font-bold text-[#1B2A4A] dark:text-white">{app.applicant_name}</div>
                        <div className="text-sm text-[#8B9AB5] dark:text-slate-500 mt-0.5">{app.course_type}, {app.university_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-4">
                    <span className={cn("px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center justify-center min-w-[70px]", 
                      app.scheme_id === "NOS" ? "bg-blue-100/60 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" : 
                      "bg-purple-100/60 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400")}>
                      {app.scheme_id}
                    </span>
                  </td>
                  <td className="py-5 px-4">
                    <span className={cn("px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center justify-center whitespace-nowrap min-w-[100px]",
                      app.status === "ai_verified" ? "bg-emerald-100/60 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" :
                      app.status === "deficiency_flagged" ? "bg-amber-100/60 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" :
                      app.status === "official_approved" ? "bg-blue-100/60 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" :
                      "bg-[#EAE6DD]/60 dark:bg-[#1e2a45]/60 text-[#4B5A7A] dark:text-slate-300"
                    )}>
                      {getStatusLabel(app.status)}
                    </span>
                  </td>
                  <td className="py-5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-[#EAE6DD] dark:bg-[#1e2a45] rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", app.ai_confidence_score >= 90 ? "bg-emerald-500" : app.ai_confidence_score >= 50 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${app.ai_confidence_score}%` }} />
                      </div>
                      <span className="text-xs text-[#4B5A7A] dark:text-slate-400 font-medium">{app.ai_confidence_score}%</span>
                    </div>
                  </td>
                  <td className="py-5 px-4">
                    {flagCount > 0 ? (
                      <div className="flex items-center gap-1.5"><AlertTriangle className="h-4 w-4 text-amber-500" /><span className="text-xs font-bold text-amber-600 dark:text-amber-400">{flagCount} issues</span></div>
                    ) : <div className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400" /><span className="text-xs font-bold text-emerald-600 dark:text-emerald-500">Clear</span></div>}
                  </td>
                  <td className="py-5 px-4 text-sm font-medium text-[#4B5A7A] dark:text-slate-300">
                    {app.annual_income ? formatCurrency(app.annual_income) : "—"}
                  </td>
                  <td className="py-5 px-6 text-right">
                    <button onClick={() => { setSelectedApplication(app); setReviewDrawerOpen(true); }} className="font-bold text-sm text-[#1B2A4A] dark:text-white hover:text-[#4A6753] dark:hover:text-[#6BA374] transition-colors whitespace-nowrap">
                      Open case
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="py-12 text-center text-[#8B9AB5] text-sm">No applications found matching the criteria</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
