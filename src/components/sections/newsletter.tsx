"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewsletterProps {
  className?: string;
}

export function Newsletter({ className }: NewsletterProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setErrorMessage("Por favor ingresa tu correo");
      setStatus("error");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage("Por favor ingresa un correo válido");
      setStatus("error");
      return;
    }

    setStatus("loading");

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setStatus("success");
    setEmail("");
  };

  return (
    <section className={cn("bg-[#f5f5f5] py-12 md:py-16", className)}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#c41e3a]/10">
            <Mail className="h-7 w-7 text-[#c41e3a]" />
          </div>

          <h2 className="mb-2 text-xl font-semibold text-[#333] md:text-2xl">
            Suscríbete a nuestras ofertas
          </h2>
          <p className="mb-6 text-sm text-[#666]">
            Recibe promociones exclusivas y descuentos directamente en tu correo
          </p>

          <form onSubmit={handleSubmit} className="mx-auto max-w-md">
            {status === "success" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-2 rounded-full bg-[#2e7d32]/10 py-4 text-[#2e7d32]"
              >
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">¡Gracias por suscribirte!</span>
              </motion.div>
            ) : (
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === "error") {
                      setStatus("idle");
                      setErrorMessage("");
                    }
                  }}
                  placeholder="Ingresa tu correo electrónico"
                  className={cn(
                    "w-full rounded-full border-2 bg-white py-3 pl-4 pr-32 text-sm outline-none transition-all",
                    status === "error"
                      ? "border-red-500 focus:border-red-500"
                      : "border-transparent focus:border-[#c41e3a]"
                  )}
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-2 rounded-full bg-[#c41e3a] px-5 py-2 text-sm font-medium text-white transition-all hover:bg-[#a01830] disabled:opacity-70"
                >
                  {status === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Suscribirse
                      <Send className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            )}

            {status === "error" && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-red-500"
              >
                {errorMessage}
              </motion.p>
            )}
          </form>

          <p className="mt-4 text-xs text-[#999]">
            Al suscribirte aceptas recibir correos promocionales. Puedes cancelar cuando quieras.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default Newsletter;
