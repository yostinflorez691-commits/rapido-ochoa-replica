"use client";

import { motion } from "framer-motion";
import { Clock, ArrowRight } from "lucide-react";

interface ViajeReciente {
  id: string;
  origenCorto: string;
  origenFull: string;
  destinoCorto: string;
  destinoFull: string;
  terminalOrigen: string;
  terminalDestino: string;
}

const viajesPopulares: ViajeReciente[] = [
  {
    id: "1",
    origenCorto: "Medellín",
    origenFull: "Medellín, Antioquia Medellín Terminal Norte",
    destinoCorto: "Bogotá",
    destinoFull: "Bogota, Cundinamarca Bogotá Terminal Salitre",
    terminalOrigen: "Terminal Norte",
    terminalDestino: "Terminal Salitre",
  },
  {
    id: "2",
    origenCorto: "Medellín",
    origenFull: "Medellín, Antioquia Medellín Terminal Norte",
    destinoCorto: "Cartagena",
    destinoFull: "Cartagena, Bolivar Cartagena",
    terminalOrigen: "Terminal Norte",
    terminalDestino: "Terminal Cartagena",
  },
  {
    id: "3",
    origenCorto: "Bogotá",
    origenFull: "Bogota, Cundinamarca Bogotá Terminal Salitre",
    destinoCorto: "Medellín",
    destinoFull: "Medellín, Antioquia Medellín Terminal Norte",
    terminalOrigen: "Terminal Salitre",
    terminalDestino: "Terminal Norte",
  },
];

interface ViajesRecientesProps {
  onSelectViaje: (origen: string, destino: string) => void;
  className?: string;
}

export function ViajesRecientes({ onSelectViaje, className }: ViajesRecientesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`viajes-recientes ${className || ""}`}
    >
      <h3 className="flex items-center gap-2 text-[14px] font-semibold text-[#2d3436]">
        <Clock className="h-5 w-5 text-[#1F8641]" />
        Elige tu próximo viaje
      </h3>

      <div className="mt-3 space-y-2">
        {viajesPopulares.map((viaje) => (
          <motion.div
            key={viaje.id}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectViaje(viaje.origenFull, viaje.destinoFull)}
            className="viaje-item"
          >
            {/* Icono de flecha */}
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#e8f5e9]">
              <ArrowRight className="h-5 w-5 text-[#1F8641]" />
            </div>

            {/* Info del viaje */}
            <div className="flex-1">
              <div className="flex items-center gap-1 text-[14px] font-semibold text-[#2d3436]">
                <span>{viaje.origenCorto}</span>
                <ArrowRight className="h-3 w-3 text-[#636e72]" />
                <span>{viaje.destinoCorto}</span>
              </div>
              <div className="text-[13px] text-[#636e72]">
                {viaje.terminalOrigen} → {viaje.terminalDestino}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default ViajesRecientes;
