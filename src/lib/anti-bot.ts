/**
 * Protección Anti-Bot y Anti-Spam
 * Implementa múltiples capas de seguridad contra bots y spam
 */

// Rate limiting con ventana deslizante
interface RateLimitEntry {
  count: number;
  firstRequest: number;
  lastRequest: number;
  blocked: boolean;
  blockUntil: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuración de rate limiting
const RATE_LIMIT_CONFIG = {
  windowMs: 60000,        // Ventana de 1 minuto
  maxRequests: 5,         // Máximo 5 requests por ventana
  blockDurationMs: 300000, // Bloqueo de 5 minutos si excede
  cleanupIntervalMs: 60000, // Limpiar entradas viejas cada minuto
};

// Limpiar entradas expiradas periódicamente
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now - entry.lastRequest > RATE_LIMIT_CONFIG.windowMs * 2) {
      rateLimitStore.delete(key);
    }
  }
}, RATE_LIMIT_CONFIG.cleanupIntervalMs);

/**
 * Verifica rate limiting para una IP
 */
export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry) {
    rateLimitStore.set(ip, {
      count: 1,
      firstRequest: now,
      lastRequest: now,
      blocked: false,
      blockUntil: 0,
    });
    return { allowed: true };
  }

  // Si está bloqueado, verificar si ya pasó el tiempo
  if (entry.blocked) {
    if (now < entry.blockUntil) {
      return {
        allowed: false,
        retryAfter: Math.ceil((entry.blockUntil - now) / 1000)
      };
    }
    // Desbloquear
    entry.blocked = false;
    entry.count = 1;
    entry.firstRequest = now;
  }

  // Si la ventana expiró, reiniciar contador
  if (now - entry.firstRequest > RATE_LIMIT_CONFIG.windowMs) {
    entry.count = 1;
    entry.firstRequest = now;
    entry.lastRequest = now;
    return { allowed: true };
  }

  // Incrementar contador
  entry.count++;
  entry.lastRequest = now;

  // Verificar si excede el límite
  if (entry.count > RATE_LIMIT_CONFIG.maxRequests) {
    entry.blocked = true;
    entry.blockUntil = now + RATE_LIMIT_CONFIG.blockDurationMs;
    return {
      allowed: false,
      retryAfter: Math.ceil(RATE_LIMIT_CONFIG.blockDurationMs / 1000)
    };
  }

  return { allowed: true };
}

/**
 * Detecta posibles bots basándose en headers HTTP
 */
export function detectBot(headers: Headers): { isBot: boolean; reason?: string } {
  const userAgent = headers.get('user-agent') || '';
  const acceptLanguage = headers.get('accept-language');
  const accept = headers.get('accept');

  // Lista de user agents de bots conocidos
  const botPatterns = [
    /bot/i, /crawler/i, /spider/i, /scraper/i,
    /curl/i, /wget/i, /python/i, /java\//i,
    /httpclient/i, /httpunit/i, /libwww/i,
    /headless/i, /phantom/i, /selenium/i,
    /puppeteer/i, /playwright/i,
  ];

  // Verificar user agent
  if (!userAgent) {
    return { isBot: true, reason: 'Missing user agent' };
  }

  for (const pattern of botPatterns) {
    if (pattern.test(userAgent)) {
      return { isBot: true, reason: `Bot pattern detected: ${pattern}` };
    }
  }

  // Verificar headers faltantes (los navegadores reales los envían)
  if (!acceptLanguage) {
    return { isBot: true, reason: 'Missing accept-language header' };
  }

  if (!accept || accept === '*/*') {
    // Muchos bots envían solo */*
    // Pero esto puede ser legítimo en algunos casos, así que solo marcamos sospechoso
  }

  return { isBot: false };
}

/**
 * Valida honeypot fields (campos ocultos que los bots llenan)
 */
