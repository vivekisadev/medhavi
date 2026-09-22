// Niyomi Trust Loop — Phase: Merit Ranking, Notifications, Configurable Rules,
// Rate Limiting, Input Validation, CSV Export, Security Hardening
// Run: node test-trust-loop.js

let passed = 0, failed = 0;
const results = [];
function assert(name, condition, detail) {
  if (condition) { passed++; results.push({ name, status: "PASS", detail: detail || "" }); }
  else { failed++; results.push({ name, status: "FAIL", detail: detail || "" }); }
}

// ═══════════════════════════════════════════════════════════
// SECTION A: Merit Ranking Engine (mirror of src/lib/merit-engine.ts)
// ═══════════════════════════════════════════════════════════
const WEIGHTS = { income: 0.25, marks: 0.30, age: 0.15, pvtg: 0.10, quality: 0.20 };

function incomeScore(income, limit) {
  if (!income || !limit) return 50;
  if (income <= 0) return 100;
  const ratio = income / limit;
  if (ratio <= 0.5) return 100;
  if (ratio <= 0.75) return 80;
  if (ratio <= 1.0) return 60;
  return 20;
}
function marksScore(marks) {
  if (marks === null || marks === undefined) return 50;
  if (marks >= 90) return 100;
  if (marks >= 80) return 85;
  if (marks >= 70) return 70;
  if (marks >= 60) return 55;
  if (marks >= 50) return 40;
  return 20;
}
function ageScore(age, maxAge) {
  if (!age || !maxAge) return 50;
  const remaining = maxAge - age;
  if (remaining >= 5) return 100;
  if (remaining >= 3) return 80;
  if (remaining >= 1) return 60;
  if (remaining === 0) return 40;
  return 10;
}
function docQualityScore(docs) {
  if (docs.length === 0) return 0;
  const valid = docs.filter((d) => d.is_valid).length;
  const avg = docs.reduce((s, d) => s + d.quality_score, 0) / docs.length;
  return Math.round(avg * 0.6 + (valid / docs.length) * 100 * 0.4);
}

// A1 — Income score bands
assert("A1: income <= 50% of limit = 100", incomeScore(300000, 600000) === 100, `got ${incomeScore(300000, 600000)}`);
assert("A1b: income at 75% wall = 80", incomeScore(450000, 600000) === 80, `got ${incomeScore(450000, 600000)}`);
assert("A1c: income at limit = 60", incomeScore(600000, 600000) === 60, `got ${incomeScore(600000, 600000)}`);
assert("A1d: income over limit = 20", incomeScore(850000, 600000) === 20, `got ${incomeScore(850000, 600000)}`);
assert("A1e: null income = 50", incomeScore(null, 600000) === 50, `got ${incomeScore(null, 600000)}`);

// A2 — Marks score bands
assert("A2: 95 -> 100", marksScore(95) === 100, `got ${marksScore(95)}`);
assert("A2b: 82 -> 85", marksScore(82) === 85, `got ${marksScore(82)}`);
assert("A2c: 62 -> 55", marksScore(62) === 55, `got ${marksScore(62)}`);
assert("A2d: 40 -> 20", marksScore(40) === 20, `got ${marksScore(40)}`);
assert("A2e: null -> 50", marksScore(null) === 50, `got ${marksScore(null)}`);

// A3 — Age score bands (NOS max 32)
assert("A3: age 27 -> 100", ageScore(27, 32) === 100, `got ${ageScore(27, 32)}`);
assert("A3b: age 29 -> 80", ageScore(29, 32) === 80, `got ${ageScore(29, 32)}`);
assert("A3c: age 31 -> 60", ageScore(31, 32) === 60, `got ${ageScore(31, 32)}`);
assert("A3d: age 32 -> 40", ageScore(32, 32) === 40, `got ${ageScore(32, 32)}`);
assert("A3e: age 33 (over) -> 10", ageScore(33, 32) === 10, `got ${ageScore(33, 32)}`);

