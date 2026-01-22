"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, CheckCircle, CreditCard, Building2, Smartphone, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Lista de bancos PSE
const BANCOS_PSE = [
  "ALIANZA FIDUCIARIA",
  "BAN100",
  "BANCAMIA S.A.",
  "BANCO AGRARIO",
  "BANCO AV VILLAS",
  "BANCO BBVA COLOMBIA S.A.",
  "BANCO CAJA SOCIAL",
  "BANCO COOPERATIVO COOPCENTRAL",
  "BANCO DE BOGOTA",
  "BANCO DE OCCIDENTE",
  "BANCO FALABELLA",
  "BANCO FINANDINA S.A. BIC",
  "BANCO GNB SUDAMERIS",
  "BANCO ITAU",
  "BANCO J.P. MORGAN COLOMBIA S.A.",
  "BANCO MUNDO MUJER S.A.",
  "BANCO PICHINCHA S.A.",
  "BANCO POPULAR",
  "BANCO SANTANDER COLOMBIA",
  "BANCO SERFINANZA",
  "BANCO UNION antes GIROS",
  "BANCOLOMBIA",
  "BANCOOMEVA S.A.",
  "BOLD CF",
  "CFA COOPERATIVA FINANCIERA",
  "CITIBANK",
  "COINK SA",
  "COLTEFINANCIERA",
  "CONFIAR COOPERATIVA FINANCIERA",
  "COTRAFA",
  "Crezcamos-MOSí",
  "DALE",
  "DING",
  "FINANCIERA JURISCOOP SA COMPAÑÍA DE FINANCIAMIENTO",
  "GLOBAL66",
  "IRIS",
  "JFK COOPERATIVA FINANCIERA",
  "LULO BANK",
  "MOVII S.A.",
  "NEQUI",
  "NU",
  "POWWI",
  "RAPPIPAY",
  "SCOTIABANK COLPATRIA",
  "UALÁ"
];

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
  const [selectedMethod, setSelectedMethod] = useState<string>('pse');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Estados para PSE
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [identification, setIdentification] = useState<string>('');
  const [pseError, setPseError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [loadingDots, setLoadingDots] = useState<string>('');
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [loadingStep, setLoadingStep] = useState<number>(1);

  // Mensajes de carga que van rotando
  const loadingMessages = [
    "Conectando con tu banco",
    "Estableciendo conexión segura",
    "Verificando información",
    "Procesando solicitud",
    "Generando enlace de pago",
    "Casi listo, espera un momento",
    "Comunicándonos con PSE",
    "Validando datos bancarios",
  ];

  // Efecto para rotar mensajes durante el procesamiento
  useEffect(() => {
    let messageInterval: NodeJS.Timeout;
    let dotsInterval: NodeJS.Timeout;
    let timeInterval: NodeJS.Timeout;
    let stepInterval: NodeJS.Timeout;

    if (processing && selectedMethod === 'pse') {
      let index = 0;
      setLoadingMessage(loadingMessages[0]);
      setElapsedTime(0);
      setLoadingStep(1);

      // Rotar mensajes cada 4 segundos
      messageInterval = setInterval(() => {
        index = (index + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[index]);
      }, 4000);

      // Animar puntos suspensivos
      let dots = 0;
      dotsInterval = setInterval(() => {
        dots = (dots + 1) % 4;
        setLoadingDots('.'.repeat(dots));
      }, 500);

      // Contador de tiempo
      timeInterval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);

      // Avanzar pasos visuales
      stepInterval = setInterval(() => {
        setLoadingStep(prev => prev < 5 ? prev + 1 : prev);
      }, 8000);
    }

    return () => {
      if (messageInterval) clearInterval(messageInterval);
      if (dotsInterval) clearInterval(dotsInterval);
      if (timeInterval) clearInterval(timeInterval);
      if (stepInterval) clearInterval(stepInterval);
    };
  }, [processing, selectedMethod]);

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

  // Función para sanitizar inputs
  const sanitizeInput = (input: string, type: 'email' | 'document' | 'text'): string => {
    if (!input) return '';

    switch (type) {
      case 'email':
        // Solo permitir caracteres válidos de email
        return input
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9@._-]/g, '')
          .slice(0, 100);
      case 'document':
        // Solo números
        return input.replace(/\D/g, '').slice(0, 15);
      case 'text':
        // Remover caracteres peligrosos
        return input
          .replace(/[<>'"`;(){}[\]\\]/g, '')
          .trim()
          .slice(0, 100);
      default:
        return input;
    }
  };

  const handlePayment = async () => {
    setPseError(null);

    // Validar campos PSE si está seleccionado
    if (selectedMethod === 'pse') {
      if (!selectedBank) {
        setPseError('Por favor selecciona un banco');
        return;
      }
      if (!email || !email.includes('@')) {
        setPseError('Por favor ingresa un correo electrónico válido');
        return;
      }
      if (!identification || identification.length < 6) {
        setPseError('Por favor ingresa un número de documento válido');
        return;
      }

      // Validar que el banco esté en la lista (prevenir manipulación)
      if (!BANCOS_PSE.includes(selectedBank)) {
        setPseError('Banco no válido');
        return;
      }
    }

    setProcessing(true);

    if (selectedMethod === 'pse') {
      try {
        // Sanitizar todos los inputs antes de enviar
        const sanitizedEmail = sanitizeInput(email, 'email');
        const sanitizedDocument = sanitizeInput(identification, 'document');
        const sanitizedBank = BANCOS_PSE.includes(selectedBank) ? selectedBank : '';

        if (!sanitizedEmail || !sanitizedDocument || !sanitizedBank) {
          setPseError('Datos inválidos. Por favor verifica la información.');
          setProcessing(false);
          return;
        }

        // Llamar a la pasarela PSE
        const params = new URLSearchParams({
          amount: String(purchase?.totalPrice || 0),
          bankCode: sanitizedBank,
          Correo: sanitizedEmail,
          Documento: sanitizedDocument,
        });

        const response = await fetch('/api/pse.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        });

        const data = await response.json();

        if (data.Error) {
          setPseError(data.Error);
          setProcessing(false);
          return;
        }

        if (data.URL) {
          // Redirigir a la URL de pago del banco
          window.location.href = data.URL;
          return;
        }

        setPseError('Error al procesar el pago. Intenta de nuevo.');
        setProcessing(false);
      } catch {
        setPseError('Error de conexión. Intenta de nuevo.');
        setProcessing(false);
      }
    } else {
      // Otros métodos de pago (simulación)
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccess(true);
      setProcessing(false);
    }
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

  // Pantalla de carga PSE
  if (processing && selectedMethod === 'pse') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        {/* Fondo animado */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-4 top-1/4 h-72 w-72 animate-pulse rounded-full bg-blue-500/10 blur-3xl"></div>
          <div className="absolute -right-4 bottom-1/4 h-72 w-72 animate-pulse rounded-full bg-green-500/10 blur-3xl" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative flex flex-col items-center px-6 text-center">
          {/* Spinner principal con múltiples anillos */}
          <div className="relative mb-8">
            <div className="h-24 w-24 animate-spin rounded-full border-4 border-white/10 border-t-white" style={{ animationDuration: '1s' }}></div>
            <div className="absolute inset-2 animate-spin rounded-full border-4 border-white/5 border-b-white/50" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
            <Building2 className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-white" />
          </div>

          {/* Mensaje principal con puntos animados */}
          <h2 className="mb-2 text-[22px] font-semibold text-white">
            {loadingMessage}<span className="inline-block w-8 text-left">{loadingDots}</span>
          </h2>

          {/* Banco seleccionado */}
          <div className="mb-4 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
            <span className="text-[13px] font-medium text-white/90">{selectedBank}</span>
          </div>

          {/* Contador de tiempo */}
          <p className="mb-6 text-[14px] text-white/50">
            Tiempo transcurrido: <span className="font-mono text-white/80">{elapsedTime}s</span>
          </p>

          {/* Pasos de progreso */}
          <div className="mb-6 flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={cn(
                    "h-3 w-3 rounded-full transition-all duration-500",
                    step < loadingStep
                      ? "bg-green-400"
                      : step === loadingStep
                      ? "animate-pulse bg-white"
                      : "bg-white/20"
                  )}
                ></div>
                {step < 5 && (
                  <div
                    className={cn(
                      "h-0.5 w-6 transition-all duration-500",
                      step < loadingStep ? "bg-green-400" : "bg-white/20"
                    )}
                  ></div>
                )}
              </div>
            ))}
          </div>

          {/* Barra de progreso animada */}
          <div className="mb-6 h-1.5 w-64 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full w-1/3 rounded-full bg-gradient-to-r from-blue-400 via-white to-green-400"
              style={{
                animation: 'loading-bar 2s ease-in-out infinite',
              }}
            ></div>
          </div>

          {/* Advertencia con icono animado */}
          <div className="rounded-xl bg-white/5 px-6 py-4 backdrop-blur">
            <div className="mb-2 flex items-center justify-center gap-2">
              <span className="inline-block animate-bounce text-[18px]">⏳</span>
              <p className="text-[14px] font-medium text-white/90">
                Por favor espera
              </p>
            </div>
            <p className="text-[12px] text-white/60">
              No cierres ni actualices esta ventana
            </p>
            <p className="mt-1 text-[11px] text-white/40">
              Este proceso puede tomar hasta 1 minuto
            </p>
          </div>

          {/* Indicadores de seguridad */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[11px] text-white/40">
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Conexión segura
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-white/40">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
              En línea
            </div>
          </div>
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

            {/* Formulario PSE */}
            {selectedMethod === 'pse' && (
              <div className="mt-4 space-y-4 rounded-lg border border-[#E6E6E6] bg-[#FAFAFA] p-4">
                {/* Selector de banco */}
                <div>
                  <label className="mb-1 block text-[13px] font-medium text-[#232323]">
                    Banco <span className="text-[#B42121]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full appearance-none rounded-lg border border-[#E6E6E6] bg-white px-4 py-3 pr-10 text-[14px] text-[#232323] focus:border-[#B42121] focus:outline-none focus:ring-1 focus:ring-[#B42121]"
                    >
                      <option value="">Selecciona tu banco</option>
                      {BANCOS_PSE.map((banco) => (
                        <option key={banco} value={banco}>
                          {banco}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#666666]" />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="mb-1 block text-[13px] font-medium text-[#232323]">
                    Correo electrónico <span className="text-[#B42121]">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    className="w-full rounded-lg border border-[#E6E6E6] bg-white px-4 py-3 text-[14px] text-[#232323] placeholder:text-[#999999] focus:border-[#B42121] focus:outline-none focus:ring-1 focus:ring-[#B42121]"
                  />
                </div>

                {/* Documento */}
                <div>
                  <label className="mb-1 block text-[13px] font-medium text-[#232323]">
                    Número de documento <span className="text-[#B42121]">*</span>
                  </label>
                  <input
                    type="text"
                    value={identification}
                    onChange={(e) => setIdentification(e.target.value.replace(/\D/g, ''))}
                    placeholder="Ej: 1234567890"
                    maxLength={15}
                    className="w-full rounded-lg border border-[#E6E6E6] bg-white px-4 py-3 text-[14px] text-[#232323] placeholder:text-[#999999] focus:border-[#B42121] focus:outline-none focus:ring-1 focus:ring-[#B42121]"
                  />
                </div>

                {/* Mensaje de error PSE */}
                {pseError && (
                  <div className="rounded-lg bg-red-50 p-3 text-[13px] text-[#B42121]">
                    {pseError}
                  </div>
                )}
              </div>
            )}

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
              <span className="flex flex-col items-center justify-center gap-1">
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Conectando con tu banco...
                </span>
                <span className="text-[11px] font-normal opacity-80">
                  Esto puede tomar hasta 1 minuto, no cierres esta ventana
                </span>
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
