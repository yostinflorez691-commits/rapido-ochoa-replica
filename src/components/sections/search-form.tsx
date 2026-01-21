"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  ArrowRightLeft,
  Search,
  Loader2,
  AlertCircle,
  X,
  MapPin,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchFormProps {
  className?: string;
}

// Interface matching the real API response
interface ApiTerminal {
  id: number;
  display: string;
  ascii_display: string;
  city_name: string;
  city_ascii_name: string;
  slug: string;
  city_slug: string;
  state: string;
  country: string;
  popularity: string;
  result_type: string;
  lat: number | null;
  long: number | null;
  tags: string[];
  tenant_id: number;
  meta: Record<string, unknown>;
}

// Simplified terminal for internal use
interface Terminal {
  id: string;
  slug: string;
  city: string;
  department: string;
  terminal: string;
  displayName: string;
}

// Convert API terminal to internal format
const apiToTerminal = (apiTerminal: ApiTerminal): Terminal => ({
  id: String(apiTerminal.id),
  slug: apiTerminal.slug,
  city: apiTerminal.city_name,
  department: apiTerminal.state,
  terminal: apiTerminal.display,
  displayName: apiTerminal.display,
});

// Format date for URL (DD-MMM-YY format, e.g., "21-Ene-26")
const formatDateForUrl = (date: Date): string => {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const day = String(date.getDate()).padStart(2, '0');
  const month = months[date.getMonth()];
  const year = String(date.getFullYear()).slice(-2);
  return `${day}-${month}-${year}`;
};

