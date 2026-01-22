"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, ChevronDown, Check } from "lucide-react";
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

const DOCUMENT_TYPES = [
  { value: "CC", label: "Cédula de Ciudadanía" },
  { value: "CE", label: "Cédula de Extranjería" },
  { value: "TI", label: "Tarjeta de Identidad" },
  { value: "PA", label: "Pasaporte" },
  { value: "RC", label: "Registro Civil" },
];

export default function PassengersPage() {
  const router = useRouter();
  const params = useParams();
  const purchaseId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [purchase, setPurchase] = useState<PurchaseData | null>(null);
  const [passengers, setPassengers] = useState<PassengerData[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [expandedPassenger, setExpandedPassenger] = useState<number>(0);

  // Cargar datos de la compra
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

        if (data.purchase.status === 'cancelled') {
          throw new Error('Esta compra ha expirado');
        }

        setPurchase(data.purchase);

        // Inicializar formularios de pasajeros
        const initialPassengers: PassengerData[] = data.purchase.seats.map((seat: string) => ({
          seatNumber: seat,
          documentType: "CC",
          documentNumber: "",
          firstName: "",
          lastName: "",
          email: "",
          phone: ""
        }));
        setPassengers(initialPassengers);

        // Calcular tiempo restante
        const expiresAt = new Date(data.purchase.expiresAt);
        const now = new Date();
        const diff = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
        setTimeLeft(diff);
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

  // Contador regresivo
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setError('El tiempo para completar la compra ha expirado');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const updatePassenger = (index: number, field: keyof PassengerData, value: string) => {
    setPassengers(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const isPassengerComplete = (passenger: PassengerData): boolean => {
    return !!(
      passenger.documentType &&
      passenger.documentNumber.trim() &&
      passenger.firstName.trim() &&
      passenger.lastName.trim()
    );
  };

  const isAllComplete = (): boolean => {
    return passengers.every(isPassengerComplete);
  };

  const handleSubmit = async () => {
    if (!isAllComplete() || !purchase) return;

    try {
      setSubmitting(true);

      const response = await fetch(`/api/purchases/${purchaseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          passengers,
          status: 'confirmed'
        }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar los pasajeros');
      }

      // Enviar tracking de reserva a Telegram (sin bloquear)
      fetch('/api/track/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripData: {
            origin: purchase.tripInfo.origin,
            destination: purchase.tripInfo.destination,
            date: purchase.tripInfo.date,
            departureTime: purchase.tripInfo.departureTime,
            arrivalTime: purchase.tripInfo.arrivalTime,
            seats: purchase.seats,
            totalPrice: purchase.totalPrice,
            passengers: passengers,
          }
        }),
      }).catch(() => {}); // Silenciar errores de tracking

      // Navegar a la página de pago (por ahora solo confirmación)
      router.push(`/purchase/${purchaseId}/payment`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F5F5]">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-[#B42121]" />
          <span className="text-[14px] text-gray-500">Cargando datos de la compra...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5F5F5] p-4">
        <div className="rounded-lg bg-white p-8 text-center shadow-lg">
          <AlertCircle className="mx-auto h-12 w-12 text-[#B42121]" />
          <h1 className="mt-4 text-[18px] font-semibold text-[#232323]">Error</h1>
          <p className="mt-2 text-[14px] text-[#666666]">{error}</p>
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

  if (!purchase) return null;

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header con countdown */}
      <header className="sticky top-0 z-50 bg-[#B42121] px-4 py-3 shadow-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <h1 className="text-[16px] font-semibold text-white">Datos de pasajeros</h1>
          <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span className={cn(
              "text-[14px] font-bold",
              timeLeft < 60 ? "text-yellow-300" : "text-white"
            )}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-4">
        {/* Resumen del viaje */}
        <div className="mb-4 rounded-lg bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] text-[#999999]">Tu viaje</p>
              <p className="text-[14px] font-semibold text-[#232323]">
                {purchase.tripInfo.origin} → {purchase.tripInfo.destination}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[12px] text-[#999999]">{purchase.tripInfo.date}</p>
              <p className="text-[14px] font-medium text-[#232323]">
                {purchase.tripInfo.departureTime} - {purchase.tripInfo.arrivalTime}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 border-t border-[#E6E6E6] pt-3">
            <span className="text-[13px] text-[#666666]">
              {purchase.seats.length} {purchase.seats.length === 1 ? 'asiento' : 'asientos'}:
            </span>
            <div className="flex gap-1">
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
        </div>

        {/* Formularios de pasajeros */}
        <div className="space-y-3">
          {passengers.map((passenger, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="overflow-hidden rounded-lg bg-white shadow-sm"
            >
              {/* Header del pasajero */}
              <button
                onClick={() => setExpandedPassenger(expandedPassenger === index ? -1 : index)}
                className="flex w-full items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f8b500] text-[14px] font-bold text-white">
                    {passenger.seatNumber}
                  </span>
                  <div className="text-left">
                    <p className="text-[14px] font-semibold text-[#232323]">
                      Pasajero {index + 1}
                    </p>
                    {isPassengerComplete(passenger) && (
                      <p className="text-[12px] text-[#666666]">
                        {passenger.firstName} {passenger.lastName}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isPassengerComplete(passenger) && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1F8641]">
                      <Check className="h-3 w-3 text-white" />
                    </span>
                  )}
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-[#666666] transition-transform",
                      expandedPassenger === index && "rotate-180"
                    )}
                  />
                </div>
              </button>

              {/* Formulario expandido */}
              {expandedPassenger === index && (
                <div className="border-t border-[#E6E6E6] p-4">
                  <div className="grid gap-4">
                    {/* Tipo de documento */}
                    <div>
                      <label className="mb-1.5 block text-[12px] font-medium text-[#666666]">
                        Tipo de documento *
                      </label>
                      <select
                        value={passenger.documentType}
                        onChange={(e) => updatePassenger(index, 'documentType', e.target.value)}
                        className="w-full rounded-lg border border-[#E6E6E6] px-3 py-2.5 text-[14px] text-[#232323] focus:border-[#B42121] focus:outline-none"
                      >
                        {DOCUMENT_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Número de documento */}
                    <div>
                      <label className="mb-1.5 block text-[12px] font-medium text-[#666666]">
                        Número de documento *
                      </label>
                      <input
                        type="text"
                        value={passenger.documentNumber}
                        onChange={(e) => updatePassenger(index, 'documentNumber', e.target.value)}
                        placeholder="Ej: 1234567890"
                        className="w-full rounded-lg border border-[#E6E6E6] px-3 py-2.5 text-[14px] text-[#232323] placeholder:text-[#999999] focus:border-[#B42121] focus:outline-none"
                      />
                    </div>

                    {/* Nombres y apellidos en una fila */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1.5 block text-[12px] font-medium text-[#666666]">
                          Nombres *
                        </label>
                        <input
                          type="text"
                          value={passenger.firstName}
                          onChange={(e) => updatePassenger(index, 'firstName', e.target.value)}
                          placeholder="Nombres"
                          className="w-full rounded-lg border border-[#E6E6E6] px-3 py-2.5 text-[14px] text-[#232323] placeholder:text-[#999999] focus:border-[#B42121] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[12px] font-medium text-[#666666]">
                          Apellidos *
                        </label>
                        <input
                          type="text"
                          value={passenger.lastName}
                          onChange={(e) => updatePassenger(index, 'lastName', e.target.value)}
                          placeholder="Apellidos"
                          className="w-full rounded-lg border border-[#E6E6E6] px-3 py-2.5 text-[14px] text-[#232323] placeholder:text-[#999999] focus:border-[#B42121] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Email (opcional) */}
                    <div>
                      <label className="mb-1.5 block text-[12px] font-medium text-[#666666]">
                        Correo electrónico
                      </label>
                      <input
                        type="email"
                        value={passenger.email || ''}
                        onChange={(e) => updatePassenger(index, 'email', e.target.value)}
                        placeholder="correo@ejemplo.com (opcional)"
                        className="w-full rounded-lg border border-[#E6E6E6] px-3 py-2.5 text-[14px] text-[#232323] placeholder:text-[#999999] focus:border-[#B42121] focus:outline-none"
                      />
                    </div>

                    {/* Teléfono (opcional) */}
                    <div>
                      <label className="mb-1.5 block text-[12px] font-medium text-[#666666]">
                        Teléfono de contacto
                      </label>
                      <input
                        type="tel"
                        value={passenger.phone || ''}
                        onChange={(e) => updatePassenger(index, 'phone', e.target.value)}
                        placeholder="3001234567 (opcional)"
                        className="w-full rounded-lg border border-[#E6E6E6] px-3 py-2.5 text-[14px] text-[#232323] placeholder:text-[#999999] focus:border-[#B42121] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Resumen de precio */}
        <div className="mt-4 rounded-lg bg-white p-4 shadow-sm">
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
            onClick={handleSubmit}
            disabled={!isAllComplete() || submitting}
            className={cn(
              "w-full rounded-lg bg-[#B42121] py-4 text-[14px] font-semibold text-white transition-colors",
              isAllComplete() && !submitting
                ? "cursor-pointer hover:bg-[#9a1c1c]"
                : "cursor-not-allowed opacity-60"
            )}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Procesando...
              </span>
            ) : (
              `Continuar al pago - $${purchase.totalPrice.toLocaleString('es-CO')} COP`
            )}
          </button>
          <p className="mt-2 text-center text-[11px] text-[#999999]">
            Al continuar, aceptas los términos y condiciones del servicio
          </p>
        </div>
      </div>

      {/* Spacer para el botón fijo */}
      <div className="h-24" />
    </div>
  );
}
