"use client";

import React, { useState, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { ReviewQueue } from "@/components/official/review-queue";
import { ReviewInspector } from "@/components/official/review-inspector";
import { AuditTrailViewer } from "@/components/official/audit-trail-viewer";
import { StatusPieChart, MeritBarChart, SchemeComparisonChart, TimelineChart } from "@/components/official/analytics-charts";
import { RulesEditor } from "@/components/official/rules-editor";
import { applicationsToCsv, downloadCsv, statusDistribution } from "@/lib/services/export";
import { DEFAULT_RULES } from "@/lib/data/scheme-rules";

// ---------------------------------------------------------------------------
// Mock queue data for the "Verification queue" view
// ---------------------------------------------------------------------------
const mockQueueData = [
  { applicant: "Sunita Oraon", course: "B.Sc, Ranchi University", scholarship: "ST Merit-cum-Means Grant", documents: "6 / 6 uploaded", status: "In review", statusColor: "text-amber-700 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-900/30", gradient: "from-[#B89F3A] to-[#4A6753]" },
  { applicant: "Birsa Munda Toppo", course: "Diploma, Govt. Polytechnic", scholarship: "Post-Matric ST Scholarship", documents: "4 / 6 uploaded", status: "Docs flagged", statusColor: "text-red-700 dark:text-red-400 bg-red-100/60 dark:bg-red-900/30", gradient: "from-[#B89F3A] to-[#4A6753]" },
  { applicant: "Meena Kachhap", course: "B.A, St. Xavier's College", scholarship: "National Fellowship for ST Students", documents: "6 / 6 uploaded", status: "Ready to approve", statusColor: "text-[#4A6753] dark:text-[#6BA374] bg-emerald-100/60 dark:bg-emerald-900/30", gradient: "from-[#B89F3A] to-[#4A6753]" },
  { applicant: "Ravi Pahan", course: "B.Tech, BIT Sindri", scholarship: "ST Merit-cum-Means Grant", documents: "5 / 6 uploaded", status: "In review", statusColor: "text-amber-700 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-900/30", gradient: "from-[#B89F3A] to-[#4A6753]" },
];

// ---------------------------------------------------------------------------
// Shared UI Wrappers
// ---------------------------------------------------------------------------
function SectionCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-[#FFFDF8] dark:bg-[#131D34] rounded-3xl shadow-sm overflow-hidden">
      <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <h2 className="text-xl md:text-2xl font-bold font-fraunces text-[#1B2A4A] dark:text-white">{title}</h2>
        {action}
      </div>
      <div className="px-6 md:px-8 pb-6 md:pb-8">{children}</div>
    </div>
  );
}

