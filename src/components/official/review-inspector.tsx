"use client";

import React, { useState } from "react";
import {
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Shield,
} from "lucide-react";
import { cn, getDocTypeLabel, getStatusLabel, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerBody,
  DrawerFooter,
} from "@/components/ui/drawer";
import { useAppStore } from "@/lib/store";
import { evaluateSchemeEligibility } from "@/lib/engines/verification-engine";
import { schemes } from "@/lib/data/mock-data";
import { AuditTrailViewer } from "@/components/official/audit-trail-viewer";

export function ReviewInspector() {
  const {
    selectedApplication,
    reviewDrawerOpen,
    setReviewDrawerOpen,
    documents,
    setSelectedApplication,
    updateApplicationStatus,
  } = useAppStore();

  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | null>(null);

  if (!selectedApplication) return null;

  const appDocs = documents.filter((d) => d.application_id === selectedApplication.id);
  const scheme = schemes.find((s) => s.id === selectedApplication.scheme_id);
  const verification = scheme
    ? evaluateSchemeEligibility(selectedApplication, appDocs, scheme)
    : null;

  const handleApprove = () => {
    if (confirmAction !== "approve") { setConfirmAction("approve"); return; }
    updateApplicationStatus(selectedApplication.id, "official_approved");
    setReviewDrawerOpen(false);
    setSelectedApplication(null);
    setConfirmAction(null);
  };

  const handleReject = () => {
    if (confirmAction !== "reject") { setConfirmAction("reject"); return; }
    updateApplicationStatus(selectedApplication.id, "deficiency_flagged");
    setReviewDrawerOpen(false);
    setSelectedApplication(null);
    setConfirmAction(null);
  };

  return (
    <Drawer open={reviewDrawerOpen} onOpenChange={setReviewDrawerOpen}>
      <DrawerContent key={selectedApplication.id} className="bg-[#FFFDF8] dark:bg-[#131D34] border-[#EAE6DD] dark:border-[#1e2a45]">
        <DrawerHeader className="border-b border-[#EAE6DD] dark:border-[#1e2a45]">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-[#1B2A4A] dark:text-white">Review — {selectedApplication.application_no}</DrawerTitle>
              <p className="text-sm text-[#4B5A7A] dark:text-slate-400 mt-0.5">{selectedApplication.scheme_id} Application</p>
            </div>
            <span className={cn("text-[10px] px-3 py-1 rounded-full font-bold",
              selectedApplication.status === "ai_verified" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" :
              selectedApplication.status === "deficiency_flagged" ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" :
              "bg-[#EAE6DD] dark:bg-[#1e2a45] text-[#4B5A7A] dark:text-slate-300"
            )}>
              {getStatusLabel(selectedApplication.status)}
            </span>
          </div>
        </DrawerHeader>
        <DrawerBody className="bg-[#FFFDF8] dark:bg-[#131D34]">
          <div className="space-y-5">
            {/* AI Score */}
            <div className="p-4 rounded-xl bg-[#F7F3EA] dark:bg-[#0B1220] border border-[#EAE6DD] dark:border-[#1e2a45]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[#4B5A7A] dark:text-slate-400" />
                  <span className="text-xs font-semibold text-[#1B2A4A] dark:text-white">AI Verification Score</span>
                </div>
                <span className={cn("text-lg font-bold", (verification?.overall_score || 0) >= 90 ? "text-emerald-600 dark:text-emerald-400" : (verification?.overall_score || 0) >= 50 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400")}>
                  {verification?.overall_score || 0}%
                </span>
              </div>
              {verification && (
                <div className="space-y-1.5">
                  {verification.rule_checks.map((rule, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-[#4B5A7A] dark:text-slate-400">{rule.rule_name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-[#8B9AB5]">{rule.score}%</span>
                        {rule.passed ? <CheckCircle2 className="h-3 w-3 text-emerald-500 dark:text-emerald-400" /> : <XCircle className="h-3 w-3 text-red-500 dark:text-red-400" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Defects */}
            {verification && verification.defects.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold text-[#4B5A7A] dark:text-slate-400 uppercase tracking-wider">Flagged Issues</p>
                {verification.defects.map((d, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                    <span className="text-xs text-amber-800 dark:text-amber-300 font-medium">{d}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="h-px bg-[#EAE6DD] dark:bg-[#1e2a45]" />

            {/* Applicant Info */}
            <div className="p-4 rounded-xl bg-[#F7F3EA] dark:bg-[#0B1220] border border-[#EAE6DD] dark:border-[#1e2a45]">
              <p className="text-[10px] font-semibold text-[#4B5A7A] dark:text-slate-400 uppercase tracking-wider mb-3">Applicant Information</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-[#8B9AB5]">Name</span><p className="font-semibold text-[#1B2A4A] dark:text-white">{selectedApplication.applicant_name}</p></div>
                <div><span className="text-[#8B9AB5]">University</span><p className="font-semibold text-[#1B2A4A] dark:text-white">{selectedApplication.university_name}</p></div>
                <div><span className="text-[#8B9AB5]">Course</span><p className="font-semibold text-[#1B2A4A] dark:text-white">{selectedApplication.course_type}</p></div>
                <div><span className="text-[#8B9AB5]">Income</span><p className="font-semibold text-[#1B2A4A] dark:text-white">{selectedApplication.annual_income ? formatCurrency(selectedApplication.annual_income) : "N/A"}</p></div>
              </div>
            </div>

            {/* Documents */}
            <div>
              <p className="text-[10px] font-semibold text-[#4B5A7A] dark:text-slate-400 uppercase tracking-wider mb-2">Documents</p>
              <div className="space-y-2">
                {appDocs.map((doc) => (
                  <div key={doc.id} className={cn("rounded-xl border overflow-hidden", doc.is_valid ? "border-[#EAE6DD] dark:border-[#1e2a45]" : "border-red-200 dark:border-red-900/50")}>
                    <div className="flex items-center justify-between p-3 bg-[#F7F3EA] dark:bg-[#0B1220]">
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-[#4B5A7A] dark:text-slate-400" />
                        <span className="text-xs font-semibold text-[#1B2A4A] dark:text-white">{getDocTypeLabel(doc.doc_type)}</span>
                      </div>
                      <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-bold", doc.is_valid ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400")}>Q: {doc.quality_score}%</span>
                    </div>
                    <div className="p-3">
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        {doc.ocr_extracted_payload.applicant_name && (
                          <div><span className="text-[#8B9AB5]">Name</span><p className="font-medium text-[#1B2A4A] dark:text-white">{doc.ocr_extracted_payload.applicant_name}</p></div>
                        )}
                        {doc.ocr_extracted_payload.certificate_no && (
                          <div><span className="text-[#8B9AB5]">Certificate No</span><p className="font-medium text-[#1B2A4A] dark:text-white">{doc.ocr_extracted_payload.certificate_no}</p></div>
                        )}
                        {doc.ocr_extracted_payload.gross_annual_income != null && (
                          <div><span className="text-[#8B9AB5]">Income</span><p className="font-medium text-[#1B2A4A] dark:text-white">{formatCurrency(doc.ocr_extracted_payload.gross_annual_income)}</p></div>
                        )}
                        {doc.ocr_extracted_payload.issue_date && (
                          <div><span className="text-[#8B9AB5]">Issue Date</span><p className="font-medium text-[#1B2A4A] dark:text-white">{new Date(doc.ocr_extracted_payload.issue_date).toLocaleDateString("en-IN")}</p></div>
                        )}
                        {doc.ocr_extracted_payload.institution_name && (
                          <div><span className="text-[#8B9AB5]">Institution</span><p className="font-medium text-[#1B2A4A] dark:text-white">{doc.ocr_extracted_payload.institution_name}</p></div>
                        )}
                        {doc.ocr_extracted_payload.qs_ranking && (
                          <div><span className="text-[#8B9AB5]">QS Rank</span><p className="font-medium text-[#1B2A4A] dark:text-white">#{doc.ocr_extracted_payload.qs_ranking}</p></div>
                        )}
                        {doc.ocr_extracted_payload.net_roll_no && (
                          <div><span className="text-[#8B9AB5]">NET Roll</span><p className="font-medium text-[#1B2A4A] dark:text-white">{doc.ocr_extracted_payload.net_roll_no}</p></div>
                        )}
                        {doc.ocr_extracted_payload.net_score && (
                          <div><span className="text-[#8B9AB5]">NET Score</span><p className="font-medium text-[#1B2A4A] dark:text-white">{doc.ocr_extracted_payload.net_score}</p></div>
                        )}
                      </div>
                      {doc.defect_reason && (
                        <div className="mt-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50">
                          <div className="flex items-start gap-1.5">
                            <AlertTriangle className="h-3 w-3 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                            <span className="text-[10px] text-red-700 dark:text-red-300 font-medium">{doc.defect_reason}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-px bg-[#EAE6DD] dark:bg-[#1e2a45]" />

            {/* Audit Trail */}
            <div>
              <p className="text-[10px] font-semibold text-[#4B5A7A] dark:text-slate-400 uppercase tracking-wider mb-2">Audit Trail</p>
              <AuditTrailViewer applicationId={selectedApplication.id} />
            </div>
          </div>
        </DrawerBody>
        <DrawerFooter className="border-t border-[#EAE6DD] dark:border-[#1e2a45] bg-[#FFFDF8] dark:bg-[#131D34]">
          {confirmAction === "reject" ? (
            <Button variant="destructive" size="sm" onClick={handleReject} className="bg-red-600 hover:bg-red-700 text-white">
              <XCircle className="h-3.5 w-3.5 mr-1.5" /> Click Again to Confirm
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={handleReject} className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/30">
              <XCircle className="h-3.5 w-3.5 mr-1.5" /> Raise Deficiency
            </Button>
          )}
          {confirmAction === "approve" ? (
            <Button size="sm" onClick={handleApprove} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Click Again to Confirm
            </Button>
          ) : (
            <Button size="sm" onClick={handleApprove} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Approve & Sanction
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
