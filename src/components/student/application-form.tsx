"use client";

import React, { useState } from "react";
import {
  User,
  GraduationCap,
  Upload,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { DobSelector } from "@/components/ui/dob-selector";
import { StateCombobox } from "@/components/ui/state-combobox";
import { TribeCombobox } from "@/components/ui/tribe-combobox";
import type { SchemeId } from "@/lib/types";
import { DocumentUploader } from "./document-uploader";

interface ApplicationFormProps {
  schemeId: SchemeId;
  onComplete: () => void;
}

const steps = [
  { label: "Personal Details", icon: User },
  { label: "Education & Admission", icon: GraduationCap },
  { label: "Document Upload", icon: Upload },
];

export function ApplicationForm({ schemeId, onComplete }: ApplicationFormProps) {
  const { formStep, setFormStep, formData, setFormData, submitApplication } = useAppStore();
  const [submitting, setSubmitting] = useState(false);
  const [selectedState, setSelectedState] = useState("");

  const step = formStep;
  const personal = formData.personal;
  const educational = formData.educational;

  const canNext = () => {
    if (step === 0) return personal.full_name && personal.email && personal.st_caste_name;
    if (step === 1) return educational.university_name && educational.course_type;
    return true;
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      submitApplication();
      setSubmitting(false);
      setFormStep(3); // Go to AI Screening Results step
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      {step < 3 && (
        <div className="flex justify-between items-center px-2">
          {steps.map((s, idx) => (
            <React.Fragment key={s.label}>
              <div className="flex flex-col items-center gap-2 relative z-10 w-16 sm:w-24">
                <div className={cn("h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 shadow-sm", idx < step ? "bg-emerald-700 border-emerald-700 text-white" : idx === step ? "bg-foreground border-foreground text-background" : "bg-card border-border/50 text-muted-foreground")}>
                  {idx < step ? <CheckCircle2 className="h-5 w-5" /> : idx + 1}
                </div>
                <span className={cn("text-[9px] sm:text-[10px] font-bold uppercase tracking-wider absolute -bottom-8 w-24 text-center leading-tight whitespace-normal break-words", idx === step ? "text-foreground" : "text-muted-foreground")}>{s.label}</span>
              </div>
              {idx < steps.length - 1 && <div className={cn("flex-1 h-[2px] mx-1 sm:mx-2 mt-[-32px]", idx < step ? "bg-emerald-700" : "bg-border/50")} />}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Step content */}
      <div className="rounded-[1.25rem] border border-border/50 bg-card p-6 min-h-[320px] shadow-sm mt-12">
        {step === 0 && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-sm font-semibold text-foreground">Personal & Community Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Full Name *</label>
                <Input placeholder="As on caste certificate" value={personal.full_name} onChange={(e) => setFormData({ personal: { ...personal, full_name: e.target.value } })} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Email *</label>
                <Input type="email" placeholder="student@email.com" value={personal.email} onChange={(e) => setFormData({ personal: { ...personal, email: e.target.value } })} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone</label>
                <Input placeholder="10-digit mobile" value={personal.phone} onChange={(e) => setFormData({ personal: { ...personal, phone: e.target.value } })} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Date of Birth *</label>
                <DobSelector value={personal.date_of_birth} onChange={(v) => setFormData({ personal: { ...personal, date_of_birth: v } })} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">State (Optional)</label>
                <StateCombobox value={selectedState} onChange={(v) => setSelectedState(v)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">ST Caste/Tribe Name *</label>
                <TribeCombobox value={personal.st_caste_name} onChange={(v) => setFormData({ personal: { ...personal, st_caste_name: v } })} stateFilter={selectedState} />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-secondary transition-colors">
                  <input type="checkbox" checked={personal.pvtg_status} onChange={(e) => setFormData({ personal: { ...personal, pvtg_status: e.target.checked } })} className="rounded border-border" />
                  <div>
                    <span className="text-sm font-medium text-foreground">PVTG Status</span>
                    <span className="text-xs text-muted-foreground block">Particularly Vulnerable Tribal Group</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-sm font-semibold text-foreground">Education & Admission Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-3">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Qualifying Marks (%) *</label>
                <Input type="number" placeholder="e.g., 78" value={educational.qualifying_marks || ""} onChange={(e) => setFormData({ educational: { ...educational, qualifying_marks: Number(e.target.value) } })} />
              </div>
              <div className="sm:col-span-3">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Course Type *</label>
                <select value={educational.course_type} onChange={(e) => setFormData({ educational: { ...educational, course_type: e.target.value } })} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="">Select</option>
                  <option value="Masters">Master&apos;s</option>
                  <option value="Ph.D">Ph.D</option>
                </select>
              </div>
              <div className="sm:col-span-6">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">University / Institution Name *</label>
                <Input placeholder="Full name of institution" value={educational.university_name} onChange={(e) => setFormData({ educational: { ...educational, university_name: e.target.value } })} />
              </div>
              {schemeId === "NFST" && (
                <>
                  <div className="sm:col-span-8">
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">NET Roll Number</label>
                    <Input placeholder="e.g., NET2024-78451" value={educational.net_roll_no} onChange={(e) => setFormData({ educational: { ...educational, net_roll_no: e.target.value } })} />
                  </div>
                  <div className="sm:col-span-4">
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">NET Score / Rank</label>
                    <Input placeholder="e.g., JRF Qualified - Rank 42" value={educational.net_score} onChange={(e) => setFormData({ educational: { ...educational, net_score: e.target.value } })} />
                  </div>
                </>
              )}
              {schemeId === "NOS" && (
                <div className="sm:col-span-4">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">QS World Ranking</label>
                  <Input type="number" placeholder="e.g., 13" value={educational.qs_ranking || ""} onChange={(e) => setFormData({ educational: { ...educational, qs_ranking: Number(e.target.value) || null } })} />
                </div>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-sm font-semibold text-foreground">Upload Documents</h3>
            <p className="text-xs text-muted-foreground">
              Securely upload or fetch your documents via DigiLocker. Our AI will automatically verify them.
            </p>
            <div className="mt-4">
              <DocumentUploader
                documents={[]}
                onUpload={() => {}}
                requiredDocTypes={schemeId === "NOS" ? ["caste_cert", "income_cert", "admission_letter"] : ["caste_cert", "admission_letter"]}
                applicationId="new-app"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fadeIn py-4">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold font-fraunces text-foreground">Application Submitted</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Your application has been securely screened by our AI verification engine.
              </p>
            </div>

            <div className="mt-8 p-5 rounded-2xl bg-secondary/30 border border-border shadow-sm">
              <div className="flex justify-between items-center mb-3 pb-3 border-b border-border/50">
                <span className="font-bold text-foreground">AI Merit Score</span>
                <span className="font-black text-2xl text-[#4A6753] dark:text-[#6BA374]">
                  95 <span className="text-sm font-normal text-muted-foreground">/ 100</span>
                </span>
              </div>
              <div className="text-sm text-muted-foreground mt-3 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-[#4A6753] dark:text-[#6BA374]" />
                <span>All documents verified successfully. Application meets MoTA eligibility criteria.</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      {step < 3 ? (
        <div className="flex items-center justify-between pt-4">
          <Button variant="outline" className="rounded-full px-6 h-12 font-bold" onClick={() => setFormStep(Math.max(0, step - 1))} disabled={step === 0}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <div className="flex items-center gap-2">
            {step < 2 ? (
              <Button className="rounded-full px-8 h-12 font-bold bg-foreground text-background hover:bg-foreground/90" onClick={() => setFormStep(step + 1)} disabled={!canNext()}>
                Next <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button className="rounded-full px-8 h-12 font-bold bg-[#D59441] text-white hover:bg-[#C28537]" onClick={handleSubmit} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                {submitting ? "Submitting..." : "Submit Application"}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex justify-center pt-4">
          <Button 
            className="rounded-full px-12 h-12 font-bold bg-foreground text-background hover:bg-foreground/90" 
            onClick={() => {
              setFormStep(0);
              useAppStore.getState().setSelectedScheme(null);
              onComplete();
            }}
          >
            Go to Track Dashboard
          </Button>
        </div>
      )}
    </div>
  );
}
