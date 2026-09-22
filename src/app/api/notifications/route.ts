import { NextResponse } from "next/server";
import { generateNotification, generateEmailHtml, type NotificationType } from "@/lib/services/notifications";

export async function POST(request: Request) {
  const body = await request.json();
  const { type, userId, applicationId, data } = body as {
    type: NotificationType;
    userId: string;
    applicationId: string;
    data: Record<string, string>;
  };

  if (!type || !userId || !applicationId || !data) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const validTypes: NotificationType[] = [
    "application_submitted",
    "application_verified",
    "deficiency_flagged",
    "application_approved",
    "application_rejected",
    "resubmission_requested",
    "disbursement_initiated",
  ];

  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: "Invalid notification type" }, { status: 400 });
  }

  const notification = generateNotification(type, userId, applicationId, data);
  const emailHtml = generateEmailHtml(type, data);

  // In production: send email via SMTP/API, persist to DB
  // For now: return notification + email HTML
  return NextResponse.json({ ok: true, notification, emailHtml });
}
