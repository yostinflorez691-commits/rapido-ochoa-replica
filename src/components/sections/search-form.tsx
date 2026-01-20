"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  ArrowRightLeft,
  Search,
  Loader2,
  AlertCircle,
  X,
  MapPin,
} from "lucide-react";
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
  const [customDate, setCustomDate] = useState("");
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

  // Filter terminals based on input
  const filteredOriginTerminals = allTerminals.filter(terminal =>
    terminal.displayName.toLowerCase().includes(originSearch.toLowerCase()) ||
    terminal.city.toLowerCase().includes(originSearch.toLowerCase())
  ).slice(0, 8);

  // For destinations, use the API-filtered list or fallback to all terminals
  const availableDestinations = selectedOrigin ? destinationTerminals : allTerminals;
  const filteredDestinationTerminals = availableDestinations.filter(terminal =>
    terminal.displayName.toLowerCase().includes(destinationSearch.toLowerCase()) ||
    terminal.city.toLowerCase().includes(destinationSearch.toLowerCase())
  ).slice(0, 8);

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
      searchDate = customDate ? new Date(customDate) : today;
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
        "bg-[#f5f5f5] py-6 md:py-10",
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-4 text-center md:mb-6"
        >
          <h1 className="text-[18px] font-bold text-[#b42121] md:text-[20px]">
            Consulta de horarios y compra de tiquetes
          </h1>
        </motion.div>

        {/* Search Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="mx-auto max-w-[1150px]"
        >
          {/* Mobile Layout */}
          <div className="flex flex-col gap-3 md:hidden">
            {/* Origin & Destination Card - Mobile */}
            <div className="relative rounded-[20px] bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.08)]">
              {/* Origin - Click to open modal */}
              <div className="relative">
                <label className="mb-1 block text-[12px] font-semibold text-[#333]">
                  Origen
                </label>
                <button
                  type="button"
                  onClick={() => setShowOriginModal(true)}
                  className="flex w-full items-center text-left"
                >
                  <MapPin className="h-4 w-4 flex-shrink-0 fill-[#4a9c4e] text-[#4a9c4e]" />
                  <span className={cn(
                    "h-[36px] flex-1 flex items-center pl-2 pr-8 text-[14px]",
                    selectedOrigin ? "text-[#333]" : "text-[#aaa]"
                  )}>
                    {selectedOrigin ? selectedOrigin.city : "Buscar Origen"}
                  </span>
                  {/* Three dots menu */}
                  <div className="flex flex-col gap-[2px] pr-2">
                    <span className="h-1 w-1 rounded-full bg-[#ccc]"></span>
                    <span className="h-1 w-1 rounded-full bg-[#ccc]"></span>
                    <span className="h-1 w-1 rounded-full bg-[#ccc]"></span>
                  </div>
                </button>
                {errors.origin && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle className="h-3 w-3" />
                    {errors.origin}
                  </p>
                )}
              </div>

              {/* Swap Button - Mobile */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <button
                  type="button"
                  onClick={handleSwapCities}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#ddd] bg-white text-[#4a9c4e] shadow-sm transition-all hover:bg-[#f5f5f5] active:scale-95"
                  aria-label="Intercambiar ciudades"
                >
                  <ArrowRightLeft className="h-4 w-4 rotate-90" />
                </button>
              </div>

              {/* Divider */}
              <div className="my-3 border-t border-[#eee]" />

              {/* Destination - Click to open modal */}
              <div className="relative">
                <label className="mb-1 block text-[12px] font-semibold text-[#333]">
                  Destino
                </label>
                <button
                  type="button"
                  onClick={() => setShowDestinationModal(true)}
                  className="flex w-full items-center text-left"
                >
                  <MapPin className="h-4 w-4 flex-shrink-0 text-[#9ca3af]" />
                  <span className={cn(
                    "h-[36px] flex-1 flex items-center pl-2 pr-8 text-[14px]",
                    selectedDestination ? "text-[#333]" : "text-[#aaa]"
                  )}>
                    {selectedDestination ? selectedDestination.city : "Buscar Destino"}
                  </span>
                  {/* Three dots menu */}
                  <div className="flex flex-col gap-[2px] pr-2">
                    <span className="h-1 w-1 rounded-full bg-[#ccc]"></span>
                    <span className="h-1 w-1 rounded-full bg-[#ccc]"></span>
                    <span className="h-1 w-1 rounded-full bg-[#ccc]"></span>
                  </div>
                </button>
                {errors.destination && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle className="h-3 w-3" />
                    {errors.destination}
                  </p>
                )}
              </div>
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
                    <div className="flex-1 overflow-auto">
                      {filteredOriginTerminals.map((terminal, index) => (
                        <button
                          key={terminal.id}
                          type="button"
                          onClick={() => selectOrigin(terminal)}
                          className={cn(
                            "flex w-full items-start gap-3 border-b border-[#f0f0f0] px-4 py-3.5 text-left transition-colors",
                            index === 0
                              ? "border-l-[3px] border-l-[#4a9c4e] bg-[#f8faf8]"
                              : "border-l-[3px] border-l-transparent hover:bg-[#f5f5f5]"
                          )}
                        >
                          <span className={cn(
                            "mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full border-2",
                            index === 0 ? "border-[#4a9c4e] bg-[#4a9c4e]" : "border-[#4a9c4e] bg-transparent"
                          )} />
                          <span className={cn(
                            "text-[14px]",
                            index === 0 ? "font-medium text-[#333]" : "text-[#666]"
                          )}>
                            {terminal.displayName}
                          </span>
                        </button>
                      ))}
                    </div>
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
                    <div className="flex-1 overflow-auto">
                      {filteredDestinationTerminals.map((terminal, index) => (
                        <button
                          key={terminal.id}
                          type="button"
                          onClick={() => selectDestination(terminal)}
                          className={cn(
                            "flex w-full items-start gap-3 border-b border-[#f0f0f0] px-4 py-3.5 text-left transition-colors",
                            index === 0
                              ? "border-l-[3px] border-l-[#888] bg-[#f8f8f8]"
                              : "border-l-[3px] border-l-transparent hover:bg-[#f5f5f5]"
                          )}
                        >
                          <span className={cn(
                            "mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full border-2",
                            index === 0 ? "border-[#888] bg-[#888]" : "border-[#999] bg-transparent"
                          )} />
                          <span className={cn(
                            "text-[14px]",
                            index === 0 ? "font-medium text-[#333]" : "text-[#666]"
                          )}>
                            {terminal.displayName}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Date Options - Mobile */}
            <div className="rounded-[20px] bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.08)]">
              <span className="mb-2 block text-[12px] text-[#888]">¿Cuándo viajas?</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDateOption("hoy")}
                  className={cn(
                    "rounded-full px-4 py-2 text-[13px] font-medium transition-all",
                    dateOption === "hoy"
                      ? "border border-[#333] bg-white font-semibold text-[#333]"
                      : "border border-[#ddd] bg-white text-[#666] hover:border-[#bbb]"
                  )}
                >
                  Hoy
                </button>
                <button
                  type="button"
                  onClick={() => setDateOption("manana")}
                  className={cn(
                    "rounded-full px-4 py-2 text-[13px] transition-all",
                    dateOption === "manana"
                      ? "border border-[#333] bg-white font-semibold text-[#333]"
                      : "border border-[#ddd] bg-white text-[#666] hover:border-[#bbb]"
                  )}
                >
                  Mañana
                </button>
                <button
                  type="button"
                  onClick={() => setDateOption("elegir")}
                  className={cn(
                    "relative flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] transition-all",
                    dateOption === "elegir"
                      ? "border border-[#333] bg-white font-semibold text-[#333]"
                      : "border border-[#ddd] bg-white text-[#666] hover:border-[#bbb]"
                  )}
                >
                  <Calendar className="h-4 w-4" />
                  Elegir
                  {/* Red badge indicator when "Elegir" selected but no date chosen */}
                  {dateOption === "elegir" && !customDate && (
                    <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#c41e3a]" />
                  )}
                </button>
              </div>
            </div>

            {/* Date picker when "Elegir" is selected - Mobile */}
            <AnimatePresence>
              {dateOption === "elegir" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="h-[44px] w-full rounded-lg border border-[#e0e0e0] bg-white px-4 text-[14px] focus:border-[#66ba5b] focus:outline-none"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Search Button - Mobile */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#4a9c4e] text-[15px] font-semibold text-white shadow-sm transition-all hover:bg-[#3d8b40] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Buscando...</span>
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  <span>Buscar</span>
                </>
              )}
            </button>
          </div>

          {/* Desktop Layout - Single unified card */}
          <div className="hidden md:flex md:flex-row md:items-center md:gap-3">
            {/* Unified Search Card */}
            <div className="flex flex-1 items-center rounded-[20px] border border-[#e8e8e8] bg-white shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
              {/* Origin */}
              <div className="relative flex-1 py-1 pl-5" ref={originRef}>
                <div className="relative flex items-center">
                  {/* Green MapPin for origin */}
                  <MapPin className="absolute left-0 h-4 w-4 fill-[#4a9c4e] text-[#4a9c4e]" />
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
                  {/* Three dots menu + X button */}
                  <div className="absolute right-2 flex items-center gap-2">
                    {originSearch && (
                      <button
                        type="button"
                        onClick={clearOrigin}
                        className="text-[#999] hover:text-[#666]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    <button type="button" className="flex flex-col gap-[3px] p-1 text-[#bbb] hover:text-[#999]">
                      <span className="h-[3px] w-[3px] rounded-full bg-current"></span>
                      <span className="h-[3px] w-[3px] rounded-full bg-current"></span>
                      <span className="h-[3px] w-[3px] rounded-full bg-current"></span>
                    </button>
                  </div>
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
                      className="absolute left-0 top-full z-50 mt-2 w-[420px] overflow-hidden rounded-[20px] bg-white shadow-[0_4px_25px_rgba(0,0,0,0.12)]"
                    >
                      {isLoadingTerminals ? (
                        <div className="flex items-center justify-center gap-2 px-5 py-4 text-[15px] text-[#888]">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Cargando ciudades...</span>
                        </div>
                      ) : (
                        filteredOriginTerminals.map((terminal, index) => (
                          <button
                            key={terminal.id}
                            type="button"
                            onClick={() => selectOrigin(terminal)}
                            className={cn(
                              "flex w-full items-center gap-3 px-5 py-4 text-left text-[15px] transition-colors hover:bg-[#f5f5f5]",
                              index === 0 ? "text-[#555]" : "text-[#888]"
                            )}
                          >
                            <span className="h-2 w-2 flex-shrink-0 rounded-full bg-[#4a9c4e]" />
                            <span>{terminal.displayName}</span>
                          </button>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Swap Button */}
              <button
                type="button"
                onClick={handleSwapCities}
                className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-[10px] border border-[#1f8641] bg-white text-[#1f8641] transition-all hover:bg-[#f8f8f8] active:scale-95"
                aria-label="Intercambiar ciudades"
              >
                <ArrowRightLeft className="h-4 w-4" />
              </button>

              {/* Destination */}
              <div className="relative flex-1 py-1 pr-4" ref={destinationRef}>
                <div className="relative flex items-center">
                  {/* Gray MapPin for destination */}
                  <MapPin className="absolute left-0 h-4 w-4 text-[#9ca3af]" />
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
                  {/* Three dots menu + X button */}
                  <div className="absolute right-2 flex items-center gap-2">
                    {destinationSearch && (
                      <button
                        type="button"
                        onClick={clearDestination}
                        className="text-[#999] hover:text-[#666]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    <button type="button" className="flex flex-col gap-[3px] p-1 text-[#bbb] hover:text-[#999]">
                      <span className="h-[3px] w-[3px] rounded-full bg-current"></span>
                      <span className="h-[3px] w-[3px] rounded-full bg-current"></span>
                      <span className="h-[3px] w-[3px] rounded-full bg-current"></span>
                    </button>
                  </div>
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
                      className="absolute left-0 top-full z-50 mt-2 w-[420px] overflow-hidden rounded-[20px] bg-white shadow-[0_4px_25px_rgba(0,0,0,0.12)]"
                    >
                      {isLoadingDestinations ? (
                        <div className="flex items-center justify-center gap-2 px-5 py-4 text-[15px] text-[#888]">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Cargando destinos...</span>
                        </div>
                      ) : (
                        filteredDestinationTerminals.map((terminal, index) => (
                          <button
                            key={terminal.id}
                            type="button"
                            onClick={() => selectDestination(terminal)}
                            className={cn(
                              "flex w-full items-center gap-3 px-5 py-4 text-left text-[15px] transition-colors hover:bg-[#f5f5f5]",
                              index === 0 ? "text-[#555]" : "text-[#888]"
                            )}
                          >
                            <span className="h-2 w-2 flex-shrink-0 rounded-full bg-[#4a9c4e]" />
                            <span>{terminal.displayName}</span>
                          </button>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

            {/* Date Options - Separate card like original */}
            <div className="flex min-w-[260px] flex-shrink-0 flex-col justify-center gap-1.5 rounded-[20px] border border-[#e8e8e8] bg-white px-5 py-3 shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
              <span className="text-[14px] font-medium text-[#444]">¿Cuándo viajas?</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDateOption("hoy")}
                  className={cn(
                    "rounded-full px-5 py-2 text-[14px] font-medium transition-all",
                    dateOption === "hoy"
                      ? "border-2 border-[#333] bg-white text-[#333]"
                      : "border border-[#ccc] bg-white text-[#666] hover:border-[#999]"
                  )}
                >
                  Hoy
                </button>
                <button
                  type="button"
                  onClick={() => setDateOption("manana")}
                  className={cn(
                    "rounded-full px-5 py-2 text-[14px] font-medium transition-all",
                    dateOption === "manana"
                      ? "border-2 border-[#333] bg-white text-[#333]"
                      : "border border-[#ccc] bg-white text-[#666] hover:border-[#999]"
                  )}
                >
                  Mañana
                </button>
                <button
                  type="button"
                  onClick={() => setDateOption("elegir")}
                  className={cn(
                    "relative flex items-center gap-1.5 rounded-full px-5 py-2 text-[14px] font-medium transition-all",
                    dateOption === "elegir"
                      ? "border-2 border-[#333] bg-white text-[#333]"
                      : "border border-[#ccc] bg-white text-[#666] hover:border-[#999]"
                  )}
                >
                  <Calendar className="h-4 w-4" />
                  Elegir
                  {/* Red badge indicator when "Elegir" selected but no date chosen */}
                  {dateOption === "elegir" && !customDate && (
                    <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#c41e3a]" />
                  )}
                </button>
              </div>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex h-[60px] min-w-[160px] items-center justify-center gap-2 rounded-[20px] bg-[#1f8641] px-5 text-[16px] font-bold text-white transition-all hover:bg-[#1a7339] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Buscando...</span>
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  <span>Buscar</span>
                </>
              )}
            </button>
          </div>

          {/* Date picker when "Elegir" is selected - Desktop */}
          <AnimatePresence>
            {dateOption === "elegir" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mx-auto mt-4 hidden max-w-md md:block"
              >
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="h-[45px] w-full rounded-lg border border-[#e0e0e0] bg-white px-4 text-[15px] focus:border-[#66ba5b] focus:outline-none focus:ring-2 focus:ring-[#66ba5b]/20"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.form>
      </div>
    </section>
  );
}

export default SearchForm;
