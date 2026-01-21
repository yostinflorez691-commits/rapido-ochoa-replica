import { NextRequest, NextResponse } from 'next/server';

// Almacén temporal en memoria para las compras (en producción sería una BD)
// Usando almacenamiento global para compartir entre rutas
function getPurchasesMap(): Map<string, PurchaseData> {
  if (typeof global !== 'undefined') {
    if (!(global as any).__purchases) {
      (global as any).__purchases = new Map();
    }
    return (global as any).__purchases;
  }
  return new Map();
}

interface PurchaseData {
  id: string;
  tripId: string;
  seats: string[];
  pricePerSeat: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  expiresAt: string;
  tripInfo: {
    origin: string;
    destination: string;
    departureTime: string;
    arrivalTime: string;
    date: string;
    isDirect: boolean;
    service?: string;
  };
  passengers?: PassengerData[];
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

// POST - Crear nueva compra
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tripId, seats, pricePerSeat, tripInfo } = body;

    if (!tripId || !seats || !Array.isArray(seats) || seats.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere tripId y al menos un asiento' },
        { status: 400 }
      );
    }

    // Generar ID único para la compra
    const purchaseId = `PUR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Tiempo de expiración: 10 minutos desde ahora
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);

    const purchase: PurchaseData = {
      id: purchaseId,
      tripId,
      seats,
      pricePerSeat: pricePerSeat || 0,
      totalPrice: (pricePerSeat || 0) * seats.length,
      status: 'pending',
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      tripInfo: tripInfo || {},
      passengers: []
    };

    getPurchasesMap().set(purchaseId, purchase);

    return NextResponse.json({
      success: true,
      purchase: {
        id: purchaseId,
        status: purchase.status,
        expiresAt: purchase.expiresAt,
        seats: purchase.seats,
        totalPrice: purchase.totalPrice
      }
    });
  } catch (error) {
    console.error('Error creating purchase:', error);
    return NextResponse.json(
      { error: 'Error al crear la compra' },
      { status: 500 }
    );
  }
}

// GET - Obtener compra por ID (usando query param)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'Se requiere el ID de la compra' },
      { status: 400 }
    );
  }

  const purchases = getPurchasesMap();
  const purchase = purchases.get(id);

  if (!purchase) {
    return NextResponse.json(
      { error: 'Compra no encontrada' },
      { status: 404 }
    );
  }

  // Verificar si la compra ha expirado
  if (new Date() > new Date(purchase.expiresAt) && purchase.status === 'pending') {
    purchase.status = 'cancelled';
    purchases.set(id, purchase);
  }

  return NextResponse.json({ purchase });
}
