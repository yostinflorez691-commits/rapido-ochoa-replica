import { NextRequest, NextResponse } from 'next/server';
import { getGeoData, notifyNewVisitor } from '@/lib/telegram';

// Almacenamiento temporal para evitar notificaciones duplicadas
const recentVisitors = new Map<string, number>();
const DUPLICATE_WINDOW_MS = 5 * 60 * 1000; // 5 minutos

// Limpiar visitantes viejos periódicamente
setInterval(() => {
  const now = Date.now();
  for (const [key, time] of recentVisitors.entries()) {
    if (now - time > DUPLICATE_WINDOW_MS) {
      recentVisitors.delete(key);
    }
  }
}, 60000);

export async function POST(request: NextRequest) {
  try {
    // Obtener IP del cliente
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    let ip = forwardedFor?.split(',')[0].trim() || realIp || 'unknown';

    // Si es localhost, usar una IP de prueba o la real
    if (ip === '::1' || ip === '127.0.0.1' || ip === 'unknown') {
      // En desarrollo, intentar obtener IP real
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

    // Verificar si ya notificamos a este visitante recientemente
    const visitorKey = ip;
    const lastVisit = recentVisitors.get(visitorKey);
    if (lastVisit && Date.now() - lastVisit < DUPLICATE_WINDOW_MS) {
      return NextResponse.json({ success: true, cached: true });
    }
    recentVisitors.set(visitorKey, Date.now());

    // Parsear body
    const body = await request.json();
    const { page, referer } = body;

    // Obtener datos de geolocalización
    const geoData = await getGeoData(ip);

    // Obtener User-Agent
    const userAgent = request.headers.get('user-agent') || undefined;

    // Crear timestamp en hora Colombia
    const timestamp = new Date().toLocaleString('es-CO', {
      timeZone: 'America/Bogota',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    // Enviar notificación a Telegram
    await notifyNewVisitor({
      geo: geoData,
      userAgent,
      referer,
      page,
      timestamp,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking visitor:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
