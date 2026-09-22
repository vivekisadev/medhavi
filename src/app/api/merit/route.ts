import { NextResponse } from "next/server";
import { calculateMeritScores, getMeritsForScheme } from "@/lib/engines/merit-engine";
import type { Application, Document, Scheme } from "@/lib/types";

// Mock data import for now â€” in production this queries Supabase
import { mockApplications, mockDocuments, schemes } from "@/lib/data/mock-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scheme = searchParams.get("scheme") as "NOS" | "NFST" | null;

  const apps = mockApplications as Application[];
  const docs = mockDocuments as Document[];
  const allSchemes = schemes as Scheme[];

  const allScores = calculateMeritScores(apps, docs, allSchemes);

  if (scheme) {
    const schemeScores = getMeritsForScheme(allScores, apps, scheme);
    return NextResponse.json({ scores: schemeScores, scheme });
  }

  return NextResponse.json({ scores: allScores });
}
