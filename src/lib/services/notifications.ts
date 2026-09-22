export type NotificationType =
  | "application_submitted"
  | "application_verified"
  | "deficiency_flagged"
  | "application_approved"
  | "application_rejected"
  | "resubmission_requested"
  | "disbursement_initiated";

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  application_id?: string;
  created_at: string;
}

const TEMPLATES: Record<NotificationType, (data: Record<string, string>) => { title: string; body: string }> = {
  application_submitted: (d) => ({
    title: "Application Submitted",
    body: `Your ${d.scheme} application (${d.app_no}) has been submitted successfully. AI verification is in progress.`,
  }),
  application_verified: (d) => ({
    title: "AI Verification Complete",
    body: `Your ${d.scheme} application (${d.app_no}) has been verified with an AI confidence score of ${d.score}%.`,
  }),
  deficiency_flagged: (d) => ({
    title: "Action Required",
    body: `Your ${d.scheme} application (${d.app_no}) has deficiencies: ${d.issues}. Please review and re-upload the required documents.`,
  }),
  application_approved: (d) => ({
    title: "Application Approved",
    body: `Congratulations! Your ${d.scheme} application (${d.app_no}) has been approved by the review committee.`,
  }),
  application_rejected: (d) => ({
    title: "Application Not Selected",
    body: `Your ${d.scheme} application (${d.app_no}) was not selected in this cycle. ${d.reason || "You may reapply in the next cycle."}`,
  }),
  resubmission_requested: (d) => ({
    title: "Resubmission Requested",
    body: `The reviewing officer has requested resubmission for ${d.scheme} application (${d.app_no}). Reason: ${d.reason}`,
  }),
  disbursement_initiated: (d) => ({
    title: "Disbursement Initiated",
    body: `Scholarship disbursement for ${d.scheme} application (${d.app_no}) has been initiated. Amount: ${d.amount}.`,
  }),
};

export function generateNotification(
  type: NotificationType,
  userId: string,
  applicationId: string,
  data: Record<string, string>
): Notification {
  const template = TEMPLATES[type](data);
  return {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    user_id: userId,
    type,
    title: template.title,
    body: template.body,
    read: false,
    application_id: applicationId,
    created_at: new Date().toISOString(),
  };
}

export function generateEmailHtml(type: NotificationType, data: Record<string, string>): string {
  const template = TEMPLATES[type](data);
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>body{font-family:system-ui,-apple-system,sans-serif;margin:0;padding:0;background:#f4f4f5}.container{max-width:600px;margin:0 auto;background:#fff}.header{background:#09090b;padding:24px;text-align:center}.header h1{color:#fafafa;font-size:20px;margin:0}.content{padding:24px;color:#27272a;font-size:14px;line-height:1.6}.badge{display:inline-block;padding:4px 12px;border-radius:6px;font-size:12px;font-weight:600;margin-bottom:16px}.badge-success{background:#dcfce7;color:#166534}.badge-warning{background:#fef3c7;color:#92400e}.badge-error{background:#fee2e2;color:#991b1b}.footer{padding:16px 24px;border-top:1px solid #e4e4e7;font-size:11px;color:#71717a;text-align:center}</style></head>
<body>
<div class="container">
<div class="header"><h1>Niyomi — Scholarship Management</h1></div>
<div class="content">
<h2 style="margin-top:0">${template.title}</h2>
<p>${template.body}</p>
<p style="margin-top:24px"><a href="http://localhost:3000/student/dashboard" style="background:#09090b;color:#fafafa;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:13px;font-weight:500">View Application</a></p>
</div>
<div class="footer">Ministry of Tribal Affairs — Niyomi Scholarship Portal</div>
</div>
</body>
</html>`;
}
