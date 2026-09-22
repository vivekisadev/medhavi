"use client";

import React, { useState } from "react";
import { Lock, FileText, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DigiDoc {
  name: string;
  uri: string;
  available: boolean;
  data?: Record<string, unknown>;
}

interface DigiLockerConnectorProps {
  onDocumentExtracted: (doc: { name: string; data: Record<string, string> }) => void;
}

export function DigiLockerConnector({ onDocumentExtracted }: DigiLockerConnectorProps) {
  const [connecting, setConnecting] = useState(false);
  const [documents, setDocuments] = useState<DigiDoc[] | null>(null);
  const [error, setError] = useState("");

  const handleConnect = async () => {
    setConnecting(true);
    setError("");
    try {
      const res = await fetch("/api/auth/digilocker?action=authorize&state=niyomi");
      const data = await res.json();
      if (data.authUrl) {
        window.open(data.authUrl, "_blank", "width=600,height=700");
        simulateDocumentFetch();
      }
    } catch {
      setError("Failed to connect to DigiLocker");
      setConnecting(false);
    }
  };

  const simulateDocumentFetch = () => {
    setTimeout(() => {
      const mockDocs: DigiDoc[] = [
        { name: "Aadhaar Card", uri: "dl://aadhaar", available: true, data: { name: "PRIYA SHARMA", dob: "15/06/2000", gender: "FEMALE", aadhaar_number: "XXXX XXXX 4521" } },
        { name: "Class X Marksheet", uri: "dl://class10", available: true, data: { name: "PRIYA SHARMA", school: "Govt Higher Secondary School, Hoshangabad", percentage: "89.2%", year: "2018" } },
        { name: "Caste Certificate", uri: "dl://caste", available: true, data: { name: "PRIYA SHARMA", caste: "Gond", category: "Scheduled Tribe", certificate_no: "CC-MP-2023-11203" } },
        { name: "Income Certificate", uri: "dl://income", available: true, data: { name: "RAJESH SHARMA", annual_income: "450000", issue_date: "2025-06-15", certificate_no: "IC-MP-2023-44821" } },
        { name: "Degree Certificate", uri: "dl://degree", available: false },
      ];
      setDocuments(mockDocs);
      setConnecting(false);
    }, 2000);
  };

  const handleExtract = (doc: DigiDoc) => {
    if (!doc.data) return;
    const normalized: Record<string, string> = {};
    for (const [key, val] of Object.entries(doc.data)) {
      normalized[key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())] = String(val);
    }
    onDocumentExtracted({ name: doc.name, data: normalized });
  };

  return (
    <Card className="animate-card-in">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-24 flex items-center justify-start shrink-0">
            <img src="/digilocker.png" alt="DigiLocker Logo" className="h-full w-full object-contain drop-shadow-sm" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground mt-1">Extract documents directly</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {!documents && !connecting && (
          <Button variant="outline" size="sm" onClick={handleConnect} className="w-full text-xs">
            <Lock className="h-3 w-3 mr-2" />
            Connect to Account
          </Button>
        )}

        {connecting && (
          <div className="flex items-center justify-center gap-2 py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Connecting to DigiLocker...</span>
          </div>
        )}

        {error && <p className="text-xs text-red-500 text-center">{error}</p>}

        {documents && (
          <div className="space-y-2">
            <p className="text-[10px] text-muted-foreground">Available documents from your DigiLocker:</p>
            {documents.map((doc) => (
              <div key={doc.uri} className="flex items-center justify-between p-2 rounded-md border bg-background">
                <div className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium">{doc.name}</span>
                </div>
                {doc.available ? (
                  <Button variant="ghost" size="sm" onClick={() => handleExtract(doc)} className="h-7 text-[10px]">
                    <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-500" /> Extract
                  </Button>
                ) : (
                  <Badge variant="secondary" className="text-[9px]">
                    <AlertTriangle className="h-2.5 w-2.5 mr-1" /> Not Available
                  </Badge>
                )}
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={() => { setDocuments(null); setConnecting(false); }} className="w-full text-[10px] text-muted-foreground">
              Disconnect
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
