"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Seat {
  category: "seat" | "hallway";
  number?: string;
  occupied?: boolean;
  adjacent_seats?: null;
}

interface TripDetails {
  trip: {
    id: string;
    pricing: {
      total: number;
    };
    service: string;
    availability: number;
    capacity: number;
  };
  bus: Seat[][][];
  lines?: Record<string, {
    name: string;
    logo_url?: string;
    services?: string[];
  }>;
}

interface SeatMapProps {
  tripId: string;
  price: number;
  departureTime?: string;
  arrivalTime?: string;
  date?: string;
  isDirect?: boolean;
  origin?: string;
  destination?: string;
  service?: string;
  onClose: () => void;
  onSelectSeats?: (seats: string[], total: number) => void;
}

export function SeatMap({
  tripId,
  price,
  departureTime = "09:00 PM",
  arrivalTime = "08:00 AM",
  date = "22 enero",
  isDirect = true,
  origin = "",
  destination = "",
  service = "",
  onClose,
  onSelectSeats
}: SeatMapProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/trips/${tripId}/details`, {
          method: 'POST',
        });

        if (!response.ok) {
          throw new Error('Error al cargar los asientos');
        }

        const data = await response.json();
        setTripDetails(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [tripId]);

  const toggleSeat = (seatNumber: string) => {
    setSelectedSeats(prev => {
      if (prev.includes(seatNumber)) {
        return prev.filter(s => s !== seatNumber);
      }
      return [...prev, seatNumber];
    });
  };

  const totalPrice = selectedSeats.length * price;

  const handleContinue = async () => {
    if (selectedSeats.length === 0) return;

    try {
      setSubmitting(true);

      // Crear la compra en el servidor
      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tripId,
          seats: selectedSeats,
          pricePerSeat: price,
          tripInfo: {
            origin,
            destination,
            departureTime,
            arrivalTime,
            date,
            isDirect,
            service
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear la compra');
      }

      const data = await response.json();

      // Callback opcional
      if (onSelectSeats) {
        onSelectSeats(selectedSeats, totalPrice);
      }

      // Navegar a la página de pasajeros
      router.push(`/purchase/${data.purchase.id}/passengers`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar');
      setSubmitting(false);
    }
  };

  // Contar asientos
  const countSeats = () => {
    if (!tripDetails?.bus) return { free: 0, occupied: 0 };
    let free = 0;
    let occupied = 0;
    tripDetails.bus[0]?.forEach(row => {
      row.forEach(seat => {
        if (seat.category === 'seat') {
          if (seat.occupied) occupied++;
          else free++;
        }
      });
    });
    return { free, occupied };
  };

  // Organizar asientos en filas de 4 (2 izquierda + 2 derecha)
  const organizeSeatsInRows = () => {
    if (!tripDetails?.bus) return [];

    const allSeats: Seat[] = [];
    const busData = tripDetails.bus[0] || [];

    // Extraer todos los asientos (no pasillos) en orden
    busData.forEach(column => {
      column.forEach(seat => {
        if (seat.category === 'seat') {
          allSeats.push(seat);
        }
      });
    });

    // Organizar en filas de 4
    const rows: (Seat | null)[][] = [];
    for (let i = 0; i < allSeats.length; i += 4) {
      const row = [
        allSeats[i] || null,
        allSeats[i + 1] || null,
        allSeats[i + 2] || null,
        allSeats[i + 3] || null,
      ];
      rows.push(row);
    }

    return rows;
  };

  // Determinar icono de tiempo (sol/luna)
  const getTimeIcon = () => {
    const hour = parseInt(departureTime.split(':')[0]);
    const isPM = departureTime.toUpperCase().includes('PM');
    const hour24 = isPM && hour !== 12 ? hour + 12 : (!isPM && hour === 12 ? 0 : hour);

    // Noche (18:00 - 05:59)
    if (hour24 >= 18 || hour24 < 6) {
      return (
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"/>
        </svg>
      );
    }
    // Día (06:00 - 17:59)
    return (
      <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"/>
      </svg>
    );
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="border-t border-[#e8e8e8] bg-white p-6"
      >
        <div className="flex items-center justify-center gap-3 py-8">
          <Loader2 className="h-6 w-6 animate-spin text-[#B42121]" />
          <span className="text-[14px] text-gray-500">Cargando asientos disponibles...</span>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="border-t border-[#e8e8e8] bg-white p-6"
      >
        <div className="flex items-center justify-center gap-3 py-8">
          <span className="text-[14px] text-[#B42121]">{error}</span>
          <button onClick={onClose} className="text-[13px] text-[#1F8641] underline">
            Cerrar
          </button>
        </div>
      </motion.div>
    );
  }

  if (!tripDetails?.bus) {
    return null;
  }

  const { free, occupied } = countSeats();
  const rows = organizeSeatsInRows();

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="relative border-t border-[#e8e8e8] bg-white"
    >
      {/* Header del Modal */}
      <div className="flex items-center justify-between border-b border-[#E6E6E6] px-5 py-4">
        <h2 className="text-[18px] font-semibold text-[#232323]">
          Elige tus sillas de ida
        </h2>
        {/* Botón X Cerrar - Verde */}
        <button
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center text-[#1F8641] transition-colors hover:text-[#166534]"
          aria-label="Cerrar"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      {/* Barra de información del viaje */}
      <div className="flex items-center gap-3 bg-[#F8F8F8] px-5 py-3">
        {/* Icono sol/luna */}
        {getTimeIcon()}
        {/* Hora salida */}
        <span className="text-[14px] font-semibold text-[#232323]">{departureTime}</span>
        {/* Tipo de ruta */}
        <span className="text-[13px] text-[#999999]">
          — {isDirect ? 'Directo' : 'Con escala'} —&gt;
        </span>
        {/* Hora llegada */}
        <span className="text-[14px] font-semibold text-[#232323]">{arrivalTime}</span>
        {/* Fecha */}
        <span className="ml-auto text-[13px] text-[#666666]">{date}</span>
      </div>

      {/* Bus Section: Legend + Seats */}
      <div className="flex gap-3 p-5">

        {/* Legend Panel (izquierda) */}
        <div className="flex w-[70px] flex-shrink-0 flex-col gap-3 py-2">
          <h4 className="text-[12px] font-semibold text-[#232323]">Tus sillas</h4>

          {/* Libres */}
          <div className="flex flex-col items-center gap-1">
            <div
              className="h-[17px] w-[17px] rounded-full border border-[#CCCCCC] bg-white"
            />
            <span className="text-[11px] text-[#666666]">{free} Libres</span>
          </div>

          {/* Elegidos */}
          <div className="flex flex-col items-center gap-1">
            <div
              className="h-[17px] w-[17px] rounded-full bg-[#B42121]"
            />
            <span className="text-[11px] text-[#666666]">{selectedSeats.length} Elegidos</span>
          </div>

          {/* Ocupados */}
          <div className="flex flex-col items-center gap-1">
            <div
              className="flex h-[25px] w-[25px] items-center justify-center rounded-[4px] bg-[#E6E6E6]"
            >
              <svg className="h-3 w-3 text-[#9B9B9B]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <span className="text-[11px] text-[#666666]">{occupied} Ocupados</span>
          </div>
        </div>

        {/* Vehicle Container (derecha) */}
        <div className="flex flex-1 flex-col items-center rounded-[10px] bg-white/60 px-3 py-5">

          {/* Steering Wheel Icon */}
          <div className="mb-4 self-start ml-[43px]">
            <svg className="h-[25px] w-[25px] text-[#9B9B9B]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-12.5c-2.49 0-4.5 2.01-4.5 4.5h2c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5h2c0-2.49-2.01-4.5-4.5-4.5zM12 14c-.83 0-1.5.67-1.5 1.5S11.17 17 12 17s1.5-.67 1.5-1.5S12.83 14 12 14z"/>
            </svg>
          </div>

          {/* Seats Layout */}
          <div className="flex flex-col gap-[15px]">
            {rows.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className="flex justify-center"
              >
                {/* Silla 1 (izquierda-ventana) */}
                <SeatButton
                  seat={row[0]}
                  isSelected={selectedSeats.includes(row[0]?.number || '')}
                  onSelect={toggleSeat}
                  style={{ marginRight: '43px' }}
                />

                {/* Silla 2 (izquierda-pasillo) */}
                <SeatButton
                  seat={row[1]}
                  isSelected={selectedSeats.includes(row[1]?.number || '')}
                  onSelect={toggleSeat}
                  style={{ marginRight: '132px' }}
                />

                {/* Silla 3 (derecha-pasillo) */}
                <SeatButton
                  seat={row[2]}
                  isSelected={selectedSeats.includes(row[2]?.number || '')}
                  onSelect={toggleSeat}
                  style={{ marginRight: '43px' }}
                />

                {/* Silla 4 (derecha-ventana) */}
                <SeatButton
                  seat={row[3]}
                  isSelected={selectedSeats.includes(row[3]?.number || '')}
                  onSelect={toggleSeat}
                  style={{ marginRight: '0' }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Precio aproximado - Solo mostrar si hay sillas seleccionadas */}
      {selectedSeats.length > 0 && (
        <div className="border-t border-[#E6E6E6] px-5 py-3">
          <p className="text-[13px] text-[#666666]">
            {selectedSeats.length} {selectedSeats.length === 1 ? 'asiento' : 'asientos'}: {selectedSeats.sort((a, b) => parseInt(a) - parseInt(b)).join(', ')}
          </p>
          <p className="text-[20px] font-bold text-[#B42121]">
            $ {totalPrice.toLocaleString('es-CO')} <span className="text-[13px] font-normal text-[#666666]">COP</span>
          </p>
        </div>
      )}

      {/* CTA Button - Fijo abajo, rojo, ancho completo */}
      <button
        onClick={selectedSeats.length > 0 && !submitting ? handleContinue : undefined}
        disabled={selectedSeats.length === 0 || submitting}
        className={cn(
          "sticky bottom-0 w-full bg-[#B42121] py-5 text-center text-[14px] font-medium text-white transition-colors",
          selectedSeats.length > 0 && !submitting
            ? "cursor-pointer hover:bg-[#9a1c1c]"
            : "cursor-not-allowed opacity-80"
        )}
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Procesando...
          </span>
        ) : selectedSeats.length > 0 ? (
          `Continuar con ${selectedSeats.length} ${selectedSeats.length === 1 ? 'silla' : 'sillas'}`
        ) : (
          'Elige al menos 1 silla'
        )}
      </button>
    </motion.div>
  );
}

// Componente Seat individual
function SeatButton({
  seat,
  isSelected,
  onSelect,
  style
}: {
  seat: Seat | null;
  isSelected: boolean;
  onSelect: (number: string) => void;
  style?: React.CSSProperties;
}) {
  if (!seat) {
    return <div className="h-10 w-10" style={style} />;
  }

  const isOccupied = seat.occupied;

  return (
    <button
      type="button"
      onClick={() => !isOccupied && seat.number && onSelect(seat.number)}
      disabled={isOccupied}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-lg text-[14px] font-medium transition-all",
        isOccupied
          ? "cursor-not-allowed bg-[#E6E6E6]"
          : isSelected
          ? "bg-[#B42121] text-white shadow-[rgba(177,177,177,0.5)_0px_2px_4px_0px]"
          : "bg-white text-[#9B9B9B] shadow-[rgba(177,177,177,0.5)_0px_2px_4px_0px] hover:scale-105"
      )}
      style={style}
    >
      {isOccupied ? (
        <svg className="h-5 w-5 text-[#9B9B9B]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      ) : (
        seat.number
      )}
    </button>
  );
}

export default SeatMap;
