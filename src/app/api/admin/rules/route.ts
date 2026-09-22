import { NextResponse } from "next/server";
import { getSchemeRules, updateRule, toggleRule, resetRules } from "@/lib/data/scheme-rules";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scheme = searchParams.get("scheme") as "NOS" | "NFST" | null;
  const rules = getSchemeRules(scheme ?? undefined);
  return NextResponse.json({ rules });
}

export async function POST(request: Request) {
  const body = await request.json();

  if (body.action === "reset") {
    resetRules();
    return NextResponse.json({ ok: true, rules: getSchemeRules() });
  }

  if (body.action === "toggle" && body.ruleId) {
    const updated = toggleRule(body.ruleId);
    if (!updated) return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    return NextResponse.json({ ok: true, rule: updated });
  }

  if (body.rules && Array.isArray(body.rules)) {
    for (const rule of body.rules) {
      if (rule.id && rule.value !== undefined) {
        updateRule(rule.id, rule.value);
      }
    }
    return NextResponse.json({ ok: true, rules: getSchemeRules() });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
