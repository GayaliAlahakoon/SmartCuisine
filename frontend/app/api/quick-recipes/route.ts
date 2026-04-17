import { type NextRequest, NextResponse } from "next/server";

const FASTAPI_BASE = process.env.FASTAPI_BASE_URL || "http://127.0.0.1:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${FASTAPI_BASE}/quick-recipes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();

    // Normalize response format
    if (Array.isArray(data)) {
      return NextResponse.json({ recipes: data });
    } else if (data.recipes) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json({ recipes: [] });
    }
  } catch (error) {
    console.error("Error in quick-recipes:", error);
    return NextResponse.json(
      { error: "Failed to generate recipes" },
      { status: 500 }
    );
  }
}
