import { type NextRequest, NextResponse } from "next/server";

const FASTAPI_BASE = process.env.FASTAPI_BASE_URL || "http://127.0.0.1:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${FASTAPI_BASE}/generate-cuisine-recipes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[v0] Backend error response:", errorText);
      throw new Error(
        `Backend responded with ${response.status}: ${errorText}`
      );
    }

    const data = await response.json();

    // Normalize response format
    if (Array.isArray(data)) {
      return NextResponse.json({ recipes: data });
    } else if (data.recipes) {
      return NextResponse.json(data);
    } else if (data.data) {
      return NextResponse.json({ recipes: data.data });
    } else {
      return NextResponse.json({ recipes: [] });
    }
  } catch (error) {
    console.error("Error in generate-cuisine-recipes:", error);
    return NextResponse.json(
      { error: "Failed to generate cuisine recipes" },
      { status: 500 }
    );
  }
}
