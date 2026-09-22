// Node 3: Backend API & AI Pipeline Integration Test
// Tests the /api/documents/process and /api/applications endpoints

const BASE = "http://localhost:3000";

let passed = 0, failed = 0;
const results = [];
function assert(name, condition, detail) {
  if (condition) { passed++; results.push({ name, status: "PASS", detail: detail || "" }); }
  else { failed++; results.push({ name, "status": "FAIL", detail: detail || "" }); }
}

async function testDocumentApi() {
  console.log("\n--- Document Processing API ---");

  // Test 1: Missing file
  try {
    const fd = new FormData();
    fd.append("docType", "income_cert");
    const res = await fetch(`${BASE}/api/documents/process`, { method: "POST", body: fd });
    assert("DOC.1: Missing file returns 400", res.status === 400, `got ${res.status}`);
  } catch (e) { assert("DOC.1: Missing file returns 400", false, e.message); }

  // Test 2: Missing docType
  try {
    const fd = new FormData();
    fd.append("file", new File(["test"], "test.pdf", { type: "application/pdf" }));
    const res = await fetch(`${BASE}/api/documents/process`, { method: "POST", body: fd });
    assert("DOC.2: Missing docType returns 400", res.status === 400, `got ${res.status}`);
  } catch (e) { assert("DOC.2: Missing docType returns 400", false, e.message); }

  // Test 3: Invalid docType
  try {
    const fd = new FormData();
    fd.append("file", new File(["test"], "test.pdf", { type: "application/pdf" }));
    fd.append("docType", "invalid_type");
    const res = await fetch(`${BASE}/api/documents/process`, { method: "POST", body: fd });
    assert("DOC.3: Invalid docType returns 400", res.status === 400, `got ${res.status}`);
  } catch (e) { assert("DOC.3: Invalid docType returns 400", false, e.message); }

  // Test 4: Valid income_cert upload (mock mode)
  try {
    const fd = new FormData();
    const fakePdf = new Uint8Array(60000); // >50KB to pass quality check
    fakePdf[0] = 37; fakePdf[1] = 80; fakePdf[2] = 68; fakePdf[3] = 70; // %PDF header
    fd.append("file", new Blob([fakePdf], { type: "application/pdf" }), "income_cert.pdf");
    fd.append("docType", "income_cert");
    const res = await fetch(`${BASE}/api/documents/process`, { method: "POST", body: fd });
    const data = await res.json();
    assert("DOC.4: Valid upload returns success", res.status === 200 && data.success, `got ${res.status}`);
    assert("DOC.5: Response has qualityScore", typeof data.qualityScore === "number", `got ${typeof data.qualityScore}`);
    assert("DOC.6: Response has extractedData", typeof data.extractedData === "object" && data.extractedData !== null, `got ${typeof data.extractedData}`);
    assert("DOC.7: Extracted data has applicant_name", data.extractedData.applicant_name === "Priya Sharma", `got ${data.extractedData.applicant_name}`);
    assert("DOC.8: Mock income data present", data.extractedData.gross_annual_income === "450000", `got ${data.extractedData.gross_annual_income}`);
  } catch (e) { assert("DOC.4-8: Valid upload flow", false, e.message); }

  // Test 5: Valid caste_cert upload
  try {
    const fd = new FormData();
    const fakeImg = new Uint8Array(60000); // >50KB
    fakeImg[0] = 137; fakeImg[1] = 80; fakeImg[2] = 78; fakeImg[3] = 71; // PNG header
    fd.append("file", new Blob([fakeImg], { type: "image/png" }), "caste_cert.png");
    fd.append("docType", "caste_cert");
    const res = await fetch(`${BASE}/api/documents/process`, { method: "POST", body: fd });
    const data = await res.json();
    assert("DOC.9: Caste cert returns success", res.status === 200 && data.success, `got ${res.status}`);
    assert("DOC.10: Caste cert has caste_category", data.extractedData.caste_category === "Scheduled Tribe", `got ${data.extractedData.caste_category}`);
  } catch (e) { assert("DOC.9-10: Caste cert upload", false, e.message); }

  // Test 6: All docTypes accepted
  const allTypes = ["income_cert", "caste_cert", "admission_letter", "marksheets", "net_scorecard", "qs_rank_proof", "photo"];
  for (const docType of allTypes) {
    try {
      const fd = new FormData();
      const buf = new Uint8Array(60000);
      buf[0] = 255; buf[1] = 216; buf[2] = 255; buf[3] = 224; // JPEG header
      fd.append("file", new Blob([buf], { type: "image/jpeg" }), `${docType}.jpg`);
      fd.append("docType", docType);
      const res = await fetch(`${BASE}/api/documents/process`, { method: "POST", body: fd });
      const data = await res.json();
      assert(`DOC.${docType}: Accepted`, res.status === 200 && data.success, `got ${res.status}`);
    } catch (e) { assert(`DOC.${docType}: Accepted`, false, e.message); }
  }
}

