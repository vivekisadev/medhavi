import type {
  Application,
  Document,
  Scheme,
  VerificationResult,
  RuleCheck,
  ApplicationStatus,
} from "../types";
import { fuzzyMatchScore } from "../utils";

export function evaluateSchemeEligibility(
  app: Application,
  docs: Document[],
  scheme: Scheme
): VerificationResult {
  const ruleChecks: RuleCheck[] = [];
  const defects: string[] = [];
  const actionable_feedback: string[] = [];
  const rules = scheme.eligibility_rules;

  // â”€â”€â”€ Rule 1: Income Check (NOS only) â”€â”€â”€
  if (scheme.id === "NOS" && rules.income_limit !== null) {
    const income = app.annual_income || 0;
    if (income === 0) {
      ruleChecks.push({
        rule_name: "Family Annual Income",
        passed: false,
        score: 0,
        message: "Income certificate not provided or income could not be extracted.",
        severity: "fail",
      });
      defects.push("Income certificate is required for NOS.");
      actionable_feedback.push(
        "Upload a valid income certificate showing gross annual family income."
      );
    } else if (income <= rules.income_limit) {
      ruleChecks.push({
        rule_name: "Family Annual Income",
        passed: true,
        score: 100,
        message: `Income â‚¹${(income / 100000).toFixed(1)}L is within â‚¹6,00,000 limit.`,
        severity: "pass",
      });
    } else {
      const overPct = Math.round(((income - rules.income_limit) / rules.income_limit) * 100);
      ruleChecks.push({
        rule_name: "Family Annual Income",
        passed: false,
        score: Math.max(0, 50 - overPct),
        message: `Income â‚¹${(income / 100000).toFixed(1)}L exceeds â‚¹6,00,000 limit by ${overPct}%.`,
        severity: "fail",
      });
      defects.push(`Annual income â‚¹${(income / 100000).toFixed(1)}L exceeds the â‚¹6,00,000 eligibility threshold.`);
      actionable_feedback.push(
        "NOS requires gross annual family income â‰¤ â‚¹6,00,000. If income has changed, upload an updated income certificate."
      );
    }
  }

  // â”€â”€â”€ Rule 2: Age Limit (NOS only) â”€â”€â”€
  if (scheme.id === "NOS" && app.age !== null) {
    const maxAge =
      app.course_type === "Ph.D"
        ? (rules.max_age_phd || 35)
        : (rules.max_age_masters || 32);
    if (app.age <= maxAge) {
      ruleChecks.push({
        rule_name: "Age Limit",
        passed: true,
        score: 100,
        message: `Age ${app.age} is within ${maxAge} year limit for ${app.course_type}.`,
        severity: "pass",
      });
    } else {
      ruleChecks.push({
        rule_name: "Age Limit",
        passed: false,
        score: 20,
        message: `Age ${app.age} exceeds ${maxAge} year limit for ${app.course_type}.`,
        severity: "fail",
      });
      defects.push(`Applicant age (${app.age}) exceeds the maximum age limit of ${maxAge} for ${app.course_type}.`);
      actionable_feedback.push(
        `NOS age limit for ${app.course_type} is ${maxAge} years. Contact the ministry if you have a valid relaxation certificate.`
      );
    }
  }

  // â”€â”€â”€ Rule 3: Qualifying Marks â”€â”€â”€
  if (app.qualifying_marks !== null) {
    if (app.qualifying_marks >= rules.min_qualifying_marks) {
      ruleChecks.push({
        rule_name: "Minimum Qualifying Marks",
        passed: true,
        score: 100,
        message: `Marks ${app.qualifying_marks}% meet the ${rules.min_qualifying_marks}% threshold.`,
        severity: "pass",
      });
    } else {
      ruleChecks.push({
        rule_name: "Minimum Qualifying Marks",
        passed: false,
        score: 30,
        message: `Marks ${app.qualifying_marks}% are below the ${rules.min_qualifying_marks}% minimum.`,
        severity: "fail",
      });
      defects.push(`Qualifying marks ${app.qualifying_marks}% are below the required ${rules.min_qualifying_marks}%.`);
      actionable_feedback.push(
        `Ensure your qualifying examination marks are at least ${rules.min_qualifying_marks}%.`
      );
    }
  }

  // â”€â”€â”€ Rule 4: QS Rank (NOS only) â”€â”€â”€
  if (scheme.id === "NOS" && rules.qs_rank_required) {
    const qsDoc = docs.find((d) => d.doc_type === "qs_rank_proof");
    const rank = qsDoc?.ocr_extracted_payload.qs_ranking;
    if (rank && rank <= 1000) {
      ruleChecks.push({
        rule_name: "QS World Ranking (Top 1000)",
        passed: true,
        score: 100,
        message: `${qsDoc?.ocr_extracted_payload.institution_name} ranked #${rank} â€” within top 1000.`,
        severity: "pass",
      });
    } else {
      ruleChecks.push({
        rule_name: "QS World Ranking (Top 1000)",
        passed: false,
        score: rank ? 40 : 0,
        message: rank
          ? `University ranked #${rank} â€” exceeds top 1000 threshold.`
          : "QS rank proof not uploaded or rank could not be extracted.",
        severity: "fail",
      });
      defects.push("Admission must be at a QS World Rank top 1000 university.");
      actionable_feedback.push(
        "Upload proof that your university is ranked within the top 1000 on QS World University Rankings."
      );
    }
  }

  // â”€â”€â”€ Rule 5: NET Qualification (NFST only) â”€â”€â”€
  if (scheme.id === "NFST" && rules.net_required) {
    const netDoc = docs.find((d) => d.doc_type === "net_scorecard");
    if (netDoc && netDoc.ocr_extracted_payload.net_roll_no) {
      ruleChecks.push({
        rule_name: "UGC-NET / CSIR-NET Qualification",
        passed: true,
        score: 100,
        message: `NET qualified â€” Roll ${netDoc.ocr_extracted_payload.net_roll_no} (${netDoc.ocr_extracted_payload.net_score}).`,
        severity: "pass",
      });
    } else {
      ruleChecks.push({
        rule_name: "UGC-NET / CSIR-NET Qualification",
        passed: false,
        score: 0,
        message: "NET scorecard not uploaded or qualification not verified.",
        severity: "fail",
      });
      defects.push("UGC-NET/CSIR-NET qualification is mandatory for NFST.");
      actionable_feedback.push(
        "Upload your UGC-NET or CSIR-NET scorecard showing JRF/LS qualification with roll number and rank."
      );
    }
  }

  // â”€â”€â”€ Rule 6: Caste Certificate (all schemes) â”€â”€â”€
  const casteDoc = docs.find((d) => d.doc_type === "caste_cert");
  if (casteDoc && casteDoc.ocr_extracted_payload.tribal_group) {
    ruleChecks.push({
      rule_name: "Valid ST Caste Certificate",
      passed: true,
      score: 100,
      message: `ST certificate verified â€” ${casteDoc.ocr_extracted_payload.tribal_group} tribe.`,
      severity: "pass",
    });
  } else {
    ruleChecks.push({
      rule_name: "Valid ST Caste Certificate",
      passed: false,
      score: 0,
      message: "Caste certificate not uploaded or tribal group could not be verified.",
      severity: "fail",
    });
    defects.push("Valid Scheduled Tribe caste certificate is required.");
    actionable_feedback.push(
      "Upload a valid ST caste certificate issued by the competent authority."
    );
  }

  // â”€â”€â”€ Rule 7: Name Match Across Documents â”€â”€â”€
  if (docs.length >= 2) {
    const names = docs
      .map((d) => d.ocr_extracted_payload.applicant_name)
      .filter(Boolean);
    if (names.length >= 2) {
      const primaryName = names[0]!;
      const matchResults = names.slice(1).map((n) => fuzzyMatchScore(primaryName, n!));
      const minScore = Math.min(...matchResults);
      if (minScore >= 85) {
        ruleChecks.push({
          rule_name: "Name Consistency Across Documents",
          passed: true,
          score: minScore,
          message: `Names match at ${minScore}% â€” consistent across all documents.`,
          severity: "pass",
        });
      } else {
        ruleChecks.push({
          rule_name: "Name Consistency Across Documents",
          passed: false,
          score: minScore,
          message: `Name mismatch detected (${minScore}% match). All documents must use the same name.`,
          severity: "fail",
        });
        defects.push(`Name mismatch across documents â€” only ${minScore}% similarity.`);
        actionable_feedback.push(
          "Ensure all uploaded documents use the exact same name as your profile. Re-upload any documents with mismatched names."
        );
      }
    }
  }

  // â”€â”€â”€ Rule 8: Document Quality â”€â”€â”€
  const lowQualityDocs = docs.filter((d) => d.quality_score < 60);
  if (lowQualityDocs.length > 0) {
    ruleChecks.push({
      rule_name: "Document Image Quality",
      passed: false,
      score: 30,
      message: `${lowQualityDocs.length} document(s) have quality below 60%.`,
      severity: "warning",
    });
    lowQualityDocs.forEach((d) => {
      if (d.defect_reason) defects.push(d.defect_reason);
    });
    actionable_feedback.push(
      "Re-upload documents that are blurry, low contrast, or have poor image quality."
    );
  } else if (docs.length > 0) {
    ruleChecks.push({
      rule_name: "Document Image Quality",
      passed: true,
      score: 95,
      message: "All documents meet minimum quality standards.",
      severity: "pass",
    });
  }

  // â”€â”€â”€ Calculate Overall Score â”€â”€â”€
  const totalWeight = ruleChecks.length * 100;
  const achieved = ruleChecks.reduce((sum, r) => sum + r.score, 0);
  const overallScore = totalWeight > 0 ? Math.round((achieved / totalWeight) * 100) : 0;

  // â”€â”€â”€ Determine Status â”€â”€â”€
  let status: ApplicationStatus;
  const hasFailures = ruleChecks.some((r) => r.severity === "fail");
  if (overallScore >= 90 && !hasFailures) {
    status = "ai_verified";
  } else {
    status = "deficiency_flagged";
  }

  // â”€â”€â”€ PVTG Priority Note â”€â”€â”€
  if (rules.pvtg_priority && app.user_id) {
    actionable_feedback.push(
      "PVTG applicants receive priority processing. Ensure all PVTG-specific documentation is complete."
    );
  }

  return {
    overall_score: overallScore,
    status,
    rule_checks: ruleChecks,
    defects,
    actionable_feedback,
  };
}

export function getRequiredDocsForScheme(schemeId: string): string[] {
  if (schemeId === "NOS") {
    return [
      "ST Caste Certificate",
      "Income Certificate",
      "Admission Letter",
      "QS Rank Proof",
    ];
  }
  return ["ST Caste Certificate", "UGC-NET/CSIR-NET Scorecard", "Ph.D Admission Letter"];
}
