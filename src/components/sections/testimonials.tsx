"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

interface TestimonialsProps {
  className?: string;
}

const testimonials = [
  {
    id: 1,
    name: "María González",
    location: "Bogotá",
    avatar: "/images/avatar-1.jpg",
    rating: 5,
    text: "Excelente servicio. Los buses son muy cómodos y siempre llegan a tiempo. Viajo frecuentemente a Medellín y siempre elijo Rápido Ochoa.",
    route: "Bogotá - Medellín",
  },
  {
    id: 2,
    name: "Carlos Rodríguez",
    location: "Medellín",
    avatar: "/images/avatar-2.jpg",
    rating: 5,
    text: "La mejor empresa de transporte. Personal muy amable y profesional. El sistema de reservas en línea es muy fácil de usar.",
    route: "Medellín - Cartagena",
  },
  {
    id: 3,
    name: "Ana Martínez",
    location: "Cali",
    avatar: "/images/avatar-3.jpg",
    rating: 5,
    text: "Llevo años viajando con ellos y nunca me han fallado. Los precios son justos y el servicio es de primera calidad.",
    route: "Cali - Bogotá",
  },
  {
    id: 4,
    name: "Juan Pérez",
    location: "Barranquilla",
    avatar: "/images/avatar-4.jpg",
    rating: 4,
    text: "Muy satisfecho con el servicio. Los conductores son muy profesionales y los buses están siempre limpios.",
    route: "Barranquilla - Santa Marta",
  },
];

export function Testimonials({ className }: TestimonialsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  return (
    <section className={cn("bg-[#f9f9f9] py-12 md:py-16", className)}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h2 className="text-xl font-semibold text-[#333] md:text-2xl">
            Lo que dicen nuestros viajeros
          </h2>
          <p className="mt-2 text-sm text-[#666]">
            Miles de colombianos confían en nosotros
          </p>
        </motion.div>

        <div
          className="relative mx-auto max-w-3xl"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute -left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg transition-all hover:bg-[#c41e3a] hover:text-white md:-left-12"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute -right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg transition-all hover:bg-[#c41e3a] hover:text-white md:-right-12"
            aria-label="Siguiente"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Testimonial Card */}
          <div className="overflow-hidden rounded-2xl bg-white p-6 shadow-lg md:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <Quote className="mx-auto mb-4 h-8 w-8 text-[#c41e3a]/20" />

                <p className="mb-6 text-base text-[#555] md:text-lg">
                  "{testimonials[currentIndex].text}"
                </p>

                <div className="mb-4 flex items-center justify-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < testimonials[currentIndex].rating
                          ? "fill-[#ffc107] text-[#ffc107]"
                          : "fill-gray-200 text-gray-200"
                      )}
                    />
                  ))}
                </div>

                <div className="flex flex-col items-center">
                  <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-[#c41e3a] text-xl font-semibold text-white">
                    {testimonials[currentIndex].name.charAt(0)}
                  </div>
                  <h4 className="font-semibold text-[#333]">
                    {testimonials[currentIndex].name}
                  </h4>
                  <p className="text-sm text-[#666]">
                    {testimonials[currentIndex].location}
                  </p>
                  <p className="mt-1 text-xs text-[#c41e3a]">
                    {testimonials[currentIndex].route}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  index === currentIndex
                    ? "w-6 bg-[#c41e3a]"
                    : "bg-[#ddd] hover:bg-[#bbb]"
                )}
                aria-label={`Ver testimonio ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
