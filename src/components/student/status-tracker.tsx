"use client";

import React from "react";
import {
  CheckCircle2,
  Shield,
  FileSearch,
  CircleDollarSign,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ApplicationStatus } from "@/lib/types";

const stages = [
  { key: "submitted", label: "Submitted", icon: Send },
  { key: "ai_verified", label: "AI Verification", icon: Shield },
  { key: "official_approved", label: "Official Review", icon: FileSearch },
  { key: "disbursed", label: "Disbursed", icon: CircleDollarSign },
];

function getIdx(status: ApplicationStatus): number {
  if (status === "draft") return -1;
  if (status === "deficiency_flagged") return 1;
  const idx = stages.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}

interface StatusTrackerProps {
  currentStatus: ApplicationStatus;
}

export function StatusTracker({ currentStatus }: StatusTrackerProps) {
  const idx = getIdx(currentStatus);
  const isFlagged = currentStatus === "deficiency_flagged";

  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {stages.map((stage, i) => {
          const done = i < idx && !isFlagged;
          const current = i === idx && !isFlagged;
          const flagged = isFlagged && i === 1;

          return (
            <React.Fragment key={stage.key}>
              <div className="flex flex-col items-center relative z-10">
                <div className={cn("h-9 w-9 rounded-full flex items-center justify-center border-2 transition-all text-xs font-medium", done ? "bg-emerald-500 border-emerald-500 text-white" : current || flagged ? "bg-foreground border-foreground text-background" : "bg-card border-border text-muted-foreground")}>
                  {done ? <CheckCircle2 className="h-4 w-4" /> : <stage.icon className="h-3.5 w-3.5" />}
                </div>
                <span className={cn("mt-1.5 text-[11px] font-medium", done || current || flagged ? "text-foreground" : "text-muted-foreground")}>
                  {stage.label}
                </span>
                {flagged && (
                  <span className="mt-0.5 text-[9px] font-medium text-amber-700 bg-white border border-amber-200 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-400 px-1.5 py-0.5 rounded-full shadow-sm">
                    Action Needed
                  </span>
                )}
              </div>
              {i < stages.length - 1 && (
                <div className={cn("flex-1 h-px mx-2 mt-[-1rem]", i < idx && !isFlagged ? "bg-emerald-500" : "bg-border")} />
              )}
            </React.Fragment>
          );
        })}
      </div>
      {isFlagged && (
        <div className="mt-4 p-3 rounded-lg bg-white dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 flex items-start gap-2 shadow-sm">
          <div className="h-4 w-4 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-amber-600 dark:text-amber-400 text-[9px] font-bold">!</span>
          </div>
          <div>
            <p className="text-xs font-medium text-amber-800 dark:text-amber-300">Action Required</p>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
              Some documents need correction. Check the alerts below for details.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
