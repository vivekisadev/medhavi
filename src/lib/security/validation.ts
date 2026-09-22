export function sanitizeInput(input: string): string {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .replace(/vbscript:/gi, "")
    .trim()
    .slice(0, 500);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  return /^\+?[\d\s-]{10,15}$/.test(phone);
}

export function isValidApplicationId(id: string): boolean {
  return /^APP-(NOS|NFST)-\d{4}-\d{6}$/.test(id);
}

export function validateFileSize(size: number, maxMb: number = 5): boolean {
  return size > 0 && size <= maxMb * 1024 * 1024;
}

export function validateFileType(mimeType: string): boolean {
  const allowed = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];
  return allowed.includes(mimeType);
}

export function validateIncome(income: unknown): income is number {
  return typeof income === "number" && income >= 0 && income <= 100000000;
}

export function validateMarks(marks: unknown): marks is number {
  return typeof marks === "number" && marks >= 0 && marks <= 100;
}

export function validateAge(age: unknown): age is number {
  return typeof age === "number" && age >= 15 && age <= 60;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateApplication(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  if (!data.applicant_name || typeof data.applicant_name !== "string" || data.applicant_name.length < 2) {
    errors.push("Applicant name is required");
  }
  if (!data.email || !isValidEmail(String(data.email))) {
    errors.push("Valid email is required");
  }
  if (!data.scheme_id || !["NOS", "NFST"].includes(String(data.scheme_id))) {
    errors.push("Valid scheme is required");
  }
  if (data.annual_income !== undefined && data.annual_income !== null && !validateIncome(data.annual_income)) {
    errors.push("Invalid income value");
  }
  if (data.qualifying_marks !== undefined && data.qualifying_marks !== null && !validateMarks(data.qualifying_marks)) {
    errors.push("Invalid marks value (0-100)");
  }
  if (data.age !== undefined && data.age !== null && !validateAge(data.age)) {
    errors.push("Invalid age value");
  }

  return { valid: errors.length === 0, errors };
}
