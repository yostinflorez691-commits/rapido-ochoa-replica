// API Service for Rápido Ochoa
const API_BASE = "https://one-api.rapidoochoa.com.co/api/v2";

export interface Terminal {
  id: number;
  display: string;
  ascii_display: string;
  city_name: string;
  city_ascii_name: string;
  slug: string;
  city_slug: string;
  state: string;
  country: string;
  popularity: string;
  result_type: string;
  lat: number | null;
  long: number | null;
  tags: string[];
  tenant_id: number;
  meta: Record<string, unknown>;
}

export interface SearchResult {
  id: string;
  departure: string;
  arrival: string;
  duration: number;
  price: number;
  currency: string;
  available_seats: number;
  bus_type: string;
  company: string;
  origin_terminal: string;
  destination_terminal: string;
  amenities: string[];
}

export interface SearchResponse {
  search_id: string;
  results: SearchResult[];
}

// Fetch all terminals (places)
export async function fetchTerminals(): Promise<Terminal[]> {
  try {
    const response = await fetch(`${API_BASE}/places?prefetch=true`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data as Terminal[];
  } catch (error) {
    console.error("Error fetching terminals:", error);
    return [];
  }
}

// Fetch destinations from a specific origin
export async function fetchDestinations(originSlug: string): Promise<Terminal[]> {
  try {
    const response = await fetch(
      `${API_BASE}/places?from=${encodeURIComponent(originSlug)}&order_by=origin_hits`,
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data as Terminal[];
  } catch (error) {
    console.error("Error fetching destinations:", error);
    return [];
  }
}

// Create a search for trips
export async function createSearch(
  origin: string,
  destination: string,
  date: string, // Format: DD-MM-YYYY
  passengers: string[] = ["adult"]
): Promise<{ search_id: string } | null> {
  try {
    const response = await fetch(`${API_BASE}/search`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
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
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating search:", error);
    return null;
  }
}

// Get search results
export async function getSearchResults(searchId: string): Promise<unknown> {
  try {
    const response = await fetch(`${API_BASE}/search/${searchId}?type=bus`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting search results:", error);
    return null;
  }
}
