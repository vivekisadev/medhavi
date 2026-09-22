"use client";

import React from "react";
import {
  AlertCircle,
  FileText,
  DollarSign,
  User,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { cn, getDocTypeLabel } from "@/lib/utils";
import type { Document } from "@/lib/types";

interface ActionAlertsProps {
  documents: Document[];
}

export function ActionAlerts({ documents }: ActionAlertsProps) {
  const alerts: { severity: "error" | "warning"; icon: React.ElementType; title: string; description: string; action: string }[] = [];

  documents.forEach((doc) => {
    if (!doc.defect_reason) return;
    if (doc.quality_score < 30) {
      alerts.push({
        severity: "error",
        icon: AlertCircle,
        title: `${getDocTypeLabel(doc.doc_type)} — Poor Image Quality`,
        description: "Image too blurry or low contrast. Upload a clear, flat scan with all four corners visible.",
        action: "Re-upload a clearer scan at 300 DPI.",
      });
    } else if (doc.defect_reason.includes("Name mismatch")) {
      alerts.push({
        severity: "error",
        icon: User,
        title: "Name Mismatch Detected",
        description: doc.defect_reason,
        action: "Ensure all documents use the exact same name as on your profile.",
      });
    } else if (doc.defect_reason.includes("exceeds") || doc.defect_reason.includes("expired")) {
      alerts.push({
        severity: "error",
        icon: DollarSign,
        title: `${getDocTypeLabel(doc.doc_type)} — Eligibility Issue`,
        description: doc.defect_reason,
        action: "Upload a valid, current-year document meeting eligibility criteria.",
      });
    } else {
      alerts.push({
        severity: "warning",
        icon: FileText,
        title: `${getDocTypeLabel(doc.doc_type)} — Action Required`,
        description: doc.defect_reason,
        action: "Re-upload or correct this document.",
      });
    }
  });

  if (alerts.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-secondary/30 border border-border">
        <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> All documents are valid. No action required.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert, idx) => (
        <div key={idx} className={cn("flex items-start gap-3 p-4 rounded-xl border shadow-sm", alert.severity === "error" ? "bg-card border-destructive" : "bg-card border-warning")}>
          <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0", alert.severity === "error" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning")}>
            <alert.icon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn("text-sm font-bold text-foreground")}>{alert.title}</p>
            <p className={cn("text-xs mt-1 text-muted-foreground")}>{alert.description}</p>
            <button onClick={() => {
              // Redirect to documents tab to fix
              const params = new URLSearchParams(window.location.search);
              params.set("tab", "documents");
              window.history.pushState(null, "", `?${params.toString()}`);
              window.dispatchEvent(new Event("popstate"));
            }} className={cn("text-xs mt-2 font-bold flex items-center gap-1 hover:underline text-left", alert.severity === "error" ? "text-destructive" : "text-warning")}>
              <ExternalLink className="h-3 w-3" />{alert.action}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