function MetricCard({ label, value, sub, subColor }: { label: string; value: string; sub: string; subColor?: string }) {
  return (
    <div className="bg-[#FFFDF8] dark:bg-[#131D34] rounded-2xl p-5 md:p-6 shadow-sm flex flex-col justify-between min-h-[130px]">
      <div className="text-xs md:text-sm font-semibold text-[#4B5A7A] dark:text-slate-400">{label}</div>
      <div>
        <div className="text-3xl md:text-4xl font-light text-[#1B2A4A] dark:text-white mb-1">{value}</div>
        <div className={cn("text-xs md:text-sm font-medium", subColor || "text-[#1B2A4A] dark:text-slate-300")}>{sub}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Dashboard (default)
// ---------------------------------------------------------------------------
function DashboardTab() {
  const [filter, setFilter] = useState("All");
  const { applications, documents } = useAppStore();

  const statusDist = useMemo(() => statusDistribution(applications), [applications]);
  const nosCount = applications.filter((a) => a.scheme_id === "NOS").length;
  const nfstCount = applications.filter((a) => a.scheme_id === "NFST").length;
  const verified = applications.filter((a) => a.status === "ai_verified").length;
  const flagged = applications.filter((a) => a.status === "deficiency_flagged").length;
  const approved = applications.filter((a) => a.status === "official_approved" || a.status === "disbursed").length;
  const meritData = useMemo(
    () => applications.slice(0, 10).map((a) => ({ name: a.applicant_name.split(" ")[0], score: a.ai_confidence_score })).sort((a, b) => b.score - a.score),
    [applications]
  );
  const handleExport = () => { downloadCsv(`medhavi-applications-${new Date().toISOString().slice(0, 10)}.csv`, applicationsToCsv(applications)); };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-fraunces text-[#1B2A4A] dark:text-white tracking-tight">Verification queue</h1>
          <p className="text-[#4B5A7A] dark:text-slate-400 mt-2 text-[15px]">318 applications need a first review before this cycle closes on 30 Sept.</p>
        </div>
        <button onClick={handleExport} className="px-6 py-2.5 rounded-xl bg-[#4A6753] hover:bg-[#3B5034] dark:bg-[#5FA179] dark:hover:bg-[#4A8A65] text-white font-semibold transition-colors shadow-sm self-start whitespace-nowrap">Export cycle report</button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total applications" value="4,812" sub="+212 this week" />
        <MetricCard label="Pending verification" value="318" sub="86 due within 3 days" subColor="text-[#C1502E] dark:text-[#E68065]" />
        <MetricCard label="Approved this cycle" value="2,940" sub="61% of total" subColor="text-[#4A6753] dark:text-[#6BA374]" />
        <MetricCard label="Disbursed so far" value="₹3.86 Cr" sub="of ₹5.20 Cr allotted" subColor="text-[#4A6753] dark:text-[#6BA374]" />
      </div>

      {/* Live Data Queue Table */}
      <div className="bg-[#FFFDF8] dark:bg-[#131D34] rounded-3xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold font-fraunces text-[#1B2A4A] dark:text-white mb-6">Applicants awaiting review</h2>
          <ReviewQueue />
        </div>
      </div>

      {/* Analytics & Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Stats */}
        <div className="lg:col-span-1 flex flex-col">
          <SectionCard title="Quick Stats">
            <div className="space-y-4">
              {[
                { label: "Total in system", value: applications.length },
                { label: "AI-Verified", value: verified },
                { label: "Deficiency flagged", value: flagged },
                { label: "Approved & disbursed", value: approved },
                { label: "Documents uploaded", value: documents.length },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-[#4B5A7A] dark:text-slate-400">{item.label}</span>
                  <span className="font-bold text-[#1B2A4A] dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Status Distribution */}
        <div className="lg:col-span-1 flex flex-col">
          <SectionCard title="Status Distribution">
            <StatusPieChart data={statusDist} />
          </SectionCard>
        </div>

        {/* Volume by Scheme */}
        <div className="lg:col-span-1 flex flex-col">
          <SectionCard title="Volume by Scheme">
            <SchemeComparisonChart nosCount={nosCount} nfstCount={nfstCount} />
          </SectionCard>
        </div>

        {/* Top AI Merit Scores */}
        <div className="lg:col-span-1 flex flex-col">
          <SectionCard title="Top AI Merit Scores">
            <MeritBarChart data={meritData} />
          </SectionCard>
        </div>
      </div>

      {/* Review Inspector Drawer (triggered from ReviewQueue) */}
      <ReviewInspector />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Verification Queue (live data from store)
// ---------------------------------------------------------------------------
function QueueTab() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold font-fraunces text-[#1B2A4A] dark:text-white tracking-tight">Application Review</h1>
        <p className="text-[#4B5A7A] dark:text-slate-400 mt-2 text-[15px]">Review individual applications, inspect AI screening results, and approve or flag deficiencies.</p>
      </div>
      <SectionCard title="All Applications">
        <ReviewQueue />
      </SectionCard>
      <ReviewInspector />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Analytics
// ---------------------------------------------------------------------------
function AnalyticsTab() {
  const { applications } = useAppStore();
  const statusDist = useMemo(() => statusDistribution(applications), [applications]);
  const nosCount = applications.filter((a) => a.scheme_id === "NOS").length;
  const nfstCount = applications.filter((a) => a.scheme_id === "NFST").length;
  const meritData = useMemo(
    () => applications.slice(0, 10).map((a) => ({ name: a.applicant_name.split(" ")[0], score: a.ai_confidence_score })).sort((a, b) => b.score - a.score),
    [applications]
  );
  const timelineData = useMemo(() => {
    const counts: Record<string, number> = {};
    applications.forEach((a) => { const d = a.created_at.slice(0, 10); counts[d] = (counts[d] || 0) + 1; });
    return Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date: date.slice(5), count }));
  }, [applications]);
  const handleExport = () => { downloadCsv(`medhavi-applications-${new Date().toISOString().slice(0, 10)}.csv`, applicationsToCsv(applications)); };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-fraunces text-[#1B2A4A] dark:text-white tracking-tight">Analytics & Reports</h1>
          <p className="text-[#4B5A7A] dark:text-slate-400 mt-2 text-[15px]">Visualise application trends, merit distributions, and scheme-level breakdowns.</p>
        </div>
        <button onClick={handleExport} className="px-6 py-2.5 rounded-xl bg-[#1B2A4A] hover:bg-[#253961] dark:bg-white dark:hover:bg-slate-200 dark:text-[#1B2A4A] text-white font-semibold transition-colors shadow-sm self-start whitespace-nowrap flex items-center gap-2">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Applications by Status">
          <StatusPieChart data={statusDist} />
        </SectionCard>
        <SectionCard title="Volume by Scheme">
          <SchemeComparisonChart nosCount={nosCount} nfstCount={nfstCount} />
        </SectionCard>
        <SectionCard title="Top AI Merit Scores">
          <MeritBarChart data={meritData} />
        </SectionCard>
        <SectionCard title="Applications Timeline">
          <TimelineChart data={timelineData} />
        </SectionCard>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Scheme Settings (Rules Editor)
// ---------------------------------------------------------------------------
function RulesTab() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold font-fraunces text-[#1B2A4A] dark:text-white tracking-tight">Scheme Settings</h1>
        <p className="text-[#4B5A7A] dark:text-slate-400 mt-2 text-[15px]">Configure eligibility rules, income limits, and verification thresholds for each scheme.</p>
      </div>
      <SectionCard title="Eligibility Rules Configuration">
        <RulesEditor initialRules={DEFAULT_RULES} />
      </SectionCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Audit Trail
// ---------------------------------------------------------------------------
function AuditTab() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold font-fraunces text-[#1B2A4A] dark:text-white tracking-tight">Audit Trail</h1>
        <p className="text-[#4B5A7A] dark:text-slate-400 mt-2 text-[15px]">Full log of every action — application submissions, AI verifications, approvals, and flags.</p>
      </div>
      <SectionCard title="System Activity Log">
        <AuditTrailViewer />
      </SectionCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
function OfficialDashboardInner() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "dashboard";

  return (
    <div className="animate-fadeIn">
      {tab === "dashboard" && <DashboardTab />}
      {tab === "queue" && <QueueTab />}
      {tab === "analytics" && <AnalyticsTab />}
      {tab === "rules" && <RulesTab />}
      {tab === "audit" && <AuditTab />}
    </div>
  );
}

export default function OfficialDashboard() {
  return (
    <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="h-8 w-8 rounded-full border-2 border-[#1B2A4A] dark:border-white border-t-transparent animate-spin" /></div>}>
      <OfficialDashboardInner />
    </Suspense>
  );
}
