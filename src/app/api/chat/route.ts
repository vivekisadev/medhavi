import { NextRequest, NextResponse } from "next/server";

const GEMINI_KEY = process.env.GEMINI_API_KEY || "";

const SYSTEM_PROMPT = `You are Medhavi, an expert AI assistant for Scheduled Tribe (ST) students applying for scholarships under the Ministry of Tribal Affairs (MoTA). 
You help students understand two main schemes:
1. National Overseas Scholarship (NOS): For Master's/Ph.D. abroad (QS Top 1000). Max income ₹6,00,000. Age limit 32 (Masters), 35 (Ph.D.).
2. National Fellowship for ST (NFST): For Ph.D. in India. Requires UGC-NET/JRF. No income cap. Priority to PVTG (Particularly Vulnerable Tribal Groups).

Be concise, helpful, and polite. If you don't know, tell them to check the official MoTA portal.`;

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (!GEMINI_KEY) {
      return NextResponse.json({ reply: "Mock Mode: Please add GEMINI_API_KEY to your .env.local file to chat with the real Medhavi AI." });
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\nUser Question: " + message }] }
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 250,
          },
        }),
      }
    );

    if (!res.ok) {
      throw new Error("Gemini API Error");
    }

    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't understand that.";

    return NextResponse.json({ reply });

  } catch (err) {
    console.error("[API /chat]", err);
    return NextResponse.json({ error: "Failed to process chat" }, { status: 500 });
  }
}
