"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Tag, ChevronRight } from "lucide-react";

interface PromoBannerProps {
  className?: string;
}

export function PromoBanner({ className }: PromoBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className={className}
      >
        <div className="bg-gradient-to-r from-[#1b5e20] via-[#2e7d32] to-[#1b5e20] py-2.5 text-white">
          <div className="container mx-auto flex items-center justify-between px-4">
            <div className="flex flex-1 items-center justify-center gap-2 text-center text-sm md:gap-3">
              <Tag className="h-4 w-4 flex-shrink-0 animate-pulse" />
              <span className="font-medium">
                <span className="hidden md:inline">¡Oferta especial! </span>
                <span className="text-[#ffd26a]">20% de descuento</span>
                {" "}en tu primer viaje
              </span>
              <button className="ml-2 flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-medium transition-colors hover:bg-white/30">
                Ver más
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="ml-4 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Cerrar banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default PromoBanner;
