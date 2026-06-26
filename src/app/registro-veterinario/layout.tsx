import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registro de veterinario — Huellas a Salvo",
  description:
    "Registra tu clínica o consulta veterinaria en la red de emergencia.",
};

export default function RegistroVeterinarioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
