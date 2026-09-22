import type { Application } from "../types";

export function applicationsToCsv(apps: Application[]): string {
  if (apps.length === 0) return "";
  const headers = [
    "Application ID",
    "Scheme",
    "Applicant Name",
    "Email",
    "Status",
    "AI Score",
    "Annual Income",
    "Qualifying Marks",
    "Age",
    "Applied Date",
    "Reviewed Date",
  ];
  const rows = apps.map((app) => [
    app.id,
    app.scheme_id,
    app.applicant_name,
    app.email,
    app.status,
    String(app.ai_confidence_score),
    app.annual_income !== null ? String(app.annual_income) : "",
    app.qualifying_marks !== null ? String(app.qualifying_marks) : "",
    app.age !== null ? String(app.age) : "",
    app.created_at,
    app.reviewed_at ?? "",
  ]);
  return [headers.join(","), ...rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))].join("\n");
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function statusDistribution(apps: Application[]): Record<string, number> {
  const dist: Record<string, number> = {};
  apps.forEach((app) => {
    dist[app.status] = (dist[app.status] || 0) + 1;
  });
  return dist;
}

export function schemeDistribution(apps: Application[]): Record<string, number> {
  const dist: Record<string, number> = {};
  apps.forEach((app) => {
    dist[app.scheme_id] = (dist[app.scheme_id] || 0) + 1;
  });
  return dist;
}
