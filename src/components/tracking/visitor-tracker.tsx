"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Componente invisible que rastrea visitantes y envía notificaciones a Telegram
 */
export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Evitar tracking múltiple en la misma sesión
    const sessionKey = 'visitor_tracked';
    const tracked = sessionStorage.getItem(sessionKey);

    if (tracked) {
      return;
    }

    // Marcar como trackeado
    sessionStorage.setItem(sessionKey, 'true');

    // Enviar datos de tracking
    const trackVisitor = async () => {
      try {
        await fetch('/api/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            page: pathname,
            referer: document.referrer || null,
          }),
        });
      } catch (error) {
        // Silenciar errores de tracking
        console.error('Tracking error:', error);
      }
    };

    // Pequeño delay para no afectar carga inicial
    setTimeout(trackVisitor, 1000);
  }, [pathname]);

  // Componente invisible
  return null;
}
