import Link from "next/link";
import { HeartHandshake, Megaphone, PawPrint, Stethoscope, Warehouse } from "lucide-react";

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
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 shadow-inner">
            <PawPrint
              className="h-9 w-9 text-amber-700"
              strokeWidth={2.25}
              aria-hidden
            />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Huellas a Salvo
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-zinc-600 sm:text-lg">
            Plataforma de emergencia para el cuidado de animales en Venezuela.
          </p>
          <p className="mt-4 max-w-2xl text-sm text-zinc-500 sm:text-base">
            Reporta mascotas, encuentra ayuda veterinaria, hogares temporales y
            centros de acopio. Actualizado cada 30 segundos.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
