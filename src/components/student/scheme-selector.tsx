"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { schemes } from "@/lib/data/mock-data";
import type { SchemeId } from "@/lib/types";

interface SchemeSelectorProps {
  onSelect: (schemeId: SchemeId) => void;
  selected: SchemeId | null;
}
import { ArrowLeft } from "lucide-react";

export function SchemeSelector({ onSelect, selected }: SchemeSelectorProps) {
  const [selectedSchemeForDetail, setSelectedSchemeForDetail] = React.useState<string | null>(null);

  if (selectedSchemeForDetail) {
    const scheme = schemes.find((s) => s.id === selectedSchemeForDetail);
    if (!scheme) return null;

    const isNOS = scheme.id === "NOS";
    const amount = isNOS ? "₹39,00,000 / year" : "₹4,50,000 / year";
    const eligibilityStr = `ST • ${scheme.eligibility_rules.income_limit ? `Income < ₹${(scheme.eligibility_rules.income_limit/100000)}L` : 'No income cap'}`;
    const deadline = "4 days left";

    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300">
        <button 
          onClick={() => setSelectedSchemeForDetail(null)} 
          className="text-sm font-bold text-muted-foreground mb-4 hover:text-foreground flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Explore
        </button>
        
        {/* Banner */}
        <div className="relative h-36 md:h-48 rounded-[2rem] bg-gradient-to-r from-[#596D3A] via-[#3B5034] to-[#1E332D] dark:from-[#9BB562] dark:via-[#74A26C] dark:to-[#619A70] p-6 md:p-8 flex flex-col justify-end overflow-hidden mb-8 shadow-md">
          {/* Concentric circles decoration */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none translate-x-1/4">
            <div className="h-40 w-40 md:h-64 md:w-64 rounded-full border-[1px] border-white flex items-center justify-center">
              <div className="h-24 w-24 md:h-40 md:w-40 rounded-full border-[1px] border-white" />
            </div>
          </div>
          <h2 className="text-white text-2xl md:text-3xl font-fraunces font-bold relative z-10 max-w-[80%]">{scheme.scheme_name}</h2>
        </div>

        {/* Details Table */}
        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <span className="text-muted-foreground font-medium text-sm md:text-base">Amount</span>
            <span className="font-bold text-foreground text-sm md:text-base">{amount}</span>
          </div>
          <div className="flex justify-between items-center border-b border-border pb-3">
            <span className="text-muted-foreground font-medium text-sm md:text-base">Eligibility</span>
            <span className="font-bold text-foreground text-sm md:text-base">{eligibilityStr}</span>
          </div>
          <div className="flex justify-between items-center border-b border-border pb-3">
            <span className="text-muted-foreground font-medium text-sm md:text-base">Deadline</span>
            <span className="font-bold text-[#CD5938] dark:text-[#E87555] text-sm md:text-base">{deadline}</span>
          </div>
        </div>

        {/* Documents Needed */}
        <div className="mb-10">
          <h3 className="text-xl md:text-2xl font-bold font-fraunces text-foreground mb-5">Documents needed</h3>
          <ul className="space-y-4">
            {[
              { label: "Caste certificate", done: true },
              { label: "Income certificate", done: true },
              { label: "Bonafide student letter", done: false },
              { label: "Aadhaar-linked bank passbook", done: false },
            ].map((doc, i) => (
              <li key={i} className="flex items-center gap-4">
                <div className={cn(
                  "h-6 w-6 md:h-7 md:w-7 rounded-lg flex items-center justify-center shrink-0 border transition-colors", 
                  doc.done ? "bg-[#3B5034] dark:bg-[#6CA071] border-[#3B5034] dark:border-[#6CA071]" : "bg-card dark:bg-transparent border-border dark:border-[#2A3F64] shadow-sm dark:shadow-none"
                )}>
                </div>
                <span className="text-foreground text-sm md:text-base font-medium">{doc.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <button 
          onClick={() => onSelect(scheme.id)}
          className="w-full bg-[#E5A145] hover:bg-[#d6953f] text-[#1B2A4A] font-extrabold py-4 md:py-5 rounded-[1.25rem] shadow-sm transition-all text-base md:text-lg hover:shadow-md"
        >
          Continue application
        </button>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {schemes.map((scheme) => {
        const isNOS = scheme.id === "NOS";
        const isSelected = selected === scheme.id;

        return (
          <Card
            key={scheme.id}
            onClick={() => setSelectedSchemeForDetail(scheme.id)}
            className={cn(
              "w-full text-left relative overflow-hidden shadow-sm transition-all cursor-pointer hover:border-primary/50 hover:shadow-md",
              isSelected ? "border-primary bg-primary/5" : "border-border bg-card"
            )}
          >
            {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary" />}
            
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-fraunces font-semibold max-w-[70%]">{scheme.scheme_name}</CardTitle>
                <Badge variant={isNOS ? "default" : "secondary"}>
                  {isNOS ? "Overseas" : "India"}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {scheme.description}
              </p>
              
              <div className="flex flex-wrap gap-2">
                {scheme.eligibility_rules.income_limit !== null && (
                  <Badge variant="outline" className="text-[10px] font-bold">
                    Income &le; {(scheme.eligibility_rules.income_limit / 100000).toFixed(0)}L
                  </Badge>
                )}
                {scheme.eligibility_rules.net_required && (
                  <Badge variant="outline" className="text-[10px] font-bold">
                    UGC-NET Required
                  </Badge>
                )}
                {scheme.eligibility_rules.qs_rank_required && (
                  <Badge variant="outline" className="text-[10px] font-bold">
                    QS Top 1000
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
