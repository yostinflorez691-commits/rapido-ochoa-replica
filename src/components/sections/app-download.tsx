"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Smartphone, Check, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppDownloadProps {
  className?: string;
}

const features = [
  "Compra tus tiquetes en segundos",
  "Recibe notificaciones de tu viaje",
  "Acumula puntos con cada compra",
  "Ofertas exclusivas para la app",
];

export function AppDownload({ className }: AppDownloadProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-[#c41e3a] to-[#8b1528] py-12 md:py-16",
        className
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-white" />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="flex flex-col items-center gap-8 md:flex-row md:gap-12">
          {/* Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative flex-shrink-0"
          >
            <div className="relative h-[300px] w-[150px] md:h-[400px] md:w-[200px]">
              {/* Phone Frame */}
              <div className="absolute inset-0 rounded-[2rem] bg-[#1a1a1a] p-2 shadow-2xl">
                <div className="h-full w-full overflow-hidden rounded-[1.5rem] bg-white">
                  {/* App Screen Mockup */}
                  <div className="flex h-full flex-col">
                    <div className="bg-[#c41e3a] px-3 py-4 text-center">
                      <div className="mx-auto h-4 w-16 rounded bg-white/30" />
                    </div>
                    <div className="flex-1 space-y-2 p-3">
                      <div className="h-20 rounded-lg bg-[#f5f5f5]" />
                      <div className="h-8 rounded bg-[#c41e3a]" />
                      <div className="space-y-1">
                        <div className="h-3 w-3/4 rounded bg-[#eee]" />
                        <div className="h-3 w-1/2 rounded bg-[#eee]" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="h-16 rounded-lg bg-[#f5f5f5]" />
                        <div className="h-16 rounded-lg bg-[#f5f5f5]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Notch */}
              <div className="absolute left-1/2 top-3 h-4 w-16 -translate-x-1/2 rounded-full bg-[#1a1a1a]" />
            </div>

            {/* Floating Badge */}
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="absolute -right-4 top-8 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg md:-right-6 md:h-20 md:w-20"
            >
              <div className="text-center">
                <Download className="mx-auto h-5 w-5 text-[#c41e3a] md:h-6 md:w-6" />
                <span className="text-[10px] font-semibold text-[#333] md:text-xs">GRATIS</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 text-center text-white md:text-left"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm backdrop-blur-sm">
              <Smartphone className="h-4 w-4" />
              <span>Descarga la app</span>
            </div>

            <h2 className="mb-4 text-2xl font-bold md:text-3xl">
              Lleva tu viaje en el bolsillo
            </h2>

            <p className="mb-6 text-white/80">
              Descarga nuestra app y disfruta de beneficios exclusivos. Compra
              más rápido y viaja mejor.
            </p>

            <ul className="mb-8 space-y-3">
              {features.map((feature, index) => (
                <motion.li
                  key={feature}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-3 text-sm md:text-base"
                >
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                    <Check className="h-3 w-3" />
                  </div>
                  {feature}
                </motion.li>
              ))}
            </ul>

            {/* App Store Buttons */}
            <div className="flex flex-col items-center gap-3 sm:flex-row md:items-start">
              <a
                href="#"
                className="flex h-12 items-center gap-2 rounded-lg bg-black px-4 transition-transform hover:scale-105"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div className="text-left">
                  <div className="text-[10px] text-white/70">Descargar en</div>
                  <div className="text-sm font-semibold text-white">App Store</div>
                </div>
              </a>
              <a
                href="#"
                className="flex h-12 items-center gap-2 rounded-lg bg-black px-4 transition-transform hover:scale-105"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white">
                  <path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.25-.84-.76-.84-1.35m13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27m3.35-4.31c.34.27.59.69.59 1.19s-.22.9-.57 1.18l-2.29 1.32-2.5-2.5 2.5-2.5 2.27 1.31M6.05 2.66l10.76 6.22-2.27 2.27-8.49-8.49z" />
                </svg>
                <div className="text-left">
                  <div className="text-[10px] text-white/70">Disponible en</div>
                  <div className="text-sm font-semibold text-white">Google Play</div>
                </div>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default AppDownload;
