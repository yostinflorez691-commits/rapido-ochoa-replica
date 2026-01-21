import { NextRequest, NextResponse } from 'next/server';
import { getAuthHeaders } from '@/lib/token-manager';

const API_BASE = 'https://one-api.rapidoochoa.com.co/api/v2';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;
    const decodedTripId = decodeURIComponent(tripId);

    console.log('Fetching trip details for:', decodedTripId);

    // Step 1: Create details request
    const createUrl = `${API_BASE}/trips/${encodeURIComponent(decodedTripId)}/details_requests`;
    console.log('POST URL:', createUrl);

    const createResponse = await fetch(createUrl, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    console.log('Create response status:', createResponse.status);

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('Create request failed:', errorText);
      return NextResponse.json(
        { error: 'Failed to create details request', details: errorText },
        { status: createResponse.status }
      );
    }

    const createData = await createResponse.json();
    const requestId = createData.id;
    console.log('Request ID:', requestId);

    // Step 2: Poll for results
    let attempts = 0;
    const maxAttempts = 20;
    const pollInterval = 500; // 500ms

    while (attempts < maxAttempts) {
      const pollUrl = `${API_BASE}/trips/${encodeURIComponent(decodedTripId)}/details_requests/${requestId}`;
      const pollResponse = await fetch(pollUrl, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!pollResponse.ok) {
        console.log(`Poll attempt ${attempts + 1} failed:`, pollResponse.status);
        attempts++;
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        continue;
      }

      const pollData = await pollResponse.json();
      console.log(`Poll attempt ${attempts + 1}, state:`, pollData.state);

      if (pollData.state === 'finished') {
        console.log('Trip details loaded successfully');
        return NextResponse.json(pollData);
      }

      if (pollData.state === 'error' || pollData.error_code) {
        console.error('Trip details error:', pollData.error_message);
        return NextResponse.json(
          { error: pollData.error_message || 'Error fetching trip details' },
          { status: 500 }
        );
      }

      attempts++;
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    return NextResponse.json(
      { error: 'Timeout waiting for trip details' },
      { status: 408 }
    );
  } catch (error) {
    console.error('Trip details API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
