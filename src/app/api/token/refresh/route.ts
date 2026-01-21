import { NextResponse } from 'next/server';
import { setApiToken, getTokenInfo } from '@/lib/token-manager';

// Este endpoint extrae el token de la API del sitio original
// Útil si el token cambia y necesita actualizarse automáticamente

const ORIGINAL_SITE = 'https://viajes.rapidoochoa.com.co';

export async function POST() {
  try {
    console.log('[Token Refresh] Intentando extraer token del sitio original...');

    // Método 1: Intentar obtener el token de las cabeceras de una petición real
    // Hacemos una petición a la API de lugares que es pública
    const testResponse = await fetch('https://one-api.rapidoochoa.com.co/api/v2/places?prefetch=true', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Referer': ORIGINAL_SITE,
      },
    });

    // Si funciona sin token, el endpoint es público
    if (testResponse.ok) {
      console.log('[Token Refresh] El endpoint places funciona sin token');
    }

    // Método 2: Extraer token del HTML/JS del sitio
    // Esto requeriría Playwright en el servidor, lo cual no es práctico
    // En su lugar, proporcionamos instrucciones manuales

    const currentToken = getTokenInfo();

    return NextResponse.json({
      message: 'Token refresh endpoint',
      currentToken: currentToken.masked,
      lastUpdated: currentToken.lastUpdated,
      instructions: {
        manual: [
          '1. Abre https://viajes.rapidoochoa.com.co en Chrome',
          '2. Abre DevTools (F12) > Network',
          '3. Haz una búsqueda de viajes',
          '4. Busca cualquier petición a one-api.rapidoochoa.com.co',
          '5. Copia el valor del header "Authorization"',
          '6. El token está después de "Token token="',
        ],
        updateEndpoint: 'POST /api/token/update con body { "token": "nuevo_token" }',
      },
    });
  } catch (error) {
    console.error('[Token Refresh] Error:', error);
    return NextResponse.json(
      { error: 'Error al intentar refrescar token' },
      { status: 500 }
    );
  }
}

// Endpoint para actualizar el token manualmente
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== 'string' || token.length < 10) {
      return NextResponse.json(
        { error: 'Token inválido. Debe ser un string de al menos 10 caracteres.' },
        { status: 400 }
      );
    }

    // Validar el token haciendo una petición de prueba
    const testResponse = await fetch('https://one-api.rapidoochoa.com.co/api/v2/places?prefetch=true', {
      method: 'GET',
      headers: {
        'Authorization': `Token token=${token}`,
        'Accept': 'application/json',
      },
    });

    if (!testResponse.ok) {
      return NextResponse.json(
        { error: 'Token inválido. La API rechazó el token.', status: testResponse.status },
        { status: 400 }
      );
    }

    // Actualizar el token
    setApiToken(token);

    const newTokenInfo = getTokenInfo();

    return NextResponse.json({
      success: true,
      message: 'Token actualizado correctamente',
      token: newTokenInfo.masked,
      updatedAt: newTokenInfo.lastUpdated,
    });
  } catch (error) {
    console.error('[Token Update] Error:', error);
    return NextResponse.json(
      { error: 'Error al actualizar token' },
      { status: 500 }
    );
  }
}

// Endpoint para obtener el estado actual del token
export async function GET() {
  const tokenInfo = getTokenInfo();

  // Probar si el token actual funciona
  let isWorking = false;
  try {
    const testResponse = await fetch('https://one-api.rapidoochoa.com.co/api/v2/places?prefetch=true', {
      method: 'GET',
      headers: {
        'Authorization': `Token token=${tokenInfo.token}`,
        'Accept': 'application/json',
      },
    });
    isWorking = testResponse.ok;
  } catch {
    isWorking = false;
  }

  return NextResponse.json({
    token: tokenInfo.masked,
    lastUpdated: tokenInfo.lastUpdated,
    isWorking,
    refreshEndpoint: 'POST /api/token/refresh',
    updateEndpoint: 'PUT /api/token/refresh con body { "token": "nuevo_token" }',
  });
}
