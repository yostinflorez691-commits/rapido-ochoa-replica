"use client";

import { motion } from "framer-motion";
import { Shield, Clock, CreditCard, Headphones } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeaturesProps {
  className?: string;
}

const features = [
  {
    icon: Shield,
    title: "Viaje Seguro",
    description: "Todos nuestros buses cuentan con seguros y protocolos de seguridad.",
  },
  {
    icon: Clock,
    title: "Puntualidad",
    description: "Cumplimos con nuestros horarios para que llegues a tiempo.",
  },
  {
    icon: CreditCard,
    title: "Pago Fácil",
    description: "Múltiples métodos de pago: tarjetas, PSE, efectivo y más.",
  },
  {
    icon: Headphones,
    title: "Soporte 24/7",
    description: "Nuestro equipo está disponible para ayudarte en cualquier momento.",
  },
];

export function Features({ className }: FeaturesProps) {
  return (
    <section className={cn("bg-[#fafafa] py-12", className)}>
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-xl font-bold text-[#232323] md:text-2xl">
            ¿Por qué viajar con nosotros?
          </h2>
          <p className="text-sm text-[#686868]">
            Ofrecemos la mejor experiencia de viaje en bus
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              viewport={{ once: true }}
              className="rounded-lg border border-[#e6e6e6] bg-white p-5 text-center transition-shadow hover:shadow-md"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#002674]/10">
                <feature.icon className="h-6 w-6 text-[#002674]" />
              </div>
              <h3 className="mb-1.5 text-sm font-semibold text-[#232323]">
                {feature.title}
              </h3>
              <p className="text-xs leading-relaxed text-[#686868]">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
