import { NextRequest, NextResponse } from "next/server";
import { evaluateSchemeEligibility } from "@/lib/engines/verification-engine";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { sanitizeInput, validateApplication } from "@/lib/security/validation";
import type { Application, Document, Scheme } from "@/lib/types";

interface PostBody {
  action: "create" | "verify" | "update_status";
  application?: Application;
  documents?: Document[];
  scheme?: Scheme;
  targetStatus?: string;
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(`api:${ip}`, 240, 60000);
  if (!allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429, headers: { "X-RateLimit-Remaining": "0" } });
  }

  try {
    const body: PostBody = await request.json();

    switch (body.action) {
      case "create": {
        if (!body.application) {
          return NextResponse.json({ error: "application required" }, { status: 400 });
        }
        const validation = validateApplication(body.application as unknown as Record<string, unknown>);
        if (!validation.valid) {
          return NextResponse.json({ error: "Validation failed", details: validation.errors }, { status: 400 });
        }
        body.application.applicant_name = sanitizeInput(body.application.applicant_name);
        return NextResponse.json({
          success: true,
          application: body.application,
          message: "Application created",
        });
      }

      case "verify": {
        if (!body.application || !body.documents || !body.scheme) {
          return NextResponse.json(
            { error: "application, documents, and scheme required" },
            { status: 400 }
          );
        }
        const result = evaluateSchemeEligibility(
          body.application,
          body.documents,
          body.scheme
        );
        return NextResponse.json({
          success: true,
          verification: result,
        });
      }

      case "update_status": {
        if (!body.application || !body.targetStatus) {
          return NextResponse.json(
            { error: "application and targetStatus required" },
            { status: 400 }
          );
        }
        const validStatuses = [
          "draft",
          "submitted",
          "ai_verified",
          "official_review",
          "deficiency_flagged",
          "deficiency",
          "approved",
          "rejected",
          "official_approved",
          "disbursed",
        ];
        if (!validStatuses.includes(body.targetStatus)) {
          return NextResponse.json(
            { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
            { status: 400 }
          );
        }
        return NextResponse.json({
          success: true,
          application: { ...body.application, status: body.targetStatus },
          message: `Status updated to ${body.targetStatus}`,
        });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (err) {
    console.error("[API /applications]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
