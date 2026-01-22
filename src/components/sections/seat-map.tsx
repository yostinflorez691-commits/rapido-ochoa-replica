"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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

  // Organizar asientos para layout HORIZONTAL (PC) - 4 filas x N columnas
  const organizeSeatsHorizontal = () => {
    if (!tripDetails?.bus) return { rows: [], totalColumns: 0 };

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

    // Para layout horizontal de bus:
    // 4 filas (2 arriba del pasillo + 2 abajo)
    // Múltiples columnas hacia la derecha
    const totalSeats = allSeats.length;
    const seatsPerColumn = 4; // 4 asientos por columna (2+2)
    const totalColumns = Math.ceil(totalSeats / seatsPerColumn);

    // Crear estructura: 4 filas x N columnas
    const horizontalLayout: (Seat | null)[][] = [[], [], [], []];

    allSeats.forEach((seat, index) => {
      const row = index % 4;
      horizontalLayout[row].push(seat);
    });

    // Rellenar con nulls para que todas las filas tengan la misma longitud
    for (let i = 0; i < 4; i++) {
      while (horizontalLayout[i].length < totalColumns) {
        horizontalLayout[i].push(null);
      }
    }

    return { rows: horizontalLayout, totalColumns };
  };

  // Organizar asientos para layout VERTICAL (móvil) - filas de 4
  const organizeSeatsVertical = () => {
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
        <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"/>
        </svg>
      );
    }
    // Día (06:00 - 17:59)
    return (
      <svg className="h-5 w-5 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
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
  const verticalRows = organizeSeatsVertical();
  const { rows: horizontalRows, totalColumns } = organizeSeatsHorizontal();

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="relative border-t border-[#e8e8e8] bg-white"
    >
      {/* Header del Modal */}
      <div className="seat-map-header flex items-center justify-between border-b border-[#E6E6E6] bg-[#f8f9fa] px-3 py-3 sm:px-5 sm:py-4">
        <h2 className="text-[16px] font-semibold text-[#2d3436] sm:text-[18px]">
          Elige tus sillas de ida
        </h2>
        {/* Botón X Cerrar - Verde */}
        <button
          onClick={onClose}
          className="close-btn flex h-8 w-8 items-center justify-center rounded-full border border-[#e0e0e0] bg-white text-[#636e72] transition-all hover:border-[#e74c3c] hover:bg-[#e74c3c] hover:text-white"
          aria-label="Cerrar"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      {/* Barra de información del viaje */}
      <div className="trip-info-compact flex flex-wrap items-center gap-2 border-b border-[#e9ecef] bg-white px-3 py-2 sm:flex-nowrap sm:gap-3 sm:px-5 sm:py-3">
        {/* Icono sol/luna */}
        {getTimeIcon()}
        {/* Hora salida */}
        <span className="time text-[12px] font-semibold text-[#2d3436] sm:text-[14px]">{departureTime}</span>
        {/* Tipo de ruta */}
        <span className="route text-[11px] text-[#28a745] sm:text-[12px]">
          — {isDirect ? 'Directo' : 'Con escala'} →
        </span>
        {/* Hora llegada */}
        <span className="time text-[12px] font-semibold text-[#2d3436] sm:text-[14px]">{arrivalTime}</span>
        {/* Fecha */}
        <span className="date ml-auto text-[11px] text-[#636e72] sm:text-[12px]">{date}</span>
      </div>

      {/* Contenedor principal - Layout responsivo */}
      <div className="seat-selection-wrapper flex flex-col gap-4 p-3 sm:p-5 md:flex-row md:gap-6 lg:gap-8">

        {/* Panel de información (izquierda en desktop) */}
        <div className="seats-info-panel flex flex-row justify-center gap-6 rounded-xl bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.08)] sm:gap-8 md:w-[140px] md:flex-col md:gap-4">
          <h4 className="hidden text-[14px] font-semibold text-[#2d3436] md:block">Tus sillas</h4>

          {/* Leyenda */}
          <div className="seats-legend flex flex-row gap-4 md:flex-col md:gap-3">
            {/* Libres */}
            <div className="legend-item flex items-center gap-2">
              <div className="legend-color available h-6 w-6 rounded-md border-2 border-[#e0e0e0] bg-white" />
              <span className="text-[12px] text-[#636e72] md:text-[13px]">{free} Libres</span>
            </div>

            {/* Elegidos */}
            <div className="legend-item flex items-center gap-2">
              <div className="legend-color selected h-6 w-6 rounded-md bg-[#c0392b]" />
              <span className="text-[12px] text-[#636e72] md:text-[13px]">{selectedSeats.length} Elegidos</span>
            </div>

            {/* Ocupados */}
            <div className="legend-item flex items-center gap-2">
              <div className="legend-color occupied relative flex h-6 w-6 items-center justify-center rounded-md border-2 border-[#e0e0e0] bg-[#f5f5f5]">
                <svg className="h-3 w-3 text-[#9e9e9e]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <span className="text-[12px] text-[#636e72] md:text-[13px]">{occupied} Ocupados</span>
            </div>
          </div>
        </div>

        {/* Mapa de sillas */}
        <div className="flex-1">
          {/* Layout HORIZONTAL para PC (md+) */}
          <div className="hidden md:block">
            <div className="seat-map-container mx-auto overflow-x-auto rounded-2xl bg-gradient-to-br from-[#f8f9fa] via-white to-[#f8f9fa] p-5 shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)]">
              {/* Icono del conductor */}
              <div className="mb-4 flex items-center gap-3">
                <div className="driver-icon flex h-10 w-10 items-center justify-center">
                  <svg className="h-8 w-8 text-[#636e72]" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="#636e72" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="3" fill="#636e72"/>
                    <line x1="12" y1="2" x2="12" y2="6" stroke="#636e72" strokeWidth="2"/>
                    <line x1="12" y1="18" x2="12" y2="22" stroke="#636e72" strokeWidth="2"/>
                    <line x1="2" y1="12" x2="6" y2="12" stroke="#636e72" strokeWidth="2"/>
                    <line x1="18" y1="12" x2="22" y2="12" stroke="#636e72" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="h-px flex-1 bg-[#e0e0e0]" />
              </div>

              {/* Grid de asientos horizontal */}
              <div className="flex flex-col gap-2">
                {/* Filas superiores (1 y 2) */}
                <div className="flex gap-2">
                  {horizontalRows[0]?.map((seat, colIndex) => (
                    <SeatButtonHorizontal
                      key={`row0-${colIndex}`}
                      seat={seat}
                      isSelected={selectedSeats.includes(seat?.number || '')}
                      onSelect={toggleSeat}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  {horizontalRows[1]?.map((seat, colIndex) => (
                    <SeatButtonHorizontal
                      key={`row1-${colIndex}`}
                      seat={seat}
                      isSelected={selectedSeats.includes(seat?.number || '')}
                      onSelect={toggleSeat}
                    />
                  ))}
                </div>

                {/* Pasillo */}
                <div className="aisle-space my-2 h-5 w-full" />

                {/* Filas inferiores (3 y 4) */}
                <div className="flex gap-2">
                  {horizontalRows[2]?.map((seat, colIndex) => (
                    <SeatButtonHorizontal
                      key={`row2-${colIndex}`}
                      seat={seat}
                      isSelected={selectedSeats.includes(seat?.number || '')}
                      onSelect={toggleSeat}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  {horizontalRows[3]?.map((seat, colIndex) => (
                    <SeatButtonHorizontal
                      key={`row3-${colIndex}`}
                      seat={seat}
                      isSelected={selectedSeats.includes(seat?.number || '')}
                      onSelect={toggleSeat}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Layout VERTICAL para móvil (< md) */}
          <div className="md:hidden">
            <div className="mx-auto flex max-w-[200px] flex-col items-center rounded-2xl bg-gradient-to-b from-[#f0f0f0] to-[#fafafa] px-4 py-5">
              {/* Icono del conductor */}
              <div className="mb-4 self-start">
                <svg className="h-6 w-6 text-[#9B9B9B]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-12.5c-2.49 0-4.5 2.01-4.5 4.5h2c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5h2c0-2.49-2.01-4.5-4.5-4.5zM12 14c-.83 0-1.5.67-1.5 1.5S11.17 17 12 17s1.5-.67 1.5-1.5S12.83 14 12 14z"/>
                </svg>
              </div>

              {/* Asientos en filas de 4 */}
              <div className="flex flex-col gap-3">
                {verticalRows.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex items-center justify-center">
                    {/* Grupo izquierdo (2 sillas) */}
                    <div className="flex gap-2">
                      <SeatButtonVertical
                        seat={row[0]}
                        isSelected={selectedSeats.includes(row[0]?.number || '')}
                        onSelect={toggleSeat}
                      />
                      <SeatButtonVertical
                        seat={row[1]}
                        isSelected={selectedSeats.includes(row[1]?.number || '')}
                        onSelect={toggleSeat}
                      />
                    </div>

                    {/* Pasillo central */}
                    <div className="w-6" />

                    {/* Grupo derecho (2 sillas) */}
                    <div className="flex gap-2">
                      <SeatButtonVertical
                        seat={row[2]}
                        isSelected={selectedSeats.includes(row[2]?.number || '')}
                        onSelect={toggleSeat}
                      />
                      <SeatButtonVertical
                        seat={row[3]}
                        isSelected={selectedSeats.includes(row[3]?.number || '')}
                        onSelect={toggleSeat}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Precio aproximado - Solo mostrar si hay sillas seleccionadas */}
      <AnimatePresence>
        {selectedSeats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="price-section border-t border-[#E6E6E6] px-3 py-3 sm:px-5 sm:py-4"
          >
            <p className="text-[12px] text-[#636e72] sm:text-[13px]">
              {selectedSeats.length} {selectedSeats.length === 1 ? 'asiento' : 'asientos'}: {selectedSeats.sort((a, b) => parseInt(a) - parseInt(b)).join(', ')}
            </p>
            <p className="price-amount text-[20px] font-bold text-[#2d3436] sm:text-[24px]">
              $ {totalPrice.toLocaleString('es-CO')} <small className="text-[12px] font-normal text-[#636e72] sm:text-[14px]">COP</small>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA Button - Fijo abajo, rojo con gradiente */}
      <button
        onClick={selectedSeats.length > 0 && !submitting ? handleContinue : undefined}
        disabled={selectedSeats.length === 0 || submitting}
        className={cn(
          "seat-action-btn sticky bottom-0 w-full py-4 text-center text-[14px] font-semibold text-white transition-all sm:py-5 sm:text-[16px]",
          selectedSeats.length > 0 && !submitting
            ? "cursor-pointer bg-gradient-to-r from-[#c0392b] to-[#e74c3c] shadow-[0_4px_15px_rgba(192,57,43,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(192,57,43,0.4)]"
            : "cursor-not-allowed bg-[#bdc3c7]"
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

// Componente Seat para layout HORIZONTAL (PC)
function SeatButtonHorizontal({
  seat,
  isSelected,
  onSelect
}: {
  seat: Seat | null;
  isSelected: boolean;
  onSelect: (number: string) => void;
}) {
  if (!seat) {
    return <div className="h-10 w-10" />;
  }

  const isOccupied = seat.occupied;

  return (
    <motion.button
      type="button"
      onClick={() => !isOccupied && seat.number && onSelect(seat.number)}
      disabled={isOccupied}
      whileHover={!isOccupied ? { scale: 1.05 } : {}}
      whileTap={!isOccupied ? { scale: 0.95 } : {}}
      className={cn(
        "seat-button flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-[12px] font-semibold transition-all duration-200",
        isOccupied
          ? "seat-occupied cursor-not-allowed border-2 border-[#e0e0e0] bg-[#f5f5f5]"
          : isSelected
          ? "seat-selected border-2 border-[#a93226] bg-[#c0392b] text-white shadow-[0_2px_8px_rgba(192,57,43,0.3)]"
          : "seat-available border-2 border-[#e0e0e0] bg-white text-[#2d3436] hover:border-[#28a745] hover:bg-[#e8f5e9]"
      )}
    >
      {isOccupied ? (
        <svg className="h-5 w-5 text-[#9e9e9e]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      ) : (
        seat.number
      )}
    </motion.button>
  );
}

// Componente Seat para layout VERTICAL (móvil)
function SeatButtonVertical({
  seat,
  isSelected,
  onSelect
}: {
  seat: Seat | null;
  isSelected: boolean;
  onSelect: (number: string) => void;
}) {
  if (!seat) {
    return <div className="h-11 w-11" />;
  }

  const isOccupied = seat.occupied;

  return (
    <motion.button
      type="button"
      onClick={() => !isOccupied && seat.number && onSelect(seat.number)}
      disabled={isOccupied}
      whileHover={!isOccupied ? { scale: 1.05 } : {}}
      whileTap={!isOccupied ? { scale: 0.95 } : {}}
      className={cn(
        "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg text-[14px] font-medium transition-all duration-200",
        isOccupied
          ? "cursor-not-allowed bg-[#E6E6E6]"
          : isSelected
          ? "bg-[#c0392b] text-white shadow-[0_2px_8px_rgba(192,57,43,0.3)]"
          : "bg-white text-[#9B9B9B] shadow-[rgba(177,177,177,0.5)_0px_2px_4px_0px] hover:border-[#28a745] hover:bg-[#e8f5e9]"
      )}
    >
      {isOccupied ? (
        <svg className="h-5 w-5 text-[#9B9B9B]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      ) : (
        seat.number
      )}
    </motion.button>
  );
}

export default SeatMap;
