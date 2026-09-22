import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "draft":
      return "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
    case "submitted":
      return "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800";
    case "ai_verified":
      return "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800";
    case "deficiency_flagged":
      return "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800";
    case "official_approved":
      return "bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-950 dark:text-violet-400 dark:border-violet-800";
    case "disbursed":
      return "bg-green-50 text-green-600 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case "draft":
      return "Draft";
    case "submitted":
      return "Submitted";
    case "ai_verified":
      return "AI Verified";
    case "deficiency_flagged":
      return "Deficiency Flagged";
    case "official_approved":
      return "Approved";
    case "disbursed":
      return "Disbursed";
    default:
      return status;
  }
}

export function getDocTypeLabel(docType: string): string {
  switch (docType) {
    case "income_cert":
      return "Income Certificate";
    case "caste_cert":
      return "Caste Certificate";
    case "admission_letter":
      return "Admission Letter";
    case "net_scorecard":
      return "NET Scorecard";
    case "qs_rank_proof":
      return "QS Rank Proof";
    default:
      return docType;
  }
}

export function generateId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export function generateAppNo(scheme: string): string {
  const prefix = scheme === "NOS" ? "NOS" : "NFST";
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 99999) + 1).padStart(5, "0");
  return `${prefix}/${year}/${seq}`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0)
  );
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

export function fuzzyMatchScore(name1: string, name2: string): number {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .trim()
      .replace(/laxmi/g, "lakshmi")
      .replace(/kumhar/g, "kumar")
      .replace(/bhairon/g, "bhairav")
      .replace(/bheel/g, "bhil")
      .replace(/mahato/g, "mahanta")
      .replace(/besra/g, "besara")
      .replace(/singh/g, "sinh")
      .replace(/\s+/g, " ");

  const a = normalize(name1);
  const b = normalize(name2);
  if (a === b) return 100;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 100;

  // Levenshtein-based score
  const dist = levenshteinDistance(a, b);
  const levScore = ((maxLen - dist) / maxLen) * 100;

  // Token-based score: split into words, find best alignment
  const wordsA = a.split(/\s+/);
  const wordsB = b.split(/\s+/);
  let tokenMatches = 0;
  const usedB = new Set<number>();

  for (const wa of wordsA) {
    let bestIdx = -1;
    let bestScore = 0;
    for (let i = 0; i < wordsB.length; i++) {
      if (usedB.has(i)) continue;
      const wb = wordsB[i];
      if (wa === wb) { bestIdx = i; bestScore = 100; break; }
      // Abbreviation match: "k" matches "kumar" if first char matches
      if (wa.length === 1 && wb.startsWith(wa)) { bestIdx = i; bestScore = 90; break; }
      if (wb.length === 1 && wa.startsWith(wb)) { bestIdx = i; bestScore = 90; break; }
      const wMaxLen = Math.max(wa.length, wb.length);
      const wDist = levenshteinDistance(wa, wb);
      const wScore = ((wMaxLen - wDist) / wMaxLen) * 100;
      if (wScore > bestScore) { bestScore = wScore; bestIdx = i; }
    }
    if (bestIdx >= 0 && bestScore >= 70) {
      tokenMatches++;
      usedB.add(bestIdx);
    }
  }

  const tokenScore = wordsA.length > 0 ? (tokenMatches / wordsA.length) * 100 : 0;

  // Use the better of the two scores
  return Math.round(Math.max(levScore, tokenScore));
}

export function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}
