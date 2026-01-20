"use client";

import { motion } from "framer-motion";
import { Shield, Clock, CreditCard, Headphones } from "lucide-react";
import { cn } from "@/lib/utils";

interface BenefitsProps {
  className?: string;
}

const benefits = [
  {
    icon: Shield,
    title: "Viaje Seguro",
    description: "Conductores certificados y buses con mantenimiento garantizado",
    color: "text-[#2e7d32]",
    bgColor: "bg-[#e8f5e9]",
  },
  {
    icon: Clock,
    title: "Puntualidad",
    description: "Salidas a tiempo para que llegues cuando lo planeas",
    color: "text-[#1976d2]",
    bgColor: "bg-[#e3f2fd]",
  },
  {
    icon: CreditCard,
    title: "Pago Fácil",
    description: "Múltiples métodos de pago: tarjeta, PSE, efectivo",
    color: "text-[#7b1fa2]",
    bgColor: "bg-[#f3e5f5]",
  },
  {
    icon: Headphones,
    title: "Soporte 24/7",
    description: "Atención al cliente disponible cuando lo necesites",
    color: "text-[#c41e3a]",
    bgColor: "bg-[#ffebee]",
  },
];

export function Benefits({ className }: BenefitsProps) {
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
            ¿Por qué viajar con nosotros?
          </h2>
          <p className="mt-2 text-sm text-[#666]">
            Más de 50 años conectando a Colombia
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group flex flex-col items-center rounded-xl bg-[#f9f9f9] p-4 text-center transition-all hover:bg-white hover:shadow-lg md:p-6"
            >
              <div
                className={cn(
                  "mb-3 flex h-12 w-12 items-center justify-center rounded-full transition-transform group-hover:scale-110 md:h-14 md:w-14",
                  benefit.bgColor
                )}
              >
                <benefit.icon className={cn("h-6 w-6 md:h-7 md:w-7", benefit.color)} />
              </div>
              <h3 className="mb-1 text-sm font-semibold text-[#333] md:text-base">
                {benefit.title}
              </h3>
              <p className="text-xs text-[#666] md:text-sm">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Benefits;