async function testApplicationsApi() {
  console.log("\n--- Applications API ---");

  // Test 1: Verify action
  try {
    const mockApp = {
      id: "test-1", user_id: "u1", scheme_id: "NOS", application_no: "NOS-2025-001",
      status: "submitted", ai_confidence_score: 0, annual_income: 450000,
      age: 25, qualifying_marks: 78, university_name: "Melbourne",
      course_type: "Masters", net_qualification: null, created_at: "", updated_at: "",
    };
    const res = await fetch(`${BASE}/api/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify", application: mockApp, documents: [], scheme: { id: "NOS", scheme_name: "NOS", description: "", eligibility_rules: { income_limit: 600000, max_age_masters: 32, max_age_phd: 35, min_qualifying_marks: 55, net_required: false, qs_rank_required: true, pvtg_priority: true, description: "" } } }),
    });
    const data = await res.json();
    assert("APP.1: Verify returns success", res.status === 200 && data.success, `got ${res.status}`);
    assert("APP.2: Verification has rule_checks", Array.isArray(data.verification?.rule_checks), `got ${typeof data.verification?.rule_checks}`);
    assert("APP.3: Verification has overall_score", typeof data.verification?.overall_score === "number", `got ${typeof data.verification?.overall_score}`);
  } catch (e) { assert("APP.1-3: Verify action", false, e.message); }

  // Test 2: Update status
  try {
    const res = await fetch(`${BASE}/api/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_status", application: { id: "test-1" }, targetStatus: "official_approved" }),
    });
    const data = await res.json();
    assert("APP.4: Update status returns success", res.status === 200 && data.success, `got ${res.status}`);
    assert("APP.5: Status updated to official_approved", data.application?.status === "official_approved", `got ${data.application?.status}`);
  } catch (e) { assert("APP.4-5: Update status", false, e.message); }

  // Test 3: Invalid status
  try {
    const res = await fetch(`${BASE}/api/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_status", application: { id: "test-1" }, targetStatus: "invalid_status" }),
    });
    assert("APP.6: Invalid status returns 400", res.status === 400, `got ${res.status}`);
  } catch (e) { assert("APP.6: Invalid status", false, e.message); }

  // Test 4: Missing params
  try {
    const res = await fetch(`${BASE}/api/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify" }),
    });
    assert("APP.7: Missing params returns 400", res.status === 400, `got ${res.status}`);
  } catch (e) { assert("APP.7: Missing params", false, e.message); }

  // Test 5: Unknown action
  try {
    const res = await fetch(`${BASE}/api/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "unknown" }),
    });
    assert("APP.8: Unknown action returns 400", res.status === 400, `got ${res.status}`);
  } catch (e) { assert("APP.8: Unknown action", false, e.message); }
}

async function run() {
  console.log("=== NIYOMI NODE 3: API & Pipeline Tests ===");
  await testDocumentApi();
  await testApplicationsApi();

  console.log("\n========================================");
  console.log("  NODE 3 API TEST REPORT");
  console.log("========================================\n");
  results.forEach(r => console.log(`  ${r.status === "PASS" ? "✓" : "✗"} ${r.status} | ${r.name}${r.detail ? " (" + r.detail + ")" : ""}`));
  console.log("\n----------------------------------------");
  console.log(`  Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log("----------------------------------------\n");
  if (failed > 0) { console.log("  ✗ NODE 3 FAILED"); process.exit(1); }
  else { console.log(`  ✓ NODE 3 PASSED — All ${passed} API tests passed`); }
}

run();
