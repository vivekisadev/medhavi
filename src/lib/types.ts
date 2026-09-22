export type UserRole = "student" | "official";
export type SchemeId = "NOS" | "NFST";
export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "ai_verified"
  | "official_review"
  | "deficiency_flagged"
  | "deficiency"
  | "approved"
  | "rejected"
  | "official_approved"
  | "disbursed";
export type DocType =
  | "caste_cert"
  | "income_cert"
  | "admission_letter"
  | "net_scorecard"
  | "qs_rank_proof"
  | "marksheets"
  | "photo";

export interface Scheme {
  id: SchemeId;
  scheme_name: string;
  description: string;
  eligibility_rules: EligibilityRules;
}

export interface EligibilityRules {
  income_limit: number | null;
  max_age_masters: number | null;
  max_age_phd: number | null;
  min_qualifying_marks: number;
  net_required: boolean;
  qs_rank_required: boolean;
  pvtg_priority: boolean;
  description: string;
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  st_caste_name: string;
  pvtg_status: boolean;
  date_of_birth: string;
  phone: string;
  created_at: string;
}

export interface Application {
  id: string;
  user_id: string;
  scheme_id: SchemeId;
  application_no: string;
  status: ApplicationStatus;
  ai_confidence_score: number;
  annual_income: number | null;
  age: number | null;
  qualifying_marks: number | null;
  university_name: string;
  course_type: string;
  net_qualification: string | null;
  applicant_name: string;
  email: string;
  created_at: string;
  updated_at: string;
  reviewed_at?: string | null;
}

export interface Document {
  id: string;
  application_id: string;
  doc_type: DocType;
  file_name: string;
  file_url: string;
  quality_score: number;
  ocr_extracted_payload: OcrPayload;
  is_valid: boolean;
  defect_reason: string | null;
}

export interface OcrPayload {
  applicant_name?: string;
  certificate_no?: string;
  tribal_group?: string;
  gross_annual_income?: number;
  issue_date?: string;
  issuing_authority?: string;
  institution_name?: string;
  course_type?: string;
  qs_ranking?: number;
  net_roll_no?: string;
  net_score?: string;
  qualifying_exam?: string;
  raw_text?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface AuditEntry {
  id: string;
  application_id: string;
  action: string;
  performed_by: string;
  timestamp: string;
  notes: string;
}

export interface RuleCheck {
  rule_name: string;
  passed: boolean;
  score: number;
  message: string;
  severity: "pass" | "warning" | "fail";
}

export interface VerificationResult {
  overall_score: number;
  status: ApplicationStatus;
  rule_checks: RuleCheck[];
  defects: string[];
  actionable_feedback: string[];
}

export interface QualityCheckResult {
  quality_score: number;
  is_readable: boolean;
  defects: string[];
  message: string;
}

export interface OcrScanResult {
  extracted_data: OcrPayload;
  confidence: number;
  warnings: string[];
}

export interface FormStepData {
  personal: {
    full_name: string;
    email: string;
    phone: string;
    date_of_birth: string;
    st_caste_name: string;
    pvtg_status: boolean;
  };
  educational: {
    qualifying_marks: number;
    university_name: string;
    course_type: string;
    net_roll_no: string;
    net_score: string;
    qs_ranking: number | null;
  };
  documents: {
    uploaded: DocType[];
  };
}
