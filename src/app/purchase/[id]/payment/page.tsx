"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, CheckCircle, CreditCard, Building2, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

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
  passengers?: {
    seatNumber: string;
    documentType: string;
    documentNumber: string;
    firstName: string;
    lastName: string;
  }[];
}

export default function PaymentPage() {
  const router = useRouter();
  const params = useParams();
  const purchaseId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchase, setPurchase] = useState<PurchaseData | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>('card');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchPurchase = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/purchases/${purchaseId}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Compra no encontrada');
          }
          throw new Error('Error al cargar la compra');
        }

        const data = await response.json();
        setPurchase(data.purchase);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    if (purchaseId) {
      fetchPurchase();
    }
  }, [purchaseId]);

  const handlePayment = async () => {
    setProcessing(true);

    // Simular procesamiento de pago
    await new Promise(resolve => setTimeout(resolve, 2000));

    setSuccess(true);
    setProcessing(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F5F5]">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-[#B42121]" />
          <span className="text-[14px] text-gray-500">Cargando información de pago...</span>
        </div>
      </div>
    );
  }

  if (error || !purchase) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5F5F5] p-4">
        <div className="rounded-lg bg-white p-8 text-center shadow-lg">
          <h1 className="text-[18px] font-semibold text-[#232323]">Error</h1>
          <p className="mt-2 text-[14px] text-[#666666]">{error || 'Compra no encontrada'}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-6 rounded-lg bg-[#B42121] px-6 py-3 text-[14px] font-medium text-white transition-colors hover:bg-[#9a1c1c]"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5F5F5] p-4">
        <div className="rounded-lg bg-white p-8 text-center shadow-lg">
          <CheckCircle className="mx-auto h-16 w-16 text-[#1F8641]" />
          <h1 className="mt-4 text-[22px] font-bold text-[#232323]">¡Compra exitosa!</h1>
          <p className="mt-2 text-[14px] text-[#666666]">
            Tu reserva ha sido confirmada. Recibirás un correo con los detalles.
          </p>

          <div className="mt-6 rounded-lg bg-[#F5F5F5] p-4 text-left">
            <p className="text-[12px] text-[#999999]">Código de reserva</p>
            <p className="text-[16px] font-bold text-[#232323]">{purchaseId}</p>

            <div className="mt-4">
              <p className="text-[12px] text-[#999999]">Viaje</p>
              <p className="text-[14px] font-medium text-[#232323]">
                {purchase.tripInfo.origin} → {purchase.tripInfo.destination}
              </p>
              <p className="text-[13px] text-[#666666]">
                {purchase.tripInfo.date} • {purchase.tripInfo.departureTime}
              </p>
            </div>

            <div className="mt-4">
              <p className="text-[12px] text-[#999999]">Pasajeros</p>
              {purchase.passengers?.map((p, idx) => (
                <p key={idx} className="text-[13px] text-[#232323]">
                  Silla {p.seatNumber}: {p.firstName} {p.lastName}
                </p>
              ))}
            </div>
          </div>

          <button
            onClick={() => router.push('/')}
            className="mt-6 w-full rounded-lg bg-[#1F8641] px-6 py-3 text-[14px] font-medium text-white transition-colors hover:bg-[#166534]"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#B42121] px-4 py-3 shadow-md">
        <div className="mx-auto flex max-w-4xl items-center">
          <h1 className="text-[16px] font-semibold text-white">Método de pago</h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-4">
        {/* Resumen del viaje */}
        <div className="mb-4 rounded-lg bg-white p-4 shadow-sm">
          <p className="text-[14px] font-semibold text-[#232323]">
            {purchase.tripInfo.origin} → {purchase.tripInfo.destination}
          </p>
          <p className="text-[13px] text-[#666666]">
            {purchase.tripInfo.date} • {purchase.tripInfo.departureTime} - {purchase.tripInfo.arrivalTime}
          </p>
          <div className="mt-2 flex gap-1">
            {purchase.seats.map((seat) => (
              <span
                key={seat}
                className="rounded bg-[#f8b500] px-2 py-0.5 text-[12px] font-semibold text-white"
              >
                {seat}
              </span>
            ))}
          </div>
        </div>

        {/* Métodos de pago */}
        <div className="mb-4 rounded-lg bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-[14px] font-semibold text-[#232323]">Selecciona un método de pago</h2>

          <div className="space-y-3">
            <button
              onClick={() => setSelectedMethod('card')}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border p-4 transition-colors",
                selectedMethod === 'card'
                  ? "border-[#B42121] bg-red-50"
                  : "border-[#E6E6E6] hover:border-gray-300"
              )}
            >
              <CreditCard className={cn(
                "h-6 w-6",
                selectedMethod === 'card' ? "text-[#B42121]" : "text-[#666666]"
              )} />
              <div className="text-left">
                <p className="text-[14px] font-medium text-[#232323]">Tarjeta de crédito/débito</p>
                <p className="text-[12px] text-[#666666]">Visa, Mastercard, American Express</p>
              </div>
            </button>

            <button
              onClick={() => setSelectedMethod('pse')}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border p-4 transition-colors",
                selectedMethod === 'pse'
                  ? "border-[#B42121] bg-red-50"
                  : "border-[#E6E6E6] hover:border-gray-300"
              )}
            >
              <Building2 className={cn(
                "h-6 w-6",
                selectedMethod === 'pse' ? "text-[#B42121]" : "text-[#666666]"
              )} />
              <div className="text-left">
                <p className="text-[14px] font-medium text-[#232323]">PSE</p>
                <p className="text-[12px] text-[#666666]">Pago desde tu cuenta bancaria</p>
              </div>
            </button>

            <button
              onClick={() => setSelectedMethod('nequi')}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border p-4 transition-colors",
                selectedMethod === 'nequi'
                  ? "border-[#B42121] bg-red-50"
                  : "border-[#E6E6E6] hover:border-gray-300"
              )}
            >
              <Smartphone className={cn(
                "h-6 w-6",
                selectedMethod === 'nequi' ? "text-[#B42121]" : "text-[#666666]"
              )} />
              <div className="text-left">
                <p className="text-[14px] font-medium text-[#232323]">Nequi</p>
                <p className="text-[12px] text-[#666666]">Paga con tu billetera digital</p>
              </div>
            </button>
          </div>
        </div>

        {/* Resumen de precio */}
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[14px] text-[#666666]">
              {purchase.seats.length} {purchase.seats.length === 1 ? 'pasaje' : 'pasajes'}
            </span>
            <span className="text-[14px] text-[#666666]">
              ${purchase.pricePerSeat.toLocaleString('es-CO')} c/u
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-[#E6E6E6] pt-2">
            <span className="text-[16px] font-semibold text-[#232323]">Total a pagar</span>
            <span className="text-[20px] font-bold text-[#B42121]">
              ${purchase.totalPrice.toLocaleString('es-CO')} <span className="text-[12px] font-normal text-[#666666]">COP</span>
            </span>
          </div>
        </div>
      </main>

      {/* Botón fijo abajo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
        <div className="mx-auto max-w-4xl">
          <button
            onClick={handlePayment}
            disabled={processing}
            className={cn(
              "w-full rounded-lg bg-[#B42121] py-4 text-[14px] font-semibold text-white transition-colors",
              processing
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer hover:bg-[#9a1c1c]"
            )}
          >
            {processing ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Procesando pago...
              </span>
            ) : (
              `Pagar $${purchase.totalPrice.toLocaleString('es-CO')} COP`
            )}
          </button>
          <p className="mt-2 text-center text-[11px] text-[#999999]">
            Pago seguro procesado por Wompi
          </p>
        </div>
      </div>

      {/* Spacer para el botón fijo */}
      <div className="h-24" />
    </div>
  );
}
