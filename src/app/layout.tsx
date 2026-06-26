import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SupportFooter } from "@/components/SupportFooter";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Huellas a Salvo — Emergencia para animales",
  description:
    "Plataforma de emergencia low-bandwidth para reportar mascotas perdidas, encontrar ayuda veterinaria y centros de acopio en Venezuela.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="flex-1">{children}</div>
        <SupportFooter />
      </body>
    </html>
  );
}
