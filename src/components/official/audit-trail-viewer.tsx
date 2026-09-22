"use client";

import React from "react";
import { User, Shield } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

export function AuditTrailViewer({ applicationId }: { applicationId?: string }) {
  const { auditTrail } = useAppStore();
  const entries = applicationId
    ? auditTrail.filter((e) => e.application_id === applicationId)
    : auditTrail;

  if (entries.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-[#F7F3EA] dark:bg-[#0B1220] border border-[#EAE6DD] dark:border-[#1e2a45] text-center">
        <p className="text-xs text-[#4B5A7A] dark:text-slate-400">No audit entries found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {entries.map((entry, idx) => (
        <div key={entry.id} className="flex gap-3 relative">
          {/* Timeline line */}
          {idx < entries.length - 1 && (
            <div className="absolute left-[11px] top-6 bottom-0 w-px bg-[#EAE6DD] dark:bg-[#1e2a45]" />
          )}
          {/* Dot */}
          <div className={cn("h-[23px] w-[23px] rounded-full flex items-center justify-center shrink-0 mt-0.5 border-2 z-10",
            entry.performed_by === "System"
              ? "border-blue-300 dark:border-blue-700 bg-[#FFFDF8] dark:bg-[#131D34]"
              : "border-[#EAE6DD] dark:border-[#1e2a45] bg-[#FFFDF8] dark:bg-[#131D34]"
          )}>
            {entry.performed_by === "System" ? (
              <Shield className="h-2.5 w-2.5 text-blue-500 dark:text-blue-400" />
            ) : (
              <User className="h-2.5 w-2.5 text-[#4B5A7A] dark:text-slate-400" />
            )}
          </div>
          {/* Content */}
          <div className="pb-4 flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#1B2A4A] dark:text-white">{entry.action}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-[#4B5A7A] dark:text-slate-400">{entry.performed_by}</span>
              <span className="text-[10px] text-[#8B9AB5]">·</span>
              <span className="text-[10px] text-[#4B5A7A] dark:text-slate-400">{formatDate(entry.timestamp)}</span>
            </div>
            {entry.notes && (
              <p className="text-[10px] text-[#8B9AB5] mt-0.5 italic">{entry.notes}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
