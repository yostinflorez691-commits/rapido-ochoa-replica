"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";

export function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);

  const phoneNumber = "573001234567"; // Replace with actual number
  const message = "Hola, necesito información sobre viajes";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="mb-4 w-72 rounded-2xl bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 rounded-t-2xl bg-[#25d366] p-4 text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">Rápido Ochoa</p>
                <p className="text-xs text-white/80">En línea</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="bg-[#e5ddd5] p-4">
              <div className="rounded-lg bg-white p-3 shadow-sm">
                <p className="text-sm text-[#333]">
                  ¡Hola! 👋 ¿En qué podemos ayudarte hoy?
                </p>
                <p className="mt-1 text-xs text-[#999]">Tiempo de respuesta: ~5 min</p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25d366] py-3 text-sm font-medium text-white transition-colors hover:bg-[#20bd5a]"
              >
                <MessageCircle className="h-5 w-5" />
                Iniciar conversación
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg transition-all hover:bg-[#20bd5a] hover:scale-110"
        whileTap={{ scale: 0.9 }}
        animate={isOpen ? { rotate: 0 } : { rotate: 0 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="whatsapp"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <MessageCircle className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Pulse animation */}
      {!isOpen && (
        <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25d366] opacity-30" />
      )}
    </div>
  );
}

export default WhatsAppButton;
