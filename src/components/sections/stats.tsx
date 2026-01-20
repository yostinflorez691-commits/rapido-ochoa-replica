"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Users, Bus, MapPin, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsProps {
  className?: string;
}

const stats = [
  {
    icon: Users,
    value: 5000000,
    suffix: "+",
    label: "Pasajeros al año",
    format: (n: number) => (n / 1000000).toFixed(0) + "M",
  },
  {
    icon: Bus,
    value: 500,
    suffix: "+",
    label: "Buses modernos",
    format: (n: number) => n.toString(),
  },
  {
    icon: MapPin,
    value: 150,
    suffix: "+",
    label: "Destinos",
    format: (n: number) => n.toString(),
  },
  {
    icon: Calendar,
    value: 50,
    suffix: "+",
    label: "Años de experiencia",
    format: (n: number) => n.toString(),
  },
];

function AnimatedNumber({
  value,
  suffix,
  format,
  isInView,
}: {
  value: number;
  suffix: string;
  format: (n: number) => string;
  isInView: boolean;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000;
    const steps = 60;
    const stepValue = value / steps;
    const stepDuration = duration / steps;
    let current = 0;

    const interval = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(interval);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [value, isInView]);

  return (
    <span className="text-3xl font-bold text-white md:text-4xl">
      {format(displayValue)}
      {suffix}
    </span>
  );
}

export function Stats({ className }: StatsProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className={cn(
        "bg-gradient-to-r from-[#333] to-[#1a1a1a] py-12 md:py-16",
        className
      )}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#c41e3a]/20 md:h-14 md:w-14">
                <stat.icon className="h-6 w-6 text-[#c41e3a] md:h-7 md:w-7" />
              </div>
              <div className="mb-1">
                <AnimatedNumber
                  value={stat.value}
                  suffix={stat.suffix}
                  format={stat.format}
                  isInView={isInView}
                />
              </div>
              <p className="text-sm text-white/60 md:text-base">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Stats;
