import type { Application, Document, Scheme } from "../types";

export interface MeritScore {
  application_id: string;
  overall_score: number;
  income_score: number;
  marks_score: number;
  age_score: number;
  pvtg_bonus: number;
  quality_score: number;
  rank: number;
}

const WEIGHTS = {
  income: 0.25,
  marks: 0.30,
  age: 0.15,
  pvtg: 0.10,
  quality: 0.20,
};

function incomeScore(income: number | null, limit: number | null): number {
  if (!income || !limit) return 50;
  if (income <= 0) return 100;
  const ratio = income / limit;
  if (ratio <= 0.5) return 100;
  if (ratio <= 0.75) return 80;
  if (ratio <= 1.0) return 60;
  return 20;
}

function marksScore(marks: number | null): number {
  if (marks === null || marks === undefined) return 50;
  if (marks >= 90) return 100;
  if (marks >= 80) return 85;
  if (marks >= 70) return 70;
  if (marks >= 60) return 55;
  if (marks >= 50) return 40;
  return 20;
}

function ageScore(age: number | null, maxAge: number | null): number {
  if (!age || !maxAge) return 50;
  const remaining = maxAge - age;
  if (remaining >= 5) return 100;
  if (remaining >= 3) return 80;
  if (remaining >= 1) return 60;
  if (remaining === 0) return 40;
  return 10;
}

function docQualityScore(docs: Document[]): number {
  if (docs.length === 0) return 0;
  const validDocs = docs.filter((d) => d.is_valid);
  const avgQuality = docs.reduce((sum, d) => sum + d.quality_score, 0) / docs.length;
  const validRatio = validDocs.length / docs.length;
  return Math.round(avgQuality * 0.6 + validRatio * 100 * 0.4);
}

export function calculateMeritScores(
  applications: Application[],
  documents: Document[],
  schemes: Scheme[]
): MeritScore[] {
  const scores = applications
    .filter((app) => app.status === "submitted" || app.status === "ai_verified")
    .map((app) => {
      const scheme = schemes.find((s) => s.id === app.scheme_id);
      const rules = scheme?.eligibility_rules;
      const appDocs = documents.filter((d) => d.application_id === app.id);

      const incScore = incomeScore(app.annual_income, rules?.income_limit ?? null);
      const mksScore = marksScore(app.qualifying_marks);
      const agScore = ageScore(app.age, rules?.max_age_phd ?? rules?.max_age_masters ?? null);
      const pvtgBonus = (rules?.pvtg_priority && app.age !== null) ? 100 : 0;
      const qualScore = docQualityScore(appDocs);

      const overall = Math.round(
        incScore * WEIGHTS.income +
        mksScore * WEIGHTS.marks +
        agScore * WEIGHTS.age +
        pvtgBonus * WEIGHTS.pvtg +
        qualScore * WEIGHTS.quality
      );

      return {
        application_id: app.id,
        overall_score: overall,
        income_score: incScore,
        marks_score: mksScore,
        age_score: agScore,
        pvtg_bonus: pvtgBonus,
        quality_score: qualScore,
        rank: 0,
      };
    })
    .sort((a, b) => b.overall_score - a.overall_score)
    .map((s, i) => ({ ...s, rank: i + 1 }));

  return scores;
}

export function getMeritsForScheme(
  scores: MeritScore[],
  applications: Application[],
  schemeId: string
): MeritScore[] {
  return scores
    .filter((s) => {
      const app = applications.find((a) => a.id === s.application_id);
      return app?.scheme_id === schemeId;
    })
    .sort((a, b) => b.overall_score - a.overall_score)
    .map((s, i) => ({ ...s, rank: i + 1 }));
}
