import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Geist, Geist_Mono } from "next/font/google";
import { ActivityTickerShell } from "@/components/ActivityTickerShell";
import {
  FIXED_SUPPORT_BAR_PADDING,
  SupportFooter,
} from "@/components/SupportFooter";
import {
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site-config";
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
  metadataBase: new URL(SITE_URL),
  title: "Huellas a Salvo | Emergencia Animal en Venezuela",
  description:
    "Plataforma de emergencia para reportar mascotas perdidas y encontradas, conectar con veterinarios, hogares temporales, rescatistas y centros de acopio en Venezuela. Actualización en tiempo real, optimizada para baja conectividad.",
  keywords: [
    "Huellas a Salvo",
    "emergencia animal Venezuela",
    "rescate de mascotas",
    "mascotas perdidas",
    "mascotas encontradas",
    "acopio insumos mascotas",
    "veterinarios emergencia",
    "hogar temporal mascotas",
    "rescatistas animales",
    "sismo Venezuela animales",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "es_VE",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Huellas a Salvo | Emergencia Animal en Venezuela",
    description:
      "Reporta mascotas, encuentra veterinarios, hogares temporales y centros de acopio. Ayuda animal en Venezuela cuando más se necesita.",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Huellas a Salvo — Plataforma de emergencia animal en Venezuela",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Huellas a Salvo | Emergencia Animal en Venezuela",
    description:
      "Reporta mascotas, encuentra veterinarios, hogares temporales y centros de acopio en Venezuela.",
    images: [DEFAULT_OG_IMAGE],
  },
  verification: {
    google: "SNRJMQDBNEcpD8SFLr4au6O5up6YXVXUoqXyiLjciL8",
  },
  icons: {
    icon: "/logohuellas.png",
    apple: "/logohuellas.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50">
        <ActivityTickerShell />
        <div className={`bg-gradient-to-b from-amber-50 to-zinc-50 ${FIXED_SUPPORT_BAR_PADDING}`}>
          {children}
        </div>
        <SupportFooter />
        <GoogleAnalytics gaId="G-ZT47MKQTXM" />
      </body>
    </html>
  );
}
