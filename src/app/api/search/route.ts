import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://one-api.rapidoochoa.com.co/api/v2";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { origin, destination, date, passengers = ["adult"] } = body;

    if (!origin || !destination || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_BASE}/search`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Origin": "https://viajes.rapidoochoa.com.co",
        "Referer": "https://viajes.rapidoochoa.com.co/",
      },
      body: JSON.stringify({
        origin,
        destination,
        date,
        passengers,
        way: "departure",
        round: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Search API error:", errorText);
      return NextResponse.json(
        { error: "Failed to create search" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in search API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchId = searchParams.get("id");

    if (!searchId) {
      return NextResponse.json(
        { error: "Missing search ID" },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_BASE}/search/${searchId}?type=bus`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Origin": "https://viajes.rapidoochoa.com.co",
        "Referer": "https://viajes.rapidoochoa.com.co/",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to get search results" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error getting search results:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
