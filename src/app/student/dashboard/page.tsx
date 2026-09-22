"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FileText, AlertCircle, Clock, CheckCircle2, Award, Home, FilePlus, FolderUp, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AiChatbot } from "@/components/ui/ai-chatbot";
import { MessageSquare, Download, ArrowLeft } from "lucide-react";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose } from "@/components/ui/drawer";

// Components
import { SchemeSelector } from "@/components/student/scheme-selector";
import { ApplicationForm } from "@/components/student/application-form";
import { StatusTracker } from "@/components/student/status-tracker";
import { DocumentUploader } from "@/components/student/document-uploader";
import { DigiLockerConnector } from "@/components/student/digilocker-connector";
import { ActionAlerts } from "@/components/student/action-alerts";
import { NotificationBell } from "@/components/student/notification-bell";

// Store & Engines
import { useAppStore } from "@/lib/store";
import { getStatusLabel, formatDate, getDocTypeLabel } from "@/lib/utils";
import { getRequiredDocTypes } from "@/lib/engines/ocr-engine";
import { evaluateSchemeEligibility } from "@/lib/engines/verification-engine";
import { calculateMeritScores } from "@/lib/engines/merit-engine";
import { generateNotification } from "@/lib/services/notifications";
import type { SchemeId } from "@/lib/types";
import { schemes as allSchemes } from "@/lib/data/mock-data";

