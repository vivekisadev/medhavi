"use client";

import React from "react";
import { FileText, ShieldCheck, AlertTriangle, CircleDollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { MeshCard } from "@/components/ui/mesh-card";
import { cn, formatCurrency } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

function MetricCard({ title, value, change, changeType = "neutral", icon: Icon, blobs }: {
  title: string; value: string | number; change?: string; changeType?: "up" | "down" | "neutral";
  icon: React.ElementType; blobs?: React.ReactNode;
}) {
  return (
    <MeshCard blobs={blobs}>
      <div className="flex items-center gap-2 mb-6">
        <div className="h-7 w-7 rounded-[10px] flex items-center justify-center bg-black/[0.04] dark:bg-white/10 text-zinc-600 dark:text-zinc-300 backdrop-blur-md">
          <Icon className="h-3.5 w-3.5" />
        </div>
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide">{title}</span>
      </div>
      
      <div>
        <p className="text-[32px] leading-none font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{value}</p>
        {change && (
          <div className="flex items-center gap-1 mt-2.5">
            {changeType === "up" && <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />}
            {changeType === "down" && <ArrowDownRight className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400" />}
            <span className={cn("text-xs font-semibold", changeType === "up" ? "text-emerald-600 dark:text-emerald-400" : changeType === "down" ? "text-rose-600 dark:text-rose-400" : "text-zinc-500 dark:text-zinc-400")}>{change}</span>
          </div>
        )}
      </div>
    </MeshCard>
  );
}

export function AnalyticsDeck() {
  const { applications } = useAppStore();
  const total = applications.length;
  const verified = applications.filter((a) => a.status === "ai_verified").length;
  const flagged = applications.filter((a) => a.status === "deficiency_flagged").length;
  const approved = applications.filter((a) => a.status === "official_approved" || a.status === "disbursed").length;
  const pvtgApps = applications.filter((a) => a.scheme_id === "NFST");
  const totalDisbursed = approved * 1200000;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <MetricCard 
        title="Total Applications" 
        value={total} 
        change="+12% this week" 
        changeType="up" 
        icon={FileText} 
        blobs={
          <>
            <div className="absolute -top-10 -left-10 w-48 h-48 bg-orange-200/60 rounded-full blur-[40px]" />
            <div className="absolute top-10 -right-10 w-40 h-40 bg-amber-100/70 rounded-full blur-[40px]" />
          </>
        } 
      />
      <MetricCard 
        title="Auto-Verified" 
        value={`${total > 0 ? Math.round((verified / total) * 100) : 0}%`} 
        change={`${verified} applications`} 
        changeType="up" 
        icon={ShieldCheck} 
        blobs={
          <>
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-teal-200/50 rounded-full blur-[40px]" />
            <div className="absolute -bottom-10 left-0 w-40 h-40 bg-emerald-100/60 rounded-full blur-[40px]" />
          </>
        } 
      />
      <MetricCard 
        title="Deficiency Flagged" 
        value={flagged} 
        change={flagged > 0 ? "Needs attention" : "All clear"} 
        changeType={flagged > 0 ? "down" : "up"} 
        icon={AlertTriangle} 
        blobs={
          <>
            <div className="absolute -top-10 right-10 w-48 h-48 bg-rose-200/50 rounded-full blur-[40px]" />
            <div className="absolute bottom-0 -left-10 w-40 h-40 bg-orange-100/60 rounded-full blur-[40px]" />
          </>
        } 
      />
      <MetricCard 
        title="Approved" 
        value={approved} 
        change={`${formatCurrency(totalDisbursed)} total`} 
        changeType="up" 
        icon={CircleDollarSign} 
        blobs={
          <>
            <div className="absolute -top-10 left-10 w-48 h-48 bg-fuchsia-200/50 rounded-full blur-[40px]" />
            <div className="absolute bottom-0 -right-10 w-40 h-40 bg-violet-200/60 rounded-full blur-[40px]" />
          </>
        } 
      />
      <MetricCard 
        title="NFST / PVTG" 
        value={pvtgApps.length} 
        change="Research scholars" 
        changeType="neutral" 
        icon={ShieldCheck} 
        blobs={
          <>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-100/60 rounded-full blur-[40px]" />
            <div className="absolute -bottom-10 right-0 w-32 h-32 bg-cyan-100/60 rounded-full blur-[40px]" />
          </>
        } 
      />
    </div>
  );
}
