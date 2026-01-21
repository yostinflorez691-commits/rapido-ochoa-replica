"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRightLeft,
  Loader2,
  X,
  SlidersHorizontal,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import SeatMap from "@/components/sections/seat-map";

// API Trip data interface
interface ApiTrip {
  id: string;
  departure: string;
  arrival: string;
  pricing: {
    total: number;
    amount: number;
    taxes: number;
  };
  service: string;
  line_id: string;
  availability: number;
  duration: number;
  path: Array<{
    origin: string;
    destination: string;
    departure: string;
    arrival: string;
  }>;
  stops: number;
}

interface ApiTerminal {
  name: string;
  city_name: string;
}

interface ApiSearchResponse {
  search?: {
    id: number;
  };
  id?: number;
  state?: string;
  trips?: ApiTrip[];
  lines?: Record<string, {
    name: string;
    human_abbr: string;
    logo_url: string;
    service_type: string;
  }>;
  terminals?: Record<string, ApiTerminal>;
}

// Internal bus trip data
interface BusTrip {
  id: string;
  company: string;
  companySlogan: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  originTerminal: string;
  destinationTerminal: string;
  originTerminalSlug: string;
  destinationTerminalSlug: string;
  serviceType: string;
  isDirect: boolean;
  isPopular?: boolean;
  isNight: boolean;
  logoUrl?: string;
  isLuxury: boolean;
}

// Parse terminal slug to get city name
const getCityFromSlug = (slug: string): string => {
  const parts = slug.split('-');
  if (parts.length >= 2) {
    const city = parts[1];
    return city.charAt(0).toUpperCase() + city.slice(1);
  }
  return slug;
};

// Parse date from URL format (DD-MMM-YY) to display format
const formatDisplayDate = (dateStr: string): string => {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[0]}${parts[1].toLowerCase()}${parts[2]}`.replace(/\s/g, '-');
  }
  return dateStr;
};

// Get full date display
const getFullDateDisplay = (dateStr: string): string => {
  const months: { [key: string]: string } = {
    'ene': 'Enero', 'feb': 'Febrero', 'mar': 'Marzo', 'abr': 'Abril',
    'may': 'Mayo', 'jun': 'Junio', 'jul': 'Julio', 'ago': 'Agosto',
    'sep': 'Septiembre', 'oct': 'Octubre', 'nov': 'Noviembre', 'dic': 'Diciembre'
  };
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const month = months[parts[1].toLowerCase()] || parts[1];
    return `${parts[0]} de ${month}, 20${parts[2]}`;
  }
  return dateStr;
};

// Format time from ISO date string to display format (HH:MM AM/PM)
const formatTime = (isoString: string): string => {
  const date = new Date(isoString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;
};

// Format duration from minutes to display string
const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours} horas`;
  return `${hours}h ${mins}m`;
};

// Check if time is night (6 PM - 5 AM)
const isNightTime = (isoString: string): boolean => {
  const date = new Date(isoString);
  const hours = date.getHours();
  return hours >= 18 || hours < 5;
};

// Get time of day icon based on departure time
const getTimeIcon = (time: string) => {
  const hour = parseInt(time.split(':')[0]);
  const isPM = time.toUpperCase().includes('PM');
  const hour24 = isPM && hour !== 12 ? hour + 12 : (!isPM && hour === 12 ? 0 : hour);

  // Noche/Madrugada (20:00 - 05:59) - Luna
  if (hour24 >= 20 || hour24 < 6) {
    return (
      <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"/>
      </svg>
    );
  }
  // Mañana (06:00 - 11:59) - Sol con rayos
  if (hour24 >= 6 && hour24 < 12) {
    return (
      <svg className="h-5 w-5 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"/>
      </svg>
    );
  }
  // Tarde (12:00 - 19:59) - Sol simple
  return (
    <svg className="h-5 w-5 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="5"/>
    </svg>
  );
};

