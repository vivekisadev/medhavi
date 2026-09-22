"use client";

import React, { useState } from "react";
import { Settings, ToggleLeft, ToggleRight, Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SchemeRule } from "@/lib/data/scheme-rules";

export function RulesEditor({ initialRules }: { initialRules: SchemeRule[] }) {
  const [rules, setRules] = useState<SchemeRule[]>(initialRules);
  const [saved, setSaved] = useState(false);

  const updateValue = (id: string, value: string) => {
    setRules((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (r.rule_type === "number") return { ...r, value: Number(value) || 0 };
        if (r.rule_type === "boolean") return { ...r, value: value === "true" };
        return { ...r, value };
      })
    );
  };

  const toggleEnabled = (id: string) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  };

  const handleSave = async () => {
    try {
      await fetch("/api/admin/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // silent
    }
  };

  const handleReset = () => {
    setRules(initialRules);
  };

  const nosRules = rules.filter((r) => r.scheme_id === "NOS");
  const nfstRules = rules.filter((r) => r.scheme_id === "NFST");

  const renderRule = (rule: SchemeRule) => (
    <div key={rule.id} className="flex items-center gap-3 py-3 border-b border-[#EAE6DD] dark:border-[#1e2a45] last:border-0">
      <button onClick={() => toggleEnabled(rule.id)} className="shrink-0" aria-label={rule.enabled ? "Disable rule" : "Enable rule"}>
        {rule.enabled ? (
          <ToggleRight className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
        ) : (
          <ToggleLeft className="h-5 w-5 text-[#8B9AB5]" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-[#1B2A4A] dark:text-white">{rule.rule_name}</p>
        <p className="text-[10px] text-[#4B5A7A] dark:text-slate-400">{rule.description}</p>
      </div>
      {rule.rule_type === "boolean" ? (
        <select
          value={String(rule.value)}
          onChange={(e) => updateValue(rule.id, e.target.value)}
          className="h-7 w-20 rounded-lg border border-[#EAE6DD] dark:border-[#1e2a45] bg-[#F7F3EA] dark:bg-[#0B1220] text-[#1B2A4A] dark:text-white px-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#E8A33D]"
          disabled={!rule.enabled}
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      ) : rule.rule_type === "number" ? (
        <input
          type="number"
          value={Number(rule.value)}
          onChange={(e) => updateValue(rule.id, e.target.value)}
          className="h-7 w-24 text-xs rounded-lg border border-[#EAE6DD] dark:border-[#1e2a45] bg-[#F7F3EA] dark:bg-[#0B1220] text-[#1B2A4A] dark:text-white px-2 focus:outline-none focus:ring-1 focus:ring-[#E8A33D]"
          disabled={!rule.enabled}
        />
      ) : (
        <input
          type="text"
          value={String(rule.value)}
          onChange={(e) => updateValue(rule.id, e.target.value)}
          className="h-7 w-24 text-xs rounded-lg border border-[#EAE6DD] dark:border-[#1e2a45] bg-[#F7F3EA] dark:bg-[#0B1220] text-[#1B2A4A] dark:text-white px-2 focus:outline-none focus:ring-1 focus:ring-[#E8A33D]"
          disabled={!rule.enabled}
        />
      )}
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Settings className="h-4 w-4 text-[#4B5A7A] dark:text-slate-400" />
        <span className="text-sm font-semibold text-[#1B2A4A] dark:text-white">Scheme Eligibility Rules</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* NOS Card */}
        <div className="rounded-2xl border border-[#EAE6DD] dark:border-[#1e2a45] bg-[#F7F3EA] dark:bg-[#0B1220] overflow-hidden">
          <div className="p-4 border-b border-[#EAE6DD] dark:border-[#1e2a45]">
            <h3 className="text-sm font-bold text-[#1B2A4A] dark:text-white">NOS — National Overseas Scholarship</h3>
            <p className="text-[10px] text-[#4B5A7A] dark:text-slate-400 mt-0.5">Income, age, marks, QS rank rules</p>
          </div>
          <div className="p-4">{nosRules.map(renderRule)}</div>
        </div>

        {/* NFST Card */}
        <div className="rounded-2xl border border-[#EAE6DD] dark:border-[#1e2a45] bg-[#F7F3EA] dark:bg-[#0B1220] overflow-hidden">
          <div className="p-4 border-b border-[#EAE6DD] dark:border-[#1e2a45]">
            <h3 className="text-sm font-bold text-[#1B2A4A] dark:text-white">NFST — National Fellowship for ST</h3>
            <p className="text-[10px] text-[#4B5A7A] dark:text-slate-400 mt-0.5">NET, PVTG priority, marks rules</p>
          </div>
          <div className="p-4">{nfstRules.map(renderRule)}</div>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-[#4A6753] hover:bg-[#3B5034] dark:bg-[#5FA179] dark:hover:bg-[#4A8A65] text-white text-xs font-bold flex items-center gap-1.5 transition-colors">
          <Save className="h-3 w-3" />
          {saved ? "Saved!" : "Save Rules"}
        </button>
        <button onClick={handleReset} className="px-4 py-2 rounded-xl border border-[#EAE6DD] dark:border-[#1e2a45] bg-transparent text-[#4B5A7A] dark:text-slate-300 hover:bg-[#F7F3EA] dark:hover:bg-[#1e2a45] text-xs font-bold flex items-center gap-1.5 transition-colors">
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>
    </div>
  );
}
