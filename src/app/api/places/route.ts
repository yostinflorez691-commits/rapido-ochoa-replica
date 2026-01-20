import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://one-api.rapidoochoa.com.co/api/v2";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const query = searchParams.get("q");

    let url = `${API_BASE}/places?prefetch=true`;

    if (from) {
      url = `${API_BASE}/places?from=${encodeURIComponent(from)}&order_by=origin_hits`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Origin": "https://viajes.rapidoochoa.com.co",
        "Referer": "https://viajes.rapidoochoa.com.co/",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch places" },
        { status: response.status }
      );
    }

    let data = await response.json();

    // Filter by query if provided
    if (query && Array.isArray(data)) {
      const searchQuery = query.toLowerCase();
      data = data.filter((place: { display?: string; city_name?: string; state?: string }) =>
        place.display?.toLowerCase().includes(searchQuery) ||
        place.city_name?.toLowerCase().includes(searchQuery) ||
        place.state?.toLowerCase().includes(searchQuery)
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in places API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
