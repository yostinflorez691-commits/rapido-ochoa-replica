"use client";

import Link from "next/link";
import Image from "next/image";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {

  return (
    <header
      className={cn(
        "sticky top-0 z-[200] w-full bg-[#c41e3a]",
        className
      )}
    >
      <div className="container mx-auto flex h-[60px] items-center px-4">
        {/* Logo and Welcome Message */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 transition-opacity duration-200 hover:opacity-90">
            {/* Logo Image */}
            <Image
              src="/images/logo.png"
              alt="Rapido Ochoa"
              width={140}
              height={36}
              className="h-[36px] w-auto"
              priority
            />
          </Link>

          {/* Welcome Message - Desktop */}
          <span className="hidden text-[14px] italic text-[#f5c842] md:block">
            ¡Bienvenido a Rápido Ochoa!
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-4 md:flex">
          <button
            className="flex items-center gap-2 rounded-full bg-[#3d3d3d] px-5 py-2.5 text-[13px] text-white transition-all hover:bg-[#4a4a4a] hover:scale-105 active:scale-95"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#d4a855] text-[#3d3d3d]">
              <User className="h-3 w-3" />
            </div>
            <span>Iniciar sesión</span>
          </button>
        </nav>

        {/* Mobile User Button */}
        <Link
          href="/login"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d4c4a8] text-[#6b5d4d] transition-all duration-200 hover:bg-[#c9b89a] active:scale-90 md:hidden"
          aria-label="Iniciar sesión"
        >
          <User className="h-5 w-5" />
        </Link>
      </div>
    </header>
  );
}

export default Header;
