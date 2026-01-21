// Token Manager - Gestiona el token de API dinámicamente
// El token se almacena aquí y se puede actualizar si cambia

// Token actual conocido (extraído del sitio original el 20 Enero 2026)
let API_TOKEN = 'ac1d2715377e5d88e7fffe848034c0b1';

// Timestamp de última actualización
let lastUpdated = Date.now();

// Obtener el token actual
export function getApiToken(): string {
  return API_TOKEN;
}

// Actualizar el token
export function setApiToken(newToken: string): void {
  API_TOKEN = newToken;
  lastUpdated = Date.now();
  console.log(`[TokenManager] Token actualizado: ${newToken.substring(0, 8)}...`);
}

// Verificar si el token es válido (no ha expirado)
// Por ahora asumimos que el token no expira, pero podemos agregar lógica aquí
export function isTokenValid(): boolean {
  // Los tokens de API pública generalmente no expiran
  // Si detectamos que expiran, podemos agregar lógica de tiempo aquí
  return API_TOKEN.length > 0;
}

// Headers de autenticación para las llamadas API
export function getAuthHeaders(): Record<string, string> {
  return {
    'Authorization': `Token token=${API_TOKEN}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}

// Información del token para debugging
export function getTokenInfo(): { token: string; lastUpdated: Date; masked: string } {
  return {
    token: API_TOKEN,
    lastUpdated: new Date(lastUpdated),
    masked: `${API_TOKEN.substring(0, 8)}...${API_TOKEN.substring(API_TOKEN.length - 4)}`,
  };
}

// NOTA: Si el token cambia frecuentemente, se puede implementar:
// 1. Un endpoint que scrape el sitio original para extraer el nuevo token
// 2. Un cron job que verifique periódicamente si el token sigue funcionando
// 3. Un fallback que detecte errores 401 y dispare la actualización

export default {
  getApiToken,
  setApiToken,
  isTokenValid,
  getAuthHeaders,
  getTokenInfo,
};
