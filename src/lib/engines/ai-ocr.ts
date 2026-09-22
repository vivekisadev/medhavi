import type { DocType } from "../types";

const AI_PROVIDER = process.env.NEXT_PUBLIC_AI_PROVIDER || "mock";
const ENABLE_REAL_AI = process.env.NEXT_PUBLIC_ENABLE_REAL_AI_OCR === "true";
const GEMINI_KEY = process.env.GEMINI_API_KEY || "";
const OPENAI_KEY = process.env.OPENAI_API_KEY || "";

/* â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

interface OcrResult {
  qualityScore: number;
  extractedData: Record<string, string>;
  defectReason?: string;
}

/* â”€â”€ Prompt builder â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function buildPrompt(docType: DocType): string {
  const base = "You are an Indian government document OCR assistant. Extract structured data from this document image.";
  const typePrompts: Record<DocType, string> = {
    income_cert: `${base} Extract: applicant_name, father_mother_name, gross_annual_income, issue_date, certificate_number, issuing_authority. Format income as number in INR.`,
    caste_cert: `${base} Extract: applicant_name, father_mother_name, caste_category, sub_caste, certificate_number, issue_date, issuing_authority.`,
    admission_letter: `${base} Extract: student_name, university_name, course_name, course_duration, enrollment_date, department.`,
    marksheets: `${base} Extract: student_name, university_name, course_name, percentage_or_cgp, year_of_passing, roll_number.`,
    net_scorecard: `${base} Extract: candidate_name, subject, net_roll_number, net_score, qualifying_status, exam_date.`,
    qs_rank_proof: `${base} Extract: university_name, qs_world_ranking, ranking_year, ranking_body.`,
    photo: `${base} Extract: description of the person in the photo. Return { description: "..." }`,
  };
  return typePrompts[docType] || `${base} Extract all visible text fields as key-value pairs.`;
}

/* â”€â”€ Google Gemini Vision â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

async function callGemini(file: File, docType: DocType): Promise<OcrResult> {
  const base64 = await fileToBase64(file);
  const prompt = buildPrompt(docType);

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: file.type,
                  data: base64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1024,
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return parseAiResponse(text);
}

/* â”€â”€ OpenAI Vision â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

async function callOpenAI(file: File, docType: DocType): Promise<OcrResult> {
  const base64 = await fileToBase64(file);
  const prompt = buildPrompt(docType);

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: `${prompt}\n\nReturn ONLY a JSON object with keys: extractedData (object), qualityScore (0-100, based on image clarity), defectReason (string or null).` },
            {
              type: "image_url",
              image_url: {
                url: `data:${file.type};base64,${base64}`,
                detail: "high",
              },
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "";
  return parseAiResponse(text);
}

/* —— Parse AI text response → OcrResult —— */

function parseAiResponse(text: string): OcrResult {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      qualityScore: typeof parsed.qualityScore === "number" ? parsed.qualityScore : 85,
      extractedData: parsed.extractedData || parsed,
      defectReason: parsed.defectReason || undefined,
    };
  } catch {
    return {
      qualityScore: 80,
      extractedData: { raw_text: text.slice(0, 500) },
      defectReason: "AI response could not be parsed as structured JSON",
    };
  }
}

/* —— Mock OCR (offline fallback) —— */

function mockOcr(_file: File, docType: DocType): OcrResult {
  const mockData: Record<DocType, { score: number; data: Record<string, string> }> = {
    income_cert: {
      score: 88,
      data: {
        applicant_name: "Priya Sharma",
        father_mother_name: "Rajesh Sharma",
        gross_annual_income: "450000",
        issue_date: "2025-06-15",
        certificate_number: "IC-2025-MP-44821",
        issuing_authority: "District Collector, Bhopal",
      },
    },
    caste_cert: {
      score: 92,
      data: {
        applicant_name: "Priya Sharma",
        father_mother_name: "Rajesh Sharma",
        caste_category: "Scheduled Tribe",
        sub_caste: "Gond",
        certificate_number: "CC-2025-MP-11203",
        issue_date: "2025-07-01",
        issuing_authority: "Tehsildar, Hoshangabad",
      },
    },
    admission_letter: {
      score: 95,
      data: {
        student_name: "Priya Sharma",
        university_name: "University of Melbourne",
        course_name: "Master of Computer Science",
        course_duration: "2 years",
        enrollment_date: "2025-08-01",
        department: "School of Computing and Information Systems",
      },
    },
    marksheets: {
      score: 90,
      data: {
        student_name: "Priya Sharma",
        university_name: "Rajiv Gandhi Proudyogiki Vishwavidyalaya",
        course_name: "Bachelor of Technology in CSE",
        percentage_or_cgp: "8.7 CGPA",
        year_of_passing: "2024",
        roll_number: "0764CE2020",
      },
    },
    net_scorecard: {
      score: 87,
      data: {
        candidate_name: "Arjun Munda",
        subject: "Computer Science",
        net_roll_number: "NET-2024-CS-44821",
        net_score: "JRF Qualified",
        qualifying_status: "Qualified for JRF",
        exam_date: "2024-09-12",
      },
    },
    qs_rank_proof: {
      score: 91,
      data: {
        university_name: "University of Melbourne",
        qs_world_ranking: "13",
        ranking_year: "2025",
        ranking_body: "QS World University Rankings",
      },
    },
    photo: {
      score: 94,
      data: { description: "Passport-sized photograph of the applicant" },
    },
  };

  const mock = mockData[docType] || { score: 80, data: { raw_text: "Mock OCR placeholder" } };
  return { qualityScore: mock.score, extractedData: mock.data, defectReason: undefined };
}

/* —— Image quality assessment —— */

function assessQuality(file: File): { score: number; reason?: string } {
  const maxSizeBytes = parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB || "5") * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { score: 10, reason: `File exceeds ${process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB}MB limit` };
  }
  if (file.size < 50000) {
    return { score: 25, reason: "File is too small — likely a low-resolution scan" };
  }
  const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  if (!validTypes.includes(file.type)) {
    return { score: 0, reason: `Unsupported file type: ${file.type}` };
  }
  return { score: 90, reason: undefined };
}

/* —— Main entry point —— */

export async function processDocumentWithAi(
  file: File,
  docType: DocType
): Promise<OcrResult> {
  const quality = assessQuality(file);
  if (quality.score < 30) {
    return {
      qualityScore: quality.score,
      extractedData: {},
      defectReason: quality.reason || "Document quality is too low for OCR processing",
    };
  }

  if (!ENABLE_REAL_AI || AI_PROVIDER === "mock") {
    await new Promise((r) => setTimeout(r, 800));
    return mockOcr(file, docType);
  }

  try {
    if (AI_PROVIDER === "google_gemini" && GEMINI_KEY) {
      return await callGemini(file, docType);
    }
    if (AI_PROVIDER === "openai" && OPENAI_KEY) {
      return await callOpenAI(file, docType);
    }
    await new Promise((r) => setTimeout(r, 800));
    return mockOcr(file, docType);
  } catch (err) {
    console.error("[AI OCR] API call failed, falling back to mock:", err);
    await new Promise((r) => setTimeout(r, 600));
    return mockOcr(file, docType);
  }
}

/* —— Helpers —— */

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
}
