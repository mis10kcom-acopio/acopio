import Image from "next/image";
import Link from "next/link";
import { HeartHandshake, Megaphone, Stethoscope, Warehouse } from "lucide-react";

const CTA_LINKS = [
  {
    href: "/reportar-mascota",
    label: "Reportar Mascota",
    icon: Megaphone,
    className:
      "bg-red-600 hover:bg-red-700 focus:ring-red-500/40 text-white",
  },
  {
    href: "/registro-voluntario",
    label: "Ofrecer Ayuda / Hogar",
    icon: HeartHandshake,
    className:
      "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500/40 text-white",
  },
  {
    href: "/registro-veterinario",
    label: "Registrar Clínica / Veterinario",
    icon: Stethoscope,
    className:
      "bg-sky-600 hover:bg-sky-700 focus:ring-sky-500/40 text-white",
  },
  {
    href: "/registro-acopio",
    label: "Registrar Acopio",
    icon: Warehouse,
    className:
      "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500/40 text-white",
  },
] as const;

export function HomeHeader() {
  return (
    <header className="border-b border-amber-200/80 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="inline-block rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/40">
            <Image
              src="/logohuellas.png"
              alt="Huellas a Salvo — Ir al inicio"
              width={90}
              height={90}
              className="mx-auto mb-3 object-contain"
              priority
            />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Huellas a Salvo
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-snug text-zinc-600 sm:text-lg">
            Plataforma de emergencia en Venezuela para reportar mascotas
            perdidas, ubicar ayuda veterinaria y organizar centros de acopio.
          </p>
          <p className="mt-2 flex items-center justify-center gap-2 text-xs text-gray-500 sm:text-sm">
            <span
              className="h-2 w-2 shrink-0 rounded-full bg-green-500 animate-pulse"
              aria-hidden
            />
            Actualizado cada 30 segundos
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CTA_LINKS.map(({ href, label, icon: Icon, className }) => (
            <Link
              key={href}
              href={href}
              className={`inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-base font-bold shadow-md transition focus:outline-none focus:ring-2 ${className}`}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