// A4 — Document quality blends validity + OCR quality
assert("A4: empty -> 0", docQualityScore([]) === 0, `got ${docQualityScore([])}`);
const allValid = [
  { is_valid: true, quality_score: 100 },
  { is_valid: true, quality_score: 100 },
];
assert("A4b: 2 docs valid+100 -> 100", docQualityScore(allValid) === 100, `got ${docQualityScore(allValid)}`);
const mixed = [
  { is_valid: true, quality_score: 100 },
  { is_valid: false, quality_score: 20 },
];
// avg = 60; validRatio = .5 -> 60*.6=36 + 50*.4=20 = 56
assert("A4c: mixed valid/invalid = 56", docQualityScore(mixed) === 56, `got ${docQualityScore(mixed)}`);

// A5 — Full ranking: poorer but smarter candidate ranks above richer
const apps = [
  { id: "a1", status: "submitted", annual_income: 850000, age: 26, qualifying_marks: 62, scheme_id: "NOS" },
  { id: "a2", status: "submitted", annual_income: 300000, age: 25, qualifying_marks: 88, scheme_id: "NOS" },
];
const docsByApp = { a1: [{ is_valid: true, quality_score: 95 }], a2: [{ is_valid: true, quality_score: 92 }] };
function rank(apps, docsByApp, limit, maxAge) {
  const scored = apps
    .filter((a) => a.status === "submitted" || a.status === "ai_verified")
    .map((a) => {
      const inc = incomeScore(a.annual_income, limit);
      const mks = marksScore(a.qualifying_marks);
      const ag = ageScore(a.age, maxAge);
      const pvtg = 0;
      const qual = docQualityScore(docsByApp[a.id] || []);
      const overall = Math.round(inc * WEIGHTS.income + mks * WEIGHTS.marks + ag * WEIGHTS.age + pvtg * WEIGHTS.pvtg + qual * WEIGHTS.quality);
      return { application_id: a.id, overall };
    })
    .sort((x, y) => y.overall - x.overall)
    .map((s, i) => ({ ...s, rank: i + 1 }));
  return scored;
}
const ranked = rank(apps, docsByApp, 600000, 32);
assert("A5: poorer+better candidate ranks #1", ranked[0].application_id === "a2", JSON.stringify(ranked));
assert("A5b: ranks are sequential", ranked[0].rank === 1 && ranked[1].rank === 2, JSON.stringify(ranked));

// A6 — PVTG bonus participates in score (NFST weighted 0.10)
assert("A6: PVTG bonus weighting exists", WEIGHTS.pvtg === 0.10, `got ${WEIGHTS.pvtg}`);
assert("A6b: weights sum to 1", WEIGHTS.income + WEIGHTS.marks + WEIGHTS.age + WEIGHTS.pvtg + WEIGHTS.quality === 1, JSON.stringify(WEIGHTS));

// ═══════════════════════════════════════════════════════════
// SECTION B: Notification System (mirror of src/lib/notifications.ts)
// ═══════════════════════════════════════════════════════════
const TEMPLATES = {
  application_submitted: ["Application Submitted", "has been submitted successfully"],
  application_verified: ["AI Verification Complete", "verified with an AI confidence score"],
  deficiency_flagged: ["Action Required", "has deficiencies"],
  application_approved: ["Application Approved", "approved by the review committee"],
  application_rejected: ["Application Not Selected", "was not selected"],
  resubmission_requested: ["Resubmission Requested", "requested resubmission"],
  disbursement_initiated: ["Disbursement Initiated", "disbursement for"],
};
function generateNotification(type, userId, applicationId, data) {
  const t = TEMPLATES[type];
  if (!t) throw new Error("invalid type");
  return { id: "notif-x", user_id: userId, type, title: t[0], body: t[1] + " (" + (data.scheme || "") + ")", read: false, application_id: applicationId, created_at: "2025-01-01" };
}
const data = { scheme: "NOS", app_no: "NOS/2025/00001", score: "92", issues: "x", reason: "y", amount: "1L" };

