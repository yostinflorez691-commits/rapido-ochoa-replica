"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {

  return (
    <header
      className={cn(
        "sticky top-0 z-[200] w-full bg-[#B42121]",
        className
      )}
    >
      <div className="container mx-auto flex h-[60px] items-center justify-between px-4">
        {/* Logo and Welcome Message */}
        <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
          <Link href="/" className="flex items-center transition-opacity duration-200 hover:opacity-90">
            {/* Logo Image - versión blanca para header rojo */}
            <Image
              src="/images/logo-white.png"
              alt="Rapido Ochoa - Transportamos tus ilusiones"
              width={180}
              height={36}
              className="h-[30px] w-[150px] object-contain sm:h-[32px] sm:w-[160px] md:h-[36px] md:w-[180px]"
              priority
            />
          </Link>

          {/* Welcome Message - Desktop only */}
          <span className="hidden text-[13px] italic text-[#f5c842] md:block md:text-[14px]">
            ¡Bienvenido a Rápido Ochoa!
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-2 sm:gap-3 md:gap-4">
          {/* Desktop Navigation */}
          <button className="hidden items-center gap-2 rounded-full bg-neutral-700/70 px-3 py-1.5 transition-colors hover:bg-neutral-700/80 md:flex">
            <svg
              className="h-5 w-5 text-gray-200 md:h-6 md:w-6"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <span className="text-sm font-medium text-white">Iniciar sesión</span>
          </button>

          {/* Mobile User Button */}
          <Link
            href="/login"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-transparent transition-all duration-300 hover:scale-105 focus:outline-none sm:h-11 sm:w-11 md:hidden"
            aria-label="Iniciar sesión"
          >
            <svg className="h-5 w-5 text-white sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