// Convert API trip to internal format
const apiTripToBusTrip = (
  apiTrip: ApiTrip,
  lines: Record<string, { name: string; human_abbr: string; logo_url: string; service_type: string }>,
  terminals: Record<string, ApiTerminal>,
  index: number
): BusTrip => {
  const line = lines[apiTrip.line_id];
  const serviceName = line?.name || apiTrip.service;
  const serviceType = line?.service_type || 'economic';
  const isLuxury = serviceType === 'luxury' || serviceName.toLowerCase().includes('primera');

  // Get terminal slugs
  const originSlug = apiTrip.path[0]?.origin || '';
  const destSlug = apiTrip.path[0]?.destination || '';

  // Get terminal names from the terminals object
  const originTerminalData = terminals[originSlug];
  const destTerminalData = terminals[destSlug];

  // Format terminal name: "City Terminal Name"
  const originTerminalName = originTerminalData
    ? `${originTerminalData.city_name} ${originTerminalData.name}`
    : originSlug;
  const destTerminalName = destTerminalData
    ? `${destTerminalData.city_name} ${destTerminalData.name}`
    : destSlug;

  // Determine slogan based on service type
  let companySlogan = '';
  if (isLuxury) {
    companySlogan = '[VIP]';
  } else if (serviceName.toLowerCase().includes('máximo') || serviceName.toLowerCase().includes('maximo')) {
    companySlogan = 'Lo máximo';
  }

  return {
    id: apiTrip.id,
    company: serviceName,
    companySlogan,
    departureTime: formatTime(apiTrip.departure),
    arrivalTime: formatTime(apiTrip.arrival),
    duration: formatDuration(apiTrip.duration),
    price: apiTrip.pricing.total,
    originTerminal: originTerminalName,
    destinationTerminal: destTerminalName,
    originTerminalSlug: originSlug,
    destinationTerminalSlug: destSlug,
    serviceType: isLuxury ? 'De Primera' : 'Lo Máximo',
    isDirect: apiTrip.stops === 0,
    isPopular: index === 0,
    isNight: isNightTime(apiTrip.departure),
    logoUrl: line?.logo_url,
    isLuxury,
  };
};

