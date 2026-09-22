import type { SchemeId } from "../types";

export interface SchemeRule {
  id: string;
  scheme_id: SchemeId;
  rule_name: string;
  rule_key: string;
  rule_type: "number" | "boolean" | "string";
  value: number | boolean | string;
  description: string;
  enabled: boolean;
  updated_at: string;
}

export const DEFAULT_RULES: SchemeRule[] = [
  { id: "r1", scheme_id: "NOS", rule_name: "Income Limit", rule_key: "income_limit", rule_type: "number", value: 600000, description: "Maximum annual family income in INR", enabled: true, updated_at: new Date().toISOString() },
  { id: "r2", scheme_id: "NOS", rule_name: "Max Age (Masters)", rule_key: "max_age_masters", rule_type: "number", value: 32, description: "Maximum age for Master's applicants", enabled: true, updated_at: new Date().toISOString() },
  { id: "r3", scheme_id: "NOS", rule_name: "Max Age (PhD)", rule_key: "max_age_phd", rule_type: "number", value: 35, description: "Maximum age for PhD applicants", enabled: true, updated_at: new Date().toISOString() },
  { id: "r4", scheme_id: "NOS", rule_name: "Min Qualifying Marks", rule_key: "min_qualifying_marks", rule_type: "number", value: 55, description: "Minimum qualifying percentage", enabled: true, updated_at: new Date().toISOString() },
  { id: "r5", scheme_id: "NOS", rule_name: "QS Rank Required", rule_key: "qs_rank_required", rule_type: "boolean", value: true, description: "University must be in QS Top 1000", enabled: true, updated_at: new Date().toISOString() },
  { id: "r6", scheme_id: "NFST", rule_name: "NET Required", rule_key: "net_required", rule_type: "boolean", value: true, description: "NET/JRF qualification mandatory", enabled: true, updated_at: new Date().toISOString() },
  { id: "r7", scheme_id: "NFST", rule_name: "PVTG Priority", rule_key: "pvtg_priority", rule_type: "boolean", value: true, description: "Priority given to Particularly Vulnerable Tribal Groups", enabled: true, updated_at: new Date().toISOString() },
  { id: "r8", scheme_id: "NFST", rule_name: "Min Qualifying Marks", rule_key: "min_qualifying_marks", rule_type: "number", value: 55, description: "Minimum qualifying percentage", enabled: true, updated_at: new Date().toISOString() },
];

let rulesStore: SchemeRule[] = [...DEFAULT_RULES];

export function getSchemeRules(schemeId?: SchemeId): SchemeRule[] {
  if (schemeId) return rulesStore.filter((r) => r.scheme_id === schemeId && r.enabled);
  return rulesStore.filter((r) => r.enabled);
}

export function updateRule(ruleId: string, value: number | boolean | string): SchemeRule | null {
  const idx = rulesStore.findIndex((r) => r.id === ruleId);
  if (idx === -1) return null;
  rulesStore[idx] = { ...rulesStore[idx], value, updated_at: new Date().toISOString() };
  return rulesStore[idx];
}

export function toggleRule(ruleId: string): SchemeRule | null {
  const idx = rulesStore.findIndex((r) => r.id === ruleId);
  if (idx === -1) return null;
  rulesStore[idx] = { ...rulesStore[idx], enabled: !rulesStore[idx].enabled, updated_at: new Date().toISOString() };
  return rulesStore[idx];
}

export function resetRules(): void {
  rulesStore = [...DEFAULT_RULES];
}
