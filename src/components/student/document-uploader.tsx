"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FileSearch
} from "lucide-react";
import { cn, getDocTypeLabel } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DigiLockerConnector } from "./digilocker-connector";
import { AiLoadingState } from "@/components/lightswind/ai-loading-state";
import type { Document, DocType } from "@/lib/types";

interface DocumentUploaderProps {
  documents: Document[];
  onUpload: (doc: Document) => void;
  requiredDocTypes?: DocType[];
  applicationId?: string;
}

export function DocumentUploader({ documents, onUpload, requiredDocTypes, applicationId = "app-1" }: DocumentUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResult, setScanResult] = useState<{ doc: Document; extracted: Record<string, string> } | null>(null);

  const simulateScan = useCallback(
    async (file: File, docType: DocType) => {
      setScanning(true);
      setScanProgress(10);
      setScanResult(null);

      const fallbackDoc: Document = {
        id: `doc-fb-${Date.now()}`,
        application_id: applicationId,
        doc_type: docType,
        file_name: file.name,
        file_url: URL.createObjectURL(file),
        quality_score: 85,
        ocr_extracted_payload: { raw_text: "Fallback OCR mock data used." },
        is_valid: true,
        defect_reason: null,
      };

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("docType", docType);

        const interval = setInterval(() => setScanProgress(p => Math.min(p + 15, 80)), 500);

        const res = await fetch("/api/documents/process", { method: "POST", body: formData });
        
        clearInterval(interval);
        setScanProgress(90);

        if (!res.ok) {
          console.warn(`[DocumentUploader] API returned ${res.status}. Using fallback.`);
          setScanning(false);
          setScanResult({ doc: fallbackDoc, extracted: fallbackDoc.ocr_extracted_payload as Record<string, string> });
          onUpload(fallbackDoc);
          return;
        }

        const data = await res.json();
        setScanProgress(100);

        const newDoc: Document = {
          ...fallbackDoc,
          quality_score: data.qualityScore,
          ocr_extracted_payload: data.extractedData,
          is_valid: !data.defectReason,
          defect_reason: data.defectReason || null,
        };

        setTimeout(() => {
          setScanning(false);
          setScanResult({
            doc: newDoc,
            extracted: Object.fromEntries(
              Object.entries(data.extractedData as Record<string, string>)
                .filter(([, v]) => v != null && v !== "")
                .map(([k, v]) => [k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), String(v)])
            ),
          });
          onUpload(newDoc);
        }, 500);
      } catch (err) {
        console.warn("[DocumentUploader] OCR fetch failed. Using fallback.", err);
        setScanning(false);
        setScanProgress(100);
        setScanResult({ doc: fallbackDoc, extracted: fallbackDoc.ocr_extracted_payload as Record<string, string> });
        onUpload(fallbackDoc);
      }
    },
    [applicationId, onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        const types: DocType[] = requiredDocTypes || ["income_cert", "caste_cert", "admission_letter"];
        const existing = documents.map((d) => d.doc_type);
        const next = types.find((t) => !existing.includes(t)) || types[0];
        simulateScan(files[0], next);
      }
    },
    [documents, requiredDocTypes, simulateScan]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, docType: DocType) => {
      const files = e.target.files;
      if (files && files.length > 0) simulateScan(files[0], docType);
    },
    [simulateScan]
  );

  const types = requiredDocTypes || ["income_cert", "caste_cert", "admission_letter"];
  const existingTypes = documents.map((d) => d.doc_type);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingDocType = useRef<DocType>(types[0]);

  const getNextDocType = () => {
    const existing = documents.map((d) => d.doc_type);
    return types.find((t) => !existing.includes(t)) || types[0];
  };

  const handleDigiLockerExtract = useCallback((extractedDoc: { name: string; data: Record<string, string> }) => {
    let docType: DocType = "photo";
    if (extractedDoc.name.toLowerCase().includes("income")) docType = "income_cert";
    if (extractedDoc.name.toLowerCase().includes("caste")) docType = "caste_cert";
    if (extractedDoc.name.toLowerCase().includes("marksheet") || extractedDoc.name.toLowerCase().includes("degree")) docType = "marksheets";

    const newDoc: Document = {
      id: `doc-dl-${Date.now()}`,
      application_id: applicationId,
      doc_type: docType,
      file_name: `DigiLocker_${extractedDoc.name}.pdf`,
      file_url: "#digilocker-verified",
      quality_score: 100,
      ocr_extracted_payload: extractedDoc.data,
      is_valid: true,
      defect_reason: null,
    };

    setScanResult({ doc: newDoc, extracted: extractedDoc.data });
    onUpload(newDoc);
  }, [applicationId, onUpload]);

  return (
    <div className="space-y-6">
      <DigiLockerConnector onDocumentExtracted={handleDigiLockerExtract} />
      
      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-border"></div>
        <span className="flex-shrink-0 mx-4 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Or Secure Manual Upload</span>
        <div className="flex-grow border-t border-border"></div>
      </div>

      <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => { const files = e.target.files; if (files && files.length > 0) simulateScan(files[0], pendingDocType.current); e.target.value = ""; }} />
      
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => { if (!scanning) { pendingDocType.current = getNextDocType(); fileInputRef.current?.click(); }}}
        className={cn(
          "group relative overflow-hidden rounded-[1.25rem] border border-dashed p-10 text-center transition-all duration-300 ease-in-out cursor-pointer flex flex-col items-center justify-center min-h-[200px]",
          dragOver ? "border-emerald-700 bg-emerald-700/5 scale-[1.02]" : "border-border/50 hover:border-foreground/40 hover:bg-secondary/30",
          scanning && "border-emerald-700 bg-emerald-700/5 cursor-wait"
        )}
      >
        {scanning ? (
          <div className="space-y-6 animate-in fade-in zoom-in duration-300 relative z-10 flex flex-col items-center justify-center py-6">
            <AiLoadingState 
              label={`Scanning ${getDocTypeLabel(pendingDocType.current || "caste_cert")}...`}
              variant="CyberCore"
              theme="glass"
              size="lg"
            />
            <div className="max-w-[240px] w-full mx-auto space-y-2">
              <Progress value={scanProgress} className="h-1.5" />
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{scanProgress}% Complete</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 relative z-10 transition-transform duration-300 group-hover:-translate-y-1">
            <div className="mx-auto h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors duration-300">
              <UploadCloud className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground tracking-tight">Click to browse or drag and drop</p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">Supports PDF, JPG, PNG (Max 5MB)</p>
            </div>
          </div>
        )}
        
        {/* Decorative background pattern */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-foreground to-transparent dark:from-foreground/20" />
      </div>

      {scanResult && (
        <div className="rounded-xl border border-border bg-card shadow-sm p-5 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <span className="text-sm font-bold text-foreground tracking-tight block">Scan Complete</span>
                <span className="text-xs text-muted-foreground font-medium truncate max-w-[200px] block">{scanResult.doc.file_name}</span>
              </div>
            </div>
            <div className="flex flex-col sm:items-end gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Confidence</span>
              <Badge variant="success" className="rounded-full px-2.5 shadow-sm">
                {scanResult.doc.quality_score}% Match
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            {Object.entries(scanResult.extracted).slice(0, 6).map(([key, value]) => (
              <div key={key} className="bg-secondary/40 rounded-lg p-3">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{key}</p>
                <p className="text-xs font-semibold text-foreground truncate" title={String(value)}>{value}</p>
              </div>
            ))}
          </div>
          
          <Button variant="ghost" onClick={() => setScanResult(null)} className="w-full text-xs font-semibold tracking-wide border border-border hover:bg-secondary h-9">
            Confirm & Continue
          </Button>
        </div>
      )}

      {documents.length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-widest border-b border-border pb-2">Verified Documents</h4>
          <div className="grid gap-2">
            {documents.map((doc) => (
              <div key={doc.id} className={cn("flex items-center justify-between p-3 rounded-xl border transition-all shadow-sm overflow-hidden", doc.is_valid ? "bg-card border-border" : "bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900")}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0", doc.is_valid ? "bg-secondary" : "bg-red-100 dark:bg-red-900/50")}>
                    {doc.is_valid ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <AlertTriangle className="h-5 w-5 text-red-500" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground tracking-tight leading-none mb-1.5 truncate" title={getDocTypeLabel(doc.doc_type)}>{getDocTypeLabel(doc.doc_type)}</p>
                    <p className="text-[10px] text-muted-foreground font-medium truncate" title={doc.file_name}>{doc.file_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <Badge variant={doc.is_valid ? "secondary" : "destructive"} className="text-[10px] font-semibold h-6 px-2">
                    {doc.is_valid ? "Verified" : "Rejected"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4 flex gap-2 flex-wrap justify-center">
        {types.map((type) => {
          const uploaded = existingTypes.includes(type);
          return (
            <label key={type}>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => handleFileSelect(e, type)} />
              <Button variant={uploaded ? "outline" : "default"} size="sm" className="text-xs h-8 cursor-pointer rounded-full font-semibold shadow-sm" asChild>
                <span>{uploaded ? "Re-upload" : "Upload"} {getDocTypeLabel(type)}</span>
              </Button>
            </label>
          );
        })}
      </div>
    </div>
  );
}
