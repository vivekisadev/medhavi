"use client";

import React, { useState } from "react";
import { FlaskConical, CheckCircle2, AlertTriangle, BookOpen, RotateCcw, ChevronUp, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

export function DemoToolbar() {
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(true);
  const { demoMode, loadValidNosScenario, loadDeficientScenario, loadNfstPvtgScenario, resetDemo } = useAppStore();

  if (!visible) return null;

  const scenarios = [
    { key: "valid_nos" as const, label: "Valid NOS Applicant", desc: "Income < ₹6L, QS Rank 420, 96% AI confidence", icon: CheckCircle2, iconBg: "bg-emerald-100 dark:bg-emerald-900", iconColor: "text-emerald-600", handler: loadValidNosScenario },
    { key: "deficient" as const, label: "Deficient Application", desc: "Blurry income cert, name mismatch, expired date", icon: AlertTriangle, iconBg: "bg-amber-100 dark:bg-amber-900", iconColor: "text-amber-600", handler: loadDeficientScenario },
    { key: "nfst_pvtg" as const, label: "NFST Research Scholar", desc: "PVTG category, UGC-NET JRF, 97% AI confidence", icon: BookOpen, iconBg: "bg-blue-100 dark:bg-blue-900", iconColor: "text-blue-600", handler: loadNfstPvtgScenario },
  ];

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {expanded && (
        <div className="mb-2.5 rounded-lg border bg-card shadow-xl p-3.5 w-72 animate-slideInUp">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground">Demo Scenarios</span>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mb-2.5">Load pre-configured scenarios for presentation.</p>
          <div className="space-y-1.5">
            {scenarios.map((s) => (
              <button key={s.key} onClick={() => { s.handler(); setExpanded(false); }} className={cn("w-full flex items-start gap-2.5 p-2.5 rounded-md border text-left transition-all hover:bg-secondary/50", demoMode.scenario === s.key ? "border-foreground/20 bg-secondary/30" : "border-border")}>
                <div className={cn("h-7 w-7 rounded flex items-center justify-center shrink-0", s.iconBg)}><s.icon className={cn("h-3.5 w-3.5", s.iconColor)} /></div>
                <div><p className="text-xs font-medium text-foreground">{s.label}</p><p className="text-[10px] text-muted-foreground mt-0.5">{s.desc}</p></div>
              </button>
            ))}
          </div>
          {demoMode.enabled && (
            <button onClick={() => { resetDemo(); setExpanded(false); }} className="w-full mt-2 flex items-center justify-center gap-1 p-1.5 text-[10px] text-muted-foreground hover:text-foreground rounded hover:bg-secondary transition-colors">
              <RotateCcw className="h-2.5 w-2.5" /> Reset
            </button>
          )}
        </div>
      )}
      <div className="flex items-center gap-2">
        <button onClick={() => setExpanded(!expanded)} className={cn("flex items-center gap-1.5 h-10 rounded-lg shadow-lg border text-xs font-medium transition-all", demoMode.enabled ? "bg-foreground border-foreground text-background" : "bg-card border-border text-foreground hover:bg-secondary")}>
          <FlaskConical className="h-3.5 w-3.5 ml-2.5" />
          <span className="pr-1">Demo</span>
          {expanded ? <ChevronDown className="h-3 w-3 mr-1.5" /> : <ChevronUp className="h-3 w-3 mr-1.5" />}
        </button>
        <button 
          onClick={() => setVisible(false)} 
          className="h-10 w-10 rounded-lg shadow-lg border border-border bg-card hover:bg-red-50 dark:hover:bg-red-950/30 text-muted-foreground hover:text-red-500 hover:border-red-200 dark:hover:border-red-900 flex items-center justify-center transition-all"
          title="Hide Demo Controls (Refresh to show again)"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