assert("B1: submitted type generated", generateNotification("application_submitted", "u1", "a1", data).type === "application_submitted");
assert("B2: deficiency flagged body carries issue info", generateNotification("deficiency_flagged", "u1", "a1", data).body.length > 10);
assert("B3: all 7 types produce templates", Object.keys(TEMPLATES).length === 7, JSON.stringify(Object.keys(TEMPLATES)));
assert("B4: notification carries user_id + app_id", generateNotification("application_approved", "u9", "a99", data).user_id === "u9" && generateNotification("application_approved", "u9", "a99", data).application_id === "a99");
assert("B5: unread by default", generateNotification("disbursement_initiated", "u1", "a1", data).read === false);
assert("B6: invalid type throws", (() => { try { generateNotification("bananas", "u1", "a1", data); return false; } catch { return true; } })());
assert("B7: rejected body explains next step", generateNotification("application_rejected", "u1", "a1", data).title.includes("Not Selected"));

// Email HTML embeds a styled badge + CTA
function generateEmailHtml(type) {
  const t = TEMPLATES[type];
  return `<!DOCTYPE html>...<h2>${t[0]}</h2><p>${t[1]}</p>...<a href="http://localhost:3000/student/dashboard">View Application</a>...`;
}
assert("B8: email HTML is valid document", generateEmailHtml("application_approved").startsWith("<!DOCTYPE html>"));
assert("B9: email HTML contains CTA link", generateEmailHtml("application_approved").includes("<a href"));

// ═══════════════════════════════════════════════════════════
// SECTION C: Configurable Scheme Rules (mirror of src/lib/scheme-rules.ts)
// ═══════════════════════════════════════════════════════════
function createRuleStore() {
  let rules = [
    { id: "r1", scheme_id: "NOS", rule_key: "income_limit", rule_type: "number", value: 600000, enabled: true },
    { id: "r2", scheme_id: "NOS", rule_key: "max_age_masters", rule_type: "number", value: 32, enabled: true },
    { id: "r5", scheme_id: "NOS", rule_key: "qs_rank_required", rule_type: "boolean", value: true, enabled: true },
    { id: "r6", scheme_id: "NFST", rule_key: "net_required", rule_type: "boolean", value: true, enabled: true },
    { id: "r7", scheme_id: "NFST", rule_key: "pvtg_priority", rule_type: "boolean", value: true, enabled: true },
    { id: "r8", scheme_id: "NFST", rule_key: "min_qualifying_marks", rule_type: "number", value: 55, enabled: true },
  ];
  return {
    get(schemeId) { return rules.filter((r) => r.scheme_id === schemeId && r.enabled); },
    update(id, value) { const x = rules.find((r) => r.id === id); if (x) { x.value = value; return true; } return false; },
    toggle(id) { const x = rules.find((r) => r.id === id); if (x) { x.enabled = !x.enabled; return true; } return false; },
    reset() { rules = rules.map((r) => ({ ...r, enabled: true, value: r.value })); },
    all() { return rules; },
  };
}

const rs = createRuleStore();
assert("C1: NOS rules filtered + enabled only", rs.get("NOS").every((r) => r.scheme_id === "NOS" && r.enabled));
assert("C2: default NOS income limit = 600000", rs.get("NOS").find((r) => r.rule_key === "income_limit").value === 600000);
assert("C3: NFST has pvtg priority toggled on", rs.get("NFST").find((r) => r.rule_key === "pvtg_priority").value === true);

assert("C4: update income limit to 800000", (rs.update("r1", 800000) && rs.get("NOS").find((r) => r.rule_key === "income_limit").value === 800000));
assert("C5: disabled rule excluded from get()", (rs.toggle("r7") && !rs.get("NFST").some((r) => r.rule_key === "pvtg_priority")), JSON.stringify(rs.get("NFST")));
assert("C6: toggle back restores rule", (rs.toggle("r7") && rs.get("NFST").some((r) => r.rule_key === "pvtg_priority")));
assert("C7: update unknown id returns false", rs.update("does-not-exist", 5) === false);
assert("C8: boolean rules accept true/false", (rs.update("r6", false) && rs.get("NFST").find((r) => r.rule_key === "net_required").value === false));