export default function SearchResultsPage() {
  const params = useParams();
  const router = useRouter();
  const [trips, setTrips] = useState<BusTrip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<string | null>(null);
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);

  const origin = decodeURIComponent(params.origin as string);
  const destination = decodeURIComponent(params.destination as string);
  const date = decodeURIComponent(params.date as string);
  const passengers = params.passengers as string;

  const originCity = getCityFromSlug(origin);
  const destCity = getCityFromSlug(destination);
  const displayDate = formatDisplayDate(date);

  // Fetch trips from API
  const fetchTrips = useCallback(async () => {
    setIsLoading(true);
    try {
      // Convert date from URL format (DD-MMM-YY) to API format (DD-MM-YYYY)
      const dateParts = date.split('-');
      const months: { [key: string]: string } = {
        'ene': '01', 'feb': '02', 'mar': '03', 'abr': '04',
        'may': '05', 'jun': '06', 'jul': '07', 'ago': '08',
        'sep': '09', 'oct': '10', 'nov': '11', 'dic': '12'
      };
      const monthNum = months[dateParts[1].toLowerCase()] || '01';
      const year = `20${dateParts[2]}`;
      const apiDate = `${dateParts[0]}-${monthNum}-${year}`;

      // Parse passengers from URL format (e.g., "A1" = 1 adult)
      const passengersArray: string[] = [];
      const adultCount = parseInt(passengers.replace(/\D/g, '') || '1');
      for (let i = 0; i < adultCount; i++) {
        passengersArray.push('adult');
      }

      // Step 1: Create search
      const searchResponse = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination,
          date: apiDate,
          passengers: passengersArray,
        }),
      });

      if (!searchResponse.ok) {
        throw new Error('Failed to create search');
      }

      const searchData: ApiSearchResponse = await searchResponse.json();
      const searchId = searchData.search?.id;

      if (!searchId) {
        throw new Error('No search ID returned');
      }

      // Step 2: Poll for results (with retry)
      let attempts = 0;
      const maxAttempts = 10;
      let resultsData: ApiSearchResponse | null = null;

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const resultsResponse = await fetch(`/api/search?id=${searchId}`);
        if (resultsResponse.ok) {
          resultsData = await resultsResponse.json();
          if (resultsData?.state === 'finished' || (resultsData?.trips && resultsData.trips.length > 0)) {
            break;
          }
        }
        attempts++;
      }

      if (resultsData?.trips && resultsData.lines) {
        const terminals = resultsData.terminals || {};
        const busTrips = resultsData.trips.map((trip, index) =>
          apiTripToBusTrip(trip, resultsData!.lines!, terminals, index)
        );
        setTrips(busTrips);
      } else {
        setTrips([]);
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
      setTrips([]);
    } finally {
      setIsLoading(false);
    }
  }, [origin, destination, date, passengers]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  // Filter trips by time of day
  const filteredTrips = trips.filter(trip => {
    if (!timeFilter) return true;
    const hour = parseInt(trip.departureTime.split(':')[0]);
    const isPM = trip.departureTime.includes('PM');
    const hour24 = isPM && hour !== 12 ? hour + 12 : (!isPM && hour === 12 ? 0 : hour);

    switch (timeFilter) {
      case 'manana': return hour24 >= 6 && hour24 < 12;
      case 'tarde': return hour24 >= 12 && hour24 < 18;
      case 'noche': return hour24 >= 18 || hour24 < 6;
      default: return true;
    }
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO').format(price);
  };

  // Get adjacent dates for navigation
  const getAdjacentDate = (offset: number): string => {
    const parts = date.split('-');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const monthIndex = months.findIndex(m => m.toLowerCase() === parts[1].toLowerCase());
    const currentDate = new Date(2000 + parseInt(parts[2]), monthIndex, parseInt(parts[0]));
    currentDate.setDate(currentDate.getDate() + offset);

    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = months[currentDate.getMonth()];
    return `${day} ${month}`;
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* ============ MOBILE HEADER ============ */}
      <header className="bg-[#B42121] md:hidden">
        <div className="flex h-[60px] items-center justify-between px-4">
          {/* Back Button */}
          <button onClick={() => router.back()} className="flex h-10 w-10 items-center justify-center text-white">
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Change Search Button */}
          <button className="flex items-center gap-2 rounded-full bg-[#8a1919] px-4 py-2 text-[13px] font-medium text-white">
            Cambiar búsqueda
          </button>

          {/* Search Icon - borde blanco, sin fondo */}
          <button className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-transparent transition-colors hover:bg-white/10">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </button>

          {/* User Icon - fondo rojo con icono gris */}
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#B42121] p-1 shadow-lg transition-shadow hover:shadow-xl">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-[#B42121]">
              <svg className="h-6 w-6 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
          </button>
        </div>
      </header>

      {/* ============ DESKTOP HEADER ============ */}
      <header className="hidden bg-[#B42121] md:block">
        <div className="mx-auto flex h-[60px] max-w-7xl items-center justify-between px-4">
          {/* Logo - versión blanca */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/logo-white.png"
              alt="Rapido Ochoa - Transportamos tus ilusiones"
              width={180}
              height={36}
              className="h-[36px] w-[180px] object-contain"
              priority
            />
          </Link>

          {/* Welcome Text */}
          <span className="text-[15px] italic text-[#f5c842]">
            ¡Bienvenido a Rápido Ochoa!
          </span>

          {/* Login Button - sin fondo verde en icono */}
          <button className="flex items-center gap-2 rounded-full bg-neutral-700/70 px-3 py-1.5 text-white transition-colors hover:bg-neutral-700/80">
            <svg className="h-5 w-5 text-gray-200" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <span className="text-sm font-medium">Iniciar sesión</span>
          </button>
        </div>
      </header>

      {/* ============ DESKTOP SEARCH BAR ============ */}
      <div className="hidden bg-[#f8f8f8] px-4 py-4 md:block">
        <div className="mx-auto flex max-w-[1100px] items-center rounded-full bg-white p-1 shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
          {/* Origin */}
          <div className="flex flex-1 items-center gap-2 px-4 py-2.5">
            <MapPin className="h-4 w-4 flex-shrink-0 fill-[#4a9c4e] text-[#4a9c4e]" />
            <span className="flex-1 truncate text-[14px] text-[#333]">{originCity}, {originCity} Term</span>
            <button className="text-[#bbb] hover:text-[#888]">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Swap Button */}
          <button className="mx-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#f5f5f5] text-[#4a9c4e] transition-colors hover:bg-[#e8e8e8]">
            <ArrowRightLeft className="h-4 w-4" />
          </button>

          {/* Destination */}
          <div className="flex flex-1 items-center gap-2 px-4 py-2.5">
            <MapPin className="h-4 w-4 flex-shrink-0 text-[#9ca3af]" />
            <span className="flex-1 truncate text-[14px] text-[#333]">{destCity}, {destCity} Terminal</span>
            <button className="text-[#bbb] hover:text-[#888]">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Divider */}
          <div className="h-8 w-[1px] bg-[#e0e0e0]"></div>

          {/* Date */}
          <div className="flex items-center gap-2 px-5 py-2.5">
            <span className="text-[14px] text-[#333]">{date}</span>
            <button className="text-[#bbb] hover:text-[#888]">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Divider */}
          <div className="h-8 w-[1px] bg-[#e0e0e0]"></div>

          {/* Optional */}
          <div className="flex items-center gap-1 px-5 py-2.5">
            <span className="text-[14px] text-[#999]">Opcional</span>
            <ChevronRight className="h-4 w-4 rotate-90 text-[#ccc]" />
          </div>

          {/* Search Button */}
          <button className="mr-1 flex items-center gap-2 rounded-full bg-[#4a9c4e] px-8 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#3d8b40]">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <span>Buscar</span>
          </button>
        </div>
      </div>

      {/* Page Title & Filters */}
      <div className="bg-white px-4 py-4 shadow-sm md:py-5">
        <div className="mx-auto max-w-[1100px]">
          {/* Mobile: Filters with horizontal scroll */}
          <div className="md:hidden">
            <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide">
              <button
                onClick={() => setTimeFilter(null)}
                className="relative flex flex-shrink-0 items-center gap-1.5 rounded-full bg-[#1F8641] px-4 py-2 text-[13px] font-medium text-white"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Personalizar búsqueda
                <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                  0
                </span>
              </button>

              {/* Flecha izquierda */}
              <button className="flex-shrink-0 p-1 text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>

              <button
                onClick={() => setTimeFilter(timeFilter === 'manana' ? null : 'manana')}
                className={cn(
                  "flex-shrink-0 rounded-[10px] px-3 py-2 text-[13px] font-medium",
                  timeFilter === 'manana'
                    ? "bg-gray-200 text-gray-800"
                    : "bg-gray-100 text-gray-700"
                )}
              >
                Mañana
              </button>
              <button
                onClick={() => setTimeFilter(timeFilter === 'tarde' ? null : 'tarde')}
                className={cn(
                  "flex-shrink-0 rounded-[10px] px-3 py-2 text-[13px] font-medium",
                  timeFilter === 'tarde'
                    ? "bg-gray-200 text-gray-800"
                    : "bg-gray-100 text-gray-700"
                )}
              >
                Tarde
              </button>
              <button
                onClick={() => setTimeFilter(timeFilter === 'noche' ? null : 'noche')}
                className={cn(
                  "flex-shrink-0 rounded-[10px] px-3 py-2 text-[13px] font-medium",
                  timeFilter === 'noche'
                    ? "bg-gray-200 text-gray-800"
                    : "bg-gray-100 text-gray-700"
                )}
              >
                Noche
              </button>

              {/* Flecha derecha */}
              <button className="flex-shrink-0 p-1 text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
            <h1 className="text-[15px] text-[#333]">
              Seleccionar horario de ida <span className="text-[#666]">{date.toLowerCase()}</span>
            </h1>
          </div>

          {/* Desktop: Title and Filters in row */}
          <div className="hidden items-center justify-between md:flex">
            <h1 className="text-[16px] text-[#333]">
              Seleccionar horario de ida{" "}
              <span className="text-[#666]">{date.toLowerCase()}</span>
            </h1>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setTimeFilter(null)}
                className="relative flex items-center gap-1.5 rounded-full bg-[#1F8641] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#1a7339]"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Personalizar búsqueda
                <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                  0
                </span>
              </button>

              {/* Flecha izquierda */}
              <button className="p-1 text-gray-400 transition-colors hover:text-gray-600">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>

              {/* Filtros de tiempo */}
              <div className="flex gap-2">
                <button
                  onClick={() => setTimeFilter(timeFilter === 'manana' ? null : 'manana')}
                  className={cn(
                    "rounded-[10px] px-3 py-2 text-[13px] font-medium transition-colors",
                    timeFilter === 'manana'
                      ? "bg-gray-200 text-gray-800"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  Mañana
                </button>
                <button
                  onClick={() => setTimeFilter(timeFilter === 'tarde' ? null : 'tarde')}
                  className={cn(
                    "rounded-[10px] px-3 py-2 text-[13px] font-medium transition-colors",
                    timeFilter === 'tarde'
                      ? "bg-gray-200 text-gray-800"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  Tarde
                </button>
                <button
                  onClick={() => setTimeFilter(timeFilter === 'noche' ? null : 'noche')}
                  className={cn(
                    "rounded-[10px] px-3 py-2 text-[13px] font-medium transition-colors",
                    timeFilter === 'noche'
                      ? "bg-gray-200 text-gray-800"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  Noche
                </button>
              </div>

              {/* Flecha derecha */}
              <button className="p-1 text-gray-400 transition-colors hover:text-gray-600">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-[1100px] px-4 pb-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-[#B42121]" />
            <p className="mt-4 text-[#666]">Buscando los mejores viajes...</p>
          </div>
        ) : (
          <>
            {/* Recommended Section Header */}
            {filteredTrips.length > 0 && (
              <div className="mb-4 mt-6 flex items-center gap-2">
                <h2 className="text-[15px] font-semibold text-[#333]">Viajes recomendados</h2>
                <span className="rounded bg-[#B42121] px-2 py-0.5 text-[10px] font-bold text-white">
                  PARA TI
                </span>
                <span className="text-[#f59e0b]">✦</span>
              </div>
            )}

            {/* Trip Cards */}
            <div className="space-y-3">
              {filteredTrips.map((trip, index) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  className={cn(
                    "relative cursor-pointer overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-200 hover:shadow-lg",
                    trip.isPopular ? "border-l-4 border-l-[#f97316] border-y border-r border-y-[#e8e8e8] border-r-[#e8e8e8]" : "border border-[#e8e8e8]"
                  )}
                >
                  {/* ============ MOBILE CARD ============ */}
                  <div className="relative p-4 pt-6 md:hidden">
                    {/* Popular Badge - Mobile */}
                    {trip.isPopular && (
                      <div className="absolute left-0 top-0 z-10 flex items-center gap-1 rounded-br-lg bg-gradient-to-r from-orange-500 to-orange-400 px-3 py-1 text-[11px] font-semibold text-white">
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 23c-4.97 0-9-4.03-9-9 0-4.17 2.56-7.75 6.2-9.23.18-.07.38-.1.58-.1.55 0 1 .45 1 1v1.42c0 .14.1.26.2.35C14.68 9.25 17.1 12.83 17.1 17c0 3.31-2.69 6-6 6h-.1z"/>
                        </svg>
                        <span>Popular</span>
                      </div>
                    )}

                    {/* Top Row: Time icon + Departure + Direct + Arrival */}
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {/* Time Icon */}
                        <div className="mt-0.5">
                          {getTimeIcon(trip.departureTime)}
                        </div>
                        {/* Departure */}
                        <div>
                          <p className="text-[18px] font-bold text-[#333]">{trip.departureTime}</p>
                          <p className="text-[11px] text-[#888]">{trip.originTerminal}</p>
                        </div>
                      </div>

                      {/* Direct indicator */}
                      <div className="flex flex-col items-center px-2">
                        <span className="text-[11px] text-[#999]">Directo</span>
                        <span className="text-[#ccc]">→</span>
                      </div>

                      {/* Arrival */}
                      <div className="text-right">
                        <p className="text-[18px] font-bold text-[#333]">{trip.arrivalTime}</p>
                        <p className="text-[11px] text-[#888]">{trip.destinationTerminal}</p>
                      </div>
                    </div>

                    {/* Middle Row: Logo + Price */}
                    <div className="mb-3 flex items-center justify-between border-t border-[#f0f0f0] pt-3">
                      {/* Company Logo */}
                      <div>
                        {trip.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={trip.logoUrl}
                            alt={trip.company}
                            className="h-8 w-auto object-contain"
                          />
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="text-[13px] font-black tracking-tight">
                              <span className="text-[#B42121]">REY </span>
                              <span className="bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] bg-clip-text text-transparent">DORADO</span>
                            </span>
                          </div>
                        )}
                        <p className="mt-1 text-[10px] text-[#888]">
                          {trip.company} {trip.companySlogan && `- ${trip.companySlogan}`}
                        </p>
                        <button className="mt-1 text-[12px] font-medium text-[#1F8641] hover:underline">
                          Ver detalles
                        </button>
                        <p className="text-[10px] text-[#888]">{trip.duration}</p>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-[20px] font-bold text-[#333]">
                          $ {formatPrice(trip.price)} <span className="text-[11px] font-normal text-[#888]">COP</span>
                        </p>
                      </div>
                    </div>

                    {/* Bottom Row: Button */}
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => setExpandedTripId(expandedTripId === trip.id ? null : trip.id)}
                        className={cn(
                          "rounded-full px-5 py-2 text-[13px] font-semibold transition-all duration-200 hover:scale-105 active:scale-95",
                          expandedTripId === trip.id
                            ? "bg-[#B42121] text-white"
                            : "border-2 border-[#B42121] bg-white text-[#B42121] hover:bg-[#B42121] hover:text-white"
                        )}
                      >
                        {expandedTripId === trip.id ? "Cerrar" : "Ver sillas"}
                      </button>
                    </div>

                    {/* Seat Map - Mobile */}
                    <AnimatePresence>
                      {expandedTripId === trip.id && (
                        <SeatMap
                          tripId={trip.id}
                          price={trip.price}
                          departureTime={trip.departureTime}
                          arrivalTime={trip.arrivalTime}
                          date={getFullDateDisplay(date)}
                          isDirect={trip.isDirect}
                          origin={trip.originTerminal}
                          destination={trip.destinationTerminal}
                          service={trip.company}
                          onClose={() => setExpandedTripId(null)}
                        />
                      )}
                    </AnimatePresence>
                  </div>

                  {/* ============ DESKTOP CARD ============ */}
                  <div className="hidden md:block">
                    {/* Popular Badge with flame */}
                    {trip.isPopular && (
                      <div className="absolute left-0 top-0 z-10 flex items-center gap-1 rounded-br-lg bg-gradient-to-r from-orange-500 to-orange-400 px-3 py-1 text-[11px] font-semibold text-white">
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 23c-4.97 0-9-4.03-9-9 0-4.17 2.56-7.75 6.2-9.23.18-.07.38-.1.58-.1.55 0 1 .45 1 1v1.42c0 .14.1.26.2.35C14.68 9.25 17.1 12.83 17.1 17c0 3.31-2.69 6-6 6h-.1z"/>
                        </svg>
                        <span>Popular</span>
                      </div>
                    )}

                    <div className="flex items-center px-5 py-4 pt-6">
                      {/* Company Info - Logo from API */}
                      <div className="w-[180px] flex-shrink-0 pl-2">
                        {trip.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={trip.logoUrl}
                            alt={trip.company}
                            className="h-10 w-auto object-contain"
                          />
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="text-[14px] font-black tracking-tight">
                              <span className="text-[#B42121]">REY </span>
                              <span className="bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] bg-clip-text text-transparent">DORADO</span>
                            </span>
                          </div>
                        )}
                        <p className="mt-1 text-[10px] text-[#888]">
                          {trip.company} {trip.companySlogan && `- ${trip.companySlogan}`}
                        </p>
                        <button className="mt-1 text-[12px] font-medium text-[#1F8641] hover:underline">
                          Ver detalles
                        </button>
                        <p className="text-[10px] text-[#888]">{trip.duration}</p>
                      </div>

                      {/* Time Icon */}
                      <div className="mx-3 flex-shrink-0">
                        {getTimeIcon(trip.departureTime)}
                      </div>

                      {/* Departure */}
                      <div className="w-[170px] flex-shrink-0">
                        <p className="text-[18px] font-bold text-[#333]">{trip.departureTime}</p>
                        <p className="text-[11px] text-[#888]">{trip.originTerminal}</p>
                      </div>

                      {/* Route Line */}
                      <div className="mx-2 w-[90px] flex-shrink-0">
                        <div className="flex items-center text-[11px] text-[#999]">
                          <span className="h-[1px] flex-1 bg-[#ddd]"></span>
                          <span className="px-1.5">{trip.isDirect ? 'Directo' : `${trip.isDirect} paradas`}</span>
                          <span className="h-[1px] flex-1 bg-[#ddd]"></span>
                          <span className="ml-1 text-[#ccc]">→</span>
                        </div>
                      </div>

                      {/* Arrival */}
                      <div className="w-[170px] flex-shrink-0">
                        <p className="text-[18px] font-bold text-[#333]">{trip.arrivalTime}</p>
                        <p className="text-[11px] text-[#888]">{trip.destinationTerminal}</p>
                      </div>

                      {/* Price */}
                      <div className="mx-3 w-[130px] flex-shrink-0 text-right">
                        <p className="text-[20px] font-bold text-[#333]">
                          $ {formatPrice(trip.price)}{" "}
                          <span className="text-[11px] font-normal text-[#888]">COP</span>
                        </p>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => setExpandedTripId(expandedTripId === trip.id ? null : trip.id)}
                        className={cn(
                          "ml-2 flex-shrink-0 whitespace-nowrap rounded-full px-6 py-2.5 text-[13px] font-semibold transition-all duration-200 hover:scale-105 active:scale-95",
                          expandedTripId === trip.id
                            ? "bg-[#B42121] text-white hover:bg-[#8a1919] hover:shadow-md"
                            : trip.isPopular
                            ? "bg-[#B42121] text-white hover:bg-[#8a1919] hover:shadow-md"
                            : "border-2 border-[#B42121] bg-white text-[#B42121] hover:bg-[#B42121] hover:text-white hover:shadow-md"
                        )}
                      >
                        {expandedTripId === trip.id ? "Cerrar" : "Ver sillas"}
                      </button>
                    </div>

                    {/* Seat Map - Desktop */}
                    <AnimatePresence>
                      {expandedTripId === trip.id && (
                        <SeatMap
                          tripId={trip.id}
                          price={trip.price}
                          departureTime={trip.departureTime}
                          arrivalTime={trip.arrivalTime}
                          date={getFullDateDisplay(date)}
                          isDirect={trip.isDirect}
                          origin={trip.originTerminal}
                          destination={trip.destinationTerminal}
                          service={trip.company}
                          onClose={() => setExpandedTripId(null)}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Date Navigation */}
            <div className="mt-8">
              {/* Mobile Date Nav */}
              <div className="flex items-center justify-center gap-1 md:hidden">
                <button className="flex h-8 w-8 items-center justify-center rounded-full border border-[#B42121] text-[#B42121] transition-all duration-200 hover:bg-[#B42121] hover:text-white active:scale-95">
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="flex flex-1 items-center justify-center gap-1">
                  <div className="flex-1 cursor-pointer rounded-lg border border-[#e0e0e0] bg-white px-3 py-2 text-center transition-all duration-200 hover:border-[#4a9c4e] hover:bg-[#f8fdf8]">
                    <p className="text-[12px] font-medium text-[#333]">{getAdjacentDate(-1)}</p>
                    <p className="text-[10px] text-[#888]">Desde:<span className="font-semibold text-[#333]"> $ {formatPrice(trips[0]?.price || 115000)} COP</span></p>
                  </div>
                  <div className="flex-1 rounded-lg border border-[#4a9c4e] bg-[#f0fdf4] px-3 py-2 text-center">
                    <p className="text-[12px] font-semibold text-[#4a9c4e]">{date}</p>
                    <p className="text-[10px] text-[#888]">Desde:<span className="font-semibold text-[#333]"> $ {formatPrice(trips[0]?.price || 115000)} COP</span></p>
                  </div>
                  <div className="flex-1 cursor-pointer rounded-lg border border-[#e0e0e0] bg-white px-3 py-2 text-center transition-all duration-200 hover:border-[#4a9c4e] hover:bg-[#f8fdf8]">
                    <p className="text-[12px] font-medium text-[#333]">{getAdjacentDate(1)}</p>
                    <p className="text-[10px] text-[#888]">Desde:<span className="font-semibold text-[#333]"> $ {formatPrice(trips[0]?.price || 115000)} COP</span></p>
                  </div>
                </div>

                <button className="flex h-8 w-8 items-center justify-center rounded-full border border-[#B42121] text-[#B42121] transition-all duration-200 hover:bg-[#B42121] hover:text-white active:scale-95">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Desktop Date Nav */}
              <div className="hidden items-center justify-center gap-2 md:flex">
                <button className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e0e0e0] bg-white text-[#4a9c4e] transition-all duration-200 hover:border-[#4a9c4e] hover:bg-[#f5f5f5] hover:scale-110 active:scale-95">
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="flex items-center overflow-hidden rounded-lg border border-[#e0e0e0] bg-white">
                  <div className="cursor-pointer px-6 py-3 text-center transition-all duration-200 hover:bg-[#f5f5f5]">
                    <p className="text-[13px] font-medium text-[#333]">{getAdjacentDate(-1)}</p>
                    <p className="text-[11px] text-[#888]">Desde: <span className="font-semibold text-[#333]">$ {formatPrice(trips[0]?.price || 115000)} COP</span></p>
                  </div>
                  <div className="border-l border-r border-[#e0e0e0] bg-[#f0fdf4] px-6 py-3 text-center">
                    <p className="text-[13px] font-semibold text-[#4a9c4e]">{date}</p>
                    <p className="text-[11px] text-[#888]">Desde: <span className="font-semibold text-[#333]">$ {formatPrice(trips[0]?.price || 115000)} COP</span></p>
                  </div>
                  <div className="cursor-pointer px-6 py-3 text-center transition-all duration-200 hover:bg-[#f5f5f5]">
                    <p className="text-[13px] font-medium text-[#333]">{getAdjacentDate(1)}</p>
                    <p className="text-[11px] text-[#888]">Desde: <span className="font-semibold text-[#333]">$ {formatPrice(trips[0]?.price || 115000)} COP</span></p>
                  </div>
                </div>

                <button className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e0e0e0] bg-white text-[#4a9c4e] transition-all duration-200 hover:border-[#4a9c4e] hover:bg-[#f5f5f5] hover:scale-110 active:scale-95">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Footer Info */}
            <div className="mt-8 flex flex-col items-center gap-4 pb-4">
              <div className="flex items-center gap-2 text-[13px] text-[#999]">
                <span>Powered by</span>
                <span className="inline-flex items-center text-[16px] font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-[#B42121] to-[#e63950] bg-clip-text text-transparent">Reser</span>
                  <span className="text-[#333]">hub</span>
                </span>
              </div>
              <p className="text-[13px] italic text-[#999]">Mostrando todos los viajes disponibles</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
