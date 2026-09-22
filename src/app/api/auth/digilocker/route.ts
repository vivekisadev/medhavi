import { NextRequest, NextResponse } from "next/server";

const DIGILOCKER_CLIENT_ID = process.env.DIGILOCKER_CLIENT_ID || "";
const DIGILOCKER_CLIENT_SECRET = process.env.DIGILOCKER_CLIENT_SECRET || "";
const DIGILOCKER_REDIRECT_URI = process.env.DIGILOCKER_REDIRECT_URI || "";

const DIGILOCKER_AUTH_URL = "https://api.digitallocker.gov.in/public/oauth2/1/authorize";
const DIGILOCKER_TOKEN_URL = "https://api.digitallocker.gov.in/public/oauth2/1/token";
const DIGILOCKER_DOC_API = "https://api.digitallocker.gov.in/public/oauth2/1/files";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (action === "authorize") {
    const state = searchParams.get("state") || crypto.randomUUID();
    const authUrl = `${DIGILOCKER_AUTH_URL}?response_type=code&client_id=${DIGILOCKER_CLIENT_ID}&redirect_uri=${encodeURIComponent(DIGILOCKER_REDIRECT_URI)}&state=${state}&dl_flow=eSign`;
    return NextResponse.json({ authUrl });
  }

  if (action === "exchange") {
    const code = searchParams.get("code");
    if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });

    try {
      const tokenRes = await fetch(DIGILOCKER_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: DIGILOCKER_CLIENT_ID,
          client_secret: DIGILOCKER_CLIENT_SECRET,
          redirect_uri: DIGILOCKER_REDIRECT_URI,
          grant_type: "authorization_code",
        }),
      });

      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) {
        return NextResponse.json({ error: "Token exchange failed" }, { status: 401 });
      }

      return NextResponse.json({
        accessToken: tokenData.access_token,
        expiresIn: tokenData.expires_in,
      });
    } catch {
      return NextResponse.json({ error: "Token exchange error" }, { status: 500 });
    }
  }

  if (action === "fetch-documents") {
    const accessToken = searchParams.get("accessToken");
    if (!accessToken) return NextResponse.json({ error: "Missing access token" }, { status: 400 });

    try {
      const docTypes = [
        { uri: "dl://012301783862/PanCard", name: "PAN Card" },
        { uri: "dl://012301783862/AadhaarCard", name: "Aadhaar Card" },
        { uri: "dl://012301783862/Class10Marksheet", name: "Class X Marksheet" },
        { uri: "dl://012301783862/Class12Marksheet", name: "Class XII Marksheet" },
        { uri: "dl://012301783862/DegreeCertificate", name: "Degree Certificate" },
      ];

      const documents = [];
      for (const doc of docTypes) {
        try {
          const res = await fetch(`${DIGILOCKER_DOC_API}?uri=${encodeURIComponent(doc.uri)}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (res.ok) {
            const data = await res.json();
            documents.push({
              name: doc.name,
              uri: doc.uri,
              available: true,
              data: data,
            });
          }
        } catch {
          documents.push({ name: doc.name, uri: doc.uri, available: false });
        }
      }

      return NextResponse.json({ documents });
    } catch {
      return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