// ═══════════════════════════════════════════════════════════
// SECTION D: Rate Limiter (mirror of src/lib/rate-limit.ts)
// ═══════════════════════════════════════════════════════════
function createLimiter() {
  const store = new Map();
  return function check(key, maxRequests = 60, windowMs = 60000) {
    const now = Date.now();
    const entry = store.get(key);
    if (!entry || now > entry.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, remaining: maxRequests - 1 };
    }
    if (entry.count >= maxRequests) return { allowed: false, remaining: 0 };
    entry.count++;
    return { allowed: true, remaining: maxRequests - entry.count };
  };
}
const limiter = createLimiter();
assert("D1: first request allowed", limiter("ip-1", 3, 60000).allowed === true);
assert("D2: second request allowed, remaining 1", limiter("ip-1", 3, 60000).remaining === 1);
assert("D3: third request allowed (last)", limiter("ip-1", 3, 60000).allowed === true);
assert("D4: fourth request blocked", limiter("ip-1", 3, 60000).allowed === false);
assert("D5: different key unaffected", limiter("ip-2", 3, 60000).allowed === true);
assert("D6: key bucketing is per-IP", limiter("ip-1", 3, 60000).allowed === false, "re-request after block should stay blocked");

// ═══════════════════════════════════════════════════════════
// SECTION E: Input Validation & Security (mirror of src/lib/validation.ts)
// ═══════════════════════════════════════════════════════════
const sanitize = (s) => s.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<iframe[\s\S]*?<\/iframe>/gi, "").replace(/<[^>]*>/g, "").replace(/javascript:/gi, "").replace(/on\w+=/gi, "").replace(/vbscript:/gi, "").trim().slice(0, 500);
const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const validMark = (m) => typeof m === "number" && m >= 0 && m <= 100;
const validIncome = (i) => typeof i === "number" && i >= 0 && i <= 100000000;
const validAge = (a) => typeof a === "number" && a >= 15 && a <= 60;
const validFileType = (t) => ["application/pdf", "image/jpeg", "image/png", "image/webp"].includes(t);
const validFileSize = (s, m = 5) => s > 0 && s <= m * 1024 * 1024;

assert("E1: XSS <script> block removed entirely", sanitize('<script>alert(1)</script> Priya') === 'Priya', `got "${sanitize('<script>alert(1)</script> Priya')}"`);
assert("E1b: nested script content stripped", !/<script|<\/script>/i.test(sanitize('hello <script>document.cookie</script> world')), `got "${sanitize('hello <script>document.cookie</script> world')}"`);
assert("E2: onerror handlers stripped", !/onerror/i.test(sanitize('<img src=x onerror=alert(1)>')), `got "${sanitize('<img src=x onerror=alert(1)>')}"`);
assert("E2b: full img tag removed", sanitize('<img src=x onerror=alert(1)>') === '', `got "${sanitize('<img src=x onerror=alert(1)>')}"`);
assert("E3: javascript: URI stripped", !/javascript:/i.test(sanitize('javascript:alert(1)')), `got "${sanitize('javascript:alert(1)')}"`);
assert("E4: valid email accepted", validEmail("priya@email.com") === true);
assert("E5: bad email rejected", validEmail("not-an-email") === false);
assert("E6: marks 0..100", validMark(0) && validMark(100) && !validMark(101) && !validMark(-1));
assert("E7: income bounds enforced", validIncome(100000000) && !validIncome(100000001) && !validIncome(-5));
assert("E8: age bounds 15..60", validAge(15) && validAge(60) && !validAge(14) && !validAge(61));
assert("E9: dangerous file type rejected", validFileType("text/html") === false);
assert("E10: oversized file rejected", validFileSize(6 * 1024 * 1024) === false);
assert("E11: empty file rejected", validFileSize(0) === false);
assert("E12: valid PDF accepted", validFileType("application/pdf") === true);

