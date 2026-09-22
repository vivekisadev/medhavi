import type {
  Document,
  DocType,
  QualityCheckResult,
  OcrScanResult,
} from "../types";
import { fuzzyMatchScore } from "../utils";

export function processDocumentQuality(doc: Document): QualityCheckResult {
  const defects: string[] = [];
  const qualityScore = doc.quality_score;

  if (qualityScore < 30) {
    defects.push(
      "Document image too blurry or low contrast. Upload a clear, flat scan."
    );
    defects.push("Ensure all four corners are visible and text is readable at 300 DPI.");
  } else if (qualityScore < 60) {
    defects.push(
      "Image quality is below optimal. Consider re-scanning at higher resolution."
    );
  }

  if (doc.doc_type === "income_cert") {
    const p = doc.ocr_extracted_payload;
    if (p.gross_annual_income && p.gross_annual_income > 600000) {
      defects.push(
        `Gross annual income â‚¹${(p.gross_annual_income / 100000).toFixed(1)}L exceeds â‚¹6,00,000 limit for NOS eligibility.`
      );
    }
    if (p.issue_date) {
      const issueDate = new Date(p.issue_date);
      const now = new Date();
      const currentYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
      const fyEnd = new Date(`${currentYear + 1}-03-31`);
      if (issueDate < fyEnd) {
        defects.push(
          `Income certificate issued on ${issueDate.toLocaleDateString("en-IN")} may be expired. Current financial year certificates preferred.`
        );
      }
    }
  }

  return {
    quality_score: qualityScore,
    is_readable: qualityScore >= 30,
    defects,
    message:
      defects.length === 0
        ? "Document quality is acceptable."
        : `${defects.length} issue(s) detected.`,
  };
}

export function extractOcrData(doc: Document): OcrScanResult {
  const data = doc.ocr_extracted_payload;
  const warnings: string[] = [];

  if (!data.applicant_name) {
    warnings.push("Could not extract applicant name from document.");
  }
  if (doc.doc_type === "caste_cert" && !data.certificate_no) {
    warnings.push("Certificate number could not be read.");
  }
  if (doc.doc_type === "income_cert" && !data.gross_annual_income) {
    warnings.push("Income figure could not be extracted.");
  }
  if (doc.doc_type === "net_scorecard" && !data.net_roll_no) {
    warnings.push("NET roll number could not be read.");
  }
  if (doc.doc_type === "qs_rank_proof" && !data.qs_ranking) {
    warnings.push("QS ranking could not be extracted.");
  }

  return {
    extracted_data: data,
    confidence: doc.quality_score,
    warnings,
  };
}

export function matchNamesAcrossDocs(
  profileName: string,
  docs: Document[]
): { doc_type: string; score: number; matched: boolean; extracted_name: string }[] {
  return docs.map((doc) => {
    const extractedName = doc.ocr_extracted_payload.applicant_name || "";
    const score = fuzzyMatchScore(profileName, extractedName);
    return {
      doc_type: doc.doc_type,
      score,
      matched: score >= 85,
      extracted_name: extractedName,
    };
  });
}

export function getRequiredDocTypes(schemeId: string): DocType[] {
  if (schemeId === "NOS") {
    return ["caste_cert", "income_cert", "admission_letter", "qs_rank_proof"];
  }
  return ["caste_cert", "admission_letter", "net_scorecard"];
}
