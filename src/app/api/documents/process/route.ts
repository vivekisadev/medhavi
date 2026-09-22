import { NextRequest, NextResponse } from "next/server";
import { processDocumentWithAi } from "@/lib/engines/ai-ocr";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { validateFileType, validateFileSize } from "@/lib/security/validation";
import type { DocType } from "@/lib/types";

const VALID_DOC_TYPES: DocType[] = [
  "income_cert",
  "caste_cert",
  "admission_letter",
  "marksheets",
  "net_scorecard",
  "qs_rank_proof",
  "photo",
];

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(`upload:${ip}`, 60, 60000);
  if (!allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const docType = formData.get("docType") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!docType || !VALID_DOC_TYPES.includes(docType as DocType)) {
      return NextResponse.json(
        { error: `Invalid docType. Must be one of: ${VALID_DOC_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    if (!validateFileType(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Allowed: PDF, JPEG, PNG, WebP" }, { status: 415 });
    }

    const maxSizeMb = parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB || "5");
    if (!validateFileSize(file.size, maxSizeMb)) {
      return NextResponse.json(
        { error: `File must be between 1 byte and ${maxSizeMb}MB` },
        { status: 413 }
      );
    }

    const result = await processDocumentWithAi(file, docType as DocType);

    return NextResponse.json({
      success: true,
      qualityScore: result.qualityScore,
      extractedData: result.extractedData,
      defectReason: result.defectReason,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    });
  } catch (err) {
    console.error("[API /documents/process]", err);
    return NextResponse.json(
      { error: "Document processing failed" },
      { status: 500 }
    );
  }
}