function StudentDashboardInner() {
  const searchParams = useSearchParams();
  const { applications, documents, addDocument, demoMode, selectedScheme, setSelectedScheme, setFormStep, currentUser, formData } = useAppStore();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "overview");
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [selectedTrackAppId, setSelectedTrackAppId] = useState<string | null>(null);

  const handleSchemeSelect = (schemeId: SchemeId) => {
    setSelectedScheme(schemeId);
    setFormStep(0);
  };

  const myApps = currentUser 
    ? applications.filter((a) => a.user_id === currentUser.id) 
    : demoMode.enabled 
      ? applications.filter((a) => a.id.startsWith("demo-app") || a.id.startsWith("app-new-"))
      : applications.filter((a) => a.id.startsWith("app-new-")); // Show newly created app for guest

  const currentApp = myApps[0];
  const appDocs = documents.filter((d) => d.application_id === currentApp?.id);
  const currentScheme = allSchemes.find((s) => s.id === (currentApp?.scheme_id || selectedScheme));
  const requiredDocs = currentScheme ? getRequiredDocTypes(currentScheme.id) : [];

  let firstName = "Guest";
  if (currentApp?.applicant_name) firstName = currentApp.applicant_name.split(' ')[0];
  else if (currentUser?.full_name) firstName = currentUser.full_name.split(' ')[0];
  else if (demoMode.scenario === "valid_nos") firstName = "Priya";
  else if (demoMode.scenario === "nfst_pvtg") firstName = "Lakshmi";
  else if (demoMode.scenario === "deficient") firstName = "Rahul";

  // The 4 main views
  const renderOverview = () => {
    if (!currentApp && !selectedScheme) {
      return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
          
          <div className="space-y-4">
            <h2 className="text-2xl font-bold font-fraunces text-foreground">Available Schemes for ST Students</h2>
            <p className="text-muted-foreground text-sm">Select a scheme below to view its eligibility criteria and begin your application.</p>
            <SchemeSelector 
              onSelect={(schemeId) => {
                handleSchemeSelect(schemeId);
                setActiveTab("application");
              }} 
              selected={selectedScheme} 
            />
          </div>

          <div className="border-t border-border pt-10 space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-full bg-white overflow-hidden flex items-center justify-center border border-border shadow-sm shrink-0">
                <img src="/logo.jpg" alt="Medhavi Logo" className="h-full w-full object-cover" />
              </div>
              <div>
                <h2 className="text-2xl font-bold font-fraunces text-foreground">About Medhavi Portal</h2>
                <p className="text-sm font-medium text-muted-foreground">Ministry of Tribal Affairs (MoTA)</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 text-sm">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-foreground mb-1 text-base">What is this portal?</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Medhavi is an advanced, AI-driven scholarship management platform developed for the Ministry of Tribal Affairs. It completely digitizes the application, verification, and disbursement processes for MoTA schemes.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1 text-base">For whom is this portal?</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    This platform is specifically built for Scheduled Tribe (ST) students across India applying for various educational empowerment schemes like the National Overseas Scholarship (NOS) and National Fellowship (NFST).
                  </p>
                </div>
              </div>
              
              <div className="bg-secondary/30 p-5 rounded-xl border border-border">
                <h3 className="font-bold text-foreground mb-3 text-base">Key Features</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground leading-snug"><strong className="text-foreground">AI Verification:</strong> Uploaded documents are automatically validated for authenticity and quality.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground leading-snug"><strong className="text-foreground">DigiLocker Integration:</strong> Pull verified documents directly from your DigiLocker.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground leading-snug"><strong className="text-foreground">Real-time Updates:</strong> Get instant action alerts and track the progress of your application live.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (currentApp) {
      let progressPercent = 65;
      if (currentApp.status === "ai_verified" || currentApp.status === "official_review") progressPercent = 65;
      else if (currentApp.status === "submitted") progressPercent = 35;
      else if (currentApp.status === "approved" || currentApp.status === "official_approved") progressPercent = 90;
      else if (currentApp.status === "disbursed") progressPercent = 100;

      return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">GOOD MORNING</p>
              <h2 className="text-2xl md:text-3xl font-fraunces font-bold text-foreground leading-tight">{firstName}</h2>
            </div>
            {/* The notification bell is already in the global header, but we can leave this space empty to match layout or add a mobile-only bell if needed. */}
          </div>

          {currentApp.status !== "disbursed" && (
            <div className="bg-[#131D34] text-[#EDF0F8] rounded-[2rem] p-6 md:p-8 flex justify-between items-center shadow-lg">
              <div>
                <p className="text-[10px] md:text-xs font-bold tracking-widest text-[#8B9AB5] uppercase mb-1.5">{currentScheme?.scheme_name || currentApp.scheme_id}</p>
                <h2 className="text-3xl md:text-4xl font-fraunces font-bold">{getStatusLabel(currentApp.status)}</h2>
              </div>
              <div className="relative h-16 w-16 md:h-20 md:w-20 shrink-0">
                <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                  <path className="text-white/10" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                  <path className="text-[#F0B15A]" strokeDasharray={`${progressPercent}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs md:text-sm font-bold text-white">{progressPercent}%</div>
              </div>
            </div>
          )}

          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl md:text-2xl font-bold font-fraunces leading-tight max-w-[80%]">{currentScheme?.scheme_name}</CardTitle>
                  <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Application Progress</p>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-2 py-1 rounded-md shrink-0">{currentApp.application_no}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="scale-90 sm:scale-100 origin-left">
                <StatusTracker currentStatus={currentApp.status} />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <Card className="flex flex-col items-center justify-center text-center p-6 shadow-sm">
              <p className="text-2xl md:text-4xl font-extrabold text-foreground mb-1 md:mb-2">{appDocs.length}/{requiredDocs.length}</p>
              <p className="text-[9px] md:text-sm font-semibold text-muted-foreground uppercase tracking-widest leading-tight">Documents Uploaded</p>
            </Card>
            <Card className="flex flex-col items-center justify-center text-center p-6 shadow-sm">
              <p className="text-2xl md:text-4xl font-extrabold text-foreground mb-1 md:mb-2">{currentApp.ai_confidence_score}%</p>
              <p className="text-[9px] md:text-sm font-semibold text-muted-foreground uppercase tracking-widest leading-tight">AI Confidence</p>
            </Card>
          </div>
        </div>
      );
    }
  };

  const renderApplication = () => {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {(!currentApp && !selectedScheme) ? (
          <div>
            <h2 className="text-2xl md:text-3xl font-bold font-fraunces text-foreground mb-6">Explore Schemes</h2>
            <SchemeSelector onSelect={handleSchemeSelect} selected={selectedScheme} />
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold font-fraunces text-foreground">Application Form</h2>
              {!currentApp && <button onClick={() => setSelectedScheme(null)} className="text-[10px] md:text-sm font-bold text-muted-foreground hover:text-foreground">Change Scheme</button>}
            </div>
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              {currentScheme && <ApplicationForm schemeId={currentScheme.id} onComplete={() => setActiveTab("track")} />}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTrack = () => {
    if (myApps.length === 0) {
      return (
        <div className="text-center py-20 text-muted-foreground font-medium text-sm">
          No applications submitted yet.
        </div>
      );
    }
    
    // DETAIL VIEW
    if (selectedTrackAppId) {
      const app = myApps.find((a) => a.id === selectedTrackAppId);
      if (!app) return null;
      
      const scheme = allSchemes.find((s) => s.id === app.scheme_id);
      const appDocsList = documents.filter((d) => d.application_id === app.id);
      
      const createdAtStr = new Date(app.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
      const isAiVerified = app.status === "ai_verified" || app.status === "official_review" || app.status === "official_approved" || app.status === "disbursed";
      const isDeficient = app.status === "deficiency_flagged" || app.status === "deficiency";
      const isOfficialReview = app.status === "official_review" || app.status === "official_approved" || app.status === "disbursed";
      const isDisbursed = app.status === "disbursed";

      const docDefects = appDocsList.filter(d => !d.is_valid && d.defect_reason);
      const meritScore = app.ai_confidence_score > 0 ? app.ai_confidence_score : 95; // Mock 95 if 0 for demo purposes

      const timeline = [
        {
          title: "Application submitted",
          subtitle: createdAtStr,
          done: true,
        },
        {
          title: isDeficient ? "Action Required" : "Verified by AI",
          subtitle: isDeficient ? "Document correction needed" : (isAiVerified ? "Verified successfully" : "Pending"),
          done: isAiVerified || isDeficient,
          isError: isDeficient,
          content: (isAiVerified || isDeficient) ? (
            <div className="mt-3 p-4 rounded-xl bg-secondary/20 border border-border text-sm shadow-sm">
              <div className="flex justify-between items-center mb-2 pb-2 border-b border-border/50">
                <span className="font-bold text-foreground">AI Merit Score</span>
                <span className={cn("font-black text-lg", meritScore >= 80 ? "text-[#4A6753] dark:text-[#6BA374]" : "text-amber-600")}>
                  {meritScore} <span className="text-xs font-normal text-muted-foreground">/ 100</span>
                </span>
              </div>
              {isDeficient && docDefects.length > 0 ? (
                <div className="text-amber-700 dark:text-amber-500 mt-2 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span><strong>AI Note:</strong> {docDefects[0].defect_reason}</span>
                </div>
              ) : (
                <div className="text-muted-foreground mt-2 flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-[#4A6753] dark:text-[#6BA374]" />
                  <span>Application securely screened and meets all MoTA eligibility requirements. Passed to district welfare office.</span>
                </div>
              )}
            </div>
          ) : null
        },
        {
          title: "With district welfare office",
          subtitle: isOfficialReview ? (isDisbursed ? "Approved" : "In progress · usually 5-7 days") : "Pending",
          done: isOfficialReview
        },
        {
          title: "Amount disbursed",
          subtitle: isDisbursed ? "Completed" : "Pending",
          done: isDisbursed
        }
      ];

      return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300 pb-10">
          <button 
            onClick={() => setSelectedTrackAppId(null)} 
            className="text-sm font-bold text-muted-foreground mb-6 hover:text-foreground flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to applications
          </button>

          <div className="space-y-8">
            <h2 className="text-2xl md:text-3xl font-bold font-fraunces text-[#1B2A4A] dark:text-foreground">
              {scheme?.scheme_name || "Scholarship"}
            </h2>
            
            {/* Vertical Timeline */}
            <div className="space-y-0">
              {timeline.map((stage, idx) => (
                <div key={idx} className="flex gap-4 relative pb-8">
                  {idx < timeline.length - 1 && (
                    <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-[#E5D5C1] dark:bg-[#1e2a45] z-0" />
                  )}
                  <div className="relative z-10 pt-1 shrink-0">
                    <div className={cn(
                      "h-6 w-6 rounded-full border-2 flex items-center justify-center bg-background", 
                      stage.done 
                        ? (stage.isError ? "border-amber-600" : "border-[#4A6753] dark:border-[#6BA374]") 
                        : "border-[#E5D5C1] dark:border-[#1e2a45]"
                    )}>
                      {stage.done && <div className={cn("h-3 w-3 rounded-full", stage.isError ? "bg-amber-600" : "bg-[#4A6753] dark:bg-[#6BA374]")} />}
                    </div>
                  </div>
                  <div className="pt-1 w-full">
                    <h4 className={cn("font-bold text-sm md:text-base", stage.done ? (stage.isError ? "text-amber-700" : "text-[#1B2A4A] dark:text-foreground") : "text-muted-foreground")}>{stage.title}</h4>
                    <p className="text-xs md:text-sm text-muted-foreground mt-0.5">{stage.subtitle}</p>
                    {stage.content && <div className="mt-2">{stage.content}</div>}
                  </div>
                </div>
              ))}
            </div>

            {/* Uploaded Documents */}
            <div className="pt-2">
              <h3 className="text-xl font-bold font-fraunces text-[#1B2A4A] dark:text-foreground mb-4">Uploaded documents</h3>
              {appDocsList.length === 0 ? (
                <p className="text-sm text-muted-foreground">No documents found.</p>
              ) : (
                <div className="space-y-3">
                  {appDocsList.map((doc) => {
                    const isVerified = doc.is_valid;
                    return (
                      <div key={doc.id} className="bg-card dark:bg-[#131D34] rounded-2xl border border-[#E5D5C1] dark:border-[#1e2a45] px-5 py-4 flex flex-wrap gap-2 items-center justify-between shadow-sm">
                        <span className="font-bold text-sm md:text-base text-[#1B2A4A] dark:text-foreground">{getDocTypeLabel(doc.doc_type)}</span>
                        <span className={cn(
                          "text-xs font-bold px-3 py-1 rounded-full",
                          isVerified 
                            ? "bg-[#E6F0E9] text-[#3B5034] dark:bg-[#D9EBD8] dark:text-[#3B5034]" 
                            : (doc.defect_reason ? "bg-red-100 text-red-800" : "bg-[#F3EBE1] text-[#7A6348] dark:bg-[#1e2a45] dark:text-[#8B9AB5]")
                        )}>
                          {isVerified ? "Verified" : (doc.defect_reason ? "Action needed" : "In review")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // LIST VIEW
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
        <h2 className="text-2xl md:text-3xl font-bold font-fraunces text-foreground mb-4">Track Applications</h2>
        <div className="space-y-4">
          {myApps.map((app) => {
            const scheme = allSchemes.find((s) => s.id === app.scheme_id);
            const isDeficient = app.status === "deficiency_flagged" || app.status === "deficiency";
            
            let statusText = getStatusLabel(app.status);
            if (isDeficient) statusText = "Action needed";
            else if (app.status === "disbursed") statusText = "Disbursed";
            else statusText = "In review";

            return (
              <button 
                key={app.id} 
                onClick={() => setSelectedTrackAppId(app.id)}
                className="w-full text-left bg-card dark:bg-[#131D34] border border-[#E5D5C1] dark:border-[#1e2a45] rounded-2xl overflow-hidden flex items-stretch shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
              >
                {/* Left Green Bar Indicator */}
                <div className={cn("w-1.5 shrink-0", isDeficient ? "bg-amber-500" : "bg-[#4A6753] dark:bg-[#6BA374]")} />
                
                <div className="p-5 flex-1 flex justify-between items-start gap-4">
                  <h3 className="font-fraunces font-bold text-lg md:text-xl text-[#1B2A4A] dark:text-foreground leading-tight">
                    {scheme?.scheme_name || "Scholarship"}
                  </h3>
                  <span className={cn(
                    "text-xs md:text-sm font-bold shrink-0",
                    isDeficient ? "text-amber-600 dark:text-amber-400" : "text-[#4A6753] dark:text-[#6BA374]"
                  )}>
                    {statusText}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderAccount = () => {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
        
        {/* Profile Header */}
        <div className="flex items-center gap-5">
          <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-amber-400 to-emerald-600 overflow-hidden shadow-md shrink-0 flex items-center justify-center group cursor-pointer border-4 border-background">
            <User className="h-10 w-10 text-white/50" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-[10px] font-bold uppercase">Add Photo</span>
            </div>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold font-fraunces text-foreground">
              {currentApp?.applicant_name || currentUser?.full_name || "Guest User"}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {formData.educational.course_type && formData.educational.university_name ? (
                `${formData.educational.course_type} · ${formData.educational.university_name}`
              ) : (
                currentApp?.email || currentUser?.email || "guest@example.com"
              )}
            </p>
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => { useAppStore.getState().resetDemo(); window.location.href = "/"; }}>
            Log out
          </Button>
        </div>

        {currentApp && (
          <div className="pt-2">
            <h2 className="text-xl md:text-2xl font-bold font-fraunces text-foreground mb-4">Action Alerts</h2>
            <ActionAlerts documents={appDocs} />
          </div>
        )}

        {appDocs.length > 0 && (
          <div className="pt-4 border-t border-border">
            <h2 className="text-xl md:text-2xl font-bold font-fraunces text-foreground mb-6">Saved documents</h2>
            <div className="space-y-3">
              {appDocs.map((doc) => (
                <div key={doc.id} className="bg-card rounded-xl border border-border px-4 py-3 flex items-center justify-between shadow-sm">
                  <span className="font-bold text-sm text-foreground">{getDocTypeLabel(doc.doc_type)}</span>
                  <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full", doc.is_valid ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400")}>
                    {doc.is_valid ? "Verified" : "Re-upload needed"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {myApps.length > 0 && (
          <div className="pt-4 border-t border-border">
            <h2 className="text-xl md:text-2xl font-bold font-fraunces text-foreground mb-6">Applications this year</h2>
            <div className="space-y-4">
              {myApps.map((app) => {
                const scheme = allSchemes.find((s) => s.id === app.scheme_id);
                const schemeTitle = scheme?.scheme_name || app.scheme_id;
                let statusColor = "text-muted-foreground";
                let borderColor = "border-border";
                let bgSide = "bg-border";
                
                if (app.status === "approved" || app.status === "official_approved" || app.status === "disbursed") {
                  statusColor = "text-emerald-700 dark:text-emerald-400";
                  borderColor = "border-emerald-200 dark:border-emerald-900";
                  bgSide = "bg-emerald-500";
                } else if (app.status === "official_review" || app.status === "ai_verified" || app.status === "submitted") {
                  statusColor = "text-blue-700 dark:text-blue-400";
                  borderColor = "border-blue-200 dark:border-blue-900";
                  bgSide = "bg-blue-500";
                } else if (app.status === "deficiency_flagged" || app.status === "deficiency") {
                  statusColor = "text-amber-700 dark:text-amber-400";
                  borderColor = "border-amber-200 dark:border-amber-900";
                  bgSide = "bg-amber-500";
                } else if (app.status === "rejected") {
                  statusColor = "text-red-700 dark:text-red-400";
                  borderColor = "border-red-200 dark:border-red-900";
                  bgSide = "bg-red-500";
                }

                const appDocuments = documents.filter((d) => d.application_id === app.id);
                let aiNotes = "All documents passed AI screening. Application is ready for official review.";
                if (app.status === "deficiency_flagged" || app.status === "deficiency") {
                  aiNotes = "AI detected issues with your documents during screening. Please review the scores and re-upload the flagged documents to proceed.";
                } else if (app.status === "rejected") {
                  aiNotes = "Application was rejected after failing AI and official review. Please ensure you meet all eligibility criteria.";
                }

                return (
                  <Drawer key={app.id}>
                    <DrawerTrigger asChild>
                      <button className={`w-full text-left bg-card rounded-xl border ${borderColor} shadow-sm overflow-hidden flex hover:shadow-md transition-shadow`}>
                        <div className={`w-2 ${bgSide} shrink-0`}></div>
                        <div className="flex-1 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-foreground font-fraunces text-lg">{schemeTitle}</h3>
                            <p className="text-xs text-muted-foreground mt-1">Application ID: {app.application_no}</p>
                            {app.status === "disbursed" && (
                              <p className="text-xs font-bold text-emerald-600 mt-2">
                                Amount Disbursed: {app.scheme_id === "NOS" ? "₹39,00,000" : "₹4,50,000"}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${statusColor}`}>
                              {getStatusLabel(app.status)}
                            </span>
                          </div>
                        </div>
                      </button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader className="border-b px-6 py-4">
                        <DrawerTitle className="font-fraunces text-2xl">{schemeTitle}</DrawerTitle>
                        <DrawerDescription>Application Details & AI Screening Report</DrawerDescription>
                      </DrawerHeader>
                      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 max-h-[80vh]">
                        
                        {/* Submitted Fields */}
                        <div>
                          <h3 className="text-lg font-bold font-fraunces mb-4 text-foreground flex items-center gap-2"><FileText className="h-5 w-5" /> Submitted Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="p-3 bg-secondary/30 rounded-lg border">
                              <p className="text-xs text-muted-foreground mb-1">Applicant Name</p>
                              <p className="font-medium">{app.applicant_name}</p>
                            </div>
                            <div className="p-3 bg-secondary/30 rounded-lg border">
                              <p className="text-xs text-muted-foreground mb-1">University / Institute</p>
                              <p className="font-medium">{app.university_name}</p>
                            </div>
                            <div className="p-3 bg-secondary/30 rounded-lg border">
                              <p className="text-xs text-muted-foreground mb-1">Course Type</p>
                              <p className="font-medium">{app.course_type}</p>
                            </div>
                            <div className="p-3 bg-secondary/30 rounded-lg border">
                              <p className="text-xs text-muted-foreground mb-1">Annual Income</p>
                              <p className="font-medium">₹{app.annual_income?.toLocaleString()}</p>
                            </div>
                            <div className="p-3 bg-secondary/30 rounded-lg border">
                              <p className="text-xs text-muted-foreground mb-1">Qualifying Marks</p>
                              <p className="font-medium">{app.qualifying_marks}%</p>
                            </div>
                            <div className="p-3 bg-secondary/30 rounded-lg border">
                              <p className="text-xs text-muted-foreground mb-1">NET Score/Rank</p>
                              <p className="font-medium">{app.net_qualification || "N/A"}</p>
                            </div>
                          </div>
                        </div>

                        {/* AI Screening Round */}
                        <div>
                          <h3 className="text-lg font-bold font-fraunces mb-4 text-foreground flex items-center gap-2"><Award className="h-5 w-5 text-indigo-500" /> AI Screening Round</h3>
                          
                          <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-xl p-5 mb-5">
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div>
                                <p className="font-bold text-indigo-900 dark:text-indigo-300">AI Confidence Score: {app.ai_confidence_score}%</p>
                                <p className="text-xs text-indigo-700/80 dark:text-indigo-400/80 mt-1">{aiNotes}</p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-bold text-sm text-foreground">Document Analysis</h4>
                            {appDocuments.length === 0 ? (
                              <p className="text-sm text-muted-foreground">No documents analyzed.</p>
                            ) : (
                              appDocuments.map((doc) => (
                                <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg bg-card gap-2">
                                  <div className="flex items-center gap-3">
                                    <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0", doc.is_valid ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600")}>
                                      {doc.is_valid ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold">{getDocTypeLabel(doc.doc_type)}</p>
                                      <p className="text-[10px] text-muted-foreground">Quality Score: {doc.quality_score}%</p>
                                    </div>
                                  </div>
                                  {!doc.is_valid && (
                                    <div className="sm:text-right bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded text-[11px] text-red-700 dark:text-red-400 max-w-xs">
                                      {doc.defect_reason}
                                    </div>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                      </div>
                    </DrawerContent>
                  </Drawer>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-32 bg-background text-foreground font-sans">
      
      {/* Header */}
      <div className="px-5 py-6 md:px-10 md:py-10 flex justify-between items-start max-w-5xl mx-auto">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="h-10 w-10 md:h-12 md:w-12 shrink-0 bg-white rounded-full overflow-hidden shadow-sm border border-border">
            <img src="/logo.jpg" alt="Medhavi Logo" className="h-full w-full object-cover" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold font-fraunces text-[#1B2A4A] dark:text-foreground tracking-tight">
              Medhavi
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {currentApp && (
            <span className="hidden sm:inline-flex px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-secondary text-foreground mr-1">
              {getStatusLabel(currentApp.status)}
            </span>
          )}
          <button 
            onClick={() => setChatbotOpen(true)}
            className="h-10 w-10 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center hover:bg-blue-600/20 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
          </button>
          <ThemeToggle />
          <NotificationBell notifications={appDocs.filter(d => !d.is_valid && d.defect_reason).map((d, i) => ({
            id: `alert-${d.id}`,
            user_id: currentApp?.user_id || "guest",
            type: "deficiency_flagged",
            title: "Action Required",
            body: d.defect_reason || "Document requires attention",
            created_at: new Date().toISOString(),
            read: false
          }))} />
        </div>
      </div>
      <AiChatbot hideTrigger forceOpen={chatbotOpen} onClose={() => setChatbotOpen(false)} />

      {/* Main Content Area */}
      <div className="px-5 md:px-10 max-w-5xl mx-auto">
        {/* Desktop Tabs */}
        <div className="hidden md:flex gap-8 border-b border-border mb-10 overflow-x-auto">
          <button onClick={() => setActiveTab("overview")} className={cn("pb-4 text-sm font-bold transition-all", activeTab === "overview" ? "border-b-2 border-foreground text-foreground" : "text-muted-foreground")}>Home</button>
          <button onClick={() => setActiveTab("application")} className={cn("pb-4 text-sm font-bold transition-all", activeTab === "application" ? "border-b-2 border-foreground text-foreground" : "text-muted-foreground")}>Explore</button>
          <button onClick={() => setActiveTab("track")} className={cn("pb-4 text-sm font-bold transition-all", activeTab === "track" ? "border-b-2 border-foreground text-foreground" : "text-muted-foreground")}>Track</button>
          <button onClick={() => setActiveTab("account")} className={cn("pb-4 text-sm font-bold transition-all flex items-center gap-2", activeTab === "account" ? "border-b-2 border-foreground text-foreground" : "text-muted-foreground")}>
            Profile
            {appDocs.some((d) => !d.is_valid) && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{appDocs.filter((d) => !d.is_valid).length}</span>}
          </button>
        </div>

        {/* Content */}
        {activeTab === "overview" && renderOverview()}
        {activeTab === "application" && renderApplication()}
        {activeTab === "track" && renderTrack()}
        {activeTab === "account" && renderAccount()}
      </div>

      {/* Floating Bottom Nav for Mobile */}
      <div className="md:hidden fixed bottom-6 inset-x-6 z-50">
        <div className="bg-card rounded-2xl shadow-xl border border-border px-6 py-4 flex justify-between items-center">
          <MobileNavItem icon={<Home />} label="Home" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
          <MobileNavItem icon={<FilePlus />} label="Explore" active={activeTab === "application"} onClick={() => setActiveTab("application")} />
          <MobileNavItem icon={<FolderUp />} label="Track" active={activeTab === "track"} onClick={() => setActiveTab("track")} />
          <MobileNavItem icon={<User />} label="Profile" active={activeTab === "account"} onClick={() => setActiveTab("account")} hasBadge={appDocs.some((d) => !d.is_valid)} />
        </div>
      </div>
    </div>
  );
}

function MobileNavItem({ icon, label, active, onClick, hasBadge }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, hasBadge?: boolean }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 relative">
      <div className={cn("transition-colors", active ? "text-foreground" : "text-muted-foreground")}>
        {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "h-6 w-6" })}
        {hasBadge && <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />}
      </div>
      <span className={cn("text-[10px] font-bold", active ? "text-foreground" : "text-muted-foreground")}>{label}</span>
    </button>
  );
}

export default function StudentDashboard() {
  return (
    <Suspense fallback={<div className="p-10 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-foreground border-t-transparent rounded-full" /></div>}>
      <StudentDashboardInner />
    </Suspense>
  );
}
