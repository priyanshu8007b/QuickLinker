import { NextRequest, NextResponse } from "next/server";
import { getLinkByCode, recordClick } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { shortCode: string } }
) {
  const { shortCode } = params;
  
  // Simulated Cache Check (In real app, use Redis)
  const link = getLinkByCode(shortCode);

  if (!link) {
    return NextResponse.redirect(new URL("/404", request.url));
  }

  // Check Expiration
  if (link.expireAt && new Date(link.expireAt) < new Date()) {
    return NextResponse.json({ error: "Link expired" }, { status: 410 });
  }

  // Record Click Asynchronously (Fire and forget)
  const userAgent = request.headers.get("user-agent") || "";
  const referrer = request.headers.get("referer") || "";
  
  // We can't actually do background processing in a simple route handler without a worker,
  // but we can simulate it by recording before redirecting.
  // In a real high-perf system, this would push to a message queue.
  recordClick(link.id, userAgent, referrer);

  // Default to 302 redirect for accurate analytics
  return NextResponse.redirect(link.originalUrl, 302);
}