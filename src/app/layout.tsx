import type { Metadata } from "next";
import { Open_Sans, Oswald } from "next/font/google";
import "./globals.css";
import VisitorTracker from "@/components/tracking/visitor-tracker";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  display: "swap",
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rapido Ochoa - Viajes en Bus",
  description: "Compra tus pasajes de bus en línea. Viaja seguro con Rapido Ochoa.",
  keywords: ["viajes", "bus", "pasajes", "colombia", "rapido ochoa"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${openSans.variable} ${oswald.variable} antialiased`}>
        <VisitorTracker />
        {children}
      </body>
    </html>
  );
}
