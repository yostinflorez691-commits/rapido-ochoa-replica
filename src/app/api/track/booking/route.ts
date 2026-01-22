import { NextRequest, NextResponse } from 'next/server';
import { getGeoData, notifyPassengerBooking } from '@/lib/telegram';

export async function POST(request: NextRequest) {
  try {
    // Obtener IP del cliente
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    let ip = forwardedFor?.split(',')[0].trim() || realIp || 'unknown';

    // Si es localhost, usar una IP de prueba
    if (ip === '::1' || ip === '127.0.0.1' || ip === 'unknown') {
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        if (ipResponse.ok) {
          const data = await ipResponse.json();
          ip = data.ip;
        }
      } catch {
        ip = '0.0.0.0';
      }
    }

    // Parsear body
    const body = await request.json();
    const { tripData } = body;

    if (!tripData) {
      return NextResponse.json({ success: false, error: 'Missing trip data' }, { status: 400 });
    }

    // Obtener datos de geolocalización
    const geoData = await getGeoData(ip);

    // Enviar notificación a Telegram
    await notifyPassengerBooking(tripData, geoData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking booking:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
