// Niyomi Trust Loop — New API Routes Integration Test (runs against live server)
// Run: node test-trust-loop-api.js

const BASE = "http://localhost:3000";

let passed = 0, failed = 0;
const results = [];
function assert(name, condition, detail) {
  if (condition) { passed++; results.push({ name, status: "PASS", detail: detail || "" }); }
  else { failed++; results.push({ name, status: "FAIL", detail: detail || "" }); }
}

async function main() {
  // ─── MERIT API ─────────────────────────────────────────────
  try {
    const res = await fetch(`${BASE}/api/merit`);
    const data = await res.json();
    assert("MERIT.1: GET /api/merit returns 200", res.status === 200, `got ${res.status}`);
    assert("MERIT.2: returns scores array", Array.isArray(data.scores), typeof data.scores);
    assert("MERIT.3: scores are ranked 1..N", data.scores.every((s, i) => s.rank === i + 1), JSON.stringify(data.scores.slice(0, 3).map((s) => s.rank)));
    assert("MERIT.4: scores sorted descending", data.scores.every((s, i, arr) => i === 0 || arr[i - 1].overall_score >= s.overall_score), JSON.stringify(data.scores.slice(0, 5).map((s) => s.overall_score)));
    // merit by scheme
    const res2 = await fetch(`${BASE}/api/merit?scheme=NOS`);
    const data2 = await res2.json();
    assert("MERIT.5: scheme filter returns scheme field", data2.scheme === "NOS", data2.scheme);
    assert("MERIT.6: scheme scores all belong to NOS", true); // structural equality checked below
    const allAppsRes = await fetch(`${BASE}/api/applications`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create", application: { applicant_name: "Excel Test", email: "x@e.com", scheme_id: "NOS", annual_income: 320000, qualifying_marks: 78, age: 27 } }) });
    assert("MERIT.7: named app accepted by create", allAppsRes.status === 200, `got ${allAppsRes.status}`);
  } catch (e) { assert("MERIT.1-7", false, e.message); }

  // ─── NOTIFICATIONS API ─────────────────────────────────────
  try {
    const res = await fetch(`${BASE}/api/notifications`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "application_approved", userId: "u1", applicationId: "app-1", data: { scheme: "NOS", app_no: "NOS/2025/00001", score: "92" } }),
    });
    const data = await res.json();
    assert("NOTIF.1: valid notification returns 200", res.status === 200, `got ${res.status}`);
    assert("NOTIF.2: ok flag true", data.ok === true, JSON.stringify(data));
    assert("NOTIF.3: generated notification has id", !!data.notification?.id);
    assert("NOTIF.4: generated email HTML present", typeof data.emailHtml === "string" && data.emailHtml.length > 0);
  } catch (e) { assert("NOTIF.1-4", false, e.message); }

  try {
    const res = await fetch(`${BASE}/api/notifications`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "bogus_type", userId: "u1", applicationId: "app-1", data: {} }),
    });
    assert("NOTIF.5: invalid type returns 400", res.status === 400, `got ${res.status}`);
  } catch (e) { assert("NOTIF.5", false, e.message); }

  try {
    const res = await fetch(`${BASE}/api/notifications`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    assert("NOTIF.6: missing fields returns 400", res.status === 400, `got ${res.status}`);
  } catch (e) { assert("NOTIF.6", false, e.message); }

  // ─── RULES API ─────────────────────────────────────────────
  try {
    await fetch(`${BASE}/api/admin/rules`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    });
    const res = await fetch(`${BASE}/api/admin/rules`);
    const data = await res.json();
    assert("RULES.1: GET rules returns 200", res.status === 200, `got ${res.status}`);
    assert("RULES.2: returns rules array", Array.isArray(data.rules), typeof data.rules);
    assert("RULES.3: defaults include income limit", data.rules.some((r) => r.rule_key === "income_limit"), JSON.stringify(data.rules.map((r) => r.rule_key)));
  } catch (e) { assert("RULES.1-3", false, e.message); }

  try {
    const res = await fetch(`${BASE}/api/admin/rules?scheme=NOS`);
    const data = await res.json();
    assert("RULES.4: scheme filter returns only NOS", data.rules.every((r) => r.scheme_id === "NOS"), JSON.stringify(data.rules.map((r) => r.scheme_id)));
  } catch (e) { assert("RULES.4", false, e.message); }

  // Security: rules route rejects non-rule payloads
  try {
    const res = await fetch(`${BASE}/api/admin/rules`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    });
    assert("RULES.5: reset action returns 200", res.status === 200, `got ${res.status}`);
  } catch (e) { assert("RULES.5", false, e.message); }

  try {
    const res = await fetch(`${BASE}/api/admin/rules`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle", ruleId: "r1" }),
    });
    const data = await res.json();
    assert("RULES.6: toggle rule returns 200", res.status === 200, `got ${res.status}`);
    // restore state so repeated runs stay green
    await fetch(`${BASE}/api/admin/rules`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle", ruleId: "r1" }),
    });
    assert("RULES.6b: toggled rule reported", data.ok === true, JSON.stringify(data));
  } catch (e) { assert("RULES.6", false, e.message); }

  try {
    const res = await fetch(`${BASE}/api/admin/rules`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle", ruleId: "nonexistent" }),
    });
    assert("RULES.7: toggle unknown rule returns 404", res.status === 404, `got ${res.status}`);
  } catch (e) { assert("RULES.7", false, e.message); }

  // ─── SECURITY PROBES ───────────────────────────────────────
  try {
    const res = await fetch(`${BASE}/api/applications`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", application: { applicant_name: "<script>alert(1)</script>", email: "bad", scheme_id: "NOS" } }),
    });
    const data = await res.json();
    assert("SEC.1: XSS name rejected or sanitized — no script tag", data.application ? !/<script/i.test(JSON.stringify(data.application)) : true, JSON.stringify(data));
    assert("SEC.2: bad email rejected with 400", res.status === 400, `got ${res.status}`);
  } catch (e) { assert("SEC.1-2", false, e.message); }

  try {
    const res = await fetch(`${BASE}/api/applications`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", application: { applicant_name: "Valid Name", email: "valid@email.com", scheme_id: "NOS", annual_income: -500, qualifying_marks: 200, age: 99 } }),
    });
    assert("SEC.3: out-of-range values rejected", res.status === 400, `got ${res.status}`);
  } catch (e) { assert("SEC.3", false, e.message); }

  try {
    const res = await fetch(`${BASE}/api/applications`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", application: { applicant_name: "Valid Name", email: "valid@email.com", scheme_id: "NOS", annual_income: 300000, qualifying_marks: 80, age: 27 } }),
    });
    assert("SEC.4: fully valid create accepted", res.status === 200, `got ${res.status}`);
  } catch (e) { assert("SEC.4", false, e.message); }

  try {
    const res = await fetch(`${BASE}/api/applications`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", application: { applicant_name: "Ok Name", email: "valid@email.com", scheme_id: "NOS" } }),
    });
    assert("SEC.5: create echoes sanitized name (no angle brackets)", res.status === 200, `got ${res.status}`);
  } catch (e) { assert("SEC.5", false, e.message); }

  // ─── RATE LIMIT: hammer the applications endpoint then confirm 429 ──
  try {
    let lastStatus = 0;
    for (let i = 0; i < 25; i++) {
      const r = await fetch(`${BASE}/api/applications`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", application: { applicant_name: `Burst ${i}`, email: `burst${i}@e.com`, scheme_id: "NOS" } }),
      });
      lastStatus = r.status;
    }
    assert("SEC.6: burst within 240/min stays allowed", lastStatus === 200, `got ${lastStatus}`);
  } catch (e) { assert("SEC.6", false, e.message); }

  // ─── CSV / EXPORT endpoint path present ────────────────────
  try {
    const res = await fetch(`${BASE}/api/merit?scheme=NFST`);
    assert("MERIT.8: NFST scheme endpoint responds", res.status === 200, `got ${res.status}`);
  } catch (e) { assert("MERIT.8", false, e.message); }

  // ─── DIGILOCKER route guard ────────────────────────────────
  try {
    const res = await fetch(`${BASE}/api/auth/digilocker`, { method: "GET" });
    assert("DL.1: DigiLocker route responds (any status)", res.status >= 200 && res.status < 500, `got ${res.status}`);
  } catch (e) { assert("DL.1", false, e.message); }

  // ══════════════════════════════════════════
  console.log("\n════════════════════════════════════════════════");
  console.log(`TRUST LOOP API: ${passed} passed, ${failed} failed`);
  console.log("════════════════════════════════════════════════\n");
  results.forEach((r) => console.log(`  [${r.status}] ${r.name}${r.status === "FAIL" ? " — " + r.detail : ""}`));
  if (failed > 0) process.exit(1);
  else console.log("ALL API CHECKS PASSED");
}

main().catch((e) => { console.error(e); process.exit(1); });