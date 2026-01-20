"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { MapPin, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DestinationsProps {
  className?: string;
}

const destinations = [
  {
    id: 1,
    name: "Cartagena",
    description: "Ciudad amurallada y playas caribeñas",
    image: "/images/dest-cartagena.jpg",
    price: "Desde $85.000",
    color: "from-[#ff6b35]/80 to-[#f7931e]/80",
  },
  {
    id: 2,
    name: "Santa Marta",
    description: "Playas, montañas y naturaleza",
    image: "/images/dest-santa-marta.jpg",
    price: "Desde $75.000",
    color: "from-[#00b4d8]/80 to-[#0077b6]/80",
  },
  {
    id: 3,
    name: "Bogotá",
    description: "Capital cultural y gastronómica",
    image: "/images/dest-bogota.jpg",
    price: "Desde $45.000",
    color: "from-[#7209b7]/80 to-[#3a0ca3]/80",
  },
  {
    id: 4,
    name: "Cali",
    description: "La capital mundial de la salsa",
    image: "/images/dest-cali.jpg",
    price: "Desde $55.000",
    color: "from-[#38b000]/80 to-[#008000]/80",
  },
];

export function Destinations({ className }: DestinationsProps) {
  return (
    <section className={cn("bg-white py-12 md:py-16", className)}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h2 className="text-xl font-semibold text-[#333] md:text-2xl">
            Destinos populares
          </h2>
          <p className="mt-2 text-sm text-[#666]">
            Descubre los lugares más visitados por nuestros viajeros
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {destinations.map((destination, index) => (
            <motion.div
              key={destination.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative cursor-pointer overflow-hidden rounded-xl shadow-md transition-all hover:shadow-xl"
            >
              {/* Background Image Placeholder */}
              <div className="aspect-[3/4] w-full bg-gradient-to-br from-[#ccc] to-[#999]">
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-t opacity-70 transition-opacity group-hover:opacity-90",
                    destination.color
                  )}
                />
              </div>

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                <div className="flex items-center gap-1 text-white/80">
                  <MapPin className="h-3 w-3" />
                  <span className="text-xs">Colombia</span>
                </div>
                <h3 className="text-lg font-bold md:text-xl">{destination.name}</h3>
                <p className="mb-2 text-xs text-white/80 md:text-sm">
                  {destination.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">
                    {destination.price}
                  </span>
                  <motion.div
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all group-hover:bg-white group-hover:text-[#c41e3a]"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </motion.div>
                </div>
              </div>

              {/* Hover overlay effect */}
              <div className="absolute inset-0 bg-black/0 transition-all group-hover:bg-black/10" />
            </motion.div>
          ))}
        </div>

        {/* View all button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 text-center"
        >
          <button className="inline-flex items-center gap-2 rounded-full border-2 border-[#c41e3a] px-6 py-2 text-sm font-medium text-[#c41e3a] transition-all hover:bg-[#c41e3a] hover:text-white">
            Ver todos los destinos
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

export default Destinations;