export function SearchForm({ className }: SearchFormProps) {
  const router = useRouter();
  const [originSearch, setOriginSearch] = useState("");
  const [destinationSearch, setDestinationSearch] = useState("");
  const [selectedOrigin, setSelectedOrigin] = useState<Terminal | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Terminal | null>(null);
  const [dateOption, setDateOption] = useState<"hoy" | "manana" | "elegir">("hoy");
  const [customDate, setCustomDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [showOriginModal, setShowOriginModal] = useState(false);
  const [showDestinationModal, setShowDestinationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ origin?: string; destination?: string }>({});
  const [originIndex, setOriginIndex] = useState(-1);
  const [destinationIndex, setDestinationIndex] = useState(-1);

  // API data state
  const [allTerminals, setAllTerminals] = useState<Terminal[]>([]);
  const [destinationTerminals, setDestinationTerminals] = useState<Terminal[]>([]);
  const [isLoadingTerminals, setIsLoadingTerminals] = useState(true);
  const [isLoadingDestinations, setIsLoadingDestinations] = useState(false);

  const originRef = useRef<HTMLDivElement>(null);
  const destinationRef = useRef<HTMLDivElement>(null);
  const originInputRef = useRef<HTMLInputElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);
  const modalOriginInputRef = useRef<HTMLInputElement>(null);
  const modalDestinationInputRef = useRef<HTMLInputElement>(null);

  // Fetch all terminals on mount
  useEffect(() => {
    const fetchTerminals = async () => {
      try {
        setIsLoadingTerminals(true);
        const response = await fetch("/api/places");
        if (response.ok) {
          const data: ApiTerminal[] = await response.json();
          setAllTerminals(data.map(apiToTerminal));
        }
      } catch (error) {
        console.error("Error fetching terminals:", error);
      } finally {
        setIsLoadingTerminals(false);
      }
    };
    fetchTerminals();
  }, []);

  // Fetch destinations when origin changes
  useEffect(() => {
    const fetchDestinations = async () => {
      if (!selectedOrigin) {
        setDestinationTerminals([]);
        return;
      }

      try {
        setIsLoadingDestinations(true);
        const response = await fetch(`/api/places?from=${encodeURIComponent(selectedOrigin.slug)}`);
        if (response.ok) {
          const data: ApiTerminal[] = await response.json();
          setDestinationTerminals(data.map(apiToTerminal));
        }
      } catch (error) {
        console.error("Error fetching destinations:", error);
      } finally {
        setIsLoadingDestinations(false);
      }
    };
    fetchDestinations();
  }, [selectedOrigin]);

  // Filter terminals based on input - mostrar más ciudades (15)
  const filteredOriginTerminals = allTerminals.filter(terminal =>
    terminal.displayName.toLowerCase().includes(originSearch.toLowerCase()) ||
    terminal.city.toLowerCase().includes(originSearch.toLowerCase()) ||
    terminal.department.toLowerCase().includes(originSearch.toLowerCase())
  ).slice(0, 15);

  // For destinations, use the API-filtered list or fallback to all terminals
  const availableDestinations = selectedOrigin ? destinationTerminals : allTerminals;
  const filteredDestinationTerminals = availableDestinations.filter(terminal =>
    terminal.displayName.toLowerCase().includes(destinationSearch.toLowerCase()) ||
    terminal.city.toLowerCase().includes(destinationSearch.toLowerCase()) ||
    terminal.department.toLowerCase().includes(destinationSearch.toLowerCase())
  ).slice(0, 15);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (originRef.current && !originRef.current.contains(event.target as Node)) {
        setShowOriginDropdown(false);
        setOriginIndex(-1);
      }
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
        setShowDestinationDropdown(false);
        setDestinationIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSwapCities = () => {
    const tempOrigin = selectedOrigin;
    const tempOriginSearch = originSearch;
    setSelectedOrigin(selectedDestination);
    setOriginSearch(destinationSearch);
    setSelectedDestination(tempOrigin);
    setDestinationSearch(tempOriginSearch);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: { origin?: string; destination?: string } = {};

    if (!selectedOrigin) {
      newErrors.origin = "Selecciona un origen";
    }

    if (!selectedDestination) {
      newErrors.destination = "Selecciona un destino";
    }

    if (selectedOrigin && selectedDestination && selectedOrigin.id === selectedDestination.id) {
      newErrors.destination = "El destino debe ser diferente al origen";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    // Calculate the search date
    let searchDate: Date;
    const today = new Date();

    if (dateOption === "hoy") {
      searchDate = today;
    } else if (dateOption === "manana") {
      searchDate = new Date(today);
      searchDate.setDate(searchDate.getDate() + 1);
    } else {
      searchDate = customDate || today;
    }

    // Format date for URL (DD-MMM-YY)
    const formattedDate = formatDateForUrl(searchDate);

    // Build the search URL with the same format as the original site
    // /search/{origin-slug}/{destination-slug}/{date}/p/A1/departures
    const searchUrl = `/search/${selectedOrigin!.slug}/${selectedDestination!.slug}/${formattedDate}/p/A1/departures`;

    // Redirect to search results page
    router.push(searchUrl);
  };

  const selectOrigin = (terminal: Terminal) => {
    setSelectedOrigin(terminal);
    setOriginSearch(terminal.displayName);
    setShowOriginDropdown(false);
    setShowOriginModal(false);
    setOriginIndex(-1);
    setErrors(prev => ({ ...prev, origin: undefined }));
    // Clear destination when origin changes (destinations depend on origin)
    setSelectedDestination(null);
    setDestinationSearch("");
    destinationInputRef.current?.focus();
  };

  const selectDestination = (terminal: Terminal) => {
    setSelectedDestination(terminal);
    setDestinationSearch(terminal.displayName);
    setShowDestinationDropdown(false);
    setShowDestinationModal(false);
    setDestinationIndex(-1);
    setErrors(prev => ({ ...prev, destination: undefined }));
  };

  const clearOrigin = () => {
    setSelectedOrigin(null);
    setOriginSearch("");
    setErrors(prev => ({ ...prev, origin: undefined }));
  };

  const clearDestination = () => {
    setSelectedDestination(null);
    setDestinationSearch("");
    setErrors(prev => ({ ...prev, destination: undefined }));
  };

  // Keyboard navigation for origin dropdown
  const handleOriginKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showOriginDropdown && !showOriginModal) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setOriginIndex(prev =>
          prev < filteredOriginTerminals.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setOriginIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (originIndex >= 0 && filteredOriginTerminals[originIndex]) {
          selectOrigin(filteredOriginTerminals[originIndex]);
        }
        break;
      case "Escape":
        setShowOriginDropdown(false);
        setShowOriginModal(false);
        setOriginIndex(-1);
        break;
    }
  }, [showOriginDropdown, showOriginModal, originIndex, filteredOriginTerminals]);

  // Keyboard navigation for destination dropdown
  const handleDestinationKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showDestinationDropdown && !showDestinationModal) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setDestinationIndex(prev =>
          prev < filteredDestinationTerminals.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setDestinationIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (destinationIndex >= 0 && filteredDestinationTerminals[destinationIndex]) {
          selectDestination(filteredDestinationTerminals[destinationIndex]);
        }
        break;
      case "Escape":
        setShowDestinationDropdown(false);
        setShowDestinationModal(false);
        setDestinationIndex(-1);
        break;
    }
  }, [showDestinationDropdown, showDestinationModal, destinationIndex, filteredDestinationTerminals]);

  // Focus modal input when opened
  useEffect(() => {
    if (showOriginModal && modalOriginInputRef.current) {
      modalOriginInputRef.current.focus();
    }
  }, [showOriginModal]);

  useEffect(() => {
    if (showDestinationModal && modalDestinationInputRef.current) {
      modalDestinationInputRef.current.focus();
    }
  }, [showDestinationModal]);

  return (
    <section
      className={cn(
        "min-h-screen bg-[#f5f5f5] py-4 sm:py-6 md:py-8 lg:py-10",
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Title - Responsivo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-3 text-center sm:mb-4 md:mb-5 lg:mb-6"
        >
          <h1 className="text-[16px] font-bold leading-tight text-[#B42121] sm:text-[18px] md:text-[20px] lg:text-[22px]">
            Consulta de horarios y compra de tiquetes
          </h1>
        </motion.div>

        {/* Search Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="mx-auto w-full max-w-[1150px]"
        >
          {/* Mobile Layout */}
          <div className="flex flex-col gap-2 sm:gap-3 md:hidden">
            {/* Origin & Destination Card - Mobile */}
            <div className="relative rounded-[16px] bg-white p-3 shadow-[0_0_30px_rgba(0,0,0,0.15)] sm:rounded-[20px] sm:p-4">
              {/* Origin Row */}
              <div className="flex items-center pr-12 sm:pr-14">
                <div className="flex-1">
                  <label className="mb-1 block text-[13px] font-semibold text-[#232323] sm:text-[14px]">
                    Origen
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowOriginModal(true)}
                    className="flex w-full items-center text-left"
                  >
                    {/* Pin sólido verde para origen */}
                    <svg width="15" height="16" viewBox="0 0 15 16" fill="none" className="h-[14px] w-[14px] flex-shrink-0 sm:h-[15px] sm:w-[15px]">
                      <path d="M7.2675,14.19975 C7.21275,14.133 5.625,12.29025 4.28475,10.26975 C2.70825,7.88475 1.875,5.9415 1.875,4.6875 C1.875,1.58025 4.393,0 7.5,0 C10.607,0 13.125,1.58025 13.125,4.6875 C13.125,5.9415 12.29175,7.88475 10.71525,10.26975 C9.375,12.29025 7.78725,14.133 7.7325,14.19975 C7.67025,14.27175 7.5855,14.3125 7.5,14.3125 C7.4145,14.3125 7.32975,14.27175 7.2675,14.19975 Z M7.5,6.875 C8.70825,6.875 9.6875,5.89575 9.6875,4.6875 C9.6875,3.47925 8.70825,2.5 7.5,2.5 C6.29175,2.5 5.3125,3.47925 5.3125,4.6875 C5.3125,5.89575 6.29175,6.875 7.5,6.875 Z" fill="#4a9c4e"/>
                    </svg>
                    <span className={cn(
                      "flex-1 pl-2 text-[14px] sm:text-[16px]",
                      selectedOrigin ? "text-[#232323]" : "text-[#999]"
                    )}>
                      {selectedOrigin ? selectedOrigin.city : "Buscar Origen"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Swap Button con líneas punteadas verdes */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center sm:right-4">
                {/* Línea punteada superior */}
                <div
                  className="h-[16px] w-[2px] sm:h-[20px]"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(to bottom, #1F8641 0px, #1F8641 4px, transparent 4px, transparent 8px)'
                  }}
                />

                {/* Botón de intercambio */}
                <button
                  type="button"
                  onClick={handleSwapCities}
                  className="my-1.5 flex h-[36px] w-[36px] items-center justify-center rounded-[8px] border border-[#1F8641] bg-white p-[8px] transition-colors hover:bg-gray-50 sm:my-2 sm:h-[42px] sm:w-[42px] sm:rounded-[10px] sm:p-[10px]"
                  aria-label="Intercambiar ciudades"
                >
                  <svg className="h-[18px] w-[18px] rotate-90 sm:h-[21px] sm:w-[21px]" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.75,11.0833 L9.75,8.0833 C9.6667,8 9.6078,7.9097 9.5733,7.8125 C9.5389,7.7153 9.5214,7.6111 9.5208,7.5 C9.5208,7.3889 9.5386,7.2847 9.5742,7.1875 C9.6097,7.0903 9.6681,7 9.75,6.9167 L12.75,3.9167 C12.9167,3.75 13.1181,3.6667 13.3542,3.6667 C13.5903,3.6667 13.7917,3.75 13.9583,3.9167 C14.125,4.0833 14.2083,4.2847 14.2083,4.5208 C14.2083,4.7569 14.125,4.9583 13.9583,5.125 L12.5833,6.5 L16.6667,6.5 C16.9028,6.5 17.1008,6.58 17.2608,6.74 C17.4208,6.9 17.5006,7.0978 17.5,7.3333 C17.5,7.5694 17.42,7.7675 17.26,7.9275 C17.1,8.0875 16.9022,8.1672 16.6667,8.1667 L12.5833,8.1667 L13.9583,9.5417 C14.125,9.7083 14.2083,9.9097 14.2083,10.1458 C14.2083,10.3819 14.125,10.5833 13.9583,10.75 C13.7917,10.9167 13.5903,11 13.3542,11 C13.1181,11 12.9167,10.9167 12.75,10.75" fill="#1F8641"/>
                    <path d="M7.25,16.0833 L10.25,13.0833 C10.3333,13 10.3922,12.9097 10.4267,12.8125 C10.4611,12.7153 10.4786,12.6111 10.4792,12.5 C10.4792,12.3889 10.4614,12.2847 10.4258,12.1875 C10.3903,12.0903 10.3319,12 10.25,11.9167 L7.25,8.9167 C7.0833,8.75 6.8819,8.6667 6.6458,8.6667 C6.4097,8.6667 6.2083,8.75 6.0417,8.9167 C5.875,9.0833 5.7917,9.2847 5.7917,9.5208 C5.7917,9.7569 5.875,9.9583 6.0417,10.125 L7.4167,11.5 L3.3333,11.5 C3.0972,11.5 2.8992,11.58 2.7392,11.74 C2.5792,11.9 2.4994,12.0978 2.5,12.3333 C2.5,12.5694 2.58,12.7675 2.74,12.9275 C2.9,13.0875 3.0978,13.1672 3.3333,13.1667 L7.4167,13.1667 L6.0417,14.5417 C5.875,14.7083 5.7917,14.9097 5.7917,15.1458 C5.7917,15.3819 5.875,15.5833 6.0417,15.75 C6.2083,15.9167 6.4097,16 6.6458,16 C6.8819,16 7.0833,15.9167 7.25,15.75" fill="#1F8641"/>
                  </svg>
                </button>

                {/* Línea punteada inferior */}
                <div
                  className="h-[16px] w-[2px] sm:h-[20px]"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(to bottom, #1F8641 0px, #1F8641 4px, transparent 4px, transparent 8px)'
                  }}
                />
              </div>

              {/* Línea divisoria */}
              <div className="my-2.5 h-[1px] w-full bg-[#e6e6e6] sm:my-3" />

              {/* Destination Row */}
              <div className="flex items-center pr-12 sm:pr-14">
                <div className="flex-1">
                  <label className="mb-1 block text-[13px] font-semibold text-[#232323] sm:text-[14px]">
                    Destino
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowDestinationModal(true)}
                    className="flex w-full items-center text-left"
                  >
                    {/* Pin outline gris para destino */}
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="h-[14px] w-[14px] flex-shrink-0 sm:h-[15px] sm:w-[15px]">
                      <path d="M7.5,14.0625 C7.4145,14.0625 7.3305,14.023 7.26825,13.9515 C7.17075,13.8375 4.6875,10.9425 3.47025,8.68725 C2.60925,7.09125 2.1875,5.74575 2.1875,4.6875 C2.1875,2.10225 4.56775,0.3125 7.5,0.3125 C10.43225,0.3125 12.8125,2.10225 12.8125,4.6875 C12.8125,5.74575 12.39075,7.09125 11.52975,8.68725 C10.3125,10.9425 7.82925,13.8375 7.73175,13.9515 C7.6695,14.023 7.5855,14.0625 7.5,14.0625 Z M7.5,0.9375 C4.89925,0.9375 2.8125,2.44725 2.8125,4.6875 C2.8125,6.76575 4.6875,10.50375 7.5,13.29 C10.3125,10.50375 12.1875,6.76575 12.1875,4.6875 C12.1875,2.44725 10.10075,0.9375 7.5,0.9375 Z M7.5,7.1875 C6.12075,7.1875 5,6.06675 5,4.6875 C5,3.30825 6.12075,2.1875 7.5,2.1875 C8.87925,2.1875 10,3.30825 10,4.6875 C10,6.06675 8.87925,7.1875 7.5,7.1875 Z M7.5,2.8125 C6.46575,2.8125 5.625,3.65325 5.625,4.6875 C5.625,5.72175 6.46575,6.5625 7.5,6.5625 C8.53425,6.5625 9.375,5.72175 9.375,4.6875 C9.375,3.65325 8.53425,2.8125 7.5,2.8125 Z" fill="#999999" stroke="#999999" strokeWidth="0.5"/>
                    </svg>
                    <span className={cn(
                      "flex-1 pl-2 text-[14px] sm:text-[16px]",
                      selectedDestination ? "text-[#232323]" : "text-[#999]"
                    )}>
                      {selectedDestination ? selectedDestination.city : "Buscar Destino"}
                    </span>
                  </button>
                </div>
              </div>

              {errors.origin && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="h-3 w-3" />
                  {errors.origin}
                </p>
              )}
              {errors.destination && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="h-3 w-3" />
                  {errors.destination}
                </p>
              )}
            </div>

            {/* Origin Modal - Mobile */}
            <AnimatePresence>
              {showOriginModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[300] bg-white"
                >
                  <div className="flex h-full flex-col">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between border-b border-[#eee] px-4 py-4">
                      <h2 className="text-[18px] font-medium text-[#333]">Elige tu origen</h2>
                      <button
                        type="button"
                        onClick={() => {
                          setShowOriginModal(false);
                          setOriginSearch(selectedOrigin?.displayName || "");
                        }}
                        className="flex h-8 w-8 items-center justify-center text-[#666]"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Search Input */}
                    <div className="border-b border-[#eee] px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] text-[#666]">Origen</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <MapPin className="h-4 w-4 flex-shrink-0 fill-[#4a9c4e] text-[#4a9c4e]" />
                        <input
                          ref={modalOriginInputRef}
                          type="text"
                          placeholder="Buscar Origen"
                          value={originSearch}
                          onChange={(e) => setOriginSearch(e.target.value)}
                          onKeyDown={handleOriginKeyDown}
                          className="flex-1 border-0 bg-transparent text-[14px] text-[#333] placeholder:text-[#999] focus:outline-none"
                        />
                        {originSearch && (
                          <button
                            type="button"
                            onClick={() => setOriginSearch("")}
                            className="text-[#999]"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                        <button type="button" className="text-[#4a9c4e]">
                          <Search className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Results */}
                    <ul className="flex-1 overflow-auto">
                      {filteredOriginTerminals.map((terminal, index) => (
                        <li
                          key={terminal.id}
                          onClick={() => selectOrigin(terminal)}
                          className={cn(
                            "flex w-full cursor-pointer items-start gap-3 border-b border-[#f0f0f0] px-4 py-3 text-left transition-colors",
                            index === 0
                              ? "border-l-[3px] border-l-[#2e7d32] bg-[#f8f8f8]"
                              : "border-l-[3px] border-l-transparent hover:bg-[#f5f5f5]"
                          )}
                        >
                          {/* Ícono de pin de ubicación verde */}
                          <svg
                            className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#2e7d32]"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                          </svg>

                          {/* Contenido del destino en 3 líneas */}
                          <div className="flex flex-col">
                            <span className="text-[15px] font-semibold text-[#333]">
                              {terminal.city},
                            </span>
                            <span className="text-[13px] text-[#666]">
                              {terminal.department}
                            </span>
                            <span className="text-[13px] text-[#666]">
                              {terminal.terminal}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Destination Modal - Mobile */}
            <AnimatePresence>
              {showDestinationModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[300] bg-white"
                >
                  <div className="flex h-full flex-col">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between border-b border-[#eee] px-4 py-4">
                      <h2 className="text-[18px] font-medium text-[#333]">Elige tu destino</h2>
                      <button
                        type="button"
                        onClick={() => {
                          setShowDestinationModal(false);
                          setDestinationSearch(selectedDestination?.displayName || "");
                        }}
                        className="flex h-8 w-8 items-center justify-center text-[#666]"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Search Input */}
                    <div className="border-b border-[#eee] px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] text-[#666]">Destino</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <MapPin className="h-4 w-4 flex-shrink-0 text-[#9ca3af]" />
                        <input
                          ref={modalDestinationInputRef}
                          type="text"
                          placeholder="Buscar Destino"
                          value={destinationSearch}
                          onChange={(e) => setDestinationSearch(e.target.value)}
                          onKeyDown={handleDestinationKeyDown}
                          className="flex-1 border-0 bg-transparent text-[14px] text-[#333] placeholder:text-[#999] focus:outline-none"
                        />
                        {destinationSearch && (
                          <button
                            type="button"
                            onClick={() => setDestinationSearch("")}
                            className="text-[#999]"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                        <button type="button" className="text-[#4a9c4e]">
                          <Search className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Results */}
                    <ul className="flex-1 overflow-auto">
                      {filteredDestinationTerminals.map((terminal, index) => (
                        <li
                          key={terminal.id}
                          onClick={() => selectDestination(terminal)}
                          className={cn(
                            "flex w-full cursor-pointer items-start gap-3 border-b border-[#f0f0f0] px-4 py-3 text-left transition-colors",
                            index === 0
                              ? "border-l-[3px] border-l-[#2e7d32] bg-[#f8f8f8]"
                              : "border-l-[3px] border-l-transparent hover:bg-[#f5f5f5]"
                          )}
                        >
                          {/* Ícono de pin de ubicación verde */}
                          <svg
                            className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#2e7d32]"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                          </svg>

                          {/* Contenido del destino en 3 líneas */}
                          <div className="flex flex-col">
                            <span className="text-[15px] font-semibold text-[#333]">
                              {terminal.city},
                            </span>
                            <span className="text-[13px] text-[#666]">
                              {terminal.department}
                            </span>
                            <span className="text-[13px] text-[#666]">
                              {terminal.terminal}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Date Options - Mobile */}
            <div className="rounded-[16px] bg-white p-3 shadow-[0_0_30px_rgba(0,0,0,0.15)] sm:rounded-[20px] sm:p-4">
              <span className="mb-2 block text-[13px] font-semibold text-[#232323] sm:text-[14px]">¿Cuándo viajas?</span>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => { setDateOption("hoy"); setShowCalendar(false); }}
                  className={cn(
                    "h-7 rounded-full bg-transparent px-2 py-1 text-[14px] font-semibold text-[#232323] transition-colors sm:h-8 sm:px-3 sm:text-[16px]",
                    dateOption === "hoy"
                      ? "border-2 border-[#232323]"
                      : "border border-[#C7C7C7] hover:border-[#232323]"
                  )}
                >
                  Hoy
                </button>
                <button
                  type="button"
                  onClick={() => { setDateOption("manana"); setShowCalendar(false); }}
                  className={cn(
                    "h-7 rounded-full bg-transparent px-2 py-1 text-[14px] font-semibold text-[#232323] transition-colors sm:h-8 sm:px-3 sm:text-[16px]",
                    dateOption === "manana"
                      ? "border-2 border-[#232323]"
                      : "border border-[#C7C7C7] hover:border-[#232323]"
                  )}
                >
                  Mañana
                </button>
                <button
                  type="button"
                  onClick={() => { setDateOption("elegir"); setShowCalendar(true); }}
                  className={cn(
                    "flex h-7 items-center gap-1 rounded-full bg-transparent px-2 py-1 text-[14px] font-semibold text-[#232323] transition-colors sm:h-8 sm:px-3 sm:text-[16px]",
                    dateOption === "elegir"
                      ? "border-2 border-[#232323]"
                      : "border border-[#C7C7C7] hover:border-[#232323]"
                  )}
                >
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <rect x="1.5" y="2.5" width="12" height="10" rx="1" stroke="#232323" strokeWidth="1.2"/>
                    <path d="M4.5 1V3.5" stroke="#232323" strokeWidth="1.2" strokeLinecap="round"/>
                    <path d="M10.5 1V3.5" stroke="#232323" strokeWidth="1.2" strokeLinecap="round"/>
                    <path d="M1.5 5.5H13.5" stroke="#232323" strokeWidth="1.2"/>
                  </svg>
                  <span>{customDate ? customDate.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }) : 'Elegir'}</span>
                </button>
              </div>
            </div>

            {/* Calendar picker when "Elegir" is selected - Mobile */}
            <AnimatePresence>
              {dateOption === "elegir" && showCalendar && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex justify-center"
                >
                  <Calendar
                    selectedDate={customDate}
                    onDateSelect={(date) => {
                      setCustomDate(date);
                      setShowCalendar(false);
                    }}
                    className="w-full max-w-full"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Regreso - Mobile */}
            <div className="rounded-[16px] bg-white p-3 shadow-[0_0_30px_rgba(0,0,0,0.15)] sm:rounded-[20px] sm:p-4">
              <span className="mb-2 block text-[13px] font-semibold text-[#232323] sm:text-[14px]">Regreso</span>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-lg border border-[#e6e6e6] bg-white px-3 py-2.5 text-[13px] text-[#999] transition-colors hover:border-[#c7c7c7] sm:px-4 sm:py-3 sm:text-[14px]"
              >
                <span>Opcional</span>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="text-[#999]">
                  <path d="M11.875 1.875H3.125C2.43464 1.875 1.875 2.43464 1.875 3.125V11.875C1.875 12.5654 2.43464 13.125 3.125 13.125H11.875C12.5654 13.125 13.125 12.5654 13.125 11.875V3.125C13.125 2.43464 12.5654 1.875 11.875 1.875Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 0.625V3.125" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5 0.625V3.125" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M1.875 5.625H13.125" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Search Button - Mobile */}
            <Button
              variant="success"
              type="submit"
              disabled={isLoading}
              aria-label="Buscar"
              className="h-[44px] w-full rounded-[16px] text-[16px] font-bold sm:h-[50px] sm:rounded-[20px] sm:text-[18px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin sm:h-5 sm:w-5" />
                  <span>Buscando...</span>
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="M21 21l-4.35-4.35"/>
                  </svg>
                  <span>Buscar</span>
                </>
              )}
            </Button>
          </div>

          {/* Desktop Layout - Single unified card */}
          <div className="hidden md:flex md:flex-col md:gap-3 lg:flex-row lg:items-center">
            {/* Unified Search Card with swap button */}
            <div className="relative flex flex-1 items-center rounded-[8px] border border-[#e0e0e0] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              {/* Origin */}
              <div className="relative flex-1 py-1 pl-5" ref={originRef}>
                <div className="relative flex items-center">
                  {/* Green location marker for origin - small diamond/pin like original */}
                  <svg className="absolute left-0 h-4 w-4" viewBox="0 0 16 16" fill="none">
                    <path d="M8 1C5.24 1 3 3.24 3 6c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5z" fill="#4a9c4e"/>
                    <circle cx="8" cy="6" r="2" fill="white"/>
                  </svg>
                  <input
                    ref={originInputRef}
                    type="text"
                    placeholder="Buscar Origen"
                    value={originSearch}
                    onChange={(e) => {
                      setOriginSearch(e.target.value);
                      setSelectedOrigin(null);
                      setShowOriginDropdown(true);
                      setErrors(prev => ({ ...prev, origin: undefined }));
                    }}
                    onFocus={() => setShowOriginDropdown(true)}
                    onKeyDown={handleOriginKeyDown}
                    className={cn(
                      "h-[50px] w-full border-0 bg-transparent pl-6 pr-12 text-[16px] text-[#333] placeholder:text-[#999] transition-all focus:outline-none focus:placeholder:text-[#666]",
                      errors.origin && "text-red-500 placeholder:text-red-300"
                    )}
                  />
                  {/* X button to clear */}
                  {originSearch && (
                    <button
                      type="button"
                      onClick={clearOrigin}
                      className="absolute right-2 text-[#999] hover:text-[#666]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {errors.origin && (
                  <p className="absolute -bottom-5 left-4 flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle className="h-3 w-3" />
                    {errors.origin}
                  </p>
                )}

                {/* Origin Dropdown */}
                <AnimatePresence>
                  {showOriginDropdown && (isLoadingTerminals || filteredOriginTerminals.length > 0) && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute left-0 top-full z-50 mt-1 w-[500px] overflow-hidden rounded-[20px] border border-white bg-white shadow-[0_0_30px_rgba(0,0,0,0.15)]"
                    >
                      <div className="max-h-[300px] overflow-y-auto">
                        {isLoadingTerminals ? (
                          <div className="flex items-center justify-center gap-2 px-4 py-4 text-[14px] text-[#686868]">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Cargando ciudades...</span>
                          </div>
                        ) : (
                          <ul>
                            {filteredOriginTerminals.map((terminal, index) => (
                              <li
                                key={terminal.id}
                                onClick={() => selectOrigin(terminal)}
                                className={cn(
                                  "flex w-full cursor-pointer items-start gap-3 border-b border-[#f0f0f0] px-4 py-3 text-left transition-colors hover:bg-[#f5f5f5]",
                                  index === originIndex && "bg-[#f0f0f0]",
                                  index === 0
                                    ? "border-l-[3px] border-l-[#2e7d32] bg-[#f8f8f8]"
                                    : "border-l-[3px] border-l-transparent"
                                )}
                              >
                                {/* Ícono de pin de ubicación verde */}
                                <svg
                                  className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#2e7d32]"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                </svg>

                                {/* Contenido en 3 líneas */}
                                <div className="flex flex-col">
                                  <span className="text-[15px] font-semibold text-[#333]">
                                    {terminal.city},
                                  </span>
                                  <span className="text-[13px] text-[#666]">
                                    {terminal.department}
                                  </span>
                                  <span className="text-[13px] text-[#666]">
                                    {terminal.terminal}
                                  </span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Swap Button - Centered between origin and destination */}
              <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                {/* Línea punteada superior */}
                <div
                  className="h-[20px] w-[2px]"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(to bottom, #1F8641 0px, #1F8641 4px, transparent 4px, transparent 8px)'
                  }}
                />

                {/* Swap button */}
                <button
                  type="button"
                  onClick={handleSwapCities}
                  className="my-1 flex h-[42px] w-[42px] items-center justify-center rounded-[10px] border border-[#1F8641] bg-white p-[10px] transition-colors hover:bg-gray-50"
                  aria-label="Intercambiar ciudades"
                >
                  <svg width="21" height="21" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="rotate-90">
                    <path d="M12.75,11.0833 L9.75,8.0833 C9.6667,8 9.6078,7.9097 9.5733,7.8125 C9.5389,7.7153 9.5214,7.6111 9.5208,7.5 C9.5208,7.3889 9.5386,7.2847 9.5742,7.1875 C9.6097,7.0903 9.6681,7 9.75,6.9167 L12.75,3.9167 C12.9167,3.75 13.1181,3.6667 13.3542,3.6667 C13.5903,3.6667 13.7917,3.75 13.9583,3.9167 C14.125,4.0833 14.2083,4.2847 14.2083,4.5208 C14.2083,4.7569 14.125,4.9583 13.9583,5.125 L12.5833,6.5 L16.6667,6.5 C16.9028,6.5 17.1008,6.58 17.2608,6.74 C17.4208,6.9 17.5006,7.0978 17.5,7.3333 C17.5,7.5694 17.42,7.7675 17.26,7.9275 C17.1,8.0875 16.9022,8.1672 16.6667,8.1667 L12.5833,8.1667 L13.9583,9.5417 C14.125,9.7083 14.2083,9.9097 14.2083,10.1458 C14.2083,10.3819 14.125,10.5833 13.9583,10.75 C13.7917,10.9167 13.5903,11 13.3542,11 C13.1181,11 12.9167,10.9167 12.75,10.75" fill="#1F8641"/>
                    <path d="M7.25,16.0833 L10.25,13.0833 C10.3333,13 10.3922,12.9097 10.4267,12.8125 C10.4611,12.7153 10.4786,12.6111 10.4792,12.5 C10.4792,12.3889 10.4614,12.2847 10.4258,12.1875 C10.3903,12.0903 10.3319,12 10.25,11.9167 L7.25,8.9167 C7.0833,8.75 6.8819,8.6667 6.6458,8.6667 C6.4097,8.6667 6.2083,8.75 6.0417,8.9167 C5.875,9.0833 5.7917,9.2847 5.7917,9.5208 C5.7917,9.7569 5.875,9.9583 6.0417,10.125 L7.4167,11.5 L3.3333,11.5 C3.0972,11.5 2.8992,11.58 2.7392,11.74 C2.5792,11.9 2.4994,12.0978 2.5,12.3333 C2.5,12.5694 2.58,12.7675 2.74,12.9275 C2.9,13.0875 3.0978,13.1672 3.3333,13.1667 L7.4167,13.1667 L6.0417,14.5417 C5.875,14.7083 5.7917,14.9097 5.7917,15.1458 C5.7917,15.3819 5.875,15.5833 6.0417,15.75 C6.2083,15.9167 6.4097,16 6.6458,16 C6.8819,16 7.0833,15.9167 7.25,15.75" fill="#1F8641"/>
                  </svg>
                </button>

                {/* Línea punteada inferior */}
                <div
                  className="h-[20px] w-[2px]"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(to bottom, #1F8641 0px, #1F8641 4px, transparent 4px, transparent 8px)'
                  }}
                />
              </div>

              {/* Spacer for the swap button area */}
              <div className="w-[60px] flex-shrink-0"></div>

              {/* Destination */}
              <div className="relative flex-1 py-1 pr-4" ref={destinationRef}>
                <div className="relative flex items-center">
                  {/* Gray circle outline for destination - like original */}
                  <span className="absolute left-0 h-3 w-3 rounded-full border-2 border-[#9ca3af]" />
                  <input
                    ref={destinationInputRef}
                    type="text"
                    placeholder="Buscar Destino"
                    value={destinationSearch}
                    onChange={(e) => {
                      setDestinationSearch(e.target.value);
                      setSelectedDestination(null);
                      setShowDestinationDropdown(true);
                      setErrors(prev => ({ ...prev, destination: undefined }));
                    }}
                    onFocus={() => setShowDestinationDropdown(true)}
                    onKeyDown={handleDestinationKeyDown}
                    className={cn(
                      "h-[50px] w-full border-0 bg-transparent pl-6 pr-12 text-[16px] text-[#333] placeholder:text-[#999] transition-all focus:outline-none focus:placeholder:text-[#666]",
                      errors.destination && "text-red-500 placeholder:text-red-300"
                    )}
                  />
                  {/* X button to clear */}
                  {destinationSearch && (
                    <button
                      type="button"
                      onClick={clearDestination}
                      className="absolute right-2 text-[#999] hover:text-[#666]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {errors.destination && (
                  <p className="absolute -bottom-5 left-4 flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle className="h-3 w-3" />
                    {errors.destination}
                  </p>
                )}

                {/* Destination Dropdown */}
                <AnimatePresence>
                  {showDestinationDropdown && (isLoadingDestinations || filteredDestinationTerminals.length > 0) && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute left-0 top-full z-50 mt-1 w-[500px] overflow-hidden rounded-[20px] border border-white bg-white shadow-[0_0_30px_rgba(0,0,0,0.15)]"
                    >
                      <div className="max-h-[300px] overflow-y-auto">
                        {isLoadingDestinations ? (
                          <div className="flex items-center justify-center gap-2 px-4 py-4 text-[14px] text-[#686868]">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Cargando destinos...</span>
                          </div>
                        ) : (
                          <ul>
                            {filteredDestinationTerminals.map((terminal, index) => (
                              <li
                                key={terminal.id}
                                onClick={() => selectDestination(terminal)}
                                className={cn(
                                  "flex w-full cursor-pointer items-start gap-3 border-b border-[#f0f0f0] px-4 py-3 text-left transition-colors hover:bg-[#f5f5f5]",
                                  index === destinationIndex && "bg-[#f0f0f0]",
                                  index === 0
                                    ? "border-l-[3px] border-l-[#2e7d32] bg-[#f8f8f8]"
                                    : "border-l-[3px] border-l-transparent"
                                )}
                              >
                                {/* Ícono de pin de ubicación verde */}
                                <svg
                                  className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#2e7d32]"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                </svg>

                                {/* Contenido en 3 líneas */}
                                <div className="flex flex-col">
                                  <span className="text-[15px] font-semibold text-[#333]">
                                    {terminal.city},
                                  </span>
                                  <span className="text-[13px] text-[#666]">
                                    {terminal.department}
                                  </span>
                                  <span className="text-[13px] text-[#666]">
                                    {terminal.terminal}
                                  </span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

            {/* Date and Search wrapper for tablet layout */}
            <div className="flex w-full flex-row items-center gap-3 lg:w-auto lg:flex-shrink-0">
              {/* Date Options - Separate card like original */}
              <div className="relative flex flex-1 flex-col justify-center gap-1.5 rounded-[8px] border border-[#e0e0e0] bg-white px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.08)] lg:min-w-[260px] lg:flex-shrink-0">
                <span className="text-[13px] text-[#666]">¿Cuándo viajas?</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setDateOption("hoy"); setShowCalendar(false); }}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-[14px] transition-all",
                      dateOption === "hoy"
                        ? "border-[1.5px] border-[#333] bg-white font-semibold text-[#333]"
                        : "border border-[#555] bg-white text-[#333] hover:border-[#333]"
                    )}
                  >
                    Hoy
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDateOption("manana"); setShowCalendar(false); }}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-[14px] transition-all",
                      dateOption === "manana"
                        ? "border-[1.5px] border-[#333] bg-white font-semibold text-[#333]"
                        : "border border-[#555] bg-white text-[#333] hover:border-[#333]"
                    )}
                  >
                    Mañana
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDateOption("elegir"); setShowCalendar(!showCalendar); }}
                    className={cn(
                      "relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[14px] transition-all",
                      dateOption === "elegir"
                        ? "border-[1.5px] border-[#333] bg-white font-semibold text-[#333]"
                        : "border border-[#555] bg-white text-[#333] hover:border-[#333]"
                    )}
                  >
                    <CalendarIcon className="h-4 w-4" />
                    {customDate ? customDate.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }) : 'Elegir'}
                  </button>
                </div>

                {/* Calendar Dropdown - Desktop */}
                <AnimatePresence>
                  {dateOption === "elegir" && showCalendar && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full z-50 mt-2"
                    >
                      <Calendar
                        selectedDate={customDate}
                        onDateSelect={(date) => {
                          setCustomDate(date);
                          setShowCalendar(false);
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Search Button */}
              <Button
                variant="success"
                type="submit"
                disabled={isLoading}
                className="h-[50px] min-w-[120px] flex-shrink-0 rounded-[20px] px-4 text-[16px] font-bold lg:h-[55px] lg:min-w-[140px] lg:px-6 lg:text-[18px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Buscando...</span>
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="M21 21l-4.35-4.35"/>
                    </svg>
                    <span>Buscar</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.form>
      </div>
    </section>
  );
}

export default SearchForm;