export function validateHoneypot(data: {
  website?: string;    // Campo honeypot - debe estar vacío
  phone2?: string;     // Campo honeypot - debe estar vacío
  _timestamp?: string; // Timestamp de cuando se cargó el form
}): { valid: boolean; reason?: string } {
  // Si los campos honeypot tienen valor, es un bot
  if (data.website && data.website.trim() !== '') {
    return { valid: false, reason: 'Honeypot field filled' };
  }

  if (data.phone2 && data.phone2.trim() !== '') {
    return { valid: false, reason: 'Honeypot field filled' };
  }

  // Verificar timestamp - el form debe haberse cargado hace al menos 3 segundos
  // (los bots llenan forms instantáneamente)
  if (data._timestamp) {
    const loadTime = parseInt(data._timestamp, 10);
    const now = Date.now();
    const timeDiff = now - loadTime;

    if (timeDiff < 3000) { // Menos de 3 segundos
      return { valid: false, reason: 'Form submitted too quickly' };
    }

    if (timeDiff > 3600000) { // Más de 1 hora
      return { valid: false, reason: 'Form session expired' };
    }
  }

  return { valid: true };
}

/**
 * Genera un token de sesión para protección CSRF básica
 */
export function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Valida patrones sospechosos en los datos de entrada
 */
export function detectSuspiciousPatterns(data: Record<string, unknown>): {
  suspicious: boolean;
  reasons: string[]
} {
  const reasons: string[] = [];

  for (const [key, value] of Object.entries(data)) {
    if (typeof value !== 'string') continue;

    // Detectar inyección SQL básica
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b)/i,
      /(--|;|\/\*|\*\/)/,
      /(\bOR\b|\bAND\b).*[=<>]/i,
    ];

    for (const pattern of sqlPatterns) {
      if (pattern.test(value)) {
        reasons.push(`SQL injection pattern in ${key}`);
        break;
      }
    }

    // Detectar XSS básico
    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
    ];

    for (const pattern of xssPatterns) {
      if (pattern.test(value)) {
        reasons.push(`XSS pattern in ${key}`);
        break;
      }
    }

    // Detectar emails masivos (spammers)
    if (key.toLowerCase().includes('email')) {
      // Dominios temporales conocidos
      const tempEmailDomains = [
        'tempmail', 'guerrillamail', 'mailinator', '10minutemail',
        'throwaway', 'fakeinbox', 'temp-mail', 'dispostable',
      ];

      for (const domain of tempEmailDomains) {
        if (value.toLowerCase().includes(domain)) {
          reasons.push('Temporary email domain detected');
          break;
        }
      }
    }
  }

  return {
    suspicious: reasons.length > 0,
    reasons,
  };
}

/**
 * Middleware completo de protección anti-bot
 */
export function antiBotProtection(
  ip: string,
  headers: Headers,
  formData?: Record<string, unknown>
): {
  allowed: boolean;
  error?: string;
  statusCode?: number;
} {
  // 1. Rate limiting
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return {
      allowed: false,
      error: `Demasiadas solicitudes. Intenta de nuevo en ${rateLimit.retryAfter} segundos.`,
      statusCode: 429,
    };
  }

  // 2. Detección de bots
  const botCheck = detectBot(headers);
  if (botCheck.isBot) {
    return {
      allowed: false,
      error: 'Solicitud no permitida.',
      statusCode: 403,
    };
  }

  // 3. Validación de honeypot (si hay datos de formulario)
  if (formData) {
    const honeypotCheck = validateHoneypot({
      website: formData.website as string,
      phone2: formData.phone2 as string,
      _timestamp: formData._timestamp as string,
    });

    if (!honeypotCheck.valid) {
      return {
        allowed: false,
        error: 'Solicitud no válida.',
        statusCode: 400,
      };
    }

    // 4. Detección de patrones sospechosos
    const suspiciousCheck = detectSuspiciousPatterns(formData);
    if (suspiciousCheck.suspicious) {
      return {
        allowed: false,
        error: 'Datos no válidos.',
        statusCode: 400,
      };
    }
  }

  return { allowed: true };
}
