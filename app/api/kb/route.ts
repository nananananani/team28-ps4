import { NextResponse } from "next/server";
import { searchKBArticles } from "@/lib/db";

export const runtime = "nodejs";

/**
 * GET /api/kb
 * Query params: q, category
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || undefined;
    const category = searchParams.get("category") || undefined;

    const articles = await searchKBArticles(query, category);
    return NextResponse.json({ articles });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load KB articles";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
