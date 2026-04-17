import { type NextRequest, NextResponse } from "next/server";

const FASTAPI_BASE = process.env.FASTAPI_BASE_URL || "http://127.0.0.1:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${FASTAPI_BASE}/substitute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      // Longer timeout for substitution requests
      signal: AbortSignal.timeout(120000),
    });

    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After") || "30";
      return NextResponse.json(
        {
          error: "Rate limit reached",
          retry_after: Number.parseInt(retryAfter),
        },
        { status: 429, headers: { "Retry-After": retryAfter } }
      );
    }

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in substitute:", error);
    return NextResponse.json(
      { error: "Failed to get substitution" },
      { status: 500 }
    );
  }
}