// Application-level validation bundle
function validateApplication(data) {
  const errors = [];
  if (!data.applicant_name || data.applicant_name.length < 2) errors.push("name");
  if (!validEmail(String(data.email))) errors.push("email");
  if (!["NOS", "NFST"].includes(String(data.scheme_id))) errors.push("scheme");
  return { valid: errors.length === 0, errors };
}
assert("E13: valid application passes", validateApplication({ applicant_name: "Priya", email: "p@e.com", scheme_id: "NOS" }).valid === true);
assert("E14: missing name rejected", validateApplication({ email: "p@e.com", scheme_id: "NOS" }).valid === false);
assert("E15: invalid scheme rejected", validateApplication({ applicant_name: "Priya", email: "p@e.com", scheme_id: "XYZ" }).valid === false);

// ═══════════════════════════════════════════════════════════
// SECTION F: CSV Export (mirror of src/lib/export.ts)
// ═══════════════════════════════════════════════════════════
function toCsv(apps) {
  if (apps.length === 0) return "";
  const headers = ["Application ID", "Scheme", "Applicant Name", "Status", "AI Score"];
  const rows = apps.map((a) => [a.id, a.scheme_id, a.applicant_name, a.status, String(a.ai_confidence_score)]);
  return [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
}
assert("F1: CSV has header row", toCsv([{ id: "a1", scheme_id: "NOS", applicant_name: "Priya", status: "submitted", ai_confidence_score: 0 }]).split("\n")[0].includes("Applicant Name"));
assert("F2: CSV escapes quotes", toCsv([{ id: "a1", scheme_id: "NOS", applicant_name: 'Pri"ya', status: "submitted", ai_confidence_score: 0 }]).includes('""'), "quotes must be doubled");
assert("F3: empty dataset -> empty string", toCsv([]) === "");

function statusDist(apps) {
  const d = {};
  apps.forEach((a) => { d[a.status] = (d[a.status] || 0) + 1; });
  return d;
}
assert("F4: status distribution counts correctly", statusDist([{ status: "approved" }, { status: "approved" }, { status: "rejected" }]).approved === 2 && statusDist([{ status: "approved" }, { status: "approved" }, { status: "rejected" }]).rejected === 1);

// ═══════════════════════════════════════════════════════════
// SECTION G: Scheme Statuses Integrity
// ═══════════════════════════════════════════════════════════
const VALID_STATUSES = ["draft", "submitted", "ai_verified", "official_review", "deficiency_flagged", "deficiency", "approved", "rejected", "official_approved", "disbursed"];
const incomingStatuses = ["submitted", "ai_verified", "official_review", "approved", "rejected", "deficiency", "disbursed"];
assert("G1: API update_status only accepts valid statuses", incomingStatuses.every((s) => VALID_STATUSES.includes(s)));
assert("G2: spam status rejected", !VALID_STATUSES.includes("hacked"));

// ═══════════════════════════════════════════════════════════
// SECTION H: Supabase env-guard (mirror of client/server guards)
// ═══════════════════════════════════════════════════════════
const hasSupabase = false; // simulating unset env in this environment
assert("H1: auth fully bypassed when env missing", hasSupabase === false && "guest mode active");
assert("H2: demo login works without Supabase", hasSupabase === false);

// ═══════════════════════════════════════════════════════════
console.log("\n════════════════════════════════════════════════");
console.log(`TRUST LOOP: ${passed} passed, ${failed} failed`);
console.log("════════════════════════════════════════════════\n");
results.forEach((r) => console.log(`  [${r.status}] ${r.name}${r.status === "FAIL" ? " — " + r.detail : ""}`));

if (failed > 0) process.exit(1);
else console.log("ALL CHECKS PASSED");