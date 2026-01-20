"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  User,
  ArrowRightLeft,
  Sun,
  Moon,
  Sunrise,
  Loader2,
  X,
  SlidersHorizontal,
  MapPin,
  Bus,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
      case 'manana': return hour24 >= 5 && hour24 < 12;
      case 'tarde': return hour24 >= 12 && hour24 < 18;
      case 'noche': return hour24 >= 18 || hour24 < 5;
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
      <header className="bg-[#c41e3a] md:hidden">
        <div className="flex h-[56px] items-center justify-between px-4">
          {/* Back Button */}
          <button onClick={() => router.back()} className="flex h-10 w-10 items-center justify-center text-white">
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Change Search Button */}
          <button className="flex items-center gap-2 rounded-full bg-[#a31830] px-4 py-2 text-[13px] font-medium text-white">
            Cambiar búsqueda
          </button>

          {/* Search Icon */}
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4a9c4e] text-white">
            <Search className="h-5 w-5" />
          </button>

          {/* User Icon */}
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d4a855] text-[#3d3d3d]">
            <User className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* ============ DESKTOP HEADER ============ */}
      <header className="hidden bg-[#c41e3a] md:block">
        <div className="mx-auto flex h-[60px] max-w-7xl items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="Rapido Ochoa"
              width={150}
              height={40}
              className="h-[40px] w-auto"
              priority
            />
          </Link>

          {/* Welcome Text */}
          <span className="text-[15px] italic text-[#f5c842]">
            ¡Bienvenido a Rápido Ochoa!
          </span>

          {/* Login Button */}
          <button className="flex items-center gap-2 rounded-full bg-[#3d3d3d] px-5 py-2.5 text-[13px] text-white transition-colors hover:bg-[#4a4a4a]">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#d4a855] text-[#3d3d3d]">
              <User className="h-3 w-3" />
            </div>
            <span>Iniciar sesión</span>
          </button>
        </div>
      </header>

      {/* ============ DESKTOP SEARCH BAR ============ */}
      <div className="hidden bg-[#c41e3a] px-4 py-3 md:block">
        <div className="mx-auto flex max-w-[1100px] items-center rounded-full bg-white p-1 shadow-lg">
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
            <Search className="h-4 w-4" />
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
                className="relative flex flex-shrink-0 items-center gap-1.5 rounded-full bg-[#4a9c4e] px-4 py-2 text-[13px] font-medium text-white"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Personalizar búsqueda
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#c41e3a] text-[10px] font-bold text-white">
                  0
                </span>
              </button>
              <button
                onClick={() => setTimeFilter(timeFilter === 'manana' ? null : 'manana')}
                className={cn(
                  "flex-shrink-0 rounded-full px-4 py-2 text-[13px] font-medium",
                  timeFilter === 'manana'
                    ? "border-2 border-[#333] bg-white text-[#333]"
                    : "border border-[#e0e0e0] bg-white text-[#666]"
                )}
              >
                Mañana
              </button>
              <button
                onClick={() => setTimeFilter(timeFilter === 'tarde' ? null : 'tarde')}
                className={cn(
                  "flex-shrink-0 rounded-full px-4 py-2 text-[13px] font-medium",
                  timeFilter === 'tarde'
                    ? "border-2 border-[#333] bg-white text-[#333]"
                    : "border border-[#e0e0e0] bg-white text-[#666]"
                )}
              >
                Tarde
              </button>
              <button
                onClick={() => setTimeFilter(timeFilter === 'noche' ? null : 'noche')}
                className={cn(
                  "flex-shrink-0 rounded-full px-4 py-2 text-[13px] font-medium",
                  timeFilter === 'noche'
                    ? "border-2 border-[#333] bg-white text-[#333]"
                    : "border border-[#e0e0e0] bg-white text-[#666]"
                )}
              >
                Noche
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
                className="relative flex items-center gap-1.5 rounded-full bg-[#4a9c4e] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#3d8b40]"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Personalizar búsqueda
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#c41e3a] text-[10px] font-bold text-white">
                  0
                </span>
              </button>
              <button
                onClick={() => setTimeFilter(timeFilter === 'manana' ? null : 'manana')}
                className={cn(
                  "rounded-full px-4 py-2 text-[13px] font-medium transition-colors",
                  timeFilter === 'manana'
                    ? "border-2 border-[#333] bg-white text-[#333]"
                    : "border border-[#e0e0e0] bg-white text-[#666] hover:border-[#ccc]"
                )}
              >
                Mañana
              </button>
              <button
                onClick={() => setTimeFilter(timeFilter === 'tarde' ? null : 'tarde')}
                className={cn(
                  "rounded-full px-4 py-2 text-[13px] font-medium transition-colors",
                  timeFilter === 'tarde'
                    ? "border-2 border-[#333] bg-white text-[#333]"
                    : "border border-[#e0e0e0] bg-white text-[#666] hover:border-[#ccc]"
                )}
              >
                Tarde
              </button>
              <button
                onClick={() => setTimeFilter(timeFilter === 'noche' ? null : 'noche')}
                className={cn(
                  "rounded-full px-4 py-2 text-[13px] font-medium transition-colors",
                  timeFilter === 'noche'
                    ? "border-2 border-[#333] bg-white text-[#333]"
                    : "border border-[#e0e0e0] bg-white text-[#666] hover:border-[#ccc]"
                )}
              >
                Noche
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-[1100px] px-4 pb-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-[#c41e3a]" />
            <p className="mt-4 text-[#666]">Buscando los mejores viajes...</p>
          </div>
        ) : (
          <>
            {/* Recommended Section Header */}
            {filteredTrips.length > 0 && (
              <div className="mb-4 mt-6 flex items-center gap-2">
                <h2 className="text-[15px] font-semibold text-[#333]">Viajes recomendados</h2>
                <span className="rounded bg-[#c41e3a] px-2 py-0.5 text-[10px] font-bold text-white">
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
                    "relative cursor-pointer overflow-hidden rounded-lg border bg-white shadow-sm transition-all duration-200 hover:shadow-lg",
                    trip.isPopular ? "border-[#f97316]" : "border-[#e8e8e8]"
                  )}
                >
                  {/* ============ MOBILE CARD ============ */}
                  <div className="p-4 md:hidden">
                    {/* Top Row: Time icon + Departure + Direct + Arrival */}
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {/* Time Icon */}
                        {trip.isNight ? (
                          <Moon className="mt-1 h-5 w-5 text-[#6366f1]" />
                        ) : (
                          <Sun className="mt-1 h-5 w-5 text-[#f59e0b]" />
                        )}
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
                        {trip.isLuxury ? (
                          <span className="text-[9px] italic text-[#c41e3a]">De Primera</span>
                        ) : (
                          <div className="mb-0.5 inline-block rounded bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] px-1.5 py-0.5">
                            <span className="text-[8px] font-bold italic text-white">Lo Máximo!</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <span className="text-[13px] font-black tracking-tight">
                            <span className="text-[#c41e3a]">REY </span>
                            <span className="bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] bg-clip-text text-transparent">DORADO</span>
                          </span>
                          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                            <path d="M9 12l2 2 4-4" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="12" r="9" stroke="#22c55e" strokeWidth="2"/>
                          </svg>
                        </div>
                        <p className="text-[10px] text-[#888]">
                          {trip.isLuxury ? 'Rey Dorado de Primera [VIP]' : 'Rey Dorado - Lo máximo'}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-[20px] font-bold text-[#333]">
                          $ {formatPrice(trip.price)} <span className="text-[11px] font-normal text-[#888]">COP</span>
                        </p>
                      </div>
                    </div>

                    {/* Bottom Row: Details + Button */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button className="text-[12px] font-medium text-[#4a9c4e] underline transition-colors hover:text-[#3d8b40]">
                          Ver detalles
                        </button>
                        <span className="text-[12px] text-[#888]">{trip.duration}</span>
                      </div>
                      <button className="rounded-full border-2 border-[#c41e3a] bg-white px-5 py-2 text-[13px] font-semibold text-[#c41e3a] transition-all duration-200 hover:scale-105 hover:bg-[#c41e3a] hover:text-white active:scale-95">
                        Ver sillas
                      </button>
                    </div>
                  </div>

                  {/* ============ DESKTOP CARD ============ */}
                  <div className="hidden md:block">
                    {/* Popular Badge with flame */}
                    {trip.isPopular && (
                      <div className="absolute -left-1 top-3">
                        <div className="relative flex items-center">
                          <Flame className="absolute -left-3 -top-2 h-6 w-6 fill-[#f97316] text-[#f97316]" />
                          <div className="rounded-r-md bg-gradient-to-r from-[#f97316] to-[#fb923c] px-3 py-1 pl-4 text-[11px] font-bold text-white shadow-sm">
                            Popular
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center px-5 py-4">
                      {/* Company Info - REY DORADO Logo */}
                      <div className="w-[180px] flex-shrink-0 pl-2">
                        {trip.isLuxury ? (
                          <>
                            <span className="text-[9px] italic text-[#c41e3a]">De Primera</span>
                            <div className="flex items-center gap-1">
                              <span className="text-[14px] font-black tracking-tight">
                                <span className="text-[#c41e3a]">REY </span>
                                <span className="bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] bg-clip-text text-transparent">DORADO</span>
                              </span>
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                                <path d="M9 12l2 2 4-4" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <circle cx="12" cy="12" r="9" stroke="#22c55e" strokeWidth="2"/>
                              </svg>
                            </div>
                            <p className="text-[10px] text-[#888]">Rey Dorado de Primera</p>
                            <p className="text-[10px] font-medium text-[#666]">[VIP]</p>
                          </>
                        ) : (
                          <>
                            <div className="mb-0.5 inline-block rounded bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] px-1.5 py-0.5">
                              <span className="text-[8px] font-bold italic text-white">Lo Máximo!</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[14px] font-black tracking-tight">
                                <span className="text-[#c41e3a]">REY </span>
                                <span className="bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] bg-clip-text text-transparent">DORADO</span>
                              </span>
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                                <path d="M9 12l2 2 4-4" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <circle cx="12" cy="12" r="9" stroke="#22c55e" strokeWidth="2"/>
                              </svg>
                            </div>
                            <p className="text-[10px] text-[#888]">Rey Dorado - Lo máximo</p>
                          </>
                        )}
                      </div>

                      {/* Time Icon */}
                      <div className="mx-3 flex-shrink-0">
                        {trip.isNight ? (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e0e7ff]">
                            <Moon className="h-4 w-4 fill-[#6366f1] text-[#6366f1]" />
                          </div>
                        ) : (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fef3c7]">
                            <Sun className="h-4 w-4 fill-[#f59e0b] text-[#f59e0b]" />
                          </div>
                        )}
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

                      {/* Duration & Details */}
                      <div className="mx-3 w-[80px] flex-shrink-0 text-right">
                        <p className="text-[12px] text-[#888]">{trip.duration}</p>
                        <button className="text-[12px] font-medium text-[#4a9c4e] underline hover:text-[#3d8b40]">
                          Ver detalles
                        </button>
                      </div>

                      {/* Price */}
                      <div className="mx-3 w-[130px] flex-shrink-0 text-right">
                        <p className="text-[20px] font-bold text-[#333]">
                          $ {formatPrice(trip.price)}{" "}
                          <span className="text-[11px] font-normal text-[#888]">COP</span>
                        </p>
                      </div>

                      {/* Action Button */}
                      <button className={cn(
                        "ml-2 flex-shrink-0 whitespace-nowrap rounded-full px-6 py-2.5 text-[13px] font-semibold transition-all duration-200 hover:scale-105 active:scale-95",
                        trip.isPopular
                          ? "bg-[#c41e3a] text-white hover:bg-[#a31830] hover:shadow-md"
                          : "border-2 border-[#c41e3a] bg-white text-[#c41e3a] hover:bg-[#c41e3a] hover:text-white hover:shadow-md"
                      )}>
                        Ver sillas
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Date Navigation */}
            <div className="mt-8">
              {/* Mobile Date Nav */}
              <div className="flex items-center justify-center gap-1 md:hidden">
                <button className="flex h-8 w-8 items-center justify-center rounded-full border border-[#c41e3a] text-[#c41e3a] transition-all duration-200 hover:bg-[#c41e3a] hover:text-white active:scale-95">
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

                <button className="flex h-8 w-8 items-center justify-center rounded-full border border-[#c41e3a] text-[#c41e3a] transition-all duration-200 hover:bg-[#c41e3a] hover:text-white active:scale-95">
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
                  <span className="bg-gradient-to-r from-[#c41e3a] to-[#e63950] bg-clip-text text-transparent">Reser</span>
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
