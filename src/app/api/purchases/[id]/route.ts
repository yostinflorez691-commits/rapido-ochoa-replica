import { NextRequest, NextResponse } from 'next/server';

// Este mapa se comparte con el archivo principal de purchases
// En producción sería una base de datos
const purchases = new Map<string, PurchaseData>();

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

// Función para sincronizar con el mapa principal (workaround para el ejemplo)
// En producción, ambos archivos accederían a la misma BD
function getPurchaseFromStorage(id: string): PurchaseData | undefined {
  // Intentar obtener del almacenamiento global si existe
  if (typeof global !== 'undefined' && (global as any).__purchases) {
    return (global as any).__purchases.get(id);
  }
  return purchases.get(id);
}

function setPurchaseToStorage(id: string, data: PurchaseData): void {
  if (typeof global !== 'undefined') {
    if (!(global as any).__purchases) {
      (global as any).__purchases = new Map();
    }
    (global as any).__purchases.set(id, data);
  }
  purchases.set(id, data);
}

// GET - Obtener compra específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const purchase = getPurchaseFromStorage(id);

  if (!purchase) {
    return NextResponse.json(
      { error: 'Compra no encontrada' },
      { status: 404 }
    );
  }

  // Verificar si la compra ha expirado
  if (new Date() > new Date(purchase.expiresAt) && purchase.status === 'pending') {
    purchase.status = 'cancelled';
    setPurchaseToStorage(id, purchase);
  }

  return NextResponse.json({ purchase });
}

// PUT - Actualizar compra (agregar pasajeros)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { passengers, status } = body;

    const purchase = getPurchaseFromStorage(id);

    if (!purchase) {
      return NextResponse.json(
        { error: 'Compra no encontrada' },
        { status: 404 }
      );
    }

    // Verificar si la compra ha expirado
    if (new Date() > new Date(purchase.expiresAt) && purchase.status === 'pending') {
      purchase.status = 'cancelled';
      setPurchaseToStorage(id, purchase);
      return NextResponse.json(
        { error: 'La compra ha expirado' },
        { status: 410 }
      );
    }

    // Actualizar pasajeros si se proporcionan
    if (passengers && Array.isArray(passengers)) {
      purchase.passengers = passengers;
    }

    // Actualizar estado si se proporciona
    if (status && ['pending', 'confirmed', 'cancelled'].includes(status)) {
      purchase.status = status;
    }

    setPurchaseToStorage(id, purchase);

    return NextResponse.json({
      success: true,
      purchase
    });
  } catch (error) {
    console.error('Error updating purchase:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la compra' },
      { status: 500 }
    );
  }
}

// DELETE - Cancelar compra
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const purchase = getPurchaseFromStorage(id);

  if (!purchase) {
    return NextResponse.json(
      { error: 'Compra no encontrada' },
      { status: 404 }
    );
  }

  purchase.status = 'cancelled';
  setPurchaseToStorage(id, purchase);

  return NextResponse.json({
    success: true,
    message: 'Compra cancelada'
  });
}
