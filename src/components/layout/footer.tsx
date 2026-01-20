"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube, Twitter } from "lucide-react";
import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  return (
    <footer
      className={cn(
        "bg-[#333] text-white",
        className
      )}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo y descripción */}
          <div className="space-y-4">
            <Image
              src="/images/logo.png"
              alt="Rapido Ochoa"
              width={140}
              height={35}
              className="h-[35px] w-auto brightness-0 invert"
            />
            <p className="text-sm text-white/70">
              Tu compañía de viajes de confianza. Conectamos Colombia con
              seguridad y comodidad.
            </p>
            {/* Social Media Links */}
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-[#1877f2] hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-gradient-to-br hover:from-[#f09433] hover:via-[#e6683c] hover:to-[#bc1888] hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-[#1da1f2] hover:scale-110"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-[#ff0000] hover:scale-110"
                aria-label="YouTube"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links útiles */}
          <div className="space-y-4">
            <h4 className="font-semibold text-[#c41e3a]">Enlaces Útiles</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/rutas"
                  className="text-white/70 transition-colors hover:text-white"
                >
                  Nuestras Rutas
                </Link>
              </li>
              <li>
                <Link
                  href="/tarifas"
                  className="text-white/70 transition-colors hover:text-white"
                >
                  Tarifas
                </Link>
              </li>
              <li>
                <Link
                  href="/promociones"
                  className="text-white/70 transition-colors hover:text-white"
                >
                  Promociones
                </Link>
              </li>
            </ul>
          </div>

          {/* Soporte */}
          <div className="space-y-4">
            <h4 className="font-semibold text-[#c41e3a]">Soporte</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/ayuda"
                  className="text-white/70 transition-colors hover:text-white"
                >
                  Centro de Ayuda
                </Link>
              </li>
              <li>
                <Link
                  href="/terminos"
                  className="text-white/70 transition-colors hover:text-white"
                >
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link
                  href="/pqrs"
                  className="text-white/70 transition-colors hover:text-white"
                >
                  PQRS
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div className="space-y-4">
            <h4 className="font-semibold text-[#c41e3a]">Contacto</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#c41e3a]" />
                <span className="text-white/70">
                  Línea Nacional: 01 8000 123 456
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#c41e3a]" />
                <span className="text-white/70">
                  contacto@rapidoochoa.com.co
                </span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#c41e3a]" />
                <span className="text-white/70">
                  Colombia
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Métodos de pago */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
            <div className="flex items-center gap-2">
              <Image
                src="/images/safe-payment-1.png"
                alt="Pago Seguro"
                width={60}
                height={30}
                className="h-6 w-auto"
              />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-white/50">Métodos de pago:</span>
              <Image
                src="/images/pf-visa-1.png"
                alt="Visa"
                width={40}
                height={25}
                className="h-5 w-auto"
              />
              <Image
                src="/images/pf-mastercard-1.png"
                alt="Mastercard"
                width={40}
                height={25}
                className="h-5 w-auto"
              />
              <Image
                src="/images/pf-pse-1.png"
                alt="PSE"
                width={40}
                height={25}
                className="h-5 w-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-xs text-white/50">
            © {new Date().getFullYear()} Rapido Ochoa. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
